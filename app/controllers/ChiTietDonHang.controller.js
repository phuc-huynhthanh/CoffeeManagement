import { ChiTietDonHangModel } from "../models/ChiTietDonHang.model.js";

export const ChiTietDonHangController = {
  async layTatCa(req, res) {
    try {
      const data = await ChiTietDonHangModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await ChiTietDonHangModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body || {};
      const data = await ChiTietDonHangModel.timTheoDieuKien(dieu_kien);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Body không được để trống!" });
      }
      const id = await ChiTietDonHangModel.them(req.body);
      res.json({ message: "Thêm thành công", chi_tiet_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await ChiTietDonHangModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy chi tiết để cập nhật!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await ChiTietDonHangModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy chi tiết để xóa!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
