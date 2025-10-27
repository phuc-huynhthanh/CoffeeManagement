import express from "express";
import { TaiKhoanController } from "../controllers/TaiKhoan.controller.js";

const router = express.Router();

router.get("/laytatca", TaiKhoanController.layTatCa);
router.get("/laytheoid/:id", TaiKhoanController.layTheoId);
router.post("/them", TaiKhoanController.them);
router.put("/sua/:id", TaiKhoanController.capNhat);
router.delete("/xoa/:id", TaiKhoanController.xoa);

export default router;
