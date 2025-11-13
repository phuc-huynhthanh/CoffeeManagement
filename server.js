import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import NhanVienRoutes from "./app/routes/NhanVien.routes.js";
import ProductRoutes from "./app/routes/Product.routes.js";
import TaiKhoanRoutes from "./app/routes/TaiKhoan.routes.js";
import LoaiSanPhamRoutes from "./app/routes/LoaiSanPham.routes.js";
import VaiTroRoutes from "./app/routes/VaiTro.routes.js";  
import DonHangRoutes from "./app/routes/DonHang.routes.js"; 
import ChiTietDonHangRoutes from "./app/routes/ChiTietDonHang.routes.js";
import BanRoutes from "./app/routes/Ban.routes.js";
import KichCoRoutes from "./app/routes/KichCo.routes.js";
import ToppingRoutes from "./app/routes/Topping.routes.js";
import MucGiamGiaRoutes from "./app/routes/MucGiamGia.routes.js";
import MailRoutes from "./app/routes/Mail.routes.js";
import ChiTietToppingRoutes from "./app/routes/ChiTietTopping.routes.js";
import ThanhVienRoutes from "./app/routes/ThanhVien.routes.js";
import ViewsRoutes from "./app/routes/View.routes.js";
import DoanhThuCaRoutes from "./app/routes/DoanhThuCa.routes.js";
import LichLamViecRoutes from "./app/routes/LichLamViec.routes.js";

// Import payment controllers
import paymentController from "./app/controllers/payment-controller.js";
import orderController from "./app/controllers/order-controller.js";
import payOS from './app/utils/payos.js';




dotenv.config();
const app = express();

// ✅ Cấu hình view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Static files
app.use('/', express.static('public'));

// ✅ Payment routes (QUAN TRỌNG: Chỉ dùng MỘT trong hai cách dưới)

// CÁCH 1: Dùng orderController (khuyến nghị)
app.use('/order', orderController);

// Hoặc CÁCH 2: Dùng route trực tiếp (comment cách 1 nếu dùng cách 2)
// app.post('/create-payment-link', async (req, res) => {
//     const { amount, description, returnUrl, cancelUrl } = req.body;

//     const body = {
//         orderCode: Number(String(Date.now()).slice(-6)),
//         amount: amount || 1000,
//         description: description || 'Thanh toan don hang',
//         returnUrl: returnUrl || 'http://localhost:3000/success',
//         cancelUrl: cancelUrl || 'http://localhost:3000/cancel'
//     };

//     try {
//         const paymentLinkResponse = await payOS.createPaymentLink(body);
//         res.json(paymentLinkResponse);
//     } catch (error) {
//         console.error("Lỗi PayOS:", error);
//         res.status(500).json({
//             error: true,
//             message: "Something went wrong",
//             details: error.message || error
//         });
//     }
// });

// Other routes
app.use("/sanpham", ProductRoutes);
app.use("/nhanvien", NhanVienRoutes);
app.use("/taikhoan", TaiKhoanRoutes);
app.use("/loaisanpham", LoaiSanPhamRoutes);
app.use("/vaitro", VaiTroRoutes);
app.use("/donhang", DonHangRoutes);
app.use("/chitietdonhang", ChiTietDonHangRoutes);
app.use("/ban", BanRoutes);
app.use("/kichco", KichCoRoutes);
app.use("/topping", ToppingRoutes);
app.use("/mucgiamgia", MucGiamGiaRoutes);
app.use("/mail", MailRoutes);
app.use("/chitiettopping", ChiTietToppingRoutes);
app.use("/thanhvien", ThanhVienRoutes);
app.use("/view", ViewsRoutes);
app.use("/doanhthuca", DoanhThuCaRoutes);
app.use("/lichlamviec", LichLamViecRoutes);
app.use("/payment", paymentController);
app.use("/order", orderController);



// Test route
app.get("/test-payos", async (req, res) => {
  try {
    res.json({ 
      message: "PayOS connection test",
      status: "OK",
      clientId: process.env.PAYOS_CLIENT_ID ? "✓ Có" : "✗ Thiếu"
    });
  } catch (error) {
    res.json({ 
      message: "PayOS test failed", 
      error: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("☕ Coffee Management API đang chạy!");
});

app.get("/admin", (req, res) => {
  res.render("admin/admin", { employees: [] });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Lỗi:", err.message);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));