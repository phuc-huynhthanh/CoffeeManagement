import ThanhVien from "../models/ThanhVien.model.js";

export const ThanhVienController = {
  async layTatCa(req, res) {
    try {
      const data = await ThanhVien.layTatCa();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoId(req, res) {
    try {
      const { id } = req.params;
      const data = await ThanhVien.timTheoId(id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy thành viên" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoSDT(req, res) {
    try {
      const { sdt } = req.params;
      const data = await ThanhVien.timTheoSDT(sdt);
      if (!data) return res.status(404).json({ message: "Không tìm thấy thành viên" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async themMoi(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Body không được để trống!" });
      }
      const data = await ThanhVien.themMoi(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async capNhat(req, res) {
    try {
      const { id } = req.params;
      const affected = await ThanhVien.capNhat(id, req.body);
      if (!affected) return res.status(404).json({ message: "Không tìm thấy thành viên để cập nhật" });
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async xoa(req, res) {
    try {
      const { id } = req.params;
      const affected = await ThanhVien.xoa(id);
      if (!affected) return res.status(404).json({ message: "Không tìm thấy thành viên để xóa" });
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async timTheoDieuKien(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Body không được để trống!" });
      }
      const data = await ThanhVien.timTheoDieuKien(req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
