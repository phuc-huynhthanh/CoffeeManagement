import { db } from "../config/db.conf.js";

export const NhanVienModel = {
  // 🧾 Lấy tất cả nhân viên
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT nv.*, cl.ten_ca, tk.ten_dang_nhap, vt.ten_vai_tro
      FROM nhan_vien nv
      LEFT JOIN ca_lam cl ON nv.ca_id = cl.ca_id
      LEFT JOIN tai_khoan tk ON nv.tai_khoan_id = tk.tai_khoan_id
      LEFT JOIN vai_tro vt ON tk.vai_tro_id = vt.vai_tro_id
    `);
    return rows;
  },

  async themNhanVien({ ho_ten, sdt, email, tai_khoan_id, ca_id }) {
    const [ketQua] = await db.execute(
      `INSERT INTO nhan_vien (ho_ten, sdt, email, tai_khoan_id, ca_id)
       VALUES (?, ?, ?, ?, ?)`,
      [ho_ten, sdt, email, tai_khoan_id, ca_id]
    );
    return ketQua.insertId;
  },

  // 🔍 Lấy nhân viên theo ID
  async timTheoId(id) {
    const [rows] = await db.query(`SELECT * FROM nhan_vien WHERE nhan_vien_id = ?`, [id]);
    return rows[0];
  },

  // 🔍 Tìm một nhân viên theo điều kiện (VD: sdt, email)
  async timMot(dieu_kien) {
    const entries = Object.entries(dieu_kien);
    if (entries.length === 0) throw new Error("Hàm timMot() cần ít nhất 1 điều kiện");

    const [cot, giaTri] = entries[0];
    const [rows] = await db.query(`SELECT * FROM nhan_vien WHERE ${cot} = ? LIMIT 1`, [giaTri]);
    return rows[0];
  },

  // 🔍 Lấy nhân viên theo tài khoản ID
async timTheoTaiKhoanId(tai_khoan_id) {
  const [rows] = await db.query(`
    SELECT nv.*, cl.ten_ca, tk.ten_dang_nhap, vt.ten_vai_tro
    FROM nhan_vien nv
    LEFT JOIN ca_lam cl ON nv.ca_id = cl.ca_id
    LEFT JOIN tai_khoan tk ON nv.tai_khoan_id = tk.tai_khoan_id
    LEFT JOIN vai_tro vt ON tk.vai_tro_id = vt.vai_tro_id
    WHERE nv.tai_khoan_id = ?
  `, [tai_khoan_id]);
  return rows[0]; // vì mỗi tài khoản chỉ gắn 1 nhân viên
},


  // ➕ Thêm nhân viên mới
  async them({ ho_ten, sdt, email, tai_khoan_id, ca_id }) {
    const [result] = await db.query(
      `INSERT INTO nhan_vien (ho_ten, sdt, email, tai_khoan_id, ca_id)
       VALUES (?, ?, ?, ?, ?)`,
      [ho_ten, sdt, email, tai_khoan_id, ca_id]
    );
    return result.insertId;
  },

  // ✏️ Cập nhật nhân viên
  async capNhat(id, { ho_ten, sdt, email, tai_khoan_id, ca_id }) {
    const [result] = await db.query(
      `UPDATE nhan_vien
       SET ho_ten = ?, sdt = ?, email = ?, tai_khoan_id = ?, ca_id = ?
       WHERE nhan_vien_id = ?`,
      [ho_ten, sdt, email, tai_khoan_id, ca_id, id]
    );
    return result.affectedRows;
  },

  // ❌ Xóa nhân viên
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM nhan_vien WHERE nhan_vien_id = ?`, [id]);
    return result.affectedRows;
  },
};
