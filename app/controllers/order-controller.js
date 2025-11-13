import express from "express";
import payOS from "../utils/payos.js";

const router = express.Router();

// Hàm tạo payment link (dùng HTTP trực tiếp nếu SDK không có)
async function createPaymentLinkDirect(body) {
  const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';
  
  const response = await fetch(PAYOS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': process.env.PAYOS_CLIENT_ID,
      'x-api-key': process.env.PAYOS_API_KEY
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayOS API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// Route tạo payment link
router.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, description, returnUrl, cancelUrl, orderCode } = req.body;
    
    const generatedOrderCode = orderCode || `ORD-${Date.now()}`;
    
    const body = {
      orderCode: generatedOrderCode,
      amount: parseInt(amount) || 1000,
      description: description || 'Thanh toán đơn hàng',
      returnUrl: returnUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/success`,
      cancelUrl: cancelUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/cancel`
    };

    let paymentLinkRes;

    // Dùng SDK nếu có phương thức
    if (payOS.createPaymentLink && typeof payOS.createPaymentLink === 'function') {
      paymentLinkRes = await payOS.createPaymentLink(body);
    } else {
      paymentLinkRes = await createPaymentLinkDirect(body);
    }

    // Debug log
console.log("Payment link response:", paymentLinkRes);

 return res.json({
    error: 0,
    message: "Success",
    data: {
        checkoutUrl: paymentLinkRes?.checkoutUrl || null,
        qrCode: paymentLinkRes?.qrCode || null,
        orderCode: paymentLinkRes?.orderCode || body.orderCode,
        amount: paymentLinkRes?.amount || body.amount,
        description: paymentLinkRes?.description || body.description
    }
});
  } catch (error) {
    console.error("PayOS Error:", error);
    return res.status(500).json({
      error: -1,
      message: "Failed to create payment link",
      details: error.message
    });
  }
});

// Route lấy thông tin payment link
router.get("/:orderId", async (req, res) => {
  try {
    let order;

    if (payOS.getPaymentLinkInformation && typeof payOS.getPaymentLinkInformation === 'function') {
      order = await payOS.getPaymentLinkInformation(req.params.orderId);
    } else {
      const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${req.params.orderId}`, {
        headers: {
          'x-client-id': process.env.PAYOS_CLIENT_ID,
          'x-api-key': process.env.PAYOS_API_KEY
        }
      });
      order = await response.json();
    }

    return res.json({
      error: 0,
      message: "ok",
      data: order
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: -1,
      message: "Failed to get payment info",
      data: null
    });
  }
});

export default router;
