import express from "express";
import { KichCoController } from "../controllers/KichCo.controller.js";

const router = express.Router();

router.get("/laytatca", KichCoController.layTatCa);
router.get("/layid/:id", KichCoController.timTheoId);
router.post("/timkiem", KichCoController.timTheoDieuKien);
router.post("/them", KichCoController.them);
router.put("/sua/:id", KichCoController.capNhat);
router.delete("/xoa/:id", KichCoController.xoa);

export default router;
