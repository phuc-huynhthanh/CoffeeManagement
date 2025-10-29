import express from "express";
import { BanController } from "../controllers/Ban.controller.js";

const router = express.Router();

router.get("/laytatca", BanController.layTatCa);
router.get("/layid/:id", BanController.timTheoId);
router.post("/timkiem", BanController.timTheoDieuKien);
router.post("/them", BanController.them);
router.put("/sua/:id", BanController.capNhat);
router.delete("/xoa/:id", BanController.xoa);

export default router;
