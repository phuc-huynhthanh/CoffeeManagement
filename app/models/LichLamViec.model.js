import { db } from "../config/db.conf.js";

export const LichLamViecModel = {
  // 📋 Lấy tất cả lịch làm việc
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT llv.*, nv.ho_ten AS ten_nhan_vien, ca.ten_ca 
      FROM lich_lam_viec llv
      JOIN nhan_vien nv ON llv.nhan_vien_id = nv.nhan_vien_id
      JOIN ca_lam ca ON llv.ca_id = ca.ca_id
    `);
    return rows;
  },

  // 🔎 Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`SELECT * FROM lich_lam_viec WHERE lich_id = ?`, [id]);
    return rows[0];
  },

  // 🔎 Tìm theo điều kiện (như nhân_vien_id, ca_id, ngay_lam, trạng thái...)
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0)
      throw new Error("Cần ít nhất một điều kiện tìm kiếm.");

    const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(`SELECT * FROM lich_lam_viec WHERE ${whereClause}`, values);
    return rows;
  },

  // ➕ Thêm mới
  async them({ nhan_vien_id, ca_id, ngay_lam, trang_thai }) {
    const [result] = await db.query(
      `INSERT INTO lich_lam_viec (nhan_vien_id, ca_id, ngay_lam, trang_thai)
       VALUES (?, ?, ?, ?)`,
      [nhan_vien_id, ca_id, ngay_lam, trang_thai]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật
  async capNhat(id, { nhan_vien_id, ca_id, ngay_lam, trang_thai }) {
    const [result] = await db.query(
      `UPDATE lich_lam_viec 
       SET nhan_vien_id = ?, ca_id = ?, ngay_lam = ?, trang_thai = ?
       WHERE lich_id = ?`,
      [nhan_vien_id, ca_id, ngay_lam, trang_thai, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM lich_lam_viec WHERE lich_id = ?`, [id]);
    return result.affectedRows;
  },
};