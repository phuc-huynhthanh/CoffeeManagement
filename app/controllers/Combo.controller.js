import { ComboModel } from "../models/Combo.model.js";
import axios from "axios";
import { IMGBB_API_KEY } from "../config/imgbb.conf.js";
import FormData from "form-data";

export const ComboController = {
  // Lấy tất cả combo
  async getAll(req, res) {
    try {
      const combos = await ComboModel.getAll();
      res.json({ success: true, data: combos });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách combo",
        error: error.message
      });
    }
  },

  // Lấy combo theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const combo = await ComboModel.findById(id);

      if (!combo) {
        return res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      }

      res.json({ success: true, data: combo });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi lấy combo",
        error: error.message
      });
    }
  },

  // Tạo combo
  async create(req, res) {
    try {
      const { ten_combo, mo_ta, gia_combo, gia_goc, trang_thai, san_pham } = req.body;

      if (!ten_combo || !gia_combo) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: ten_combo và gia_combo"
        });
      }

      const parsedGiaCombo = parseFloat(gia_combo);
      const parsedGiaGoc = gia_goc ? parseFloat(gia_goc) : 0;

      if (parsedGiaGoc > 0 && parsedGiaGoc < parsedGiaCombo) {
        return res.status(400).json({
          success: false,
          message: "Giá gốc phải lớn hơn hoặc bằng giá combo"
        });
      }

      // Ảnh mặc định
      let imageUrl = "/assets/coffee.png";

      // Upload ảnh imgbb
      if (req.file) {
        try {
          const formData = new FormData();
          formData.append("image", req.file.buffer.toString("base64"));

          const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData,
            { headers: formData.getHeaders() }
          );

          imageUrl = response.data.data.url || imageUrl;
        } catch (err) {
          console.error("Upload ảnh thất bại:", err.message);
        }
      }

      // Parse sản phẩm
      let parsedSanPham = [];
      if (san_pham) {
        parsedSanPham = typeof san_pham === "string" ? JSON.parse(san_pham) : san_pham;
      }

      const comboId = await ComboModel.create({
        ten_combo,
        mo_ta: mo_ta || "",
        gia_combo: parsedGiaCombo,
        gia_goc: parsedGiaGoc,
        hinh_anh: imageUrl,
        trang_thai: trang_thai || "active",
        san_pham: parsedSanPham
      });

      res.status(201).json({
        success: true,
        message: "Tạo combo thành công!",
        data: { combo_id: comboId, hinh_anh: imageUrl }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo combo",
        error: error.message
      });
    }
  },

  // Cập nhật combo
  async update(req, res) {
    try {
      const { id } = req.params;

      const combo = await ComboModel.findById(id);
      if (!combo) {
        return res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      }

      const { ten_combo, mo_ta, gia_combo, gia_goc, trang_thai, san_pham } = req.body;

      const parsedGiaCombo = gia_combo ? parseFloat(gia_combo) : combo.gia_combo;
      const parsedGiaGoc = gia_goc ? parseFloat(gia_goc) : combo.gia_goc;

      if (parsedGiaGoc > 0 && parsedGiaGoc < parsedGiaCombo) {
        return res.status(400).json({
          success: false,
          message: "Giá gốc phải lớn hơn hoặc bằng giá combo"
        });
      }

      let imageUrl = combo.hinh_anh;

      if (req.file) {
        try {
          const formData = new FormData();
          formData.append("image", req.file.buffer.toString("base64"));

          const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData,
            { headers: formData.getHeaders() }
          );

          imageUrl = response.data.data.url || imageUrl;
        } catch (err) {
          console.error("Upload ảnh thất bại:", err.message);
        }
      }

      let parsedSanPham = san_pham
        ? typeof san_pham === "string"
          ? JSON.parse(san_pham)
          : san_pham
        : combo.san_pham;

      await ComboModel.update(id, {
        ten_combo: ten_combo || combo.ten_combo,
        mo_ta: mo_ta || combo.mo_ta,
        gia_combo: parsedGiaCombo,
        gia_goc: parsedGiaGoc,
        hinh_anh: imageUrl,
        trang_thai: trang_thai || combo.trang_thai,
        san_pham: parsedSanPham
      });

      res.json({ success: true, message: "Cập nhật combo thành công!" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi cập nhật combo",
        error: error.message
      });
    }
  },

  // Xóa combo
  async delete(req, res) {
    try {
      const { id } = req.params;

      const combo = await ComboModel.findById(id);
      if (!combo) {
        return res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      }

      const affected = await ComboModel.delete(id);

      res.json({
        success: true,
        message: "Xóa combo thành công!"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi xóa combo",
        error: error.message
      });
    }
  }
};
