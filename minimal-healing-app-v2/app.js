const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

app.use(express.json());
app.use("/orders", orderRoutes);

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", line: 10 });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", line: 14 });
});

setInterval(() => {
  if (Math.random() > 0.7) {
    throw new Error("Random crash");
  }
}, 5000);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
