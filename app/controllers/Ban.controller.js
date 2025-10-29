import { BanModel } from "../models/Ban.model.js";

export const BanController = {
  async layTatCa(req, res) {
    try {
      const data = await BanModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await BanModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await BanModel.timTheoDieuKien(dieu_kien);
      if (data.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu phù hợp." });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const { ten_ban, trang_thai } = req.body;
      if (!ten_ban) {
        return res.status(400).json({ error: "Tên bàn không được để trống!" });
      }
      const id = await BanModel.them({ ten_ban, trang_thai });
      res.json({ message: "Thêm thành công", ban_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await BanModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await BanModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
