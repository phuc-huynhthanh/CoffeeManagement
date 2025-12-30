import { db } from "../config/db.conf.js";

export class BacThanhVienModel {
  // Lấy tất cả bậc thành viên
  static async layTatCa() {
    const [rows] = await db.query(
      "SELECT * FROM bac_thanh_vien ORDER BY diem_toi_thieu ASC, bac_id ASC"
    );
    return rows;
  }

  // Tìm theo ID
  static async timTheoId(id) {
    const [rows] = await db.query(
      "SELECT * FROM bac_thanh_vien WHERE bac_id = ?",
      [id]
    );
    return rows[0] || null;
  }

  // Tìm theo điều kiện (object: { ten_bac: 'Vang', diem_toi_thieu: 240, ... })
  static async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien || {});
    if (entries.length === 0) throw new Error("Cần ít nhất 1 điều kiện.");
    const where = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);
    const [rows] = await db.query(`SELECT * FROM bac_thanh_vien WHERE ${where}`, values);
    return rows;
  }

  // Thêm mới
  static async them({ ten_bac, diem_toi_thieu, phan_tram_giam, ma_icon, ma_mau }) {
    const [result] = await db.query(
      `INSERT INTO bac_thanh_vien
       (ten_bac, diem_toi_thieu, phan_tram_giam, ma_icon, ma_mau)
       VALUES (?, ?, ?, ?, ?)`,
      [
        ten_bac,
        diem_toi_thieu ?? 0,
        phan_tram_giam ?? 0,
        ma_icon ?? null,
        ma_mau ?? null
      ]
    );
    return result.insertId;
  }

  // Cập nhật (truyền đầy đủ hoặc các giá trị có thể là null)
  static async capNhat(id, { ten_bac, diem_toi_thieu, phan_tram_giam, ma_icon, ma_mau }) {
    const [result] = await db.query(
      `UPDATE bac_thanh_vien
       SET ten_bac = ?, diem_toi_thieu = ?, phan_tram_giam = ?, ma_icon = ?, ma_mau = ?
       WHERE bac_id = ?`,
      [
        ten_bac,
        diem_toi_thieu ?? 0,
        phan_tram_giam ?? 0,
        ma_icon ?? null,
        ma_mau ?? null,
        id
      ]
    );
    return result.affectedRows;
  }

  // Xóa
  static async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM bac_thanh_vien WHERE bac_id = ?",
      [id]
    );
    return result.affectedRows;
  }
}