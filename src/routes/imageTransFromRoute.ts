import { Router } from "express";
import { imageTrnsform } from "../controllers/imageTransForm";

const router = Router();

router.post("/image/:id/transform", imageTrnsform);
export default router;
export { router };
