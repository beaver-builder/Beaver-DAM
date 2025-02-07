import { PermissionEnum } from "@/enums/permission.enum";
import { getErrorMessage } from "@/helpers/response.collection";
import { NextFunction, Request, Response } from "express";

class PermissionMiddleware {
    validateRoutePerm(req: Request, res: Response, next: NextFunction) {
        const baseUrlInParts = req.baseUrl.split('/');
        const userRole = res.locals.role;

        if (baseUrlInParts.length <= 2) res.status(404).send('Not Found').end();
        const baseRoute = baseUrlInParts[2];
        let hasPermissionToRoute = true;

        switch (baseRoute) {
            case 'application_key':
            case 'wooba_issue_client_blacklist':
                if (userRole !== PermissionEnum.ADMIN) hasPermissionToRoute = false;
                break;
            case 'cotation':
            case 'issue':
                if (userRole !== PermissionEnum.ADMIN && userRole !== PermissionEnum.ISSUE) hasPermissionToRoute = false;
                break;
            case 'airport':
            case 'airport_fee':
            case 'stur':
                if (userRole !== PermissionEnum.ADMIN && userRole !== PermissionEnum.BILLING) hasPermissionToRoute = false;
                break;
            default:
                break;
        }

        if (hasPermissionToRoute) next();
        else res.status(403).send({ message: getErrorMessage('userActionNotPermitted') }).end();
    }
}

export default new PermissionMiddleware();