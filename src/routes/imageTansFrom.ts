import { Router } from "express";
import { imageTrnsform } from "../controllers/imageTransForm";

const router = Router();

router.post("/", imageTrnsform);
export default router;
export { Router };
