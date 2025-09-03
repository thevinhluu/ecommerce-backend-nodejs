"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  // v2
  static handlerRefreshToKenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend !! Please relogin");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop not registered");

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // create 1 cap tokens moi
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

  /*
     check this token used?
  */
  // v1
  // static handlerRefreshToKen = async (refreshToken) => {
  //   // check xem token nay da duoc su dung chua
  //   const foundToken = await KeyTokenService.findByRefreshTokenUsed(
  //     refreshToken
  //   );

  //   if (foundToken) {
  //     // decode
  //     const { userId, email } = await verifyJWT(
  //       refreshToken,
  //       foundToken.privateKey
  //     );
  //     console.log({ userId, email });
  //     // xoa tat ca token trong keyStore
  //     await KeyTokenService.deleteKeyById(userId);
  //     throw new ForbiddenError("Something wrong happend !! Please relogin");
  //   }

  //   //
  //   const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
  //   if (!holderToken) throw new AuthFailureError("Shop not registered");

  //   // verifyToken
  //   const { userId, email } = await verifyJWT(
  //     refreshToken,
  //     holderToken.privateKey
  //   );
  //   console.log("[2]--", { userId, email });
  //   // check UserId
  //   const foundShop = await findByEmail({ email });
  //   if (!foundShop) throw new AuthFailureError("Shop not registered");

  //   // create 1 cap tokens moi
  //   const tokens = await createTokenPair(
  //     { userId, email },
  //     holderToken.publicKey,
  //     holderToken.privateKey
  //   );

  //   // update token
  //   await holderToken.updateOne({
  //     $set: {
  //       refreshToken: tokens.refreshToken,
  //     },
  //     $addToSet: {
  //       refreshTokensUsed: refreshToken,
  //     },
  //   });

  //   return {
  //     user: { userId, email },
  //     tokens,
  //   };
  // };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore.id);
    console.log({ delKey });
    return delKey;
  };

  /*
    1 - check email in dbs
    2 - match password
    3 - create AT vs RS and save
    4 - generate tokens
    5 - get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    //1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    //2.
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureErrorilureError("Authentication error");

    //3.
    // created privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //4. generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    //5.
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // step1: check email exists??

    const hoderShop = await shopModel.findOne({ email }).lean();
    if (hoderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      // const publicKeyString = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey,
      // });

      // const publicKeyString = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey,
      //   privateKey,
      // });

      // if (!publicKeyString) {
      //   return {
      //     code: "xxxx",
      //     message: "publicKeyString error",
      //   };
      // }

      // created privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      // Public key CryptoGraphy Standards !

      console.log({ privateKey, publicKey }); // save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: keyStore error!");
        // return {
        //   code: "xxxx",
        //   message: "keyStore error",
        // };
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
      //const token  = await
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   console.log(error);
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
