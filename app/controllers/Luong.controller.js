// controllers/Luong.controller.js
import { LuongModel } from "../models/Luong.model.js";

export const LuongController = {
async layTatCa(req, res) {
  try {
    const { thang, nam } = req.query;
    const data = await LuongModel.layTatCa(thang, nam);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await LuongModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await LuongModel.timTheoDieuKien(dieu_kien);
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
      const { nhan_vien_id, thang, nam, luong_co_ban } = req.body;

      if (!nhan_vien_id || !thang || !nam || !luong_co_ban) {
        return res
          .status(400)
          .json({ error: "Thiếu thông tin bắt buộc!" });
      }

      const id = await LuongModel.them(req.body);
      res.json({ message: "Thêm thành công", luong_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await LuongModel.capNhat(id, req.body);
      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await LuongModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
    // 🔒 CHỐT LƯƠNG
  async chotLuong(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "Thiếu luong_id"
        });
      }

      const data = await LuongModel.chotLuong(id);

      res.json({
        message: "Chốt lương thành công",
        data
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

};
