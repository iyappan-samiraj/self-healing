const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);
    const total = Number(order?.totalAmount ?? 0);
    return total.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 7 });
    throw err;
  }
}

async function createOrder(data) {
  try {
    const items = Array.isArray(data?.items) ? data.items : [];
    const amount = items.reduce((sum, item) => {
      const price = Number(item?.price ?? 0);
      return sum + (Number.isNaN(price) ? 0 : price);
    }, 0);
    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status };
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 18 });
    throw err;
  }
}

module.exports = { getOrder, createOrder };