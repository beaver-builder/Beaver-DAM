import {
  json,
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import logger from "./logger";
import apiRouter from "@/routes";

export default (app: Application) => {
  app.use(json({ limit: '1mb' }));

  const options: cors.CorsOptions = {
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: ['http://46.101.105.113:4173', 'http://localhost:5173', 'https://betabox.sternatravel.com.br', 'http://betabox.sternatravel.com.br'],
    preflightContinue: false,
    optionsSuccessStatus: 200
  }

  app.use(cors(options));

  //app.use(logger);

  app.use('/api', apiRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: any = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  // error handlers
  app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === "UnauthorizedError") {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  }) as ErrorRequestHandler);

  app.use(((err: any, req: Request, res: Response) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  }) as ErrorRequestHandler);
};
