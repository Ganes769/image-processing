import { Router } from "express";
import { imageTrnsform } from "../controllers/imageTransForm";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/image/:id/transform", protect, imageTrnsform);
export default router;
export { router };
