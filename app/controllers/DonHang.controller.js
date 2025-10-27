import { DonHangModel } from "../models/DonHang.model.js";

export const DonHangController = {
  async layTatCa(req, res) {
    try {
      const data = await DonHangModel.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const donHang = await DonHangModel.timTheoId(id);
      if (!donHang) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      res.json(donHang);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tìm đơn hàng", error });
    }
  },

  async them(req, res) {
    try {
      const id = await DonHangModel.them(req.body);
      res.status(201).json({ message: "Thêm đơn hàng thành công", don_hang_id: id });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm đơn hàng", error });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const rows = await DonHangModel.capNhat(id, req.body);
      if (!rows) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng", error });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const rows = await DonHangModel.xoa(id);
      if (!rows) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error });
    }
  },
};
