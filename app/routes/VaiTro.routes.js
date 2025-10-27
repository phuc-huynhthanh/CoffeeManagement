import express from "express";
import { VaiTroController } from "../controllers/VaiTro.controller.js";

const router = express.Router();

router.get("/laytatca", VaiTroController.layTatCa);
router.get("/layid/:id", VaiTroController.timTheoId);
router.post("/tim", VaiTroController.timTheoTen);
// router.post("/them", VaiTroController.them);
router.put("/sua/:id", VaiTroController.capNhat);
router.delete("/xoa/:id", VaiTroController.xoa);

export default router;
