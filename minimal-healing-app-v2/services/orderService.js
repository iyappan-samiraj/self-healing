const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);
    return order.totalAmount.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 7 });
    throw err;
  }
}

async function createOrder(data) {
  try {
    // Ensure data.items is always an array before calling reduce
    const items = data && Array.isArray(data.items) ? data.items : [];
    const amount = items.reduce((s, i) => s + (i && typeof i.price === "number" ? i.price : 0), 0);
    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status };
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 18 });
    throw err;
  }
}

module.exports = { getOrder, createOrder };