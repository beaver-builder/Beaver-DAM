import { Request, Response, } from "express";
import Controller from "./controller";
import service from "@/services/valocracy.service";

class Valocracy extends Controller{

	async config(req: Request, res: Response) {
		try {

			await service.config()
			
			return this.sendSuccessResponse(res, {message:'sucess'});
		} catch (err) {

			this.sendErrorMessage(res, err, 'Valocracy');
      	}
	}

	async allowance(req: Request, res: Response) {
		try {

			const allowance = await service.allowance()
			
			return this.sendSuccessResponse(res, {content:{allowance}});
		} catch (err) {

			this.sendErrorMessage(res, err, 'Valocracy');
      	}
	}

	async balanceOfUsdt(req: Request, res: Response) {
		try {

			const balance = await service.balanceOfUsdt()
			
			return this.sendSuccessResponse(res, {content:{balance}});
		} catch (err) {

			this.sendErrorMessage(res, err, 'Valocracy');
      	}
	}

	async error(req: Request, res: Response) {
		try {

			await service.error()
			
			return this.sendSuccessResponse(res, {message:'sucess'});
		} catch (err) {

			this.sendErrorMessage(res, err, 'Valocracy');
      	}
	}

}

export default new Valocracy();