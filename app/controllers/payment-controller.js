import express from "express";
import payOS from "../utils/payos.js";
import { db } from "../config/db.conf.js";

const router = express.Router();

router.post("/payos", async (req, res) => {
  try {
    const webhookData = payOS.verifyPaymentWebhookData(req.body);
    
    // ✅ Xử lý khi thanh toán thành công
    if (webhookData.code === "00" && webhookData.desc === "success") {
      const orderCode = webhookData.data?.orderCode;
      
      if (orderCode) {
        // Tìm đơn hàng có mã orderCode này
        const [orders] = await db.query(
          'SELECT * FROM don_hang WHERE JSON_EXTRACT(ghi_chu, "$.orderCode") = ?',
          [orderCode]
        );
        
        if (orders.length > 0) {
          const donHang = orders[0];
          
          // Cập nhật trạng thái đơn hàng thành "Đã thanh toán"
          await db.query(
            'UPDATE don_hang SET trang_thai = ? WHERE don_hang_id = ?',
            ['Đã thanh toán', donHang.don_hang_id]
          );
          
          // Cập nhật trạng thái bàn về "Trống"
          await db.query(
            'UPDATE ban SET trang_thai = ? WHERE ban_id = ?',
            ['Trống', donHang.ban_id]
          );
          
          // Cập nhật đặt bàn (nếu có) thành "Đã hủy"
          const [reservations] = await db.query(
            'SELECT * FROM dat_ban WHERE ban_id = ? AND trang_thai = ?',
            [donHang.ban_id, 'Đã đến']
          );
          
          if (reservations.length > 0) {
            await db.query(
              'UPDATE dat_ban SET trang_thai = ? WHERE dat_ban_id = ?',
              ['Đã hủy', reservations[0].dat_ban_id]
            );
          }
          
          console.log(`✅ Thanh toán thành công cho đơn hàng #${donHang.don_hang_id}, bàn #${donHang.ban_id}`);
        }
      }
    }

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
