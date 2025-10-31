import { db } from "../config/db.conf.js";

class ThanhVien {
  // Lấy tất cả
  static async layTatCa() {
    const [rows] = await db.query("SELECT * FROM thanh_vien");
    return rows;
  }

  // Tìm theo ID
  static async timTheoId(id) {
    const [rows] = await db.query(
      "SELECT * FROM thanh_vien WHERE thanh_vien_id = ?",
      [id]
    );
    return rows[0];
  }

  // Thêm mới
  static async themMoi(data) {
    const { ho_ten, sdt, email, tong_don_da_mua } = data;
    const [result] = await db.query(
      `INSERT INTO thanh_vien (ho_ten, sdt, email, tong_don_da_mua)
       VALUES (?, ?, ?, ?)`,
      [ho_ten, sdt, email, tong_don_da_mua || 0]
    );
    return { thanh_vien_id: result.insertId, ...data };
  }

  // Cập nhật
  static async capNhat(id, data) {
    const { ho_ten, sdt, email, tong_don_da_mua } = data;
    const [result] = await db.query(
      `UPDATE thanh_vien 
       SET ho_ten = ?, sdt = ?, email = ?, tong_don_da_mua = ? 
       WHERE thanh_vien_id = ?`,
      [ho_ten, sdt, email, tong_don_da_mua, id]
    );
    return result.affectedRows;
  }

  // Xóa
  static async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM thanh_vien WHERE thanh_vien_id = ?",
      [id]
    );
    return result.affectedRows;
  }

  // Tìm theo điều kiện lọc
  static async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0)
      throw new Error("Hàm timTheoDieuKien() cần ít nhất 1 điều kiện.");

    const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(
      `SELECT * FROM thanh_vien WHERE ${whereClause}`,
      values
    );
    return rows;
  }
}

export default ThanhVien;
