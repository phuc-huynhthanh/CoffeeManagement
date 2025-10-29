import { db } from "../config/db.conf.js";

export const ChiTietDonHangModel = {
  // Lấy tất cả
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT ctdh.*, sp.ten_san_pham, kc.ten_kich_co, tp.ten_topping
      FROM chi_tiet_don_hang ctdh
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id
    `);
    return rows;
  },

  // Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`
      SELECT ctdh.*, sp.ten_san_pham, kc.ten_kich_co, tp.ten_topping
      FROM chi_tiet_don_hang ctdh
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id
      WHERE ctdh.chi_tiet_id = ?
    `, [id]);
    return rows[0];
  },

  // 🔍 Tìm theo điều kiện linh hoạt
  async timTheoDieuKien(dieu_kien) {
    let sql = `
      SELECT ctdh.*, sp.ten_san_pham, kc.ten_kich_co, tp.ten_topping
      FROM chi_tiet_don_hang ctdh
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id
      WHERE 1=1
    `;
    const params = [];

    if (dieu_kien.ten_san_pham) {
      sql += " AND sp.ten_san_pham LIKE ?";
      params.push(`%${dieu_kien.ten_san_pham}%`);
    }
    if (dieu_kien.don_gia_min) {
      sql += " AND ctdh.don_gia >= ?";
      params.push(dieu_kien.don_gia_min);
    }
    if (dieu_kien.don_gia_max) {
      sql += " AND ctdh.don_gia <= ?";
      params.push(dieu_kien.don_gia_max);
    }
    if (dieu_kien.don_hang_id) {
      sql += " AND ctdh.don_hang_id = ?";
      params.push(dieu_kien.don_hang_id);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // ➕ Thêm chi tiết đơn hàng
  async them(data) {
    const { don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia } = data;
    const [result] = await db.query(
      `INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật
  async capNhat(id, data) {
    const [result] = await db.query(
      `UPDATE chi_tiet_don_hang 
       SET don_hang_id=?, san_pham_id=?, kich_co_id=?, topping_id=?, so_luong=?, don_gia=?
       WHERE chi_tiet_id=?`,
      [
        data.don_hang_id,
        data.san_pham_id,
        data.kich_co_id,
        data.topping_id,
        data.so_luong,
        data.don_gia,
        id,
      ]
    );
    return result.affectedRows;
  },

  // 🗑️ Xóa
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM chi_tiet_don_hang WHERE chi_tiet_id = ?`, [id]);
    return result.affectedRows;
  },
};
