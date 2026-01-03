// models/DonHang.model.js
import { db } from "../config/db.conf.js";
import {
  getDonHangSnapshot,
  applyDoanhThuChange,
} from "../services/DoanhThuCa.service.js";

export const DonHangModel = {
  // ✅ Lấy tất cả (giữ nguyên logic của bạn, chỉ thêm IFNULL để tránh chi_tiet bị [null])
  async layTatCa(conn = db) {
    const [rows] = await conn.query(`
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

        IFNULL(
          JSON_ARRAYAGG(
            IF(ctdh.chi_tiet_id IS NULL, NULL,
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
            )
          ),
          JSON_ARRAY()
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

  // ✅ Tìm theo id (giữ nguyên logic, thêm IFNULL tương tự)
  async timTheoId(id, conn = db) {
    const [rows] = await conn.query(
      `
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

        IFNULL(
          JSON_ARRAYAGG(
            IF(ctdh.chi_tiet_id IS NULL, NULL,
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
            )
          ),
          JSON_ARRAY()
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
      `,
      [id]
    );

    return rows[0] || null;
  },

  // ✅ (OPTION) Tính lại tổng tiền từ chi_tiet_don_hang
  // Nếu bạn đã tính tổng tiền ở phía client rồi thì có thể bỏ và chỉ update tong_tien/tien_sau_giam theo payload
  async tinhTongTienTuChiTiet(don_hang_id, conn = db) {
    const [rows] = await conn.query(
      `
      SELECT 
        COALESCE(SUM(so_luong * don_gia), 0) AS tong
      FROM chi_tiet_don_hang
      WHERE don_hang_id = ?
      `,
      [don_hang_id]
    );

    return Number(rows?.[0]?.tong ?? 0);
  },

  // ➕ Thêm đơn hàng + ✅ tự cập nhật doanh_thu_ca
  async them({
    thanh_vien_id,
    ban_id,
    tai_khoan_id,
    tong_tien,
    tien_sau_giam,
    muc_giam_gia_id,
    trang_thai,
    chi_tiet = [],
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rsDH] = await conn.query(
        `
        INSERT INTO don_hang (thanh_vien_id, ban_id, tai_khoan_id, tong_tien, tien_sau_giam, muc_giam_gia_id, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          thanh_vien_id ?? null,
          ban_id ?? null,
          tai_khoan_id ?? null,
          tong_tien ?? 0,
          tien_sau_giam ?? null,
          muc_giam_gia_id ?? null,
          trang_thai ?? null,
        ]
      );

      const don_hang_id = rsDH.insertId;

      // insert chi tiết
      if (Array.isArray(chi_tiet) && chi_tiet.length > 0) {
        for (const item of chi_tiet) {
          const { san_pham_id, kich_co_id, topping_id, so_luong, don_gia } = item;
          await conn.query(
            `
            INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              don_hang_id,
              san_pham_id ?? null,
              kich_co_id ?? null,
              topping_id ?? null,
              so_luong ?? 0,
              don_gia ?? 0,
            ]
          );
        }
      }

      // (tuỳ bạn) nếu muốn tổng tiền luôn đúng theo chi tiết:
      // const tong = await this.tinhTongTienTuChiTiet(don_hang_id, conn);
      // await conn.query("UPDATE don_hang SET tong_tien=? WHERE don_hang_id=?", [tong, don_hang_id]);

      // ✅ cập nhật doanh thu ca (new snapshot)
      const newDH = await getDonHangSnapshot(don_hang_id, conn);
      await applyDoanhThuChange(null, newDH, conn);

      await conn.commit();
      return don_hang_id;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  // ✏️ Cập nhật đơn hàng (tiền/ngày/trạng thái...) + ✅ tự cập nhật doanh_thu_ca
  async capNhat(id, payload) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const oldDH = await getDonHangSnapshot(id, conn);
      if (!oldDH) throw new Error("Không tìm thấy đơn hàng");

      // ⚠️ Chỉ update những field được gửi lên (tránh ghi đè null/undefined)
      const fields = [];
      const params = [];

      const allowed = [
        "thanh_vien_id",
        "ban_id",
        "tai_khoan_id",
        "tong_tien",
        "tien_sau_giam",
        "muc_giam_gia_id",
        "trang_thai",
        "ngay_dat", // nếu bạn muốn cho phép đổi ngày đặt
      ];

      for (const k of allowed) {
        if (payload[k] !== undefined) {
          fields.push(`${k} = ?`);
          params.push(payload[k]);
        }
      }

      if (fields.length === 0) {
        // không đổi gì thì thôi
        await conn.rollback();
        return 0;
      }

      params.push(id);

      const [rs] = await conn.query(
        `
        UPDATE don_hang 
        SET ${fields.join(", ")}
        WHERE don_hang_id = ?
        `,
        params
      );

      const newDH = await getDonHangSnapshot(id, conn);

      // ✅ trừ cũ + cộng mới (đổi trạng thái / đổi tiền / đổi ngày đều đúng)
      await applyDoanhThuChange(oldDH, newDH, conn);

      await conn.commit();
      return rs.affectedRows || 0;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  // ✅ Update trạng thái nhanh (chỉ đổi trạng thái)
  async capNhatTrangThai(id, trang_thai) {
    return this.capNhat(id, { trang_thai });
  },

  // ✅ Cập nhật chi tiết đơn hàng + ✅ tự cập nhật doanh_thu_ca
  // Dùng khi bạn có màn hình sửa món / số lượng.
  async capNhatChiTiet(don_hang_id, chi_tiet_moi = []) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const oldDH = await getDonHangSnapshot(don_hang_id, conn);
      if (!oldDH) throw new Error("Không tìm thấy đơn hàng");

      // 1) reset chi tiết
      await conn.query("DELETE FROM chi_tiet_don_hang WHERE don_hang_id = ?", [
        don_hang_id,
      ]);

      // 2) insert lại
      if (Array.isArray(chi_tiet_moi) && chi_tiet_moi.length > 0) {
        for (const item of chi_tiet_moi) {
          const { san_pham_id, kich_co_id, topping_id, so_luong, don_gia } = item;
          await conn.query(
            `
            INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, kich_co_id, topping_id, so_luong, don_gia)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              don_hang_id,
              san_pham_id ?? null,
              kich_co_id ?? null,
              topping_id ?? null,
              so_luong ?? 0,
              don_gia ?? 0,
            ]
          );
        }
      }

      // 3) (khuyên dùng) tính lại tong_tien theo chi tiết để doanh thu luôn đúng
      const tong = await this.tinhTongTienTuChiTiet(don_hang_id, conn);
      await conn.query("UPDATE don_hang SET tong_tien = ? WHERE don_hang_id = ?", [
        tong,
        don_hang_id,
      ]);

      const newDH = await getDonHangSnapshot(don_hang_id, conn);

      // ✅ cập nhật doanh thu
      await applyDoanhThuChange(oldDH, newDH, conn);

      await conn.commit();
      return true;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  // ❌ Xóa đơn hàng + ✅ tự trừ doanh_thu_ca nếu đã thanh toán
  async xoa(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const oldDH = await getDonHangSnapshot(id, conn);
      if (!oldDH) throw new Error("Không tìm thấy đơn hàng");

      // ✅ nếu có FK chi_tiet_don_hang -> phải xóa trước
      await conn.query("DELETE FROM chi_tiet_don_hang WHERE don_hang_id = ?", [id]);

      const [rs] = await conn.query("DELETE FROM don_hang WHERE don_hang_id = ?", [
        id,
      ]);

      // ✅ trừ doanh thu (old -> null)
      await applyDoanhThuChange(oldDH, null, conn);

      await conn.commit();
      return rs.affectedRows || 0;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },
};
