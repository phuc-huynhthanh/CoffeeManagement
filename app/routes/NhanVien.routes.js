import express from "express";
import { NhanVienController } from "../controllers/NhanVien.controller.js";

const router = express.Router();

// Các API CRUD cho nhân viên
router.get("/laytatca", NhanVienController.layTatCa);
router.get("/layid/:id", NhanVienController.layTheoId);
router.post("/them", NhanVienController.them);
router.put("/sua/:id", NhanVienController.capNhat);
router.delete("/xoa/:id", NhanVienController.xoa);
router.post("/tim", NhanVienController.timTheoGiaTri); 
router.get("/taikhoan/:tai_khoan_id", NhanVienController.layTheoTaiKhoanId);

export default router;
