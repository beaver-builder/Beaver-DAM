import { Request, Response, } from "express";
import Controller from "./controller";
import service from "@/services/wallet.service";

class walletController extends Controller{

	async balanceOf(req: Request, res: Response) {
		try {

			const balance = await service.balanceOf()
			
			return this.sendSuccessResponse(res, {content:{balance}});
		} catch (err) {

			this.sendErrorMessage(res, err, 'walletController');
      	}
	}

}

export default new walletController();