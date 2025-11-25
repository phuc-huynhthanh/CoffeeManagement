import { db } from "../config/db.conf.js";

export const DonHangModel = {
  // 📋 Lấy tất cả đơn hàng kèm chi tiết
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT 
        dh.don_hang_id,
        dh.ngay_dat,
        dh.tong_tien,
        dh.tien_sau_giam,
        dh.trang_thai,

        JSON_OBJECT(
          'thanh_vien_id', ANY_VALUE(tv.thanh_vien_id),
          'ho_ten', ANY_VALUE(tv.ho_ten),
          'sdt', ANY_VALUE(tv.sdt),
          'email', ANY_VALUE(tv.email)
        ) AS thanh_vien,

        JSON_OBJECT(
          'ban_id', ANY_VALUE(b.ban_id),
          'ten_ban', ANY_VALUE(b.ten_ban)
        ) AS ban,

        JSON_OBJECT(
          'tai_khoan_id', ANY_VALUE(tk.tai_khoan_id),
          'ten_dang_nhap', ANY_VALUE(tk.ten_dang_nhap)
        ) AS tai_khoan,

        JSON_OBJECT(
          'nhan_vien_id', ANY_VALUE(nv.nhan_vien_id),
          'ho_ten', ANY_VALUE(nv.ho_ten),
          'sdt', ANY_VALUE(nv.sdt),
          'email', ANY_VALUE(nv.email)
        ) AS nhan_vien_tao_don,

        -- Chi tiết đơn hàng
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'chi_tiet_id', ctdh.chi_tiet_id,
            'san_pham_id', sp.san_pham_id,
            'ten_san_pham', sp.ten_san_pham,
            'kich_co_id', kc.kich_co_id,
            'ten_kich_co', kc.ten_kich_co,
            'topping_id', tp.topping_id,
            'ten_topping', tp.ten_topping,
            'so_luong', ctdh.so_luong,
            'don_gia', ctdh.don_gia
          )
        ) AS chi_tiet

      FROM don_hang dh
      LEFT JOIN thanh_vien tv ON dh.thanh_vien_id = tv.thanh_vien_id
      LEFT JOIN ban b ON dh.ban_id = b.ban_id
      LEFT JOIN tai_khoan tk ON dh.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN nhan_vien nv ON tk.tai_khoan_id = nv.tai_khoan_id
      LEFT JOIN chi_tiet_don_hang ctdh ON dh.don_hang_id = ctdh.don_hang_id
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id

      GROUP BY dh.don_hang_id
      ORDER BY dh.don_hang_id DESC
    `);
    return rows;
  },

  // 🔎 Tìm đơn hàng theo ID kèm chi tiết
  async timTheoId(id) {
    const [rows] = await db.query(`
      SELECT 
        dh.don_hang_id,
        dh.ngay_dat,
        dh.tong_tien,
        dh.tien_sau_giam,
        dh.trang_thai,

        JSON_OBJECT(
          'thanh_vien_id', ANY_VALUE(tv.thanh_vien_id),
          'ho_ten', ANY_VALUE(tv.ho_ten),
          'sdt', ANY_VALUE(tv.sdt),
          'email', ANY_VALUE(tv.email)
        ) AS thanh_vien,

        JSON_OBJECT(
          'ban_id', ANY_VALUE(b.ban_id),
          'ten_ban', ANY_VALUE(b.ten_ban)
        ) AS ban,

        JSON_OBJECT(
          'tai_khoan_id', ANY_VALUE(tk.tai_khoan_id),
          'ten_dang_nhap', ANY_VALUE(tk.ten_dang_nhap)
        ) AS tai_khoan,

        JSON_OBJECT(
          'nhan_vien_id', ANY_VALUE(nv.nhan_vien_id),
          'ho_ten', ANY_VALUE(nv.ho_ten),
          'sdt', ANY_VALUE(nv.sdt),
          'email', ANY_VALUE(nv.email)
        ) AS nhan_vien_tao_don,

        JSON_ARRAYAGG(
          JSON_OBJECT(
            'chi_tiet_id', ctdh.chi_tiet_id,
            'san_pham_id', sp.san_pham_id,
            'ten_san_pham', sp.ten_san_pham,
            'kich_co_id', kc.kich_co_id,
            'ten_kich_co', kc.ten_kich_co,
            'topping_id', tp.topping_id,
            'ten_topping', tp.ten_topping,
            'so_luong', ctdh.so_luong,
            'don_gia', ctdh.don_gia
          )
        ) AS chi_tiet

      FROM don_hang dh
      LEFT JOIN thanh_vien tv ON dh.thanh_vien_id = tv.thanh_vien_id
      LEFT JOIN ban b ON dh.ban_id = b.ban_id
      LEFT JOIN tai_khoan tk ON dh.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN nhan_vien nv ON tk.tai_khoan_id = nv.tai_khoan_id
      LEFT JOIN chi_tiet_don_hang ctdh ON dh.don_hang_id = ctdh.don_hang_id
      LEFT JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
      LEFT JOIN kich_co kc ON ctdh.kich_co_id = kc.kich_co_id
      LEFT JOIN topping tp ON ctdh.topping_id = tp.topping_id

      WHERE dh.don_hang_id = ?
      GROUP BY dh.don_hang_id
    `, [id]);
    return rows[0];
  },

  // ➕ Thêm đơn hàng kèm chi tiết
  async them({ thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai, chi_tiet = [] }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1️⃣ Thêm đơn hàng
      const [resultDonHang] = await conn.query(`
        INSERT INTO don_hang (thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai]);

      const don_hang_id = resultDonHang.insertId;

      // 2️⃣ Thêm chi tiết đơn hàng
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
