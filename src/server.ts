import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
export { app };
export default { app };
