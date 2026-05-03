import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import aiRouter from "./ai";
import projectRouter from "./project";
import learnRouter from "./learn";
import learnProgressRouter from "./learnProgress";
import certificatesRouter from "./certificates";
import adminRouter, { adminSessionMiddleware } from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(adminSessionMiddleware);
router.use("/ai", aiRouter);
router.use("/project", projectRouter);
router.use("/learn/progress", learnProgressRouter);
router.use("/learn", learnRouter);
router.use("/certificates", certificatesRouter);
router.use(adminRouter);

export default router;
