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

  // Tìm thông tin giảm giá theo mã khuyến mãi
 // MucGiamGia.controller.js
async timTheoMaKhuyenMai(req, res) {
    try {
        const { ma_khuyen_mai } = req.params;
        if (!ma_khuyen_mai) {
            return res.status(400).json({ error: 1, message: "Thiếu ma_khuyen_mai" });
        }

        const data = await MucGiamGiaModel.timTheoMaKhuyenMai(ma_khuyen_mai);

        if (!data) {
            return res.status(404).json({ error: 1, message: "Không tìm thấy mức giảm giá hoặc đã sử dụng" });
        }

        res.json({ error: 0, message: "Success", data });
    } catch (error) {
        res.status(500).json({ error: 1, message: error.message });
    }
},
// MucGiamGia.controller.js
async kiemTraMaChoThanhVien(req, res) {
    try {
        const { ma_khuyen_mai, thanh_vien_id } = req.body;

        if (!ma_khuyen_mai || !thanh_vien_id) {
            return res.status(400).json({ error: 1, message: "Thiếu ma_khuyen_mai hoặc thanh_vien_id" });
        }

        const data = await MucGiamGiaModel.kiemTraTheoThanhVien(ma_khuyen_mai, thanh_vien_id);

        if (!data) {
            return res.status(404).json({ error: 1, message: "Mã đã sử dụng hoặc không tồn tại cho thành viên này" });
        }

        res.json({ error: 0, message: "Success", data });
    } catch (error) {
        res.status(500).json({ error: 1, message: error.message });
    }
}


};
