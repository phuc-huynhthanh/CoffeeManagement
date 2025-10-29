import { db } from "../config/db.conf.js";

export const MucGiamGiaModel = {
  // 📋 Lấy tất cả mức giảm giá
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM muc_giam_gia`);
    return rows;
  },

  // 🔎 Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM muc_giam_gia WHERE muc_giam_gia_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm theo điều kiện (VD: phần trăm hoặc mô tả)
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0)
      throw new Error("Hàm timTheoDieuKien() cần ít nhất 1 điều kiện.");

    const whereClause = entries.map(([col]) => `\`${col}\` = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(
      `SELECT * FROM \`muc_giam_gia\` WHERE ${whereClause}`,
      values
    );

    return rows;
  },

  // ➕ Thêm mức giảm giá
  async them({ phan_tram_giam, mo_ta }) {
    const [result] = await db.query(
      `INSERT INTO muc_giam_gia (phan_tram_giam, mo_ta) VALUES (?, ?)`,
      [phan_tram_giam, mo_ta]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật
  async capNhat(id, { phan_tram_giam, mo_ta }) {
    const [result] = await db.query(
      `UPDATE muc_giam_gia SET phan_tram_giam = ?, mo_ta = ? WHERE muc_giam_gia_id = ?`,
      [phan_tram_giam, mo_ta, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM muc_giam_gia WHERE muc_giam_gia_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
