// models/CaLam.model.js
import { db } from "../config/db.conf.js";

export const CaLamModel = {
  async layTatCa(conn = db) {
    const [rows] = await conn.query("SELECT * FROM ca_lam");
    return rows;
  },

  async timTheoId(id, conn = db) {
    const [rows] = await conn.query("SELECT * FROM ca_lam WHERE ca_id = ?", [id]);
    return rows[0] || null;
  },

  async timTheoDieuKien(dieu_kien = {}, conn = db) {
    let sql = "SELECT * FROM ca_lam WHERE 1=1";
    const params = [];

    if (dieu_kien.ten_ca) {
      sql += " AND ten_ca LIKE ?";
      params.push(`%${dieu_kien.ten_ca}%`);
    }

    if (dieu_kien.thoi_gian_bat_dau) {
      sql += " AND thoi_gian_bat_dau >= ?";
      params.push(dieu_kien.thoi_gian_bat_dau);
    }

    if (dieu_kien.thoi_gian_ket_thuc) {
      sql += " AND thoi_gian_ket_thuc <= ?";
      params.push(dieu_kien.thoi_gian_ket_thuc);
    }

    const [rows] = await conn.query(sql, params);
    return rows;
  },

  async them(data, conn = db) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc } = data;

    const [result] = await conn.query(
      `INSERT INTO ca_lam (ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc)
       VALUES (?, ?, ?)`,
      [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc]
    );

    return result.insertId;
  },

  async capNhat(id, data, conn = db) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc } = data;

    const [result] = await conn.query(
      `UPDATE ca_lam
       SET ten_ca = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ?
       WHERE ca_id = ?`,
      [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, id]
    );

    return result.affectedRows || 0;
  },

  async xoa(id, conn = db) {
    const [result] = await conn.query("DELETE FROM ca_lam WHERE ca_id = ?", [id]);
    return result.affectedRows || 0;
  },

  /**
   * ✅ Xác định ca_id + ngày doanh thu từ ngay_dat BẰNG SQL
   * - Không phụ thuộc parse Date của NodeJS
   * - Hỗ trợ ca qua đêm (ket_thuc < bat_dau)
   * Trả về: { ca_id, ngay } hoặc null
   */
  async xacDinhCaTheoNgayDat(ngay_dat, conn = db) {
    const [rows] = await conn.query(
      `
      SELECT 
        ca_id,
        CASE
          WHEN thoi_gian_ket_thuc < thoi_gian_bat_dau
               AND TIME(?) < thoi_gian_ket_thuc
          THEN DATE(?) - INTERVAL 1 DAY
          ELSE DATE(?)
        END AS ngay
      FROM ca_lam
      WHERE
        (
          thoi_gian_ket_thuc > thoi_gian_bat_dau
          AND TIME(?) >= thoi_gian_bat_dau
          AND TIME(?) <  thoi_gian_ket_thuc
        )
        OR
        (
          thoi_gian_ket_thuc < thoi_gian_bat_dau
          AND (TIME(?) >= thoi_gian_bat_dau OR TIME(?) < thoi_gian_ket_thuc)
        )
      LIMIT 1
      `,
      [ngay_dat, ngay_dat, ngay_dat, ngay_dat, ngay_dat, ngay_dat, ngay_dat]
    );

    if (!rows[0]) return null;
    return { ca_id: rows[0].ca_id, ngay: rows[0].ngay };
  },
};
