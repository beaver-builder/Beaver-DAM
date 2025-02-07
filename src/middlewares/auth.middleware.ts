import env from "@/config";
import { Logger } from "@/helpers/Logger";

import { getErrorMessage, getErrorStatusCode } from "@/helpers/response.collection";
import { JwtType } from "@/interfaces/types/jwt.type";
import { UserInterface } from "@/interfaces/user.interface";
import applicationkeyService from "@/services/applicationkey.service";
import userService from "@/services/user.service";
import { Request, Response, NextFunction } from "express";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import jwtMiddleware from "./jwt.middleware";
const jwtSecret = env.JWT_SECRET || "";

// import UserService from "@api/services/users.service";

class AuthMiddleware {
	async verifyUserPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const user: any = await userService.fetchUserByUsernameNPassword(req.body);

			if (user.length === 0) {
				return res
					.status(getErrorStatusCode('invalidLoginCredentials'))
					.send({ message: getErrorMessage('invalidLoginCredentials') });
			}

			console.log({user})
			
			req.body.user_id = user[0].id;
			req.body.role_id = user[0].role_id;
			req.body.role = user[0].role;
			req.body.billing_control = user[0].billing_control;
			req.body.full_name = user[0].full_name
			req.body.email = user[0].email

		} catch (err: any) {
			return res.status(500).send({ message: err?.message || err });
		}
		return next();
		// Giving the same message in both cases
		// helps protect aganist cracking attempts:
	}

	async validWSAuth(req: IncomingMessage) {
		if(req.url?.includes('auth=')) {
			const jwt = decodeURI(req.url?.split('auth=')[1]);

			req.headers["authorization"] = jwt;
		}

		if (req.headers["authorization"]) {
			if(req.headers["authorization"].includes('Basic')) {
				const authorization = req.headers["authorization"].split(" ");

				const credentials = decodeURI(Buffer.from(authorization[1], 'base64').toString()).split(':');

				if(!credentials[0].includes('Bearer')) {
					if(credentials.length < 2) throw Error(getErrorMessage('missingField', 'login/senha'));
					const userData: UserInterface = {
						username: credentials[0],
						password: credentials[1],
						phone: ''
					};
					const user = await userService.fetchUserByUsernameNPassword(userData);

					if(user.length === 0) throw Error(getErrorMessage('wrongCredential'));
	
					return {user_id: user[0].id};
				}else {
					req.headers["authorization"] = credentials[0];
				}
				// req.headers["authorization"] = decodeURI(Buffer.from(authorization[1], 'base64').toString()).replace(':', '');
			}
			// eslint-disable-next-line dot-notation
			const authorization = req.headers["authorization"].split(" ");
			if (authorization[0] !== "Bearer") {
				throw Error("Prefixo do token incorreto");
			} else {
				return jwt.verify(authorization[1], jwtSecret) as JwtType;
			}
		} else {
			throw Error("Token nao informado" );
		}
	}

	async validateBasic(req: Request, res: Response, next: NextFunction) {
		try {
			const authorization = req.headers?.authorization?.split(" ") || [];
	
			if(authorization.length != 2) throw Error(getErrorMessage('missingField', 'Nome de usuario e/ou senha'));
	
			const credentials = decodeURI(Buffer.from(authorization[1], 'base64').toString()).split(':');
			const appKey: any = await applicationkeyService.fetchUserByUsernameNPassword({ username: credentials[0], password: credentials[1] });

			if(Object.keys(appKey).length === 0) throw Error(getErrorMessage('wrongCredential'));
			const user: any = await userService.fetch(appKey.user_account_id) 	;		

			res.locals.user_id = user.id;
			res.locals.role = user.role;
			res.locals.app_id = appKey.id;
			next();
		} catch (err: any) {
			Logger.getInstance().error('AUTHMiddleware', err?.message || err);
			return res.status(500).send({ message: err?.message || err});
		}
	}

	async validateBaiscOrBearer(req: Request, res: Response, next: NextFunction) {
		// if(req.headers['origin'] && req.headers['origin'] === 'http://localhost') next();
		try {
			if(req.headers['authorization'] && req.headers['authorization'].includes('Basic')) this.validateBasic(req, res, next);
			else jwtMiddleware.validJWTNeeded(req, res, next);
		} catch (err: any) {
			Logger.getInstance().error('AUTHMiddleware', err?.message || err);
			return res.status(500).send({ message: 'Erro desconhecido ao validor token de acesso'});
		}
	}
}

export default new AuthMiddleware();
