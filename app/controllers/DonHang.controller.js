import { DonHangModel } from "../models/DonHang.model.js";
import ThanhVien from "../models/ThanhVien.model.js"; // ✅ thêm dòng này

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

  // ✅ Thêm đơn hàng -> recalc thành viên
  async them(req, res) {
    try {
      // 1) tạo đơn hàng
      const id = await DonHangModel.them(req.body);

      // 2) lấy thanh_vien_id để cập nhật thống kê
      // Ưu tiên lấy từ body, nếu không có thì lấy lại từ DB theo id
      let thanh_vien_id = req.body.thanh_vien_id;

      if (!thanh_vien_id) {
        const created = await DonHangModel.timTheoId(id);
        thanh_vien_id = created?.thanh_vien_id;
      }

      // 3) cập nhật thống kê + bậc (nếu có thanh_vien_id)
      if (thanh_vien_id) {
        await ThanhVien.capNhatThongKeVaBac(thanh_vien_id);
      }

      res.status(201).json({ message: "Thêm đơn hàng thành công", don_hang_id: id });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm đơn hàng", error });
    }
  },

  // ✅ Cập nhật đơn -> recalc thành viên (cả OLD và NEW nếu đổi người)
  async capNhat(req, res) {
    try {
      const { id } = req.params;

      // 1) lấy đơn cũ trước khi update để biết old_thanh_vien_id
      const oldDon = await DonHangModel.timTheoId(id);
      if (!oldDon) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // 2) update
      const rows = await DonHangModel.capNhat(id, req.body);
      if (!rows) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // 3) lấy đơn mới sau update để biết new_thanh_vien_id
      const newDon = await DonHangModel.timTheoId(id);

      const old_tv = oldDon?.thanh_vien_id;
      const new_tv = newDon?.thanh_vien_id;

      // 4) recalc NEW
      if (new_tv) await ThanhVien.capNhatThongKeVaBac(new_tv);

      // 5) nếu đổi thành viên thì recalc OLD
      if (old_tv && new_tv && old_tv !== new_tv) {
        await ThanhVien.capNhatThongKeVaBac(old_tv);
      }

      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng", error });
    }
  },

  // ✅ Xóa đơn -> recalc thành viên
  async xoa(req, res) {
    try {
      const { id } = req.params;

      // 1) lấy thanh_vien_id trước khi xóa
      const oldDon = await DonHangModel.timTheoId(id);
      if (!oldDon) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // 2) xóa
      const rows = await DonHangModel.xoa(id);
      if (!rows) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // 3) recalc thành viên
      const old_tv = oldDon?.thanh_vien_id;
      if (old_tv) await ThanhVien.capNhatThongKeVaBac(old_tv);

      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error });
    }
  },
};
