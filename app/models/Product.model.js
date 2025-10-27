import { db } from "../config/db.conf.js";

export const ProductModel = {


    
  // Lấy toàn bộ sản phẩm
  async getAll() {
    const [rows] = await db.query(
      `SELECT sp.*, lsp.ten_loai 
       FROM san_pham sp 
       LEFT JOIN loai_san_pham lsp ON sp.loai_id = lsp.loai_id`
    );
    return rows;
  },

  // Thêm sản phẩm mới
  async create({ ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban }) {
    const [result] = await db.query(
      `INSERT INTO san_pham (ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban)
       VALUES (?, ?, ?, ?, ?)`,
      [ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban]
    );
    return result.insertId;
  },

  // Cập nhật sản phẩm
  async update(id, { ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban }) {
    const [result] = await db.query(
      `UPDATE san_pham
       SET ten_san_pham = ?, mo_ta = ?, loai_id = ?, hinh_anh = ?, gia_co_ban = ?
       WHERE san_pham_id = ?`,
      [ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban, id]
    );
    return result.affectedRows;
  },

  // Xóa sản phẩm
  async delete(id) {
    const [result] = await db.query(
      `DELETE FROM san_pham WHERE san_pham_id = ?`,
      [id]
    );
    return result.affectedRows;
  },

  // Lấy sản phẩm theo ID (dùng khi cần)
  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM san_pham WHERE san_pham_id = ?`,
      [id]
    );
    return rows[0];
  },
};
