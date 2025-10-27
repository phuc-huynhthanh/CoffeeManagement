import { db } from "../config/db.conf.js";

export const VaiTroModel = {
  // 📋 Lấy tất cả vai trò
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM vai_tro`);
    return rows;
  },

  // 🔍 Tìm vai trò theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`SELECT * FROM vai_tro WHERE vai_tro_id = ?`, [id]);
    return rows[0];
  },

  // 🔍 Tìm vai trò theo tên
  async timTheoTen(ten_vai_tro) {
    const [rows] = await db.query(`SELECT * FROM vai_tro WHERE ten_vai_tro = ?`, [ten_vai_tro]);
    return rows[0];
  },

  // ➕ Thêm vai trò
//   async them({ ten_vai_tro }) {
//     const [result] = await db.query(`INSERT INTO vai_tro (ten_vai_tro) VALUES (?)`, [ten_vai_tro]);
//     return result.insertId;
//   },

  // ✏️ Cập nhật vai trò
  async capNhat(id, { ten_vai_tro }) {
    const [result] = await db.query(
      `UPDATE vai_tro SET ten_vai_tro = ? WHERE vai_tro_id = ?`,
      [ten_vai_tro, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa vai trò
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM vai_tro WHERE vai_tro_id = ?`, [id]);
    return result.affectedRows;
  },
};
