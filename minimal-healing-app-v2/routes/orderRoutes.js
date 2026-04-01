const express = require("express");
const router = express.Router();
const { createOrder, getOrder } = require("../services/orderService");
const { logError } = require("../utils/logger");

router.get("/:id", async (req, res) => {
  try {
    const data = await getOrder(req.params.id);
    res.json(data);
  } catch (err) {
    logError(err, { file: "routes/orderRoutes.js", line: 9 });
    res.status(500).send("Error");
  }
});

router.post("/", async (req, res) => {
  try {
    const result = createOrder(req.body);
    res.json(result);
  } catch (err) {
    logError(err, { file: "routes/orderRoutes.js", line: 18 });
    res.status(500).send("Error");
  }
});

module.exports = router;
