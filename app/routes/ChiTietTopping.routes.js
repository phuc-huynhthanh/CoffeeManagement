import express from "express";
import { ChiTietToppingController } from "../controllers/ChiTietTopping.controller.js";

const router = express.Router();

router.get("/laytatca", ChiTietToppingController.layTatCa);
router.get("/layid/:id", ChiTietToppingController.timTheoId);
router.post("/tim", ChiTietToppingController.timTheoDieuKien);
router.post("/them", ChiTietToppingController.them);
router.put("/sua/:id", ChiTietToppingController.capNhat);
router.delete("/xoa/:id", ChiTietToppingController.xoa);

export default router;
