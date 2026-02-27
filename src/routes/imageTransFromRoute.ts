import { Router } from "express";
import { imageTrnsform } from "../controllers/imageTransForm";
import {
  getAllTransformedImages,
  getTransformedImagesByImageId,
} from "../controllers/transformedImageController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/image/:id/transform", protect, imageTrnsform);
router.get("/images", protect, getAllTransformedImages);
router.get("/images/:id", protect, getTransformedImagesByImageId);

export default router;
export { router };
