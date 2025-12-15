// routes/Luong.routes.js
import express from "express";
import { LuongController } from "../controllers/Luong.controller.js";

const router = express.Router();

router.get("/laytatca", LuongController.layTatCa);
router.get("/timtheoid:id", LuongController.timTheoId);
router.post("/timkiem", LuongController.timTheoDieuKien);
router.post("/them", LuongController.them);
router.put("/sua:id", LuongController.capNhat);
router.delete("/xoa:id", LuongController.xoa);

export default router;
