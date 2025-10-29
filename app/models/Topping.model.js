import { db } from "../config/db.conf.js";

export const ToppingModel = {
  // 📋 Lấy tất cả topping
  async layTatCa() {
    const [rows] = await db.query(`SELECT * FROM topping`);
    return rows;
  },

  // 🔍 Tìm topping theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM topping WHERE topping_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm topping theo điều kiện (vd: theo tên, giá)
 async timTheoDieuKien(dieu_kien) {
  const entries = Object.entries(dieu_kien);
  if (entries.length === 0)
    throw new Error("Hàm timTheoDieuKien() cần ít nhất 1 điều kiện.");

  // Dùng backtick để bảo vệ tên cột khỏi bị MySQL hiểu sai
  const whereClause = entries.map(([col]) => `\`${col}\` = ?`).join(" AND ");
  const values = entries.map(([_, val]) => val);

  // In ra câu query để debug nếu cần
  console.log("WHERE:", whereClause);
  console.log("VALUES:", values);

  // Thực thi truy vấn an toàn
  const [rows] = await db.query(
    `SELECT * FROM \`topping\` WHERE ${whereClause}`,
    values
  );

  return rows;
},

  // ➕ Thêm topping mới
  async them({ ten_topping, gia_them }) {
    const [result] = await db.query(
      `INSERT INTO topping (ten_topping, gia_them) VALUES (?, ?)`,
      [ten_topping, gia_them]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật topping
  async capNhat(id, { ten_topping, gia_them }) {
    const [result] = await db.query(
      `UPDATE topping SET ten_topping = ?, gia_them = ? WHERE topping_id = ?`,
      [ten_topping, gia_them, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa topping
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM topping WHERE topping_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
