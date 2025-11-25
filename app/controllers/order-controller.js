import express from "express";
import payOS from "../utils/payos.js";

const router = express.Router();

// 👉 Tạo payment link với thông tin sản phẩm
router.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, description, returnUrl, cancelUrl, orderCode, items } = req.body;
    
    const generatedOrderCode = orderCode || Number(String(Date.now()).slice(-6));
    
    const body = {
      orderCode: generatedOrderCode,
      amount: parseInt(amount) || 1000,
      description: description || 'Thanh toán đơn hàng',
      returnUrl: returnUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/success`,
      cancelUrl: cancelUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/view/pos`
    };

    // ✅ Thêm items nếu có
    if (items && Array.isArray(items) && items.length > 0) {
      body.items = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
    }

    console.log("📤 Sending to PayOS:", body);

    // ✅ Sử dụng paymentRequests.create() thay vì createPaymentLink()
    const paymentLinkRes = await payOS.paymentRequests.create(body);

    console.log("✅ Payment link created:", paymentLinkRes);

    return res.json({
      error: 0,
      message: "Success",
      data: paymentLinkRes
    });
  } catch (error) {
    console.error("❌ PayOS Error:", error);
    return res.status(500).json({
      error: -1,
      message: "Failed to create payment link",
      details: error.message
    });
  }
});

// 👉 Lấy thông tin payment link
router.get("/:orderId", async (req, res) => {
  try {
    // ✅ Sử dụng paymentRequests.retrieve()
    const order = await payOS.paymentRequests.retrieve(req.params.orderId);

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
      data: error.message
    });
  }
});

// 👉 Hủy payment link
router.delete("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;

    // ✅ Sử dụng paymentRequests.cancel()
    const result = await payOS.paymentRequests.cancel(orderId, {
      cancellationReason: cancellationReason || "Hủy đơn hàng"
    });

    return res.json({
      error: 0,
      message: "Success",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      error: -1,
      message: "Failed",
      data: err.message
    });
  }
});

export default router;