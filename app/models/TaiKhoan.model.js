import { db } from "../config/db.conf.js";

export const TaiKhoanModel = {
  // 📋 Lấy tất cả tài khoản
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT tk.*, vt.ten_vai_tro
      FROM tai_khoan tk
      LEFT JOIN vai_tro vt ON tk.vai_tro_id = vt.vai_tro_id
    `);
    return rows;
  },

  // 🔎 Tìm tài khoản theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM tai_khoan WHERE tai_khoan_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm một tài khoản theo điều kiện (VD: tên đăng nhập)
  async timMot(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Hàm timMot() cần 1 điều kiện");

    const [cot, giaTri] = entries[0];
    const [rows] = await db.query(
      `SELECT * FROM tai_khoan WHERE ${cot} = ? LIMIT 1`,
      [giaTri]
    );
    return rows[0];
  },

  // ➕ Thêm tài khoản mới
  async them({ ten_dang_nhap, mat_khau, vai_tro_id }) {
    const [result] = await db.query(
      `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro_id)
       VALUES (?, ?, ?)`,
      [ten_dang_nhap, mat_khau, vai_tro_id]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật tài khoản
  async capNhat(id, { ten_dang_nhap, mat_khau, vai_tro_id }) {
    const [result] = await db.query(
      `UPDATE tai_khoan
       SET ten_dang_nhap = ?, mat_khau = ?, vai_tro_id = ?
       WHERE tai_khoan_id = ?`,
      [ten_dang_nhap, mat_khau, vai_tro_id, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa tài khoản
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM tai_khoan WHERE tai_khoan_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
