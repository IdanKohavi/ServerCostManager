/**
 * @fileoverview Custom logging middleware using Pino
 * @requires pino
 * @requires ../models/logs
 */

const pino = require('pino');
const Log = require('../models/logs');

//Creating the Pino logger:
const logger = pino({
    level: "info",
    transports: {
        target: "pino-pretty",
        options: {
            colorize: true,
        }
    }
});

/**
 * Custom logging middleware that logs to both console and MongoDB
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 */
const logMiddleware = async (req, res, next) => {
    const start = Date.now();

    //Store original res.end
    const originalEnd = res.end;

    //Capture response details
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;

        //Console logs
        logger.info({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get("User-Agent"),
            ip: req.ip,
        }, `${req.method} ${req.url} - ${res.statusCode}`);

        //Save to MongoDB
        const logEntry = new Log({
            level: res.statusCode >= 400 ? "error" : "info",
            message: `${req.method} ${req.url} - ${res.statusCode}`,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            req: {
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers
            },
            res: {
                statusCode: res.statusCode,
                duration: duration
            }
        });

        //Save to DB
        logEntry.save().catch(error => {
            console.error("Failed to save log to database: ",error);
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = { logger, logMiddleware };