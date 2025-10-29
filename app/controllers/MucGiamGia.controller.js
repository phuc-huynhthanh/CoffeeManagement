import { MucGiamGiaModel } from "../models/MucGiamGia.model.js";

export const MucGiamGiaController = {
  async layTatCa(req, res) {
    try {
      const data = await MucGiamGiaModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await MucGiamGiaModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await MucGiamGiaModel.timTheoDieuKien(dieu_kien);
      if (data.length === 0)
        return res.status(404).json({ message: "Không tìm thấy dữ liệu phù hợp." });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const id = await MucGiamGiaModel.them(req.body);
      res.json({ message: "Thêm thành công", muc_giam_gia_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await MucGiamGiaModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await MucGiamGiaModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
