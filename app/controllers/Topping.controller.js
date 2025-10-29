import { ToppingModel } from "../models/Topping.model.js";

export const ToppingController = {
  async layTatCa(req, res) {
    try {
      const data = await ToppingModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await ToppingModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await ToppingModel.timTheoDieuKien(dieu_kien);

      if (data.length === 0)
        return res.status(404).json({ message: "Không tìm thấy dữ liệu phù hợp." });

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const { ten_topping, gia_them } = req.body;
      if (!ten_topping || gia_them == null)
        return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc!" });

      const id = await ToppingModel.them({ ten_topping, gia_them });
      res.json({ message: "Thêm thành công", topping_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await ToppingModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await ToppingModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
