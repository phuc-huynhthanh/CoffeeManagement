import { db } from "../config/db.conf.js";

export const ChiTietToppingModel = {
  // 📋 Lấy tất cả
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM chi_tiet_topping`);
    return rows;
  },

  // 🔎 Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM chi_tiet_topping WHERE chi_tiet_topping_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm theo điều kiện bất kỳ (chi_tiet_id, topping_id, so_luong, ...)
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0)
      throw new Error("Hàm timTheoDieuKien() cần ít nhất 1 điều kiện.");

    const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(
      `SELECT * FROM chi_tiet_topping WHERE ${whereClause}`,
      values
    );

    return rows;
  },

  // ➕ Thêm mới
  async them({ chi_tiet_id, topping_id, so_luong, gia_them }) {
    const [result] = await db.query(
      `INSERT INTO chi_tiet_topping (chi_tiet_id, topping_id, so_luong, gia_them)
       VALUES (?, ?, ?, ?)`,
      [chi_tiet_id, topping_id, so_luong, gia_them]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật
  async capNhat(id, { chi_tiet_id, topping_id, so_luong, gia_them }) {
    const [result] = await db.query(
      `UPDATE chi_tiet_topping 
       SET chi_tiet_id = ?, topping_id = ?, so_luong = ?, gia_them = ?
       WHERE chi_tiet_topping_id = ?`,
      [chi_tiet_id, topping_id, so_luong, gia_them, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM chi_tiet_topping WHERE chi_tiet_topping_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
