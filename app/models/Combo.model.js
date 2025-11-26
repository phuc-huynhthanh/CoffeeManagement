import { db } from "../config/db.conf.js";

export const ComboModel = {
  // Lấy tất cả combo
  async getAll() {
    await db.query("SET SESSION group_concat_max_len = 1000000");

    const [combos] = await db.query(`
      SELECT 
        c.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'san_pham_id', ctc.san_pham_id,
            'ten_san_pham', sp.ten_san_pham,
            'so_luong', ctc.so_luong,
            'gia_co_ban', sp.gia_co_ban
          )
        ) as san_pham
      FROM combo c
      LEFT JOIN chi_tiet_combo ctc ON c.combo_id = ctc.combo_id
      LEFT JOIN san_pham sp ON ctc.san_pham_id = sp.san_pham_id
      GROUP BY c.combo_id
      ORDER BY c.ngay_tao DESC
    `);

    return combos.map(combo => ({
      ...combo,
      san_pham: combo.san_pham ? JSON.parse(`[${combo.san_pham}]`) : []
    }));
  },

  // Lấy combo theo ID
  async findById(id) {
    await db.query("SET SESSION group_concat_max_len = 1000000");

    const [rows] = await db.query(`
      SELECT 
        c.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'san_pham_id', ctc.san_pham_id,
            'ten_san_pham', sp.ten_san_pham,
            'so_luong', ctc.so_luong,
            'gia_co_ban', sp.gia_co_ban
          )
        ) as san_pham
      FROM combo c
      LEFT JOIN chi_tiet_combo ctc ON c.combo_id = ctc.combo_id
      LEFT JOIN san_pham sp ON ctc.san_pham_id = sp.san_pham_id
      WHERE c.combo_id = ?
      GROUP BY c.combo_id
    `, [id]);

    if (rows[0]) {
      rows[0].san_pham = rows[0].san_pham ? JSON.parse(`[${rows[0].san_pham}]`) : [];
    }
    return rows[0];
  },

  // Tạo combo mới
  async create({ ten_combo, mo_ta, gia_combo, gia_goc, hinh_anh, trang_thai, san_pham }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO combo (ten_combo, mo_ta, gia_combo, gia_goc, hinh_anh, trang_thai) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ten_combo, mo_ta, gia_combo, gia_goc || 0, hinh_anh, trang_thai || 'active']
      );

      const comboId = result.insertId;

      if (san_pham && san_pham.length > 0) {
        for (const sp of san_pham) {
          await connection.query(
            `INSERT INTO chi_tiet_combo (combo_id, san_pham_id, so_luong) 
             VALUES (?, ?, ?)`,
            [comboId, sp.san_pham_id, sp.so_luong]
          );
        }
      }

      await connection.commit();
      return comboId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Cập nhật combo
  async update(id, { ten_combo, mo_ta, gia_combo, gia_goc, hinh_anh, trang_thai, san_pham }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE combo 
         SET ten_combo = ?, mo_ta = ?, gia_combo = ?, gia_goc = ?, hinh_anh = ?, trang_thai = ?
         WHERE combo_id = ?`,
        [ten_combo, mo_ta, gia_combo, gia_goc, hinh_anh, trang_thai, id]
      );

      await connection.query(`DELETE FROM chi_tiet_combo WHERE combo_id = ?`, [id]);

      if (san_pham && san_pham.length > 0) {
        for (const sp of san_pham) {
          await connection.query(
            `INSERT INTO chi_tiet_combo (combo_id, san_pham_id, so_luong)
             VALUES (?, ?, ?)`,
            [id, sp.san_pham_id, sp.so_luong]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Xóa combo
  async delete(id) {
    const [result] = await db.query(
      `DELETE FROM combo WHERE combo_id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};
