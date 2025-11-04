import {db} from "../config/db.conf.js";

export const DoanhThuCaModel = {
  async layTatCa() {
    const [rows] = await db.query("SELECT * FROM doanh_thu_ca");
    return rows;
  },

  async timTheoId(id) {
    const [rows] = await db.query("SELECT * FROM doanh_thu_ca WHERE doanh_thu_id = ?", [id]);
    return rows[0];
  },

  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Cần ít nhất 1 điều kiện tìm kiếm.");

    const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(`SELECT * FROM doanh_thu_ca WHERE ${whereClause}`, values);
    return rows;
  },

//   async them({ ca_id, ngay, tong_doanh_thu }) {
//     const [result] = await db.query(
//       "INSERT INTO doanh_thu_ca (ca_id, ngay, tong_doanh_thu) VALUES (?, ?, ?)",
//       [ca_id, ngay, tong_doanh_thu]
//     );
//     return result.insertId;
//   },

//   async capNhat(id, data) {
//     const fields = Object.keys(data).map((col) => `${col} = ?`).join(", ");
//     const values = [...Object.values(data), id];
//     const [result] = await db.query(`UPDATE doanh_thu_ca SET ${fields} WHERE doanh_thu_id = ?`, values);
//     return result.affectedRows;
//   },

//   async xoa(id) {
//     const [result] = await db.query("DELETE FROM doanh_thu_ca WHERE doanh_thu_id = ?", [id]);
//     return result.affectedRows;
//   },
};
