import { Router } from "express";

import wallet from './wallet.routes'
import valocracy from './valocracy.routes'

const apiRouter = Router();

apiRouter.use("/wallet", wallet);
apiRouter.use("/valocracy", valocracy);

export default apiRouter;