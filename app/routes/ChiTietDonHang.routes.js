import express from "express";
import { ChiTietDonHangController } from "../controllers/ChiTietDonHang.controller.js";

const router = express.Router();

router.get("/laytatca", ChiTietDonHangController.layTatCa);
router.get("/layid/:id", ChiTietDonHangController.timTheoId);
router.post("/tim", ChiTietDonHangController.timTheoDieuKien);
router.post("/them", ChiTietDonHangController.them);
router.put("/sua/:id", ChiTietDonHangController.capNhat);
router.delete("/xoa/:id", ChiTietDonHangController.xoa);

export default router;
