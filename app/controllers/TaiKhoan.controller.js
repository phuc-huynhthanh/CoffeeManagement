import { TaiKhoanModel } from "../models/TaiKhoan.model.js";

export const TaiKhoanController = {
  // 📋 Lấy tất cả tài khoản
  async layTatCa(req, res, next) {
    try {
      const duLieu = await TaiKhoanModel.layTatCa();
      res.json(duLieu);
    } catch (loi) {
      next(loi);
    }
  },

  // 🔎 Lấy tài khoản theo ID
  async layTheoId(req, res, next) {
    try {
      const { id } = req.params;
      const taiKhoan = await TaiKhoanModel.timTheoId(id);
      if (!taiKhoan)
        return res.status(404).json({ thong_bao: "Không tìm thấy tài khoản" });
      res.json(taiKhoan);
    } catch (loi) {
      next(loi);
    }
  },

  // ➕ Thêm tài khoản mới
  async them(req, res, next) {
    try {
      const { ten_dang_nhap, mat_khau, vai_tro_id } = req.body;

      if (!ten_dang_nhap || !mat_khau) {
        return res
          .status(400)
          .json({ thong_bao: "Thiếu tên đăng nhập hoặc mật khẩu" });
      }

      // 🔎 Kiểm tra trùng tên đăng nhập
      const tonTai = await TaiKhoanModel.timMot({ ten_dang_nhap });
      if (tonTai)
        return res.status(409).json({ thong_bao: "Tên đăng nhập đã tồn tại" });

      const idMoi = await TaiKhoanModel.them({
        ten_dang_nhap,
        mat_khau,
        vai_tro_id,
      });
      res
        .status(201)
        .json({ thong_bao: "Thêm tài khoản thành công", id: idMoi });
    } catch (loi) {
      next(loi);
    }
  },

  // ✏️ Cập nhật tài khoản
  async capNhat(req, res, next) {
    try {
      const { id } = req.params;
      const { ten_dang_nhap, mat_khau, vai_tro_id } = req.body;

      const soDong = await TaiKhoanModel.capNhat(id, {
        ten_dang_nhap,
        mat_khau,
        vai_tro_id,
      });

      if (!soDong)
        return res
          .status(404)
          .json({ thong_bao: "Không tìm thấy tài khoản để cập nhật" });

      res.json({ thong_bao: "Cập nhật tài khoản thành công" });
    } catch (loi) {
      next(loi);
    }
  },

  // ❌ Xóa tài khoản
  async xoa(req, res, next) {
    try {
      const { id } = req.params;
      const soDong = await TaiKhoanModel.xoa(id);
      if (!soDong)
        return res
          .status(404)
          .json({ thong_bao: "Không tìm thấy tài khoản để xóa" });

      res.json({ thong_bao: "Xóa tài khoản thành công" });
    } catch (loi) {
      next(loi);
    }
  },
};
