class Logger {
  static info(msg, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data);
  }

  static error(msg, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error);
  }

  static success(msg, data = {}) {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`, data);
  }
}

module.exports = Logger;
