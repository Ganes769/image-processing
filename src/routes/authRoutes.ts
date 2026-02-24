import { Router } from "express";
import { hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { validateBody } from "../middleware/validation";
import { register } from "../controllers/authControllers";

const router = Router();
router.post("/register", register);
export default router;
