import { Logger } from "@/helpers/Logger";
import ResponseInterface from "@/interfaces/ResponseInterface";
import { Response } from "express";

class Controller {
    protected logger: any = null;
    public static errorStatusCode = 500;

    constructor() {
        this.logger = Logger.getInstance();
    }

    async sendSuccessResponse(res: Response, { message = '', content = null, status = -1 }: ResponseInterface) {
        const response: ResponseInterface = {

        };

        if (status != -1) response.status = status;
        if (message) response.message = message;
        if (content != null) response.content = content;

        return res.status(200).send(response).end();
    }

    async sendErrorMessage(res: Response, err: any, errorControllerOrigin: any) {
        const errorMessage = err?.message || err;
        console.error(err?.stack);
        console.log(errorMessage);
        const logError = { status: Controller.errorStatusCode, message: errorMessage, stack: err?.stack || '' };
        (await this.logger).error(errorControllerOrigin, logError)
        return res.status(Controller.errorStatusCode).send({ message: errorMessage?.name || errorMessage }).end();
    }
}

export default Controller;