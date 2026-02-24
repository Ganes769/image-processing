import { Router } from "express";
import { hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { validateBody } from "../middleware/validation";
import { login, register } from "../controllers/authControllers";

const router = Router();
router.post("/register", register);
router.post("/login", login);
export default router;
