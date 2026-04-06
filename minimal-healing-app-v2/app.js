const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

// Helper to safely reduce arrays without crashing when data is missing
const safeReduce = (arr, reducer, initialValue) => {
  if (!Array.isArray(arr)) return initialValue;
  if (arr.length === 0 && arguments.length < 3) return initialValue;
  return arr.reduce(reducer, initialValue);
};

// Expose safeReduce so routes can use it: req.app.locals.safeReduce(...)
app.locals.safeReduce = safeReduce;

app.use(express.json());
app.use("/orders", orderRoutes);

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", scope: "unhandledRejection" });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", scope: "uncaughtException" });
});

setInterval(() => {
  try {
    if (Math.random() > 0.7) {
      throw new Error("Random crash");
    }
  } catch (err) {
    logError(err, { file: "app.js", scope: "setInterval" });
  }
}, 5000);

// Centralized Express error handler to prevent crashes on route errors
app.use((err, req, res, next) => {
  logError(err, { file: "app.js", scope: "expressErrorHandler" });
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});