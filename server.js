import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer"; // ✅ Thêm import này

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
import ComboRoutes from "./app/routes/Combo.routes.js";

// Import payment controllers
import paymentController from "./app/controllers/payment-controller.js";
import orderController from "./app/controllers/order-controller.js";

dotenv.config();
const app = express();

// ✅ Cấu hình view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Middleware - QUAN TRỌNG: Thứ tự này rất quan trọng!
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // ✅ THÊM dòng này - Parse application/x-www-form-urlencoded
app.use(morgan("dev"));

// Static files
app.use('/', express.static('public'));

// ✅ Payment & Order routes
app.use("/payment", paymentController);
app.use("/order", orderController);

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
app.use("/combo", ComboRoutes);

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

// ✅ Error Handler - Xử lý lỗi Multer
app.use((err, req, res, next) => {
  // Xử lý lỗi Multer
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer Error:", err);
    
    if (err.code === 'UNEXPECTED_FIELD') {
      return res.status(400).json({
        success: false,
        message: `Tên field upload không đúng. Expected field: 'hinh_anh', Got: '${err.field}'`
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File quá lớn.Giới hạn 5MB"
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`
    });
  }
  
  // Xử lý lỗi khác
  console.error("❌ Lỗi:", err.message);
  console.error("Stack:", err.stack);
  
  res.status(500).json({ 
    success: false,
    message: "Lỗi server", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));