import { LoaiSanPhamModel } from "../models/LoaiSanPham.model.js";

export const LoaiSanPhamController = {
  // 📋 Lấy tất cả loại sản phẩm
  async layTatCa(req, res) {
    try {
      const dsLoai = await LoaiSanPhamModel.layTatCa();
      res.json(dsLoai);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách loại sản phẩm", error: err.message });
    }
  },

  // 🔎 Tìm theo ID
  async timTheoId(req, res) {
    try {
      const loai = await LoaiSanPhamModel.timTheoId(req.params.id);
      if (!loai) return res.status(404).json({ message: "Không tìm thấy loại sản phẩm" });
      res.json(loai);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tìm loại sản phẩm theo ID", error: err.message });
    }
  },

  // 🔎 Tìm theo tên (body)
  async timTheoTen(req, res) {
    try {
      const { ten_loai } = req.body;
      if (!ten_loai) return res.status(400).json({ message: "Thiếu tên loại sản phẩm" });

      const loai = await LoaiSanPhamModel.timMot({ ten_loai });
      if (!loai) return res.status(404).json({ message: "Không tìm thấy loại sản phẩm" });
      res.json(loai);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tìm loại sản phẩm", error: err.message });
    }
  },

  // ➕ Thêm mới
  async them(req, res) {
    try {
      const { ten_loai } = req.body;
      if (!ten_loai) return res.status(400).json({ message: "Thiếu tên loại sản phẩm" });

      const id = await LoaiSanPhamModel.them({ ten_loai });
      res.status(201).json({ message: "Thêm loại sản phẩm thành công", loai_id: id });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi thêm loại sản phẩm", error: err.message });
    }
  },

  // ✏️ Cập nhật
  async capNhat(req, res) {
    try {
      const { ten_loai } = req.body;
      const id = req.params.id;

      const soDong = await LoaiSanPhamModel.capNhat(id, { ten_loai });
      if (soDong === 0) return res.status(404).json({ message: "Không tìm thấy loại sản phẩm để cập nhật" });

      res.json({ message: "Cập nhật loại sản phẩm thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật loại sản phẩm", error: err.message });
    }
  },

  // ❌ Xóa
  async xoa(req, res) {
    try {
      const id = req.params.id;
      
      // Kiểm tra xem loại sản phẩm có sản phẩm nào không
      const soLuongSanPham = await LoaiSanPhamModel.demSanPhamTheoLoai(id);
      
      if (soLuongSanPham > 0) {
        return res.status(400).json({ 
          message: `Không thể xóa loại sản phẩm này vì đã có ${soLuongSanPham} sản phẩm trong danh mục`,
          error: "CONSTRAINT_VIOLATION"
        });
      }
      
      const soDong = await LoaiSanPhamModel.xoa(id);

      if (soDong === 0) return res.status(404).json({ message: "Không tìm thấy loại sản phẩm để xóa" });
      res.json({ message: "Xóa loại sản phẩm thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa loại sản phẩm", error: err.message });
    }
  },
};
