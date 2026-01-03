import { db } from "../config/db.conf.js";

const LUONG_MAC_DINH = 200000;

export const TaiKhoanModel = {
  // 📋 Lấy tất cả tài khoản
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT tk.*, vt.ten_vai_tro
      FROM tai_khoan tk
      LEFT JOIN vai_tro vt ON tk.vai_tro_id = vt.vai_tro_id
    `);
    return rows;
  },

  // 📋 Lấy tất cả tài khoản kèm thông tin nhân viên + lương cơ bản (theo tháng/năm)
  async layTatCaChiTiet(thang, nam) {
    const now = new Date();
    const _thang = thang || now.getMonth() + 1;
    const _nam = nam || now.getFullYear();

    const [rows] = await db.query(
      `
      SELECT 
        tk.tai_khoan_id, tk.ten_dang_nhap, tk.vai_tro_id, vt.ten_vai_tro,
        nv.nhan_vien_id, nv.ho_ten, nv.sdt, nv.email, nv.ca_id,
        COALESCE(l.luong_co_ban, ?) AS luong_co_ban
      FROM tai_khoan tk
      LEFT JOIN vai_tro vt ON tk.vai_tro_id = vt.vai_tro_id
      LEFT JOIN nhan_vien nv ON nv.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN luong l
        ON l.nhan_vien_id = nv.nhan_vien_id
       AND l.thang = ?
       AND l.nam = ?
      ORDER BY tk.tai_khoan_id ASC
      `,
      [LUONG_MAC_DINH, _thang, _nam]
    );

    // Gom dữ liệu lại cho dễ sử dụng
    return rows.map((row) => ({
      tai_khoan: {
        tai_khoan_id: row.tai_khoan_id,
        ten_dang_nhap: row.ten_dang_nhap,
        vai_tro_id: row.vai_tro_id,
        ten_vai_tro: row.ten_vai_tro,
      },
      nhan_vien: row.nhan_vien_id
        ? {
            nhan_vien_id: row.nhan_vien_id,
            ho_ten: row.ho_ten,
            sdt: row.sdt,
            email: row.email,
            ca_id: row.ca_id,
            luong_co_ban: Number(row.luong_co_ban), // ✅ thêm lương cơ bản
          }
        : null,
    }));
  },

  // 🔎 Tìm tài khoản theo ID
  async timTheoId(id) {
    const [rows] = await db.query(
      `SELECT * FROM tai_khoan WHERE tai_khoan_id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔎 Tìm một tài khoản theo điều kiện (VD: tên đăng nhập)
  async timMot(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Hàm timMot() cần 1 điều kiện");

    const [cot, giaTri] = entries[0];
    const [rows] = await db.query(
      `SELECT * FROM tai_khoan WHERE ${cot} = ? LIMIT 1`,
      [giaTri]
    );
    return rows[0];
  },

  // ➕ Thêm tài khoản mới
  async them({ ten_dang_nhap, mat_khau, vai_tro_id }) {
    const [result] = await db.query(
      `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro_id)
       VALUES (?, ?, ?)`,
      [ten_dang_nhap, mat_khau, vai_tro_id]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật tài khoản (mat_khau optional)
  async capNhat(id, { ten_dang_nhap, mat_khau, vai_tro_id }) {
    // Nếu mat_khau = null/undefined/"" -> không cập nhật mật khẩu
    if (!mat_khau) {
      const [result] = await db.query(
        `UPDATE tai_khoan
         SET ten_dang_nhap = ?, vai_tro_id = ?
         WHERE tai_khoan_id = ?`,
        [ten_dang_nhap, vai_tro_id, id]
      );
      return result.affectedRows;
    }

    // Có mat_khau -> cập nhật cả mật khẩu (đã hash từ controller)
    const [result] = await db.query(
      `UPDATE tai_khoan
       SET ten_dang_nhap = ?, mat_khau = ?, vai_tro_id = ?
       WHERE tai_khoan_id = ?`,
      [ten_dang_nhap, mat_khau, vai_tro_id, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa tài khoản
  async xoa(id) {
    // Xóa nhân viên liên quan trước
    await db.query(`DELETE FROM nhan_vien WHERE tai_khoan_id = ?`, [id]);

    // Xóa tài khoản
    const [result] = await db.query(
      `DELETE FROM tai_khoan WHERE tai_khoan_id = ?`,
      [id]
    );
    return result.affectedRows;
  },
};
