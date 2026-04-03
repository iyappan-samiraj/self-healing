const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);
    const amountNum = Number(order?.totalAmount);
    const safeAmount = Number.isFinite(amountNum) ? amountNum : 0;
    return safeAmount.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 7 });
    throw err;
  }
}

async function createOrder(data = {}) {
  try {
    const items = Array.isArray(data.items) ? data.items : [];
    const amount = items.reduce((sum, item) => {
      const priceNum = Number(item?.price);
      return sum + (Number.isFinite(priceNum) ? priceNum : 0);
    }, 0);
    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status };
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 18 });
    throw err;
  }
}

module.exports = { getOrder, createOrder };