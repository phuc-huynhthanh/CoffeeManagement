import { db } from "../config/db.conf.js";

export const KichCoModel = {
  // 📋 Lấy tất cả kích cỡ
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM kich_co`);
    return rows;
  },

  // 🔎 Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`SELECT * FROM kich_co WHERE kich_co_id = ?`, [id]);
    return rows[0];
  },

  // 🔎 Tìm theo điều kiện (ví dụ: tên_kich_co, giá_them)
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Phải có ít nhất 1 điều kiện tìm kiếm!");

    const sql = `SELECT * FROM kich_co WHERE ${entries
      .map(([key]) => `${key} LIKE ?`)
      .join(" AND ")}`;

    const values = entries.map(([_, val]) => `%${val}%`);

    const [rows] = await db.query(sql, values);
    return rows;
  },

  // ➕ Thêm kích cỡ mới
  async them({ ten_kich_co, gia_them }) {
    const [result] = await db.query(
      `INSERT INTO kich_co (ten_kich_co, gia_them) VALUES (?, ?)`,
      [ten_kich_co, gia_them]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật kích cỡ
  async capNhat(id, { ten_kich_co, gia_them }) {
    const [result] = await db.query(
      `UPDATE kich_co SET ten_kich_co = ?, gia_them = ? WHERE kich_co_id = ?`,
      [ten_kich_co, gia_them, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa kích cỡ
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM kich_co WHERE kich_co_id = ?`, [id]);
    return result.affectedRows;
  },
};
