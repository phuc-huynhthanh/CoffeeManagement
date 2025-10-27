import { ProductModel } from "../models/Product.model.js";

export const ProductController = {
  // Lấy danh sách sản phẩm
  async getAll(req, res, next) {
    try {
      const products = await ProductModel.getAll();
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  // Thêm sản phẩm mới
  async create(req, res, next) {
    try {
      const { ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban } = req.body;

      if (!ten_san_pham || !loai_id || !gia_co_ban) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      const newId = await ProductModel.create({
        ten_san_pham,
        mo_ta,
        loai_id,
        hinh_anh,
        gia_co_ban,
      });

      res.status(201).json({ message: "Thêm sản phẩm thành công!", id: newId });
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật sản phẩm
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban } = req.body;

      const product = await ProductModel.findById(id);
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      const affected = await ProductModel.update(id, {
        ten_san_pham,
        mo_ta,
        loai_id,
        hinh_anh,
        gia_co_ban,
      });

      if (affected > 0)
        res.json({ message: "Cập nhật sản phẩm thành công!" });
      else res.status(400).json({ message: "Không có thay đổi nào được áp dụng." });
    } catch (error) {
      next(error);
    }
  },

  // Xóa sản phẩm
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affected = await ProductModel.delete(id);
      if (affected > 0)
        res.json({ message: "Xóa sản phẩm thành công!" });
      else res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    } catch (error) {
      next(error);
    }
  },
};
