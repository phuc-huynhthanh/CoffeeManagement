import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
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

// Routes
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

app.get("/", (req, res) => {
  res.send("☕ Coffee Management API đang chạy!");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Lỗi:", err.message);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));

