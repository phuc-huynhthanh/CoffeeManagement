import express from "express";
import { LuongController } from "../controllers/Luong.controller.js";

const router = express.Router();

router.get("/laytatca", LuongController.layTatCa);
router.get("/timtheoid/:id", LuongController.timTheoId);  // ✅ Thêm / trước :id
router.post("/timkiem", LuongController.timTheoDieuKien);
router.post("/them", LuongController.them);
router.post("/:id/chot-luong", LuongController.chotLuong);
router.put("/capnhat/:id", LuongController.capNhat);      // ✅ Thêm / trước :id
router.delete("/xoa/:id", LuongController.xoa);           // ✅ Thêm / trước :id

export default router;