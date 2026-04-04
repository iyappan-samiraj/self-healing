const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

app.use(express.json());

// Guard to ensure arrays are defined and of the expected type before routes use reduce on them
app.use("/orders", (req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      // If orderRoutes uses reduce on these fields, ensure they're arrays
      if (Object.prototype.hasOwnProperty.call(req.body, "items")) {
        if (req.body.items == null) {
          req.body.items = [];
        } else if (!Array.isArray(req.body.items)) {
          return res.status(400).json({ error: "'items' must be an array" });
        }
      }
      // Add more field checks as needed (example: 'products')
      if (Object.prototype.hasOwnProperty.call(req.body, "products")) {
        if (req.body.products == null) {
          req.body.products = [];
        } else if (!Array.isArray(req.body.products)) {
          return res.status(400).json({ error: "'products' must be an array" });
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}, orderRoutes);

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