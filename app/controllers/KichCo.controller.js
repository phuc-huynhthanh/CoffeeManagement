import { KichCoModel } from "../models/KichCo.model.js";

export const KichCoController = {
  async layTatCa(req, res) {
    try {
      const data = await KichCoModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await KichCoModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy kích cỡ!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await KichCoModel.timTheoDieuKien(dieu_kien);
      if (data.length === 0)
        return res.status(404).json({ message: "Không có dữ liệu phù hợp." });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const { ten_kich_co, gia_them } = req.body;
      if (!ten_kich_co || gia_them === undefined) {
        return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc!" });
      }
      const id = await KichCoModel.them({ ten_kich_co, gia_them });
      res.json({ message: "Thêm thành công!", kich_co_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const { ten_kich_co, gia_them } = req.body;
      const result = await KichCoModel.capNhat(id, { ten_kich_co, gia_them });
      res.json({
        message: result ? "Cập nhật thành công!" : "Không tìm thấy kích cỡ!",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const result = await KichCoModel.xoa(id);
      res.json({
        message: result ? "Xóa thành công!" : "Không tìm thấy kích cỡ!",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
