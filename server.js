const app = require("./src/app");
const {
  app: { port },
} = require("./src/configs/config.mongodb");

const server = app.listen(port, () => {
  console.log(`WSV eCommerce start with port ${port}`);
});

// process.on("SIGNINT", () => {
//   server.close(() => console.log(`Exit Server Express`));
//   //   notify.send(ping...)
// });
