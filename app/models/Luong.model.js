// models/Luong.model.js
import {db} from "../config/db.conf.js";

export const LuongModel = {
  async layTatCa() {
    const [rows] = await db.query("SELECT * FROM luong");
    return rows;
  },

  async timTheoId(id) {
    const [rows] = await db.query(
      "SELECT * FROM luong WHERE luong_id = ?",
      [id]
    );
    return rows[0];
  },

  async timTheoDieuKien(dieu_kien) {
    let sql = "SELECT * FROM luong WHERE 1=1";
    const params = [];

    if (dieu_kien.nhan_vien_id) {
      sql += " AND nhan_vien_id = ?";
      params.push(dieu_kien.nhan_vien_id);
    }

    if (dieu_kien.thang) {
      sql += " AND thang = ?";
      params.push(dieu_kien.thang);
    }

    if (dieu_kien.nam) {
      sql += " AND nam = ?";
      params.push(dieu_kien.nam);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async them(data) {
    const {
      nhan_vien_id,
      thang,
      nam,
      luong_co_ban,
      so_ca_lam = 0,
      tong_thuong = 0,
      tong_phat = 0,
      tong_luong = 0,
      ngay_tinh_luong,
    } = data;

    const [result] = await db.query(
      `INSERT INTO luong
      (nhan_vien_id, thang, nam, luong_co_ban, so_ca_lam, tong_thuong, tong_phat, tong_luong, ngay_tinh_luong)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nhan_vien_id,
        thang,
        nam,
        luong_co_ban,
        so_ca_lam,
        tong_thuong,
        tong_phat,
        tong_luong,
        ngay_tinh_luong || new Date(),
      ]
    );

    return result.insertId;
  },

  async capNhat(id, data) {
    const {
      nhan_vien_id,
      thang,
      nam,
      luong_co_ban,
      so_ca_lam,
      tong_thuong,
      tong_phat,
      tong_luong,
      ngay_tinh_luong,
    } = data;

    const [result] = await db.query(
      `UPDATE luong SET
        nhan_vien_id = ?,
        thang = ?,
        nam = ?,
        luong_co_ban = ?,
        so_ca_lam = ?,
        tong_thuong = ?,
        tong_phat = ?,
        tong_luong = ?,
        ngay_tinh_luong = ?
      WHERE luong_id = ?`,
      [
        nhan_vien_id,
        thang,
        nam,
        luong_co_ban,
        so_ca_lam,
        tong_thuong,
        tong_phat,
        tong_luong,
        ngay_tinh_luong,
        id,
      ]
    );

    return result.affectedRows;
  },

  async xoa(id) {
    const [result] = await db.query(
      "DELETE FROM luong WHERE luong_id = ?",
      [id]
    );
    return result.affectedRows;
  },
};
