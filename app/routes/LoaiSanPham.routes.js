import express from "express";
import { LoaiSanPhamController } from "../controllers/LoaiSanPham.controller.js";

const router = express.Router();
router.get("/laytatca", LoaiSanPhamController.layTatCa);
router.get("/layid/:id", LoaiSanPhamController.timTheoId);
router.post("/tim", LoaiSanPhamController.timTheoTen);
router.post("/them", LoaiSanPhamController.them);
router.put("/sua/:id", LoaiSanPhamController.capNhat);
router.delete("/xoa/:id", LoaiSanPhamController.xoa);

export default router;
