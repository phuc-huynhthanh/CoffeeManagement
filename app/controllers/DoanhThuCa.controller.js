// controllers/DoanhThuCa.controller.js
import { db } from "../config/db.conf.js";
import { DoanhThuCaModel } from "../models/DoanhThuCa.model.js";
import { rebuildDoanhThuCa } from "../services/DoanhThuCa.service.js";

export const DoanhThuCaController = {
  async layTatCa(req, res) {
    try {
      const data = await DoanhThuCaModel.layTatCa();
      res.json({ thanh_cong: true, du_lieu: data });
    } catch (e) {
      res.status(500).json({ thanh_cong: false, thong_bao: e.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await DoanhThuCaModel.timTheoId(id);

      if (!data) {
        return res.status(404).json({
          thanh_cong: false,
          thong_bao: "Không tìm thấy doanh thu ca",
        });
      }

      res.json({ thanh_cong: true, du_lieu: data });
    } catch (e) {
      res.status(500).json({ thanh_cong: false, thong_bao: e.message });
    }
  },

  // POST /doanh-thu-ca/tim  body: { ca_id?, ngay? }
  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body || {};
      const data = await DoanhThuCaModel.timTheoDieuKien(dieu_kien);
      res.json({ thanh_cong: true, du_lieu: data });
    } catch (e) {
      res.status(400).json({ thanh_cong: false, thong_bao: e.message });
    }
  },

  // GET /doanh-thu-ca/thongke?ngay=YYYY-MM-DD
  async thongKeTheoNgay(req, res) {
    try {
      const { ngay } = req.query;
      if (!ngay) {
        return res
          .status(400)
          .json({ thanh_cong: false, thong_bao: "Thiếu tham số ngay" });
      }

      const data = await DoanhThuCaModel.thongKeTheoNgay({ ngay });
      res.json({ thanh_cong: true, du_lieu: data });
    } catch (e) {
      res.status(500).json({ thanh_cong: false, thong_bao: e.message });
    }
  },

  // POST /doanh-thu-ca/rebuild body: { tu_ngay?: 'YYYY-MM-DD', den_ngay?: 'YYYY-MM-DD' }
  async rebuild(req, res) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { tu_ngay, den_ngay } = req.body || {};
      const rs = await rebuildDoanhThuCa({ tu_ngay, den_ngay }, conn);

      await conn.commit();
      res.json({
        thanh_cong: true,
        thong_bao: "Rebuild thành công",
        du_lieu: rs,
      });
    } catch (e) {
      await conn.rollback();
      res.status(500).json({ thanh_cong: false, thong_bao: e.message });
    } finally {
      conn.release();
    }
  },
};
