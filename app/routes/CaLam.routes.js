// routes/CaLam.routes.js
import express from "express";
import { CaLamController } from "../controllers/CaLam.controller.js";

const router = express.Router();

router.get("/laytatca", CaLamController.layTatCa);
router.get("/timtheoid:id", CaLamController.timTheoId);
router.post("/timkiemdieukien", CaLamController.timTheoDieuKien);
router.post("/them", CaLamController.them);
router.put("/sua:id", CaLamController.capNhat);
router.delete("/xoa:id", CaLamController.xoa);

export default router;
