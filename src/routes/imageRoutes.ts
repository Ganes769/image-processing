import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth";
import { upload } from "../controllers/imageUplaod";
import { uploadImage } from "../controllers/imageUploadController";

const router = Router();

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  (req, _res, next) => {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const file = files?.image?.[0] ?? files?.file?.[0];
    if (file) (req as unknown as { file?: Express.Multer.File }).file = file;
    next();
  },
  uploadImage,
);

router.use((err: unknown, _req: unknown, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
      expected_fields: ["image", "file"],
    });
  }
  return next(err);
});

export default router;
