import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET_KEY =
  "$2a$12$ZF9spVgpLpcerM/C7KOmi.cLXid5TjXEIpks/CzXkAQGXbomUjfui";

import { TaiKhoanModel } from "../models/TaiKhoan.model.js";
import { NhanVienModel } from "../models/NhanVien.model.js";
import { LuongModel } from "../models/Luong.model.js";
import { db } from "../config/db.conf.js";

export const TaiKhoanController = {
  // 📋 Lấy tất cả tài khoản (kèm nhân viên + lương cơ bản)
  async layTatCa(req, res, next) {
    try {
      const thang = req.query.thang ? Number(req.query.thang) : undefined;
      const nam = req.query.nam ? Number(req.query.nam) : undefined;

      const duLieu = await TaiKhoanModel.layTatCaChiTiet(thang, nam);

      res.json(duLieu);
    } catch (loi) {
      console.error(loi);
      next(loi);
    }
  },

  // 📋 Lấy tất cả tài khoản kèm thông tin nhân viên chi tiết (có message + du_lieu)
  async layTatCaChiTiet(req, res, next) {
    try {
      const thang = req.query.thang ? Number(req.query.thang) : undefined;
      const nam = req.query.nam ? Number(req.query.nam) : undefined;

      const duLieu = await TaiKhoanModel.layTatCaChiTiet(thang, nam);

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
      
      // Lấy thông tin lương nếu có nhân viên
      const nhanVien = await NhanVienModel.timTheoTaiKhoanId(id);
      if (nhanVien) {
        const now = new Date();
        const thang = now.getMonth() + 1;
        const nam = now.getFullYear();
        
        // Lấy lương của tháng hiện tại
        const [luongRows] = await db.query(
          `SELECT luong_co_ban FROM luong 
           WHERE nhan_vien_id = ? AND thang = ? AND nam = ?`,
          [nhanVien.nhan_vien_id, thang, nam]
        );
        
        if (luongRows && luongRows[0]) {
          taiKhoan.luong_co_ban = luongRows[0].luong_co_ban;
        }
      }
      
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
      let { ten_dang_nhap, mat_khau, vai_tro_id, luong } = req.body;

      if (!id)
        return res.status(400).json({ thong_bao: "Thiếu ID tài khoản" });
      if (!ten_dang_nhap || !vai_tro_id) {
        return res
          .status(400)
          .json({ thong_bao: "Thiếu ten_dang_nhap hoặc vai_tro_id" });
      }

      const taiKhoanCu = await TaiKhoanModel.timTheoId(id);
      if (!taiKhoanCu) {
        return res
          .status(404)
          .json({ thong_bao: "Không tìm thấy tài khoản để cập nhật" });
      }

      const tonTai = await TaiKhoanModel.timMot({ ten_dang_nhap });
      if (tonTai && Number(tonTai.tai_khoan_id) !== Number(id)) {
        return res.status(409).json({ thong_bao: "Tên đăng nhập đã tồn tại" });
      }

      let mat_khau_hash = null;
      if (mat_khau && String(mat_khau).trim() !== "") {
        mat_khau_hash = await bcrypt.hash(mat_khau, 10);
      }

      const soDong = await TaiKhoanModel.capNhat(id, {
        ten_dang_nhap,
        mat_khau: mat_khau_hash,
        vai_tro_id,
      });

      if (!soDong) {
        return res.status(400).json({ thong_bao: "Cập nhật thất bại" });
      }

      // Cập nhật lương nếu có
      if (luong !== undefined && luong !== null && luong !== "") {
        const nhanVien = await NhanVienModel.timTheoTaiKhoanId(id);
        if (nhanVien) {
          const now = new Date();
          const thang = now.getMonth() + 1;
          const nam = now.getFullYear();
          await LuongModel.taoLuongChoNhanVien({
            nhan_vien_id: nhanVien.nhan_vien_id,
            thang,
            nam,
            luong_co_ban: Number(luong)
          });
        }
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

  // 🧾 Đăng ký (✅ thêm lương cơ bản khi tạo nhân viên)
  async dangKy(req, res, next) {
    try {
      const { tai_khoan, nhan_vien } = req.body;
      if (!tai_khoan || !nhan_vien) {
        return res.status(400).json({ thong_bao: "Thiếu thông tin đăng ký" });
      }

      const { ten_dang_nhap, mat_khau, vai_tro_id } = tai_khoan;

      // ✅ nhận thêm luong_co_ban (hoặc luong)
      const { ho_ten, so_dien_thoai, email, luong_co_ban, luong } = nhan_vien;

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

      // ✅ tạo lương tháng/năm hiện tại cho nhân viên mới
      const now = new Date();
      const thang = now.getMonth() + 1;
      const nam = now.getFullYear();

      await LuongModel.taoLuongChoNhanVien({
        nhan_vien_id: nhanVienIdMoi,
        thang,
        nam,
        luong_co_ban: luong_co_ban ?? luong, // hỗ trợ cả 2 field
      });

      res.status(201).json({
        thong_bao: "Đăng ký thành công",
        tai_khoan_id: taiKhoanIdMoi,
        nhan_vien_id: nhanVienIdMoi,
        thang,
        nam,
        luong_co_ban: Number(luong_co_ban ?? luong ?? 200000),
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
        return res
          .status(401)
          .json({ thong_bao: "Sai tên đăng nhập hoặc mật khẩu" });

      const hopLe = await bcrypt.compare(mat_khau, taiKhoan.mat_khau);
      if (!hopLe)
        return res
          .status(401)
          .json({ thong_bao: "Sai tên đăng nhập hoặc mật khẩu" });

      const token = jwt.sign(
        {
          tai_khoan_id: taiKhoan.tai_khoan_id,
          ten_dang_nhap: taiKhoan.ten_dang_nhap,
          vai_tro_id: taiKhoan.vai_tro_id,
        },
        SECRET_KEY,
        { expiresIn: "8h" }
      );

      res.json({ thong_bao: "Đăng nhập thành công", token });
    } catch (loi) {
      next(loi);
    }
  },

  // 🧾 Lấy thông tin người dùng từ token
  async thongTinNguoiDung(req, res, next) {
    try {
      const { tai_khoan_id } = req.nguoi_dung;

      const taiKhoan = await TaiKhoanModel.timTheoId(tai_khoan_id);
      if (!taiKhoan)
        return res.status(404).json({ thong_bao: "Không tìm thấy người dùng" });

      delete taiKhoan.mat_khau;

      res.json({ thong_bao: "Lấy thông tin thành công", du_lieu: taiKhoan });
    } catch (loi) {
      next(loi);
    }
  },
};
