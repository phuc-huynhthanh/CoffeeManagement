import { db } from "../config/db.conf.js";

export const DonHangModel = {
  // 📋 Lấy tất cả đơn hàng
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT 
        dh.don_hang_id,
        dh.ngay_dat,
        dh.tong_tien,
        dh.tien_sau_giam,
        dh.trang_thai,
        tv.ho_ten AS ten_thanh_vien,
        b.ten_ban,
        tk.ten_dang_nhap AS ten_tai_khoan,
        mg.mo_ta AS mo_ta_giam_gia
      FROM don_hang dh
      LEFT JOIN thanh_vien tv ON dh.thanh_vien_id = tv.thanh_vien_id
      LEFT JOIN ban b ON dh.ban_id = b.ban_id
      LEFT JOIN tai_khoan tk ON dh.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN muc_giam_gia mg ON dh.muc_giam_gia_id = mg.muc_giam_gia_id
      ORDER BY dh.don_hang_id DESC
    `);
    return rows;
  },

  // 🔎 Tìm đơn hàng theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`
      SELECT 
        dh.*, 
        tv.ho_ten AS ten_thanh_vien,
        b.ten_ban,
        tk.ten_dang_nhap AS ten_tai_khoan,
        mg.mo_ta AS mo_ta_giam_gia
      FROM don_hang dh
      LEFT JOIN thanh_vien tv ON dh.thanh_vien_id = tv.thanh_vien_id
      LEFT JOIN ban b ON dh.ban_id = b.ban_id
      LEFT JOIN tai_khoan tk ON dh.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN muc_giam_gia mg ON dh.muc_giam_gia_id = mg.muc_giam_gia_id
      WHERE dh.don_hang_id = ?
    `, [id]);
    return rows[0];
  },

  // ➕ Thêm đơn hàng kèm chi tiết
  async them({ thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai, chi_tiet = [] }) {
    const conn = await db.getConnection(); // Lấy connection để transaction
    try {
      await conn.beginTransaction();

      // 1️⃣ Thêm đơn hàng
      const [resultDonHang] = await conn.query(`
        INSERT INTO don_hang (thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai]);

      const don_hang_id = resultDonHang.insertId;

      // 2️⃣ Thêm chi tiết đơn hàng nếu có
      for (const item of chi_tiet) {
        const { san_pham_id, kich_co_id, topping_id, so_luong, don_gia } = item;
        await conn.query(`
          INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia]);
      }

      await conn.commit();
      return don_hang_id;

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  // ✏️ Cập nhật đơn hàng
  async capNhat(id, { thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai }) {
    const [result] = await db.query(`
      UPDATE don_hang 
      SET thanh_vien_id = ?, ban_id = ?, tai_khoan_id = ?, tong_tien = ?, tien_sau_giam = ?, muc_giam_gia_id = ?, trang_thai = ?
      WHERE don_hang_id = ?
    `, [thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai, id]);
    return result.affectedRows;
  },

  // ❌ Xóa đơn hàng
  async xoa(id) {
    const [result] = await db.query(
      `DELETE FROM don_hang WHERE don_hang_id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};
