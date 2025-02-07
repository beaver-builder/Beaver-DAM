import env from "@/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JwtType } from "@/interfaces/types/jwt.type";
import { Logger } from "@/helpers/Logger";
import userService from "@/services/user.service";
import { Console } from "console";
// import UserService from "@api/services/users.service";

const jwtSecret = env.JWT_SECRET || "";

class JwtMiddleware {
	verifyRefreshBodyField(req: Request, res: Response, next: NextFunction) {
		if (req.body && req.body.refreshToken) {
			return next();
		} else {
			return res
				.status(400)
				.send({ errors: ["Missing required field: refreshToken."] });
		}
	}

	async validRefreshNeeded(req: Request, res: Response, next: NextFunction) {
		// const user: any = await UserService.getUserByEmailWithPassword(
		//   res.locals.jwt.email
		// );
		const user = {
			user_id: 1,
			email: "abc@hotmail.com",
			role: 1,
			username: 'lucas',
			password: 'as'
		}
		const salt = crypto.createSecretKey(
			Buffer.from(res.locals.jwt.refreshKey.data)
		);

		const hash = crypto
			.createHmac("sha512", salt)
			.update(res.locals.jwt.userId + jwtSecret)
			.digest("base64");
		if (hash === req.body.refreshToken) {
			req.body = {
				userId: user.user_id,
				email: user.email,
				role: user.role,
			};
			return next();
		} else {
			return res
				.status(400)
				.send({ errors: [{ msg: "Invalid refresh token." }] });
		}
	}

	async validJWTNeeded(req: Request, res: Response, next: NextFunction) {
		try {
			// eslint-disable-next-line dot-notation
			if (req.headers["authorization"]) {
				try {
					
					// eslint-disable-next-line dot-notation
					const authorization = req.headers["authorization"].split(" ");
					if (authorization[0] !== "Bearer") {
						return res.status(401).send({ message: "Prefixo do token incorreto" });
					} else {
						res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as JwtType;
						const userRole = await userService.fetchUserRole(res.locals.jwt.user_id);

						res.locals.role = userRole;
						next()
					}
				} catch (err) {
					return res.status(403).send({ message: err });
				}
			} else {
				return res.status(401).send({ message: "Token nao informado" });
			}
		} catch (err: any) {
			Logger.getInstance().error('JWTMiddleware', err?.message || err);
			return res.status(500).send({ message: 'Erro desconhecido ao validor token de acesso'});
		}
	}

	validJWTOrPassphraseNeeded(req: Request, res: Response, next: NextFunction) {
		try {
			// eslint-disable-next-line dot-notation
			if (req.headers["authorization"]) {
				try {
					// eslint-disable-next-line dot-notation
					const authorization = req.headers["authorization"].split(" ");
					if (authorization[0] !== "Bearer") {
						return res.status(401).send();
					} else {
						if (
							authorization[1] ===
							"9b5ebb16f0220af9f91b2cd5fbda0e31a0fc349f3336507b65d088a6566be178"
						) {
							next();
						} else {
							res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as JwtType;
							next();
						}
					}
				} catch (err) {
					return res.status(403).send();
				}
			} else {
				return res.status(401).send();
			}
		} catch (err: any) {
			Logger.getInstance().error('JWTMiddleware', err?.message || err);
			return res.status(500).send({ message: 'Erro desconhecido ao validor token de acesso'});
		}
	}
}

export default new JwtMiddleware();
