/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const DailyRotateFile = require('winston-daily-rotate-file');
const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');
const {
  log: { logEnable, logEnableConsole, logSuccess, logError, logPerformance, logMaxSize, logMaxFiles, logDebugMode },
} = require('./vars');

const { combine, timestamp, printf, colorize, splat, errors } = format;

// winston Format
const customFormat = printf((context) => {
  if (typeof context.message === 'object') {
    context.message = JSON.stringify(context.message, null, 2);
  }
  return `${context.timestamp} ${context.level}: ${context.message}${context.stack ? `\n- ${context.stack}` : ''}`;
});

// Morgan Format
const ResponseFormat = `:status - :method :url - :response-time ms`;

const AllTransports = () => {
  // Add/Modify your own log files based on level
  const logTypes = ['ERROR', 'INFO', 'HTTP', 'DEBUG'];
  return [
    ...logTypes.map((tlogs) => {
      return new DailyRotateFile({
        name: `${tlogs}Logs`,
        filename: `./logs/${tlogs.toLowerCase()}-logs/${tlogs.toLowerCase()}-%DATE%.log`,
        format: combine(format((info) => (info.level === tlogs.toLowerCase() ? info : false))(), customFormat),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        logMaxSize,
        logMaxFiles,
        json: true,
        colorize: false,
      });
    }),
    new transports.Console({
      silent: !logEnableConsole,
      json: false,
      colorize: true,
      format: combine(colorize(), customFormat),
    }),
  ];
};

// Logger Export
const logger = createLogger({
  silent: !logEnable,
  level: logDebugMode,
  exitOnError: false,
  format: combine(errors({ stack: true }), splat(), timestamp()),
  transports: AllTransports(),
});

// HttpLogger Error Export
logger.httpErrorLogger = morgan(`ERROR REQ: ${ResponseFormat}`, {
  skip: (req, res) => res.statusCode <= 400 || !logError,
  stream: { write: (message) => logger.debug(message.trim()) },
});

// HttpLogger Success Export
logger.httpSuccessLogger = morgan(`SUCCESS REQ: ${ResponseFormat}`, {
  skip: (req, res) => res.statusCode >= 400 || !logSuccess,
  stream: { write: (message) => logger.debug(message.trim()) },
});

// Performance Logger Export
logger.performanceLogger = morgan(`Performance: ${ResponseFormat}`, {
  skip: (req, res) => {
    if (!req._startAt || !res._startAt) {
      return;
    }
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
    return ms.toFixed(2) < 1000 || !logPerformance;
  },
  stream: {
    write: (message) => logger.http(message.trim()),
  },
});

module.exports = logger;
