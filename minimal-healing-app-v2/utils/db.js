const { logError } = require("./logger");

async function findOrder(id) {
  try {
    if (Math.random() > 0.5) {
      throw new Error("DB failure");
    }
    return null;
  } catch (err) {
    logError(err, { file: "utils/db.js", line: 6 });
    throw err;
  }
}

module.exports = { findOrder };
