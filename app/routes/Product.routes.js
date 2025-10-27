import express from "express";
import { ProductController } from "../controllers/Product.controller.js";

const router = express.Router();

router.get("/laytatca", ProductController.getAll);
router.post("/them", ProductController.create);
router.put("/sua/:id", ProductController.update);
router.delete("/xoa/:id", ProductController.delete);

export default router;
