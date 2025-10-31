import express from "express";
import multer from "multer";

import { ProductController } from "../controllers/Product.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
router.get("/laytatca", ProductController.getAll);
// router.post("/them", ProductController.create);
router.put("/sua/:id", ProductController.update);
router.delete("/xoa/:id", ProductController.delete);
router.post("/them", upload.single("hinh_anh"), ProductController.create);

export default router;
