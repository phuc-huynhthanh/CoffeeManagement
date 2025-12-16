// models/Luong.model.js
import { db } from "../config/db.conf.js";

const LUONG_MAC_DINH = 200000;

export const LuongModel = {

  // ======================================================
  // 🔢 ĐẾM SỐ CA LÀM
  // ======================================================
  async demSoCa(nhan_vien_id, thang, nam) {
    const [[row]] = await db.query(`
      SELECT COUNT(*) AS so_ca
      FROM lich_lam_viec
      WHERE nhan_vien_id = ?
        AND trang_thai = 'Đã xác nhận'
        AND MONTH(ngay_lam) = ?
        AND YEAR(ngay_lam) = ?
        AND (
          ngay_lam < CURDATE()
          OR (
            ngay_lam = CURDATE()
            AND thoi_gian_ket_thuc <= CURTIME()
          )
        )
    `, [nhan_vien_id, thang, nam]);

    return Number(row?.so_ca || 0);
  },

  // ======================================================
  // 💰 TÍNH TỔNG THƯỞNG / PHẠT TỪ CHI TIẾT
  // ======================================================
  async tinhThuongPhat(luong_id) {
    const [[row]] = await db.query(`
      SELECT
        SUM(CASE WHEN loai = 'Thuong' THEN so_tien ELSE 0 END) AS tong_thuong,
        SUM(CASE WHEN loai = 'Phat' THEN so_tien ELSE 0 END) AS tong_phat
      FROM chi_tiet_thuong_phat
      WHERE luong_id = ?
    `, [luong_id]);

    return {
      tong_thuong: Number(row?.tong_thuong || 0),
      tong_phat: Number(row?.tong_phat || 0)
    };
  },

  // ======================================================
  // 🔄 ĐẢM BẢO LƯƠNG CƠ BẢN = 200.000
  // ======================================================
  async damBaoLuongCoBan(luong_id) {
    await db.query(`
      UPDATE luong
      SET luong_co_ban = ?
      WHERE luong_id = ? AND luong_co_ban = 0
    `, [LUONG_MAC_DINH, luong_id]);
  },

  // ======================================================
  // 📋 LẤY TẤT CẢ BẢNG LƯƠNG
  // ======================================================
  async layTatCa(thang, nam) {
    const now = new Date();
    thang = thang || now.getMonth() + 1;
    nam = nam || now.getFullYear();

    await this.taoLuongThangNam(thang, nam);

    const [rows] = await db.query(`
      SELECT
        l.luong_id,
        l.nhan_vien_id,
        l.thang,
        l.nam,
        l.luong_co_ban,
        l.ngay_tinh_luong,
        nv.ho_ten AS ten_nhan_vien,
        nv.sdt AS sdt_nhan_vien,
        nv.email AS email_nhan_vien
      FROM luong l
      JOIN nhan_vien nv ON nv.nhan_vien_id = l.nhan_vien_id
      WHERE l.thang = ? AND l.nam = ?
      ORDER BY nv.ho_ten
    `, [thang, nam]);

    for (const l of rows) {
      // fix lương CB
      if (+l.luong_co_ban === 0) {
        await this.damBaoLuongCoBan(l.luong_id);
        l.luong_co_ban = LUONG_MAC_DINH;
      } else {
        l.luong_co_ban = Number(l.luong_co_ban);
      }

      // số ca
      l.so_ca_lam = await this.demSoCa(
        l.nhan_vien_id,
        l.thang,
        l.nam
      );

      // thưởng / phạt
      const { tong_thuong, tong_phat } =
        await this.tinhThuongPhat(l.luong_id);

      l.tong_thuong = tong_thuong;
      l.tong_phat = tong_phat;

      // tổng lương
      l.tong_luong =
        l.so_ca_lam * l.luong_co_ban +
        tong_thuong -
        tong_phat;
    }

    return rows;
  },

  // ======================================================
  // 🔎 TÌM THEO ID
  // ======================================================
  async timTheoId(luong_id) {
    const [[l]] = await db.query(`
      SELECT
        l.luong_id,
        l.nhan_vien_id,
        l.thang,
        l.nam,
        l.luong_co_ban,
        l.ngay_tinh_luong,
        nv.ho_ten AS ten_nhan_vien,
        nv.sdt AS sdt_nhan_vien
      FROM luong l
      JOIN nhan_vien nv ON nv.nhan_vien_id = l.nhan_vien_id
      WHERE l.luong_id = ?
    `, [luong_id]);

    if (!l) return null;

    if (+l.luong_co_ban === 0) {
      await this.damBaoLuongCoBan(luong_id);
      l.luong_co_ban = LUONG_MAC_DINH;
    } else {
      l.luong_co_ban = Number(l.luong_co_ban);
    }

    l.so_ca_lam = await this.demSoCa(
      l.nhan_vien_id,
      l.thang,
      l.nam
    );

    const { tong_thuong, tong_phat } =
      await this.tinhThuongPhat(luong_id);

    l.tong_thuong = tong_thuong;
    l.tong_phat = tong_phat;

    l.tong_luong =
      l.so_ca_lam * l.luong_co_ban +
      tong_thuong -
      tong_phat;

    return l;
  },

  // ======================================================
  // 🔒 CHỐT LƯƠNG
  // ======================================================
  async chotLuong(luong_id) {
    const luong = await this.timTheoId(luong_id);
    if (!luong) throw new Error("Không tìm thấy bảng lương");

    await db.query(`
      UPDATE luong SET
        tong_luong = ?,
        ngay_tinh_luong = NOW()
      WHERE luong_id = ?
    `, [luong.tong_luong, luong_id]);

    return luong;
  },

  // ======================================================
  // ✅ TẠO BẢNG LƯƠNG THÁNG / NĂM
  // ======================================================
  async taoLuongThangNam(thang, nam) {
    const [nhanVienList] = await db.query(`
      SELECT nhan_vien_id FROM nhan_vien
    `);

    for (const nv of nhanVienList) {
      const [[exists]] = await db.query(`
        SELECT 1 FROM luong
        WHERE nhan_vien_id = ? AND thang = ? AND nam = ?
      `, [nv.nhan_vien_id, thang, nam]);

      if (!exists) {
        await db.query(`
          INSERT INTO luong
          (nhan_vien_id, thang, nam, luong_co_ban)
          VALUES (?, ?, ?, ?)
        `, [
          nv.nhan_vien_id,
          thang,
          nam,
          LUONG_MAC_DINH
        ]);
      }
    }
  }
};
