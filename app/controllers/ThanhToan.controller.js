import { db } from "../config/db.conf.js";

export const ThanhToanController = {
  async xacNhanThanhToan(req, res) {
    try {
      const { thanh_vien_sdt, don_hang_id, muc_giam_gia_id } = req.body;

      // 1️⃣ Lấy thông tin thành viên
      const [tvRows] = await db.query(
        "SELECT * FROM thanh_vien WHERE sdt = ?",
        [thanh_vien_sdt]
      );
      if (tvRows.length === 0)
        return res.status(404).json({ message: "Không tìm thấy thành viên" });

      const thanh_vien = tvRows[0];

      // 2️⃣ Lấy thông tin đơn hàng
      const [dhRows] = await db.query(
        "SELECT * FROM don_hang WHERE don_hang_id = ?",
        [don_hang_id]
      );
      if (dhRows.length === 0)
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });

      const donHang = dhRows[0];

      let tienSauGiam = donHang.tong_tien;

      // 3️⃣ Kiểm tra khuyến mãi nếu có mã giảm giá
      if (muc_giam_gia_id) {
        const [mgRows] = await db.query(
          "SELECT * FROM muc_giam_gia WHERE muc_giam_gia_id = ? AND da_su_dung = FALSE",
          [muc_giam_gia_id]
        );
        if (mgRows.length > 0) {
          const khuyenMai = mgRows[0];

          // 4️⃣ Kiểm tra khoảng thời gian khuyến mãi
          const [rows] = await db.query(`
            SELECT SUM(ct.so_luong) AS tong_da_mua
            FROM don_hang dh
            JOIN chi_tiet_don_hang ct ON dh.don_hang_id = ct.don_hang_id
            WHERE dh.thanh_vien_id = ?
              AND dh.ngay_dat BETWEEN ? AND ?
          `, [thanh_vien.thanh_vien_id, khuyenMai.ngay_tao, khuyenMai.ngay_het_han]);

          const tongDaMua = rows[0].tong_da_mua || 0;

          // Ví dụ: nếu mua >= 3 sản phẩm mới áp dụng lần thứ 4
          if (tongDaMua >= 3) {
            tienSauGiam = donHang.tong_tien * (1 - khuyenMai.phan_tram_giam / 100);

            // 5️⃣ Đánh dấu đã sử dụng
            await db.query(
              "UPDATE muc_giam_gia SET da_su_dung = TRUE WHERE muc_giam_gia_id = ?",
              [muc_giam_gia_id]
            );
          } else {
            return res.status(400).json({ message: `Chưa đủ điều kiện áp dụng khuyến mãi. Bạn đã mua ${tongDaMua} sản phẩm.` });
          }
        }
      }

      // 6️⃣ Cập nhật đơn hàng với tiền sau giảm
      await db.query(
        "UPDATE don_hang SET tien_sau_giam = ?, muc_giam_gia_id = ? WHERE don_hang_id = ?",
        [tienSauGiam, muc_giam_gia_id || null, don_hang_id]
      );

      res.json({ message: "Thanh toán thành công", tien_sau_giam: tienSauGiam });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
