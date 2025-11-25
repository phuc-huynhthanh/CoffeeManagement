import express from "express";
import payOS from "../utils/payos.js";

const router = express.Router();

router.post("/payos", async (req, res) => {
  try {
    const webhookData = payOS.verifyPaymentWebhookData(req.body);

    return res.json({
      error: 0,
      message: "OK",
      data: webhookData,
    });
  } catch (err) {
    console.error(err);
    res.json({
      error: -1,
      message: "Invalid webhook",
    });
  }
});

export default router;
