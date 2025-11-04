import express from "express";
import { DoanhThuCaController } from "../controllers/DoanhThuCa.controller.js";

const router = express.Router();

router.get("/laytatca", DoanhThuCaController.layTatCa);
router.get("/layid/:id", DoanhThuCaController.timTheoId);
router.post("/timkiem", DoanhThuCaController.timTheoDieuKien);
router.post("/them", DoanhThuCaController.them);
router.put("/sua/:id", DoanhThuCaController.capNhat);
router.delete("/xoa/:id", DoanhThuCaController.xoa);

export default router;
