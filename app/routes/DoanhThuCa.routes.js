// routes/doanhThuCa.route.js
import express from "express";
import { DoanhThuCaController } from "../controllers/DoanhThuCa.controller.js";

const router = express.Router();

router.get("/laytatca", DoanhThuCaController.layTatCa);
router.get("/:id", DoanhThuCaController.timTheoId);

// tìm theo điều kiện (body)
router.post("/tim", DoanhThuCaController.timTheoDieuKien);

// thống kê theo ngày
router.get("/thongke/ngay", DoanhThuCaController.thongKeTheoNgay);

// rebuild doanh thu ca từ don_hang
router.post("/rebuild", DoanhThuCaController.rebuild);

export default router;
