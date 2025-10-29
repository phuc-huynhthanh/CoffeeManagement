import express from "express";
import { MucGiamGiaController } from "../controllers/MucGiamGia.controller.js";

const router = express.Router();

router.get("/laytatca", MucGiamGiaController.layTatCa);
router.get("/layid/:id", MucGiamGiaController.timTheoId);
router.post("/timkiem", MucGiamGiaController.timTheoDieuKien);
router.post("/them", MucGiamGiaController.them);
router.put("/sua/:id", MucGiamGiaController.capNhat);
router.delete("/xoa/:id", MucGiamGiaController.xoa);

export default router;
