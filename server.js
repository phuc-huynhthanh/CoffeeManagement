import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import NhanVienRoutes from "./app/routes/NhanVien.routes.js";
import ProductRoutes from "./app/routes/Product.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/sanpham", ProductRoutes);
app.use("/nhanvien", NhanVienRoutes);

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

