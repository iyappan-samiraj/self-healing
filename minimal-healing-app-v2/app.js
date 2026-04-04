const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

// Safe reduce helper to prevent "reduce of undefined" crashes
function safeReduce(list, reducer, initialValue) {
  if (!Array.isArray(list)) {
    logError(new TypeError("Attempted to call reduce on a non-array or undefined value"), {
      file: "app.js",
      line: 9,
    });
    return arguments.length >= 3 ? initialValue : undefined;
  }
  return arguments.length >= 3 ? list.reduce(reducer, initialValue) : list.reduce(reducer);
}

// Expose safeReduce to routes via app.locals and req
app.locals.safeReduce = safeReduce;
app.use((req, res, next) => {
  req.safeReduce = safeReduce;
  next();
});

app.use(express.json());
app.use("/orders", orderRoutes);

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", line: 27 });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", line: 31 });
});

// Log random errors instead of crashing the process
setInterval(() => {
  if (Math.random() > 0.7) {
    const err = new Error("Random crash");
    logError(err, { file: "app.js", line: 38 });
  }
}, 5000);

// Centralized error handler to catch reduce misuse and other errors
app.use((err, req, res, next) => {
  if (err && /reduce/.test(String(err.message || ""))) {
    logError(err, {
      file: "app.js",
      line: 46,
      note: "Reduce called on undefined or non-array",
    });
    return res.status(400).json({
      error: "Invalid input: expected an array before using reduce.",
    });
  }
  logError(err, { file: "app.js", line: 52 });
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});