import express from "express";
import { LichLamViecController } from "../controllers/LichLamViec.controller.js";

const router = express.Router();

// GET - Lấy tất cả lịch làm việc
router.get("/", LichLamViecController.layTatCa);

// GET - Lấy lịch làm việc theo ID
router.get("/:id", LichLamViecController. timTheoId);

// POST - Tìm lịch theo điều kiện
router.post("/tim-kiem", LichLamViecController.timTheoDieuKien);

// POST - Tìm lịch trong khoảng thời gian (PHẢI ĐẶT TRƯỚC /: id)
router.post("/tim-khoang-ngay", LichLamViecController.timTheoKhoangNgay);

// GET - Tìm lịch theo nhân viên
router.get("/nhan-vien/:nhan_vien_id", LichLamViecController.timTheoNhanVien);

// POST - Lấy thống kê lịch làm
router.post("/thong-ke", LichLamViecController.thongKe);

// POST - Thêm lịch làm việc mới
router.post("/", LichLamViecController. them);

// PUT - Cập nhật lịch làm việc
router.put("/:id", LichLamViecController.capNhat);

// DELETE - Xóa lịch làm việc
router.delete("/:id", LichLamViecController.xoa);

export default router;