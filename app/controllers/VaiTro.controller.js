import { VaiTroModel } from "../models/VaiTro.model.js";

export const VaiTroController = {
  // 📋 Lấy danh sách vai trò
  async layTatCa(req, res) {
    try {
      const data = await VaiTroModel.layTatCa();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 🔍 Tìm vai trò theo ID
  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await VaiTroModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy vai trò" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 🔍 Tìm vai trò theo tên (body)
  async timTheoTen(req, res) {
    try {
      const { ten_vai_tro } = req.body;
      if (!ten_vai_tro) return res.status(400).json({ message: "Thiếu tên vai trò" });

      const data = await VaiTroModel.timTheoTen(ten_vai_tro);
      if (!data) return res.status(404).json({ message: "Không tìm thấy vai trò" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ➕ Thêm vai trò
  async them(req, res) {
    try {
      const { ten_vai_tro } = req.body;
      if (!ten_vai_tro) return res.status(400).json({ message: "Thiếu tên vai trò" });

      const id = await VaiTroModel.them({ ten_vai_tro });
      res.status(201).json({ message: "Thêm vai trò thành công", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ✏️ Cập nhật vai trò
  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const { ten_vai_tro } = req.body;
      const rows = await VaiTroModel.capNhat(id, { ten_vai_tro });
      if (rows === 0) return res.status(404).json({ message: "Không tìm thấy vai trò" });
      res.json({ message: "Cập nhật vai trò thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ❌ Xóa vai trò
  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await VaiTroModel.xoa(id);
      if (rows === 0) return res.status(404).json({ message: "Không tìm thấy vai trò" });
      res.json({ message: "Xóa vai trò thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
