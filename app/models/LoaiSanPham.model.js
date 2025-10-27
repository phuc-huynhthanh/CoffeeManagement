import { db } from "../config/db.conf.js";

export const LoaiSanPhamModel = {
  // 📋 Lấy tất cả loại sản phẩm
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM loai_san_pham`);
    return rows;
  },

  // 🔎 Tìm loại sản phẩm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM loai_san_pham WHERE loai_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm loại sản phẩm theo điều kiện (VD: tên loại)
  async timMot(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Hàm timMot() cần 1 điều kiện");

    const [cot, giaTri] = entries[0];
    const [rows] = await db.query(
      `SELECT * FROM loai_san_pham WHERE ${cot} = ? LIMIT 1`,
      [giaTri]
    );
    return rows[0];
  },

  // ➕ Thêm loại sản phẩm mới
  async them({ ten_loai }) {
    const [result] = await db.query(
      `INSERT INTO loai_san_pham (ten_loai) VALUES (?)`,
      [ten_loai]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật loại sản phẩm
  async capNhat(id, { ten_loai }) {
    const [result] = await db.query(
      `UPDATE loai_san_pham SET ten_loai = ? WHERE loai_id = ?`,
      [ten_loai, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa loại sản phẩm
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM loai_san_pham WHERE loai_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
