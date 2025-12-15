// routes/ChiTietThuongPhat.routes.js
import express from "express";
import { ChiTietThuongPhatController } from "../controllers/ChiTietThuongPhat.controller.js";

const router = express.Router();

router.get("/laytatca", ChiTietThuongPhatController.layTatCa);
router.get("/timtheoid/:id", ChiTietThuongPhatController.timTheoId);
router.post("/timkiem", ChiTietThuongPhatController.timTheoDieuKien);
router.post("/them", ChiTietThuongPhatController.them);
router.put("/capnhat/:id", ChiTietThuongPhatController.capNhat);
router.delete("/xoa/:id", ChiTietThuongPhatController.xoa);

export default router;
