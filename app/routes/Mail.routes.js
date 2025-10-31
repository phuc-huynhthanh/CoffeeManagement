import express from "express";
import multer from "multer";
import { sendMail } from "../controllers/Mail.controller.js";
const router = express.Router();

// Cấu hình multer để lưu file tạm trong thư mục /uploads
const upload = multer({ dest: "uploads/" });

// Nếu người dùng gửi file thì dùng upload.single("file"), nếu không thì vẫn gửi được
router.post("/sendmail", upload.single("file"), sendMail);

export default router;
