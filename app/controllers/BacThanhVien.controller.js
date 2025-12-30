import { BacThanhVienModel } from "../models/BacThanhVien.model.js";

export const BacThanhVienController = {
  async layTatCa(req, res) {
    try {
      const data = await BacThanhVienModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await BacThanhVienModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body || {};
      const data = await BacThanhVienModel.timTheoDieuKien(dieu_kien);
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu phù hợp." });
      }
      res.json(data);
    } catch (error) {
      // Nếu model ném lỗi vì thiếu điều kiện
      if (error.message && error.message.includes("Cần ít nhất")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async them(req, res) {
    try {
      const {
        ten_bac,
        diem_toi_thieu,
        phan_tram_giam,
        ma_icon,
        ma_mau
      } = req.body;

      if (!ten_bac) {
        return res.status(400).json({ error: "Tên bậc thành viên không được để trống!" });
      }

      // parse số nếu cần
      const diem = diem_toi_thieu !== undefined ? parseInt(diem_toi_thieu, 10) : 0;
      const phanTram = phan_tram_giam !== undefined ? parseFloat(phan_tram_giam) : 0;

      const id = await BacThanhVienModel.them({
        ten_bac,
        diem_toi_thieu: Number.isNaN(diem) ? 0 : diem,
        phan_tram_giam: Number.isNaN(phanTram) ? 0 : phanTram,
        ma_icon,
        ma_mau
      });

      res.json({ message: "Thêm thành công", bac_id: id });
    } catch (error) {
      // xử lý duplicate tên unique
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Tên bậc đã tồn tại." });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const {
        ten_bac,
        diem_toi_thieu,
        phan_tram_giam,
        ma_icon,
        ma_mau
      } = req.body;

      if (ten_bac === undefined && diem_toi_thieu === undefined && phan_tram_giam === undefined && ma_icon === undefined && ma_mau === undefined) {
        return res.status(400).json({ error: "Cần ít nhất 1 trường để cập nhật." });
      }

      // Lấy bản ghi hiện tại để giữ giá trị nếu người dùng không gửi trường đó
      const existing = await BacThanhVienModel.timTheoId(id);
      if (!existing) return res.status(404).json({ message: "Không tìm thấy!" });

      const diem = diem_toi_thieu !== undefined ? parseInt(diem_toi_thieu, 10) : existing.diem_toi_thieu;
      const phanTram = phan_tram_giam !== undefined ? parseFloat(phan_tram_giam) : existing.phan_tram_giam;

      const rows = await BacThanhVienModel.capNhat(id, {
        ten_bac: ten_bac !== undefined ? ten_bac : existing.ten_bac,
        diem_toi_thieu: Number.isNaN(diem) ? 0 : diem,
        phan_tram_giam: Number.isNaN(phanTram) ? 0 : phanTram,
        ma_icon: ma_icon !== undefined ? ma_icon : existing.ma_icon,
        ma_mau: ma_mau !== undefined ? ma_mau : existing.ma_mau
      });

      res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Tên bậc đã tồn tại." });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await BacThanhVienModel.xoa(id);
      res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};