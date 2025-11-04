import { DoanhThuCaModel } from "../models/DoanhThuCa.model.js";

export const DoanhThuCaController = {
  async layTatCa(req, res) {
    try {
      const data = await DoanhThuCaModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await DoanhThuCaModel.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy doanh thu ca" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      const data = await DoanhThuCaModel.timTheoDieuKien(dieu_kien);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

//   async them(req, res) {
//     try {
//       const { ca_id, ngay, tong_doanh_thu } = req.body;
//       if (!ca_id || !ngay)
//         return res.status(400).json({ error: "Thiếu ca_id hoặc ngày." });

//       const id = await DoanhThuCaModel.them({ ca_id, ngay, tong_doanh_thu });
//       res.status(201).json({ message: "Thêm thành công", doanh_thu_id: id });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async capNhat(req, res) {
//     try {
//       const { id } = req.params;
//       const rows = await DoanhThuCaModel.capNhat(id, req.body);
//       res.json({ message: rows ? "Cập nhật thành công" : "Không tìm thấy!" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async xoa(req, res) {
//     try {
//       const { id } = req.params;
//       const rows = await DoanhThuCaModel.xoa(id);
//       res.json({ message: rows ? "Xóa thành công" : "Không tìm thấy!" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
};
