import express from "express";
import { LichLamViecController } from "../controllers/LichLamViec.controller.js";

const router = express.Router();

router.get("/laytatca", LichLamViecController.layTatCa);
router.get("/layid/:id", LichLamViecController.timTheoId);
router.post("/timkiem", LichLamViecController.timTheoDieuKien);
router.post("/them", LichLamViecController.them);
router.put("/sua/:id", LichLamViecController.capNhat);
router.delete("/xoa/:id", LichLamViecController.xoa);

export default router;