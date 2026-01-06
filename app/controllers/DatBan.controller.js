import {db} from '../config/db.conf.js';

const DatBanController = {
  // Thêm đặt bàn mới
  them: async (req, res) => {
    const { ban_id, ten_khach_hang, so_dien_thoai, email, ngay_dat, gio_bat_dau, gio_ket_thuc, ghi_chu } = req.body;
    
    try {
      // Kiểm tra xung đột thời gian
      const [conflict] = await db.query(`
        SELECT * FROM dat_ban 
        WHERE ban_id = ? 
        AND ngay_dat = ? 
        AND trang_thai IN ('Đã đặt', 'Đã đến')
        AND (
          (? >= gio_bat_dau AND ? < gio_ket_thuc) OR
          (? > gio_bat_dau AND ? <= gio_ket_thuc) OR
          (? <= gio_bat_dau AND ? >= gio_ket_thuc)
        )
      `, [ban_id, ngay_dat, gio_bat_dau, gio_bat_dau, gio_ket_thuc, gio_ket_thuc, gio_bat_dau, gio_ket_thuc]);

      if (conflict.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bàn đã được đặt trong khung giờ này!' 
        });
      }

      // Thêm đặt bàn
      const [result] = await db.query(
        `INSERT INTO dat_ban (ban_id, ten_khach_hang, so_dien_thoai, email, ngay_dat, gio_bat_dau, gio_ket_thuc, ghi_chu, trang_thai) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Đã đặt')`,
        [ban_id, ten_khach_hang, so_dien_thoai, email, ngay_dat, gio_bat_dau, gio_ket_thuc, ghi_chu]
      );

      // Cập nhật trạng thái bàn
      await db.query(`UPDATE ban SET trang_thai = 'Đã đặt' WHERE ban_id = ?`, [ban_id]);

      res.status(201).json({ 
        success: true, 
        message: 'Đặt bàn thành công!',
        data: { dat_ban_id: result.insertId }
      });
    } catch (error) {
      console.error('Lỗi khi thêm đặt bàn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Lấy tất cả đặt bàn
  layTatCa: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT db.*, b.ten_ban 
        FROM dat_ban db
        LEFT JOIN ban b ON db.ban_id = b.ban_id
        ORDER BY db.ngay_dat DESC, db.gio_bat_dau DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt bàn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Lấy đặt bàn theo ID
  layTheoId: async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query(`
        SELECT db.*, b.ten_ban 
        FROM dat_ban db
        LEFT JOIN ban b ON db.ban_id = b.ban_id
        WHERE db.dat_ban_id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đặt bàn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Cập nhật trạng thái
  capNhatTrangThai: async (req, res) => {
    const { id } = req.params;
    const { trang_thai } = req.body;

    try {
      // Lấy thông tin đặt bàn hiện tại
      const [current] = await db.query('SELECT * FROM dat_ban WHERE dat_ban_id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });
      }

      // Cập nhật trạng thái đặt bàn
      await db.query(
        'UPDATE dat_ban SET trang_thai = ? WHERE dat_ban_id = ?',
        [trang_thai, id]
      );

      // Cập nhật trạng thái bàn tương ứng
      if (trang_thai === 'Đã đến') {
        await db.query(`UPDATE ban SET trang_thai = 'Đang phục vụ' WHERE ban_id = ?`, [current[0].ban_id]);
      } else if (trang_thai === 'Đã hủy' || trang_thai === 'Quá hạn') {
        // Kiểm tra xem còn đặt bàn nào đang hoạt động không
        const [activeReservations] = await db.query(`
          SELECT * FROM dat_ban 
          WHERE ban_id = ? 
          AND trang_thai IN ('Đã đặt', 'Đã đến')
          AND dat_ban_id != ?
        `, [current[0].ban_id, id]);

        if (activeReservations.length === 0) {
          await db.query(`UPDATE ban SET trang_thai = 'Trống' WHERE ban_id = ?`, [current[0].ban_id]);
        }
      }

      res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Hủy đặt bàn
  huy: async (req, res) => {
    const { id } = req.params;
    try {
      // Lấy thông tin đặt bàn
      const [current] = await db.query('SELECT * FROM dat_ban WHERE dat_ban_id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });
      }

      // Cập nhật trạng thái thành "Đã hủy"
      await db.query('UPDATE dat_ban SET trang_thai = ? WHERE dat_ban_id = ?', ['Đã hủy', id]);

      // Kiểm tra xem còn đặt bàn nào đang hoạt động không
      const [activeReservations] = await db.query(`
        SELECT * FROM dat_ban 
        WHERE ban_id = ? 
        AND trang_thai IN ('Đã đặt', 'Đã đến')
      `, [current[0].ban_id]);

      if (activeReservations.length === 0) {
        await db.query(`UPDATE ban SET trang_thai = 'Trống' WHERE ban_id = ?`, [current[0].ban_id]);
      }

      res.json({ success: true, message: 'Hủy đặt bàn thành công!' });
    } catch (error) {
      console.error('Lỗi khi hủy đặt bàn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Xóa đặt bàn
  xoa: async (req, res) => {
    const { id } = req.params;
    try {
      // Lấy thông tin đặt bàn
      const [current] = await db.query('SELECT * FROM dat_ban WHERE dat_ban_id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });
      }

      // Xóa đặt bàn
      await db.query('DELETE FROM dat_ban WHERE dat_ban_id = ?', [id]);

      // Kiểm tra xem còn đặt bàn nào đang hoạt động không
      const [activeReservations] = await db.query(`
        SELECT * FROM dat_ban 
        WHERE ban_id = ? 
        AND trang_thai IN ('Đã đặt', 'Đã đến')
      `, [current[0].ban_id]);

      if (activeReservations.length === 0) {
        await db.query(`UPDATE ban SET trang_thai = 'Trống' WHERE ban_id = ?`, [current[0].ban_id]);
      }

      res.json({ success: true, message: 'Xóa đặt bàn thành công!' });
    } catch (error) {
      console.error('Lỗi khi xóa đặt bàn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Cập nhật trạng thái quá hạn
  capNhatQuaHan: async (req, res) => {
    try {
      // Tìm các đặt bàn quá hạn
      const [expiredReservations] = await db.query(`
        SELECT * FROM dat_ban 
        WHERE trang_thai = 'Đã đặt'
        AND CONCAT(ngay_dat, ' ', gio_ket_thuc) < NOW()
      `);

      // Cập nhật trạng thái thành "Quá hạn"
      await db.query(`
        UPDATE dat_ban 
        SET trang_thai = 'Quá hạn' 
        WHERE trang_thai = 'Đã đặt'
        AND CONCAT(ngay_dat, ' ', gio_ket_thuc) < NOW()
      `);

      // Cập nhật trạng thái bàn về "Trống"
      for (const reservation of expiredReservations) {
        // Kiểm tra xem còn đặt bàn nào đang hoạt động không
        const [activeReservations] = await db.query(`
          SELECT * FROM dat_ban 
          WHERE ban_id = ? 
          AND trang_thai IN ('Đã đặt', 'Đã đến')
        `, [reservation.ban_id]);

        if (activeReservations.length === 0) {
          await db.query(`UPDATE ban SET trang_thai = 'Trống' WHERE ban_id = ?`, [reservation.ban_id]);
        }
      }

      res.json({ 
        success: true, 
        message: `Đã cập nhật ${expiredReservations.length} đặt bàn quá hạn`,
        count: expiredReservations.length
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật đặt bàn quá hạn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  },

  // Lấy đặt bàn đang hoạt động (cho POS)
  layDangHoatDong: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT db.*, b.ten_ban 
        FROM dat_ban db
        LEFT JOIN ban b ON db.ban_id = b.ban_id
        WHERE db.trang_thai IN ('Đã đặt', 'Đã đến')
        AND CONCAT(db.ngay_dat, ' ', db.gio_bat_dau) <= NOW()
        AND CONCAT(db.ngay_dat, ' ', db.gio_ket_thuc) >= NOW()
        ORDER BY db.ngay_dat, db.gio_bat_dau
      `);
      res.json(rows);
    } catch (error) {
      console.error('Lỗi khi lấy đặt bàn đang hoạt động:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
};

export default DatBanController;
