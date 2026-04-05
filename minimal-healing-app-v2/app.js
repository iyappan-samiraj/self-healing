const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

// Helper to safely use reduce without crashing on non-arrays
function safeReduce(source, reducer, initialValue) {
  if (!Array.isArray(source)) {
    return typeof initialValue !== "undefined" ? initialValue : undefined;
  }
  return source.reduce(reducer, initialValue);
}

app.use(express.json());

// Expose safeReduce to all routes so they can use it before calling reduce
app.use((req, res, next) => {
  req.safeReduce = safeReduce;
  next();
});

app.use("/orders", orderRoutes);

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", line: 10 });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", line: 14 });
});

// Prevent random crash from bringing down the process
setInterval(() => {
  if (Math.random() > 0.7) {
    try {
      throw new Error("Random crash");
    } catch (err) {
      logError(err, { file: "app.js", line: 24 });
    }
  }
}, 5000);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});