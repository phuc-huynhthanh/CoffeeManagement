import { NhanVienModel } from "../models/NhanVien.model.js";

export const NhanVienController = {
  // Lấy danh sách nhân viên
  async layTatCa(req, res, next) {
    try {
      const duLieu = await NhanVienModel.layTatCa();
      res.json(duLieu);
    } catch (loi) {
      next(loi);
    }
  },

  // Lấy nhân viên theo ID
  async layTheoId(req, res, next) {
    try {
      const { id } = req.params;
      const nhanVien = await NhanVienModel.timTheoId(id);
      if (!nhanVien) return res.status(404).json({ thong_bao: "Không tìm thấy nhân viên" });
      res.json(nhanVien);
    } catch (loi) {
      next(loi);
    }
  },

  // 🧑‍💼 Lấy thông tin nhân viên theo tài khoản ID
async layTheoTaiKhoanId(req, res, next) {
  try {
    const { tai_khoan_id } = req.params;

    const nhanVien = await NhanVienModel.timTheoTaiKhoanId(tai_khoan_id);

    if (!nhanVien)
      return res.status(404).json({ thong_bao: "Không tìm thấy nhân viên với tài khoản này" });

    res.json(nhanVien);
  } catch (loi) {
    next(loi);
  }
},


  // Thêm nhân viên mới
  async them(req, res, next) {
    try {
      const { ho_ten, sdt, email, tai_khoan_id, ca_id } = req.body;

      if (!ho_ten || !sdt) {
        return res.status(400).json({ thong_bao: "Thiếu thông tin bắt buộc (họ tên, sđt)" });
      }

      // Kiểm tra trùng SĐT
      const tonTai = await NhanVienModel.timMot({ sdt });
      if (tonTai) return res.status(409).json({ thong_bao: "Số điện thoại đã tồn tại" });

      const idMoi = await NhanVienModel.them({ ho_ten, sdt, email, tai_khoan_id, ca_id });
      res.status(201).json({ thong_bao: "Thêm nhân viên thành công", id: idMoi });
    } catch (loi) {
      next(loi);
    }
  },

  // Cập nhật nhân viên
  async capNhat(req, res, next) {
    try {
      const { id } = req.params;
      const { ho_ten, sdt, email, tai_khoan_id, ca_id } = req.body;

      const soDong = await NhanVienModel.capNhat(id, { ho_ten, sdt, email, tai_khoan_id, ca_id });
      if (!soDong) return res.status(404).json({ thong_bao: "Không tìm thấy nhân viên để cập nhật" });

      res.json({ thong_bao: "Cập nhật thành công" });
    } catch (loi) {
      next(loi);
    }
  },

  // Xóa nhân viên
  async xoa(req, res, next) {
    try {
      const { id } = req.params;
      const soDong = await NhanVienModel.xoa(id);
      if (!soDong) return res.status(404).json({ thong_bao: "Không tìm thấy nhân viên để xóa" });

      res.json({ thong_bao: "Xóa thành công" });
    } catch (loi) {
      next(loi);
    }
  },
  async timTheoGiaTri(req, res, next) {
    try {
      const { cot, gia_tri } = req.body;

      if (!cot || !gia_tri) {
        return res
          .status(400)
          .json({ thong_bao: "Thiếu tham số cot hoặc gia_tri trong body" });
      }

      const nhanVien = await NhanVienModel.timMot({ [cot]: gia_tri });

      if (!nhanVien)
        return res
          .status(404)
          .json({ thong_bao: "Không tìm thấy nhân viên phù hợp" });

      res.json(nhanVien);
    } catch (loi) {
      next(loi);
    }
  },
};
