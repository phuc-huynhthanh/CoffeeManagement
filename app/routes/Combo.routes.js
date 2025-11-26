import express from "express";
import { ComboController } from "../controllers/Combo.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/laytatca", ComboController.getAll);
router.get("/layid/:id", ComboController.getById);
router.post("/them", upload.single("hinh_anh"), ComboController.create);
router.put("/sua/:id", upload.single("hinh_anh"), ComboController.update);
router.delete("/xoa/:id", ComboController.delete);

export default router;