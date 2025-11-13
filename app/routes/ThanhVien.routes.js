import express from "express";
import { ThanhVienController } from "../controllers/ThanhVien.controller.js";

const router = express.Router();

router.get("/laytatca", ThanhVienController.layTatCa);
router.get("/layid/:id", ThanhVienController.timTheoId);
router.get("/timtheosdt/:sdt", ThanhVienController.timTheoSDT); // <-- API mới
router.post("/them", ThanhVienController.themMoi);
router.put("/sua/:id", ThanhVienController.capNhat);
router.delete("/xoa/:id", ThanhVienController.xoa);
router.post("/timkiem", ThanhVienController.timTheoDieuKien);

export default router;
