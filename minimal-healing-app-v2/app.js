const express = require("express");
const { logError } = require("./utils/logger");

const app = express();

app.use(express.json());

// Helper to safely use reduce in downstream code
app.locals.safeReduce = (arr, reducer, initial) => {
  if (Array.isArray(arr)) return arr.reduce(reducer, initial);
  return initial;
};

// Middleware to ensure expected array fields exist before routes use reduce
function normalizeOrderArrayFields(req, res, next) {
  try {
    if (!req.body || typeof req.body !== "object") req.body = {};

    // Common fields that order routes may reduce over
    const fields = ["items", "products", "lineItems"];

    for (const field of fields) {
      if (req.body[field] === undefined) {
        // Default to empty array to avoid TypeError when reduce is called downstream
        req.body[field] = [];
      } else if (!Array.isArray(req.body[field])) {
        return res.status(400).json({ error: `${field} must be an array` });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Load order routes safely
let orderRoutes;
try {
  orderRoutes = require("./routes/orderRoutes");
} catch (err) {
  logError(err, { file: "app.js", section: "require:orderRoutes" });
  const router = express.Router();
  router.use((req, res) => {
    res.status(500).json({ error: "Orders service temporarily unavailable" });
  });
  orderRoutes = router;
}

app.use("/orders", normalizeOrderArrayFields, orderRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  logError(err, { file: "app.js", section: "errorHandler" });
  res.status(500).json({ error: "Internal Server Error" });
});

process.on("unhandledRejection", (err) => {
  logError(err, { file: "app.js", event: "unhandledRejection" });
});

process.on("uncaughtException", (err) => {
  logError(err, { file: "app.js", event: "uncaughtException" });
});

setInterval(() => {
  if (Math.random() > 0.7) {
    // This will be captured by the 'uncaughtException' handler above
    throw new Error("Random crash");
  }
}, 5000);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});