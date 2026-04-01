const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../logs/error.log");

if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function logError(err, meta = {}) {
  const log = {
    level: "ERROR",
    message: err.message,
    file: meta.file,
    line: meta.line,
    timestamp: new Date().toISOString()
  };

  const logString = JSON.stringify(log);

  console.error(logString);
  fs.appendFileSync(logFilePath, logString + "\n");
}

module.exports = { logError };
