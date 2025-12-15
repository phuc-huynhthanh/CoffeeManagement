// models/ChiTietThuongPhat.model.js
import {db} from "../config/db.conf.js";

export const ChiTietThuongPhatModel = {
  async layTatCa() {
    const [rows] = await db.query("SELECT * FROM chi_tiet_thuong_phat");
    return rows;
  },

  async timTheoId(id) {
    const [rows] = await db.query(
      "SELECT * FROM chi_tiet_thuong_phat WHERE chi_tiet_id = ?",
      [id]
    );
    return rows[0];
  },

  async timTheoDieuKien(dieu_kien) {
    let sql = "SELECT * FROM chi_tiet_thuong_phat WHERE 1=1";
    const params = [];

    if (dieu_kien.luong_id) {
      sql += " AND luong_id = ?";
      params.push(dieu_kien.luong_id);
    }

    if (dieu_kien.loai) {
      sql += " AND loai = ?";
      params.push(dieu_kien.loai);
    }

    if (dieu_kien.ngay_ap_dung) {
      sql += " AND ngay_ap_dung = ?";
      params.push(dieu_kien.ngay_ap_dung);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async them(data) {
    const {
      luong_id,
      loai,
      so_tien,
      ly_do,
      ngay_ap_dung,
    } = data;

    const [result] = await db.query(
      `INSERT INTO chi_tiet_thuong_phat
      (luong_id, loai, so_tien, ly_do, ngay_ap_dung)
      VALUES (?, ?, ?, ?, ?)`,
      [
        luong_id,
        loai,
        so_tien,
        ly_do || null,
        ngay_ap_dung || new Date(),
      ]
    );

    return result.insertId;
  },

  async capNhat(id, data) {
    const {
      luong_id,
      loai,
      so_tien,
      ly_do,
      ngay_ap_dung,
    } = data;

    const [result] = await db.query(
      `UPDATE chi_tiet_thuong_phat SET
        luong_id = ?,
        loai = ?,
        so_tien = ?,
        ly_do = ?,
        ngay_ap_dung = ?
      WHERE chi_tiet_id = ?`,
      [
        luong_id,
        loai,
        so_tien,
        ly_do,
        ngay_ap_dung,
        id,
      ]
    );

    return result.affectedRows;
  },

  async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM chi_tiet_thuong_phat WHERE chi_tiet_id = ?",
      [id]
    );
    return result.affectedRows;
  },
};
