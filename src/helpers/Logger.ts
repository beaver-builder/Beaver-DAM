const winston = require("winston");
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, label, printf, errors} = format;


class PrivateLogger {
    private format: any = null;
    private logger: any = null;
    private levels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    }

    private level = () => {
        const env = process.env.NODE_ENV || 'development'
        const isDevelopment = env === 'development'
        return isDevelopment ? 'debug' : 'warn'
    }
      
    private colors = {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    }

    constructor() {
        this.format = printf((info: any) => {
            console.log(info);
            const status = info.level === "error" ? "err" : info.level;

            return`{"status": "${status}", "timestamp": "${info.timestamp}, "message": "${info.message}", "trace": "${info?.stack ? info.stack.replace(/(\r\n|\n|\r)/gm, "") : ''}"}`
        });

        // const logger = winston.createLogger({
        //     transports: [
        //       new winston.transports.Console()
        //     ]
        // });
        this.logger = createLogger({
            level: this.level(),
            ...this.levels,
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: './logs/combined.log'
                }),
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),
            ],
            format: combine(
                label({ label: 'filename!' }),
                timestamp(),
                errors({ stack: true }),
                // colorize({ all: true }),
                this.format
            )
        });

        // this.loggerRequest = createLogger({
        //     transports: [
        //         new winston.transports.Console(),
        //         new winston.transports.File({
        //             filename: './logs/request.log',
        //         })
        //     ],
        //     format: combine(
        //         label({ label: 'filename!' }),
        //         timestamp(),
        //         format.splat(),
        //         format.simple()
        //     )
        // });
        // logger.warn('Hello again distributed logs');
    }

    changeLabel(filename: string) {
        this.logger.format = combine(
            label({ label: filename }),
            timestamp(),
            // colorize({ all: true }),
            this.format
        );
        // this.loggerRequest.format = combine(
        //     label({ label: filename }),
        //     timestamp(),
        //     format.splat(),
        //     format.simple()
        // );
    };

    error(filename: string, message: string, stack: string = '') {
        this.changeLabel(filename);
        this.logger.error(message);
    }

    warn(filename: string, message: string) {
        this.changeLabel(filename);
        this.logger.warn(message);
    }

    info(filename: string, message: string) {
        this.changeLabel(filename);
        this.logger.info(message);
    }

    http(message: string) {
        this.changeLabel('HTTP');
        this.logger.http(message);
    }

    verbose(filename: string, message: string) {
        this.changeLabel(filename);
        this.logger.verbose(message);
    }

    debug(filename: string, message: string) {
        this.changeLabel(filename);
        this.logger.debug(message);
    }

    silly(filename: string, message: string) {
        this.changeLabel(filename);
        this.logger.silly(message);
    }
}

class Logger {
    private static instance: any = null;

    constructor() {
        throw new Error('Use Logger.getInstance()');
    }

    static getInstance(): PrivateLogger {
        if (!Logger.instance) {
            Logger.instance = new PrivateLogger();
        }
        return Logger.instance;
    }
}


export {
    Logger,
    PrivateLogger
}