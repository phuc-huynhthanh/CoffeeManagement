import express from "express";
import { xacThucJWT } from "../middlewares/auth.middleware.js";
import { TaiKhoanController } from "../controllers/TaiKhoan.controller.js";

const router = express.Router();

// router.get("/laytatca", TaiKhoanController.layTatCa);
router.get("/laytheoid/:id", TaiKhoanController.layTheoId);
router.post("/them", TaiKhoanController.them);
router.put("/sua/:id", TaiKhoanController.capNhat);
router.delete("/xoa/:id", TaiKhoanController.xoa);

router.get("/dangnhap", (req, res) => res.render("auth/DangNhap"));



router.post("/dangky", TaiKhoanController.dangKy);
router.post("/dangnhap", TaiKhoanController.dangNhap);
router.get("/laytatca", xacThucJWT, TaiKhoanController.layTatCa);

router.get("/thongtin", xacThucJWT, TaiKhoanController.thongTinNguoiDung);
export default router;
