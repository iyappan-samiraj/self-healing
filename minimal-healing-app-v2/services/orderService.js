const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);

    if (!order) {
      throw new Error(`Order not found for id=${id}`);
    }

    const { totalAmount } = order;
    if (typeof totalAmount !== "number" || Number.isNaN(totalAmount)) {
      throw new Error(`Invalid totalAmount for order id=${id}: ${totalAmount}`);
    }

    return totalAmount.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 7, context: { id } });
    throw err;
  }
}

async function createOrder(data) {
  try {
    // Immediate fix: guard against null/undefined before calling reduce
    const items = Array.isArray(data?.items) ? data.items : [];

    // Optional diagnostic to aid investigation if items are missing or invalid
    if (!Array.isArray(data?.items)) {
      logError(new Error("items is missing or not an array in createOrder data"), {
        file: "services/orderService.js",
        line: 18,
        context: { receivedType: typeof data?.items }
      });
    }

    const amount = items.reduce((sum, item) => {
      const price = Number(item?.price);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);

    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status, amount };
  } catch (err) {
    logError(err, { file: "services/orderService.js", line: 18 });
    throw err;
  }
}

module.exports = { getOrder, createOrder };