import { db } from "../config/db.conf.js";

export const MucGiamGiaModel = {
  // 📋 Lấy tất cả mức giảm giá
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT mg.*, tv.ho_ten AS ten_thanh_vien
      FROM muc_giam_gia mg
      LEFT JOIN thanh_vien tv ON mg.thanh_vien_id = tv.thanh_vien_id
      ORDER BY mg.muc_giam_gia_id DESC
    `);
    return rows;
  },

  // 🔎 Tìm theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`
      SELECT mg.*, tv.ho_ten AS ten_thanh_vien
      FROM muc_giam_gia mg
      LEFT JOIN thanh_vien tv ON mg.thanh_vien_id = tv.thanh_vien_id
      WHERE mg.muc_giam_gia_id = ?
    `, [id]);
    return rows[0];
  },

  // 🔍 Tìm theo điều kiện linh hoạt (vd: { ma_khuyen_mai: 'KM01', da_su_dung: false })
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0)
      throw new Error("Hàm timTheoDieuKien() cần ít nhất 1 điều kiện.");

    const whereClause = entries.map(([col]) => `mg.\`${col}\` = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(`
      SELECT mg.*, tv.ho_ten AS ten_thanh_vien
      FROM muc_giam_gia mg
      LEFT JOIN thanh_vien tv ON mg.thanh_vien_id = tv.thanh_vien_id
      WHERE ${whereClause}
    `, values);

    return rows;
  },

  // ➕ Thêm mức giảm giá mới
  async them({ ma_khuyen_mai, phan_tram_giam, mo_ta, thanh_vien_id, ngay_het_han }) {
    const [result] = await db.query(`
      INSERT INTO muc_giam_gia 
      (ma_khuyen_mai, phan_tram_giam, mo_ta, thanh_vien_id, ngay_het_han)
      VALUES (?, ?, ?, ?, ?)
    `, [ma_khuyen_mai, phan_tram_giam, mo_ta || null, thanh_vien_id || null, ngay_het_han || null]);

    return result.insertId;
  },

  // ✏️ Cập nhật mức giảm giá
  async capNhat(id, { ma_khuyen_mai, phan_tram_giam, mo_ta, thanh_vien_id, da_su_dung, ngay_het_han }) {
    const [result] = await db.query(`
      UPDATE muc_giam_gia
      SET ma_khuyen_mai = ?, phan_tram_giam = ?, mo_ta = ?, 
          thanh_vien_id = ?, da_su_dung = ?, ngay_het_han = ?
      WHERE muc_giam_gia_id = ?
    `, [ma_khuyen_mai, phan_tram_giam, mo_ta, thanh_vien_id, da_su_dung, ngay_het_han, id]);

    return result.affectedRows;
  },

  // ✅ Đánh dấu đã sử dụng
  async danhDauDaSuDung(id) {
    const [result] = await db.query(`
      UPDATE muc_giam_gia SET da_su_dung = TRUE WHERE muc_giam_gia_id = ?
    `, [id]);
    return result.affectedRows;
  },

  // ❌ Xóa mức giảm giá
  async xoa(id) {
    const [result] = await db.query(`
      DELETE FROM muc_giam_gia WHERE muc_giam_gia_id = ?
    `, [id]);
    return result.affectedRows;
  },

  // MucGiamGia.model.js
async timTheoMaKhuyenMai(ma_khuyen_mai) {
    const [rows] = await db.query(`
        SELECT mg.*, tv.ho_ten AS ten_thanh_vien
        FROM muc_giam_gia mg
        LEFT JOIN thanh_vien tv ON mg.thanh_vien_id = tv.thanh_vien_id
        WHERE mg.ma_khuyen_mai = ? AND mg.da_su_dung = FALSE
    `, [ma_khuyen_mai]);

    return rows[0]; // trả về 1 object hoặc undefined nếu không tìm thấy
},
// MucGiamGia.model.js
async kiemTraTheoThanhVien(ma_khuyen_mai, thanh_vien_id) {
    // Kiểm tra mã khuyến mãi hợp lệ:
    // 1. Mã chưa hết hạn (ngay_het_han >= CURDATE() hoặc NULL)
    // 2. Mã chưa được sử dụng (da_su_dung = FALSE)
    // 3. Mã dành cho thành viên cụ thể (thanh_vien_id khớp) HOẶC dành cho tất cả (thanh_vien_id IS NULL)
    const [rows] = await db.query(`
        SELECT mg.*, tv.ho_ten AS ten_thanh_vien
        FROM muc_giam_gia mg
        LEFT JOIN thanh_vien tv ON mg.thanh_vien_id = tv.thanh_vien_id
        WHERE mg.ma_khuyen_mai = ?
          AND (mg.thanh_vien_id = ? OR mg.thanh_vien_id IS NULL)
          AND (mg.da_su_dung = FALSE OR mg.da_su_dung IS NULL)
          AND (mg.ngay_het_han >= CURDATE() OR mg.ngay_het_han IS NULL)
    `, [ma_khuyen_mai, thanh_vien_id]);

    return rows[0]; // trả về object hoặc undefined nếu không có
},

// MucGiamGia.model.js
async capNhatThongTin(id, { thanh_vien_id, da_su_dung }) {
  // Cập nhật trực tiếp trên bảng muc_giam_gia
  const [result] = await db.query(`
    UPDATE muc_giam_gia
    SET da_su_dung = ?
    WHERE muc_giam_gia_id = ?
  `, [da_su_dung, id]);

  return result.affectedRows;
}




};
