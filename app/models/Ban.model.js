import { db } from "../config/db.conf.js";

export const BanModel = {
  // Lấy toàn bộ danh sách bàn
  async layTatCa() {
    const [rows] = await db.execute("SELECT * FROM ban");
    return rows;
  },

  // Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.execute("SELECT * FROM ban WHERE ban_id = ?", [id]);
    return rows[0];
  },

  // Tìm theo điều kiện (VD: tên bàn, trạng thái,...)
  async timTheoDieuKien(dieu_kien) {
    const keys = Object.keys(dieu_kien);
    if (keys.length === 0) {
      const [rows] = await db.execute("SELECT * FROM ban");
      return rows;
    }

    const where = keys.map(k => `${k} LIKE ?`).join(" AND ");
    const values = keys.map(k => `%${dieu_kien[k]}%`);

    const [rows] = await db.execute(`SELECT * FROM ban WHERE ${where}`, values);
    return rows;
  },

  // Thêm bàn mới
  async them(data) {
    const { ten_ban, trang_thai = "Trống" } = data;
    const [result] = await db.execute(
      "INSERT INTO ban (ten_ban, trang_thai) VALUES (?, ?)",
      [ten_ban, trang_thai]
    );
    return result.insertId;
  },

  // Cập nhật bàn
  async capNhat(id, data) {
    const { ten_ban, trang_thai } = data;
    const [result] = await db.execute(
      "UPDATE ban SET ten_ban = ?, trang_thai = ? WHERE ban_id = ?",
      [ten_ban, trang_thai, id]
    );
    return result.affectedRows;
  },

  // Xóa bàn
  async xoa(id) {
    const [result] = await db.execute("DELETE FROM ban WHERE ban_id = ?", [id]);
    return result.affectedRows;
  }
};
