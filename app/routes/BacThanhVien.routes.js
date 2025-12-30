import express from "express";
import { BacThanhVienController } from "../controllers/BacThanhVien.controller.js";

const router = express.Router();

// Lấy tất cả
router.get("/laytatca", BacThanhVienController.layTatCa);

// Lấy theo id
router.get("/:id", BacThanhVienController.timTheoId);

// Tìm theo điều kiện (body: JSON object)
router.post("/tim-kiem", BacThanhVienController.timTheoDieuKien);

// Thêm mới
router.post("/them", BacThanhVienController.them);

// Cập nhật (PUT)
router.put("/sua/:id", BacThanhVienController.capNhat);

// Xóa
router.delete("/xoa/:id", BacThanhVienController.xoa);

export default router;