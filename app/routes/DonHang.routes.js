import express from "express";
import { DonHangController } from "../controllers/DonHang.controller.js";

const router = express.Router();

router.get("/laytatca", DonHangController.layTatCa);
router.get("/layid/:id", DonHangController.timTheoId);
router.post("/them", DonHangController.them);
router.put("/sua/:id", DonHangController.capNhat);
router.delete("/xoa/:id", DonHangController.xoa);

export default router;
