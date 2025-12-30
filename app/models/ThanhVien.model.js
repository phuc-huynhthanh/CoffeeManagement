import { db } from "../config/db.conf.js";

class ThanhVien {
  // ✅ Hàm lõi: tính lại tổng + điểm + bậc và LƯU vào DB
static async capNhatThongKeVaBac(thanh_vien_id, conn = db) {
  const [[agg]] = await conn.query(
    `
    SELECT 
      COUNT(*) AS tong_don,
      IFNULL(SUM(dh.tong_tien), 0) AS tong_tien
    FROM don_hang dh
    WHERE dh.thanh_vien_id = ?
    `,
    [thanh_vien_id]
  );

  const tongDon = Number(agg?.tong_don ?? 0);
  const tongTien = Number(agg?.tong_tien ?? 0);

  // ✅ 1 điểm = 1000đ
  const diem = Math.floor(tongTien / 1000);

  const [[bac]] = await conn.query(
    `
    SELECT bac_id
    FROM bac_thanh_vien
    WHERE diem_toi_thieu <= ?
    ORDER BY diem_toi_thieu DESC, bac_id DESC
    LIMIT 1
    `,
    [diem]
  );

  const bacId = bac?.bac_id ?? null;

  await conn.query(
    `
    UPDATE thanh_vien
    SET tong_don_da_mua = ?, tong_tien_da_mua = ?, bac_id = ?
    WHERE thanh_vien_id = ?
    `,
    [tongDon, tongTien, bacId, thanh_vien_id]
  );

  return { tong_don_da_mua: tongDon, tong_tien_da_mua: tongTien, bac_id: bacId, diem_tich_luy: diem };
}


  static async layTatCa() {
    const [rows] = await db.query(`
      SELECT tv.*
      FROM thanh_vien tv
      ORDER BY tv.thanh_vien_id DESC
    `);
    return rows;
  }

  static async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM thanh_vien WHERE thanh_vien_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async themMoi(data) {
    const { ho_ten, sdt, email } = data;
    const [result] = await db.query(
      `
      INSERT INTO thanh_vien (ho_ten, sdt, email, bac_id, tong_don_da_mua, tong_tien_da_mua)
      VALUES (?, ?, ?, NULL, 0, 0)
      `,
      [ho_ten, sdt, email]
    );

    await ThanhVien.capNhatThongKeVaBac(result.insertId);

    return await ThanhVien.timTheoId(result.insertId);
  }

  static async capNhat(id, data) {
    const { ho_ten, sdt, email } = data;
    const [result] = await db.query(
      `
      UPDATE thanh_vien 
      SET ho_ten = ?, sdt = ?, email = ?
      WHERE thanh_vien_id = ?
      `,
      [ho_ten, sdt, email, id]
    );
    return result.affectedRows;
  }

  static async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM thanh_vien WHERE thanh_vien_id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Cần ít nhất 1 điều kiện.");

    const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(
      `SELECT * FROM thanh_vien WHERE ${whereClause}`,
      values
    );
    return rows;
  }

  static async timTheoSDT(sdt) {
    const [rows] = await db.query(
      `SELECT * FROM thanh_vien WHERE sdt = ?`,
      [sdt]
    );
    return rows[0] || null;
  }
  static async recalcAll() {
  const [rows] = await db.query(`SELECT thanh_vien_id FROM thanh_vien`);
  for (const r of rows) {
    await ThanhVien.capNhatThongKeVaBac(r.thanh_vien_id);
  }
  return rows.length;
}

}

export default ThanhVien;
