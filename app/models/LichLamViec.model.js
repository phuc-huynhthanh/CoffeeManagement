import { db } from "../config/db.conf.js";

export const LichLamViecModel = {
  // 📋 Lấy tất cả lịch làm việc (với thông tin nhân viên đầy đủ)
  async layTatCa() {
    const [rows] = await db.query(`
      SELECT 
        llv. lich_id,
        llv.nhan_vien_id,
        llv.ca_id,
        llv.ngay_lam,
        llv.thoi_gian_bat_dau,
        llv.thoi_gian_ket_thuc,
        llv.trang_thai,
        nv.ho_ten,
        nv.sdt,
        nv.email,
        ca.ten_ca,
        ca.thoi_gian_bat_dau AS thoi_gian_ca_bat_dau,
        ca.thoi_gian_ket_thuc AS thoi_gian_ca_ket_thuc,
        COALESCE(llv.thoi_gian_bat_dau, ca.thoi_gian_bat_dau) AS thoi_gian_thuc_te_bat_dau,
        COALESCE(llv.thoi_gian_ket_thuc, ca.thoi_gian_ket_thuc) AS thoi_gian_thuc_te_ket_thuc
      FROM lich_lam_viec llv
      LEFT JOIN nhan_vien nv ON llv.nhan_vien_id = nv. nhan_vien_id
      LEFT JOIN ca_lam ca ON llv.ca_id = ca.ca_id
      ORDER BY llv.ngay_lam DESC, llv.thoi_gian_bat_dau ASC
    `);
    return rows;
  },

  // 🔎 Tìm theo ID (với thông tin nhân viên đầy đủ)
  async timTheoId(id) {
    const [rows] = await db.query(`
      SELECT 
        llv. lich_id,
        llv.nhan_vien_id,
        llv.ca_id,
        llv. ngay_lam,
        llv.thoi_gian_bat_dau,
        llv.thoi_gian_ket_thuc,
        llv.trang_thai,
        nv.ho_ten,
        nv.sdt,
        nv.email,
        ca.ten_ca,
        ca.thoi_gian_bat_dau AS thoi_gian_ca_bat_dau,
        ca.thoi_gian_ket_thuc AS thoi_gian_ca_ket_thuc,
        COALESCE(llv.thoi_gian_bat_dau, ca.thoi_gian_bat_dau) AS thoi_gian_thuc_te_bat_dau,
        COALESCE(llv. thoi_gian_ket_thuc, ca.thoi_gian_ket_thuc) AS thoi_gian_thuc_te_ket_thuc
      FROM lich_lam_viec llv
      LEFT JOIN nhan_vien nv ON llv.nhan_vien_id = nv.nhan_vien_id
      LEFT JOIN ca_lam ca ON llv.ca_id = ca.ca_id
      WHERE llv.lich_id = ?  
    `, [id]);
    return rows[0];
  },

  // 🔎 Tìm theo điều kiện (với thông tin nhân viên đầy đủ)
  async timTheoDieuKien(dieu_kien) {
    const entries = Object.entries(dieu_kien).filter(([_, val]) => val !== undefined && val !== null);
    
    if (entries.length === 0)
      throw new Error("Cần ít nhất một điều kiện tìm kiếm.");

    const whereClause = entries.map(([col]) => `llv.${col} = ?`).join(" AND ");
    const values = entries.map(([_, val]) => val);

    const [rows] = await db.query(`
      SELECT 
        llv.lich_id,
        llv.nhan_vien_id,
        llv.ca_id,
        llv.ngay_lam,
        llv.thoi_gian_bat_dau,
        llv.thoi_gian_ket_thuc,
        llv.trang_thai,
        nv. ho_ten,
        nv.sdt,
        nv.email,
        ca.ten_ca,
        ca.thoi_gian_bat_dau AS thoi_gian_ca_bat_dau,
        ca.thoi_gian_ket_thuc AS thoi_gian_ca_ket_thuc,
        COALESCE(llv.thoi_gian_bat_dau, ca.thoi_gian_bat_dau) AS thoi_gian_thuc_te_bat_dau,
        COALESCE(llv.thoi_gian_ket_thuc, ca. thoi_gian_ket_thuc) AS thoi_gian_thuc_te_ket_thuc
      FROM lich_lam_viec llv
      LEFT JOIN nhan_vien nv ON llv.nhan_vien_id = nv.nhan_vien_id
      LEFT JOIN ca_lam ca ON llv. ca_id = ca.ca_id
      WHERE ${whereClause}
      ORDER BY llv.ngay_lam DESC
    `, values);
    
    return rows;
  },

  // 🔎 Tìm lịch theo nhân viên (với thông tin nhân viên đầy đủ)
  async timTheoNhanVien(nhan_vien_id) {
    const [rows] = await db.query(`
      SELECT 
        llv.lich_id,
        llv.nhan_vien_id,
        llv.ca_id,
        llv.ngay_lam,
        llv. thoi_gian_bat_dau,
        llv. thoi_gian_ket_thuc,
        llv.trang_thai,
        nv.ho_ten,
        nv.sdt,
        nv.email,
        ca.ten_ca,
        ca.thoi_gian_bat_dau AS thoi_gian_ca_bat_dau,
        ca.thoi_gian_ket_thuc AS thoi_gian_ca_ket_thuc,
        COALESCE(llv.thoi_gian_bat_dau, ca.thoi_gian_bat_dau) AS thoi_gian_thuc_te_bat_dau,
        COALESCE(llv.thoi_gian_ket_thuc, ca.thoi_gian_ket_thuc) AS thoi_gian_thuc_te_ket_thuc
      FROM lich_lam_viec llv
      LEFT JOIN nhan_vien nv ON llv.nhan_vien_id = nv.nhan_vien_id
      LEFT JOIN ca_lam ca ON llv.ca_id = ca.ca_id
      WHERE llv.nhan_vien_id = ?
      ORDER BY llv.ngay_lam DESC
    `, [nhan_vien_id]);
    return rows;
  },

  // 🔎 Tìm lịch trong khoảng thời gian (với thông tin nhân viên đầy đủ)
  async timTheoKhoangNgay(tu_ngay, den_ngay) {
    const [rows] = await db.query(`
      SELECT 
        llv.lich_id,
        llv.nhan_vien_id,
        llv.ca_id,
        llv.ngay_lam,
        llv.thoi_gian_bat_dau,
        llv.thoi_gian_ket_thuc,
        llv.trang_thai,
        nv. ho_ten,
        nv.sdt,
        nv.email,
        ca.ten_ca,
        ca.thoi_gian_bat_dau AS thoi_gian_ca_bat_dau,
        ca.thoi_gian_ket_thuc AS thoi_gian_ca_ket_thuc,
        COALESCE(llv.thoi_gian_bat_dau, ca.thoi_gian_bat_dau) AS thoi_gian_thuc_te_bat_dau,
        COALESCE(llv.thoi_gian_ket_thuc, ca. thoi_gian_ket_thuc) AS thoi_gian_thuc_te_ket_thuc
      FROM lich_lam_viec llv
      LEFT JOIN nhan_vien nv ON llv.nhan_vien_id = nv.nhan_vien_id
      LEFT JOIN ca_lam ca ON llv. ca_id = ca.ca_id
      WHERE llv.ngay_lam BETWEEN ? AND ?
      ORDER BY llv. ngay_lam DESC, llv.thoi_gian_bat_dau ASC
    `, [tu_ngay, den_ngay]);
    return rows;
  },

  // ➕ Thêm mới (hỗ trợ thời gian tùy chỉnh)
  async them(data) {
    const { 
      nhan_vien_id, 
      ca_id, 
      ngay_lam, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc, 
      trang_thai 
    } = data;

    // Validation
    if (!nhan_vien_id || !ngay_lam) {
      throw new Error("nhan_vien_id và ngay_lam là bắt buộc");
    }

    // Nếu có ca_id nhưng không có thời gian tùy chỉnh, lấy từ ca_lam
    let bat_dau = thoi_gian_bat_dau;
    let ket_thuc = thoi_gian_ket_thuc;

    if (ca_id && ! bat_dau) {
      const [caData] = await db.query(
        `SELECT thoi_gian_bat_dau, thoi_gian_ket_thuc FROM ca_lam WHERE ca_id = ?`,
        [ca_id]
      );
      if (caData.length > 0) {
        bat_dau = bat_dau || caData[0].thoi_gian_bat_dau;
        ket_thuc = ket_thuc || caData[0].thoi_gian_ket_thuc;
      }
    }

    const [result] = await db.query(
      `INSERT INTO lich_lam_viec (nhan_vien_id, ca_id, ngay_lam, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nhan_vien_id, ca_id || null, ngay_lam, bat_dau || null, ket_thuc || null, trang_thai || 'Đăng ký']
    );
    return result. insertId;
  },

  // ✏️ Cập nhật (hỗ trợ cập nhật thời gian)
  async capNhat(id, data) {
    const { 
      nhan_vien_id, 
      ca_id, 
      ngay_lam, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc, 
      trang_thai 
    } = data;

    // Xây dựng dynamic query
    const updateFields = [];
    const values = [];

    if (nhan_vien_id !== undefined) {
      updateFields. push("nhan_vien_id = ?  ");
      values.push(nhan_vien_id);
    }
    if (ca_id !== undefined) {
      updateFields.push("ca_id = ? ");
      values.push(ca_id || null);
    }
    if (ngay_lam !== undefined) {
      updateFields.push("ngay_lam = ?  ");
      values.push(ngay_lam);
    }
    if (thoi_gian_bat_dau !== undefined) {
      updateFields.push("thoi_gian_bat_dau = ? ");
      values.push(thoi_gian_bat_dau || null);
    }
    if (thoi_gian_ket_thuc !== undefined) {
      updateFields.push("thoi_gian_ket_thuc = ?");
      values.push(thoi_gian_ket_thuc || null);
    }
    if (trang_thai !== undefined) {
      updateFields.push("trang_thai = ?");
      values.push(trang_thai);
    }

    if (updateFields.length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE lich_lam_viec SET ${updateFields.join(", ")} WHERE lich_id = ?`,
      values
    );
    return result. affectedRows;
  },

  // ❌ Xóa
  async xoa(id) {
    const [result] = await db.query(`DELETE FROM lich_lam_viec WHERE lich_id = ? `, [id]);
    return result.affectedRows;
  },

  // 📊 Lấy thống kê lịch làm
  async thongKeLich(nhan_vien_id, tu_ngay, den_ngay) {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS tong_lich,
        SUM(CASE WHEN trang_thai = 'Đã xác nhận' THEN 1 ELSE 0 END) AS so_lich_xac_nhan,
        SUM(CASE WHEN trang_thai = 'Đăng ký' THEN 1 ELSE 0 END) AS so_lich_dang_ky,
        SUM(CASE WHEN trang_thai = 'Hủy' THEN 1 ELSE 0 END) AS so_lich_huy
      FROM lich_lam_viec
      WHERE nhan_vien_id = ?  AND ngay_lam BETWEEN ?  AND ?
    `, [nhan_vien_id, tu_ngay, den_ngay]);
    return rows[0];
  }
};