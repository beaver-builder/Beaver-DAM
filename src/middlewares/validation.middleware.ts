import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

class ValidationMiddleware {
  verifyBodyFieldErrors(
    req: Request,
    res: Response | null,
    next: NextFunction | null
  ) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (res) {
        return res.status(400).send({ errors: errors.array() });
      } else {
        return { errors: errors.array() };
      }
    } else {
      if (!res) {
        return null;
      }
    }

    if (next) {
      next();
    }
  }
}

export default new ValidationMiddleware();
