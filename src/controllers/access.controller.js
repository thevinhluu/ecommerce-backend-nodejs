"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // v1
    // new SuccessResponse({
    //   message: "Get token success!",
    //   metadata: await AccessService.handlerRefreshToKen(req.body.refreshToken),
    // }).send(res);

    //v2 fixed, no need accessToken
    new SuccessResponse({
      message: "Get token success!",
      metadata: await AccessService.handlerRefreshToKenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    // return res.status(200).json({
    //   message:'',
    //   metadata:''
    // })

    // return res.status(201).json(await AccessService.signUp(req.body));

    new CREATED({
      message: "Registered OK",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
