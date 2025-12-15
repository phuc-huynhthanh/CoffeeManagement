// controllers/ChiTietThuongPhat.controller.js
import { ChiTietThuongPhatModel } from "../models/ChiTietThuongPhat.model.js";

export const ChiTietThuongPhatController = {
  async layTatCa(req, res) {
    try {
      const data = await ChiTietThuongPhatModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await ChiTietThuongPhatModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await ChiTietThuongPhatModel.timTheoDieuKien(dieu_kien);
      if (data.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy dữ liệu phù hợp." });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const { luong_id, loai, so_tien } = req.body;

      if (!luong_id || !loai || so_tien === undefined) {
        return res
          .status(400)
          .json({ error: "Thiếu thông tin bắt buộc!" });
      }

      const id = await ChiTietThuongPhatModel.them(req.body);
      res.json({ message: "Thêm thành công", chi_tiet_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await ChiTietThuongPhatModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await ChiTietThuongPhatModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
