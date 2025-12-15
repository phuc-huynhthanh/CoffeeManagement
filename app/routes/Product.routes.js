import express from "express";
import multer from "multer";

import { ProductController } from "../controllers/Product.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
router.get("/laytatca", ProductController.getAll);
router.get("/ban-chay", ProductController.laySanPhamBanChay);
// router.post("/them", ProductController.create);
// Cập nhật sản phẩm (upload file mới nếu muốn)
router.put("/sua/:id", upload.single("hinh_anh"), ProductController.update);
router.delete("/xoa/:id", ProductController.delete);
router.post("/them", upload.single("hinh_anh"), ProductController.create);
// Lấy sản phẩm bán chạy

export default router;
