// models/CaLam.model.js
import {db} from "../config/db.conf.js";

export const CaLamModel = {
  async layTatCa() {
    const [rows] = await db.query("SELECT * FROM ca_lam");
    return rows;
  },

  async timTheoId(id) {
    const [rows] = await db.query(
      "SELECT * FROM ca_lam WHERE ca_id = ?",
      [id]
    );
    return rows[0];
  },

  async timTheoDieuKien(dieu_kien) {
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

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async them(data) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc } = data;

    const [result] = await db.query(
      `INSERT INTO ca_lam (ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc)
       VALUES (?, ?, ?)`,
      [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc]
    );

    return result.insertId;
  },

  async capNhat(id, data) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc } = data;

    const [result] = await db.query(
      `UPDATE ca_lam
       SET ten_ca = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ?
       WHERE ca_id = ?`,
      [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, id]
    );

    return result.affectedRows;
  },

  async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM ca_lam WHERE ca_id = ?",
      [id]
    );
    return result.affectedRows;
  },
};
