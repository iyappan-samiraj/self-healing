const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);

    if (!order) {
      throw new Error(`Order not found (id=${id})`);
    }

    const total = Number(order.totalAmount);
    if (!Number.isFinite(total)) {
      throw new Error(`Invalid totalAmount for order (id=${id})`);
    }

    return total.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 7, id });
    throw err;
  }
}

async function createOrder(data) {
  try {
    if (!data || !Array.isArray(data.items)) {
      throw new Error("Invalid order payload: 'items' must be an array");
    }

    const amount = data.items.reduce((sum, item) => {
      const price = Number(item && item.price);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);

    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status };
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 18 });
    throw err;
  }
}

module.exports = { getOrder, createOrder };