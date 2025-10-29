import express from "express";
import { ToppingController } from "../controllers/Topping.controller.js";

const router = express.Router();

router.get("/laytatca", ToppingController.layTatCa);
router.get("/layid/:id", ToppingController.timTheoId);
router.post("/timkiem", ToppingController.timTheoDieuKien);
router.post("/them", ToppingController.them);
router.put("/sua/:id", ToppingController.capNhat);
router.delete("/xoa/:id", ToppingController.xoa);

export default router;
