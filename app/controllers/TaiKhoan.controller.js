import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET_KEY = "$2a$12$ZF9spVgpLpcerM/C7KOmi.cLXid5TjXEIpks/CzXkAQGXbomUjfui";

import { TaiKhoanModel } from "../models/TaiKhoan.model.js";
import { NhanVienModel } from "../models/NhanVien.model.js";

export const TaiKhoanController = {
  // 📋 Lấy tất cả tài khoản
  async layTatCa(req, res, next) {
  try {
    const duLieu = await TaiKhoanModel.layTatCaChiTiet(); // ✅ gọi hàm mới
    res.json(duLieu);
  } catch (loi) {
    console.error(loi);
    next(loi);
  }
},

// 📋 Lấy tất cả tài khoản kèm thông tin nhân viên chi tiết
async layTatCaChiTiet(req, res, next) {
  try {
    const duLieu = await TaiKhoanModel.layTatCaChiTiet();
    res.json({
      thong_bao: "Lấy danh sách chi tiết tài khoản thành công",
      du_lieu: duLieu,
    });
  } catch (loi) {
    console.error(loi);
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


// ✏️ Cập nhật tài khoản (Sửa theo id)
async capNhat(req, res, next) {
  try {
    const { id } = req.params;
    let { ten_dang_nhap, mat_khau, vai_tro_id } = req.body;

    if (!id) return res.status(400).json({ thong_bao: "Thiếu ID tài khoản" });
    if (!ten_dang_nhap || !vai_tro_id) {
      return res.status(400).json({ thong_bao: "Thiếu ten_dang_nhap hoặc vai_tro_id" });
    }

    // 1) kiểm tra tài khoản tồn tại
    const taiKhoanCu = await TaiKhoanModel.timTheoId(id);
    if (!taiKhoanCu) {
      return res.status(404).json({ thong_bao: "Không tìm thấy tài khoản để cập nhật" });
    }

    // 2) check trùng tên đăng nhập (nếu đổi)
    const tonTai = await TaiKhoanModel.timMot({ ten_dang_nhap });
    if (tonTai && Number(tonTai.tai_khoan_id) !== Number(id)) {
      return res.status(409).json({ thong_bao: "Tên đăng nhập đã tồn tại" });
    }

    // 3) nếu có nhập mật khẩu thì hash, không thì bỏ qua (giữ nguyên)
    let mat_khau_hash = null;
    if (mat_khau && String(mat_khau).trim() !== "") {
      mat_khau_hash = await bcrypt.hash(mat_khau, 10);
    }

    const soDong = await TaiKhoanModel.capNhat(id, {
      ten_dang_nhap,
      mat_khau: mat_khau_hash, // null nghĩa là không update mật khẩu
      vai_tro_id,
    });

    if (!soDong) {
      return res.status(400).json({ thong_bao: "Cập nhật thất bại" });
    }

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
 async dangKy(req, res, next) {
  try {
    const { tai_khoan, nhan_vien } = req.body;
    if (!tai_khoan || !nhan_vien) {
      return res.status(400).json({ thong_bao: "Thiếu thông tin đăng ký" });
    }

    const { ten_dang_nhap, mat_khau, vai_tro_id } = tai_khoan;
    const { ho_ten, gioi_tinh, ngay_sinh, so_dien_thoai, email, dia_chi, ngay_vao_lam, luong } = nhan_vien;

    if (!ten_dang_nhap || !mat_khau || !ho_ten || !so_dien_thoai) {
      return res.status(400).json({ thong_bao: "Thiếu thông tin đăng ký" });
    }

    const tonTai = await TaiKhoanModel.timMot({ ten_dang_nhap });
    if (tonTai)
      return res.status(409).json({ thong_bao: "Tên đăng nhập đã tồn tại" });

    const hashMatKhau = await bcrypt.hash(mat_khau, 10);
    const taiKhoanIdMoi = await TaiKhoanModel.them({
      ten_dang_nhap,
      mat_khau: hashMatKhau,
      vai_tro_id: vai_tro_id || 3,
    });

    const nhanVienIdMoi = await NhanVienModel.themNhanVien({
      ho_ten,
      sdt: so_dien_thoai,
      email,
      tai_khoan_id: taiKhoanIdMoi,
      ca_id: null,
    });

    res.status(201).json({
      thong_bao: "Đăng ký thành công",
      tai_khoan_id: taiKhoanIdMoi,
      nhan_vien_id: nhanVienIdMoi,
    });
  } catch (loi) {
    next(loi);
  }
},


  // 🔑 Đăng nhập
  async dangNhap(req, res, next) {
    try {
      const { ten_dang_nhap, mat_khau } = req.body;

      if (!ten_dang_nhap || !mat_khau)
        return res.status(400).json({ thong_bao: "Thiếu thông tin đăng nhập" });

      const taiKhoan = await TaiKhoanModel.timMot({ ten_dang_nhap });
      if (!taiKhoan)
        return res.status(401).json({ thong_bao: "Sai tên đăng nhập hoặc mật khẩu" });

      // So sánh mật khẩu
      const hopLe = await bcrypt.compare(mat_khau, taiKhoan.mat_khau);
      if (!hopLe)
        return res.status(401).json({ thong_bao: "Sai tên đăng nhập hoặc mật khẩu" });

      // Tạo token
      const token = jwt.sign(
        {
          tai_khoan_id: taiKhoan.tai_khoan_id,
          ten_dang_nhap: taiKhoan.ten_dang_nhap,
          vai_tro_id: taiKhoan.vai_tro_id,
        },
        SECRET_KEY,
        { expiresIn: "8h" } // token có hiệu lực 1 giờ
      );

      res.json({ thong_bao: "Đăng nhập thành công", token });
    } catch (loi) {
      next(loi);
    }
  },

  // 🧾 Lấy thông tin người dùng từ token
async thongTinNguoiDung(req, res, next) {
  try {
    // Lấy thông tin từ middleware
    const { tai_khoan_id } = req.nguoi_dung;

    // Truy vấn DB để lấy thông tin chi tiết
    const taiKhoan = await TaiKhoanModel.timTheoId(tai_khoan_id);

    if (!taiKhoan)
      return res.status(404).json({ thong_bao: "Không tìm thấy người dùng" });

    // Không trả mật khẩu
    delete taiKhoan.mat_khau;

    res.json({ thong_bao: "Lấy thông tin thành công", du_lieu: taiKhoan });
  } catch (loi) {
    next(loi);
  }
},

};
