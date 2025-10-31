import express from "express";
import { sendMail } from "../controllers/Mail.controller.js";

const router = express.Router();

router.post("/sendmail", sendMail);

export default router;
