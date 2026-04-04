const express = require("express");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { logError } = require("./utils/logger");

app.use(express.json());

// Middleware to ensure expected array fields exist before they are used with `reduce`
function ensureArrayFields(fields = []) {
  return (req, res, next) => {
    if (req.body && typeof req.body === "object") {
      for (const field of fields) {
        const value = req.body[field];
        if (value === undefined) {
          // Initialize to empty array to avoid `.reduce` on undefined
          req.body[field] = [];
        } else if (!Array.isArray(value)) {
          // Reject invalid types to avoid downstream crashes
          return res.status(400).json({ error: `${field} must be an array` });
        }
      }
    }
    next();
  };
}

// Apply validator to orders routes (common array fields used with reduce)
app.use(
  "/orders",
  ensureArrayFields(["items", "orderItems", "products", "lines"]),
  orderRoutes
);

// Centralized error handler to prevent crashes from TypeErrors (e.g., reduce on undefined)
app.use((err, req, res, next) => {
  logError(err, { file: "app.js" });

  if (err instanceof TypeError && /reduce/i.test(String(err.message))) {
    return res
      .status(400)
      .json({ error: "Invalid input: expected an array before using reduce" });
  }

  res.status(500).json({ error: "Internal Server Error" });
});

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", context: "unhandledRejection" });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", context: "uncaughtException" });
});

// Prevent app from crashing due to thrown errors in interval
setInterval(() => {
  try {
    if (Math.random() > 0.7) {
      throw new Error("Random crash");
    }
  } catch (err) {
    logError(err, { file: "app.js", context: "interval" });
  }
}, 5000);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});