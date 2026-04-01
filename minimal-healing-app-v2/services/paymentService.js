const axios = require("axios");
const { logError } = require("../utils/logger");

async function processPayment(amount) {
  try {
    const res = await axios.post("https://invalid-api.com/pay", { amount });
    return res.data;
  } catch (err) {
    logError(err, { file: "services/paymentService.js", line: 6 });
    throw err;
  }
}

module.exports = { processPayment };
