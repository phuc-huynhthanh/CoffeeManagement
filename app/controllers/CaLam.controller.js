// controllers/CaLam.controller.js
import { CaLamModel } from "../models/CaLam.model.js";

export const CaLamController = {
  async layTatCa(req, res) {
    try {
      const data = await CaLamModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await CaLamModel.timTheoId(id);
      if (!data) {
        return res.status(404).json({ message: "Không tìm thấy ca làm!" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body || {};
      const data = await CaLamModel.timTheoDieuKien(dieu_kien);
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

      const id = await CaLamModel.them(req.body);
      res.json({ message: "Thêm ca làm thành công", ca_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await CaLamModel.capNhat(id, req.body);

      res.json({
        message: rows ? "Cập nhật ca làm thành công" : "Không tìm thấy ca làm!",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await CaLamModel.xoa(id);

      res.json({
        message: rows ? "Xóa ca làm thành công" : "Không tìm thấy ca làm!",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
