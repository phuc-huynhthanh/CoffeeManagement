import { db } from "../config/db.conf.js";

export const ChiTietDonHangModel = {
  // 📋 Lấy tất cả chi tiết đơn hàng
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT ctdh.*, 
             sp.ten_san_pham, 
             kc.ten_kich_co, 
             tp.ten_topping 
      FROM chi_tiet_don_hang ctdh
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id
    `);
    return rows;
  },

  // 🔍 Tìm theo ID chi tiết đơn hàng
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM chi_tiet_don_hang WHERE chi_tiet_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm theo đơn hàng (ví dụ: lấy tất cả chi tiết của đơn hàng 1)
  async timTheoDieuKien(dieu_kien) {
    if (!dieu_kien || Object.keys(dieu_kien).length === 0) {
      throw new Error("Vui lòng nhập ít nhất 1 điều kiện tìm kiếm!");
    }

    let query = `
      SELECT ctdh.*, 
             sp.ten_san_pham, 
             kc.ten_kich_co, 
             tp.ten_topping
      FROM chi_tiet_don_hang ctdh
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id
      WHERE 1=1
    `;

    const values = [];

    // 🔍 Linh hoạt tìm theo tên hoặc ID
    if (dieu_kien.ten_san_pham) {
      query += ` AND sp.ten_san_pham LIKE ?`;
      values.push(`%${dieu_kien.ten_san_pham}%`);
    }

    if (dieu_kien.ten_kich_co) {
      query += ` AND kc.ten_kich_co LIKE ?`;
      values.push(`%${dieu_kien.ten_kich_co}%`);
    }

    if (dieu_kien.ten_topping) {
      query += ` AND tp.ten_topping LIKE ?`;
      values.push(`%${dieu_kien.ten_topping}%`);
    }

    if (dieu_kien.don_hang_id) {
      query += ` AND ctdh.don_hang_id = ?`;
      values.push(dieu_kien.don_hang_id);
    }

    if (dieu_kien.gia_min) {
      query += ` AND ctdh.don_gia >= ?`;
      values.push(dieu_kien.gia_min);
    }

    if (dieu_kien.gia_max) {
      query += ` AND ctdh.don_gia <= ?`;
      values.push(dieu_kien.gia_max);
    }

    if (dieu_kien.so_luong) {
      query += ` AND ctdh.so_luong = ?`;
      values.push(dieu_kien.so_luong);
    }

    const [rows] = await db.query(query, values);
    return rows;
  },

  // ➕ Thêm chi tiết đơn hàng
  async them({ don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia }) {
    const [result] = await db.query(
      `
      INSERT INTO chi_tiet_don_hang 
      (don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật chi tiết đơn hàng
  async capNhat(id, { don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia }) {
    const [result] = await db.query(
      `
      UPDATE chi_tiet_don_hang
      SET don_hang_id = ?, san_pham_id = ?, kich_co_id = ?, topping_id = ?, 
          so_luong = ?, don_gia = ?
      WHERE chi_tiet_id = ?
      `,
      [don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa chi tiết đơn hàng
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM chi_tiet_don_hang WHERE chi_tiet_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
