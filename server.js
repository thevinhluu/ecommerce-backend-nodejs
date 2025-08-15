const app = require("./src/app");

const PORT = 3055;

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with port ${3055}`);
});

// process.on("SIGNINT", () => {
//   server.close(() => console.log(`Exit Server Express`));
//   //   notify.send(ping...)
// });
