import { LichLamViecModel } from "../models/LichLamViec.model.js";

export const LichLamViecController = {
  // 📋 Lấy tất cả lịch làm việc
  async layTatCa(req, res) {
    try {
      const data = await LichLamViecModel.layTatCa();
      res.json({
        success: true,
        message: "Lấy danh sách lịch làm việc thành công",
        data:  data,
        total: data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách",
        error: error.message
      });
    }
  },

  // 🔎 Tìm lịch theo ID
  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      
      // Validation
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ"
        });
      }

      const data = await LichLamViecModel.timTheoId(id);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch làm việc"
        });
      }

      res.json({
        success: true,
        message: "Tìm lịch thành công",
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi tìm lịch",
        error: error.message
      });
    }
  },

  // 🔎 Tìm lịch theo điều kiện
  async timTheoDieuKien(req, res) {
    try {
      const dieu_kien = req.body;
      
      if (!dieu_kien || Object.keys(dieu_kien).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp ít nhất một điều kiện tìm kiếm"
        });
      }

      const data = await LichLamViecModel.timTheoDieuKien(dieu_kien);
      
      if (data. length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy dữ liệu phù hợp"
        });
      }

      res.json({
        success: true,
        message: "Tìm kiếm thành công",
        data: data,
        total: data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi tìm kiếm",
        error: error.message
      });
    }
  },

  // 🔎 Tìm lịch theo nhân viên
  async timTheoNhanVien(req, res) {
    try {
      const { nhan_vien_id } = req.params;
      
      if (!nhan_vien_id || isNaN(nhan_vien_id)) {
        return res.status(400).json({
          success: false,
          message: "ID nhân viên không hợp lệ"
        });
      }

      const data = await LichLamViecModel.timTheoNhanVien(nhan_vien_id);
      
      res.json({
        success: true,
        message: "Lấy lịch nhân viên thành công",
        data: data,
        total: data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy lịch nhân viên",
        error:  error.message
      });
    }
  },

  // 🔎 Tìm lịch trong khoảng thời gian
  async timTheoKhoangNgay(req, res) {
    try {
      const { tu_ngay, den_ngay } = req.body;
      
      // Validation
      if (!tu_ngay || !den_ngay) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp tu_ngay và den_ngay (định dạng: YYYY-MM-DD)"
        });
      }

      // Kiểm tra định dạng ngày
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tu_ngay) || !dateRegex.test(den_ngay)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ngày không hợp lệ (phải là YYYY-MM-DD)"
        });
      }

      const data = await LichLamViecModel.timTheoKhoangNgay(tu_ngay, den_ngay);
      
      res.json({
        success: true,
        message: "Lấy lịch theo khoảng ngày thành công",
        data:  data,
        total: data. length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:  "Lỗi khi lấy lịch",
        error: error.message
      });
    }
  },

  // ➕ Thêm lịch làm việc mới
  async them(req, res) {
    try {
      const data = req.body;
      const { nhan_vien_id, ca_id, ngay_lam, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai } = data;

      // Validation
      if (!nhan_vien_id) {
        return res.status(400).json({
          success: false,
          message: "nhan_vien_id là bắt buộc"
        });
      }

      if (! ngay_lam) {
        return res.status(400).json({
          success: false,
          message: "ngay_lam là bắt buộc"
        });
      }

      // Kiểm tra định dạng ngày
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngay_lam)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ngay_lam không hợp lệ (phải là YYYY-MM-DD)"
        });
      }

      // Kiểm tra thời gian
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (thoi_gian_bat_dau && ! timeRegex.test(thoi_gian_bat_dau)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng thoi_gian_bat_dau không hợp lệ (phải là HH:MM: SS)"
        });
      }

      if (thoi_gian_ket_thuc && !timeRegex.test(thoi_gian_ket_thuc)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng thoi_gian_ket_thuc không hợp lệ (phải là HH:MM:SS)"
        });
      }

      const lich_id = await LichLamViecModel.them(data);

      res.status(201).json({
        success: true,
        message: "Thêm lịch làm việc thành công",
        lich_id: lich_id,
        data: {
          lich_id,
          nhan_vien_id,
          ca_id:  ca_id || null,
          ngay_lam,
          thoi_gian_bat_dau:  thoi_gian_bat_dau || null,
          thoi_gian_ket_thuc: thoi_gian_ket_thuc || null,
          trang_thai:  trang_thai || 'Đăng ký'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi thêm lịch",
        error: error. message
      });
    }
  },

  // ✏️ Cập nhật lịch làm việc
  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validation
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ"
        });
      }

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp ít nhất một trường để cập nhật"
        });
      }

      // Kiểm tra định dạng ngày nếu có
      if (data.ngay_lam) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.ngay_lam)) {
          return res.status(400).json({
            success: false,
            message: "Định dạng ngay_lam không hợp lệ (phải là YYYY-MM-DD)"
          });
        }
      }

      // Kiểm tra định dạng thời gian nếu có
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (data.thoi_gian_bat_dau && ! timeRegex.test(data. thoi_gian_bat_dau)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng thoi_gian_bat_dau không hợp lệ (phải là HH:MM:SS)"
        });
      }

      if (data.thoi_gian_ket_thuc && ! timeRegex.test(data. thoi_gian_ket_thuc)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng thoi_gian_ket_thuc không hợp lệ (phải là HH:MM:SS)"
        });
      }

      const rows = await LichLamViecModel.capNhat(id, data);

      if (rows === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch làm việc"
        });
      }

      res.json({
        success: true,
        message: "Cập nhật lịch làm việc thành công",
        lich_id: id
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật lịch",
        error:  error.message
      });
    }
  },

  // ❌ Xóa lịch làm việc
  async xoa(req, res) {
    try {
      const { id } = req.params;

      // Validation
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ"
        });
      }

      const rows = await LichLamViecModel.xoa(id);

      if (rows === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch làm việc"
        });
      }

      res.json({
        success: true,
        message:  "Xóa lịch làm việc thành công",
        lich_id: id
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa lịch",
        error: error.message
      });
    }
  },

  // 📊 Lấy thống kê lịch làm
  async thongKe(req, res) {
    try {
      const { nhan_vien_id, tu_ngay, den_ngay } = req.body;

      if (!nhan_vien_id || !tu_ngay || ! den_ngay) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp nhan_vien_id, tu_ngay và den_ngay"
        });
      }

      const data = await LichLamViecModel.thongKeLich(nhan_vien_id, tu_ngay, den_ngay);

      res.json({
        success: true,
        message: "Lấy thống kê thành công",
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message
      });
    }
  }
};