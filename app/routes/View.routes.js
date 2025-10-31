import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/pos", async (req, res, next) => {
  try {
    // Gọi API lấy toàn bộ sản phẩm
    const response = await axios.get("http://localhost:3000/sanpham/laytatca");
    const sanPham = response.data;

    // Nếu API trả về sai định dạng, ta xử lý an toàn
    if (!Array.isArray(sanPham)) {
      console.error("❌ API không trả về mảng sản phẩm:", sanPham);
      return res.render("pos/index", { sanPham: [], loai: [] });
    }

    // Tạo danh sách loại sản phẩm duy nhất
    const loai = [...new Set(sanPham.map(sp => sp.ten_loai || "Khác"))];

    // Truyền cả 2 biến vào EJS
    res.render("pos/index", { sanPham, loai });
  } catch (error) {
    console.error("❌ Lỗi khi tải sản phẩm:", error.message);
    res.render("pos/index", { sanPham: [], loai: [] });
  }
});

export default router;
