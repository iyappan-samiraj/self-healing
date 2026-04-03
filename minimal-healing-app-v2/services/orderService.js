const db = require("../utils/db");
const { processPayment } = require("./paymentService");
const { logError } = require("../utils/logger");

async function getOrder(id) {
  try {
    const order = await db.findOrder(id);

    if (!order || typeof order.totalAmount !== "number") {
      throw new Error("Order not found or totalAmount is invalid");
    }

    return order.totalAmount.toFixed(2);
  } catch (err) {
    logError(err, { file: "services/orderService.js", method: "getOrder" });
    throw err;
  }
}

async function createOrder(data) {
  try {
    // Ensure items is always an array before reduce is called
    const items = Array.isArray(data?.items) ? data.items : [];

    const amount = items.reduce((sum, item) => {
      const price = typeof item?.price === "number" ? item.price : Number(item?.price) || 0;
      return sum + price;
    }, 0);

    const payment = await processPayment(amount);
    return { id: Date.now(), status: payment.status };
  } catch (err) {
    logError(err, { file: "services/orderService.js", method: "createOrder" });
    throw err;
  }
}

module.exports = { getOrder, createOrder };