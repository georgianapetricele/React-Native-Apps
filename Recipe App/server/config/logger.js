const logger = {
  debug: (message) => console.debug(`[DEBUG]: ${message}`),
  info: (message) => console.info(`[INFO]: ${message}`),
  error: (message) => console.error(`[ERROR]: ${message}`),
};

module.exports = logger;
