const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

app.use(express.json());

// Guard middleware to ensure arrays exist before any potential 'reduce' usage
function ensureOrderArrays(req, res, next) {
  try {
    const body = req.body || {};

    // Common field likely used with reduce in order routes
    if (body.items === undefined) {
      // Provide a safe default to prevent reduce on undefined
      body.items = [];
    } else if (!Array.isArray(body.items)) {
      return res.status(400).json({ error: "Invalid payload: 'items' must be an array." });
    }

    req.body = body;
    next();
  } catch (err) {
    next(err);
  }
}

app.use("/orders", ensureOrderArrays, orderRoutes);

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

// Centralized error handler to avoid crashing on TypeErrors like 'reduce of undefined'
app.use((err, req, res, next) => {
  logError(err, { file: "app.js", line: 29 });
  if (err instanceof TypeError && /reduce/i.test(err.message)) {
    return res.status(400).json({ error: "Invalid input: expected an array before calling reduce." });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});