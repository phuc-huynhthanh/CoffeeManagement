import express from "express";
import payOS from "../utils/payos.js";

const router = express.Router();

router.post("/payos", async (req, res) => {
  try {
    const webhookData = payOS.verifyPaymentWebhookData(req.body);

    return res.json({
      error: 0,
      message: "Ok",
      data: webhookData
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: -1,
      message: "Webhook processing failed",
      details: error.message
    });
  }
});

export default router;
