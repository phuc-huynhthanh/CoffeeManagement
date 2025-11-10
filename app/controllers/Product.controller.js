import { ProductModel } from "../models/Product.model.js";
import axios from "axios";
import { IMGBB_API_KEY } from "../config/imgbb.conf.js";
import FormData from "form-data";

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
      const { ten_san_pham, mo_ta, loai_id, gia_co_ban } = req.body;

      if (!ten_san_pham || !loai_id || !gia_co_ban) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      let imageUrl = null;

      // Nếu có file ảnh, upload lên ImgBB
      if (req.file) {
        const formData = new FormData();
        formData.append("image", req.file.buffer.toString("base64"));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData,
          { headers: formData.getHeaders() }
        );

        imageUrl = response.data.data.url;
      }

      const newId = await ProductModel.create({
        ten_san_pham,
        mo_ta,
        loai_id,
        hinh_anh: imageUrl,
        gia_co_ban,
      });

      res.status(201).json({
        message: "Thêm sản phẩm thành công!",
        id: newId,
        imageUrl,
      });
    } catch (error) {
      console.error("Lỗi upload ảnh:", error.message);
      next(error);
    }
  },

  // Cập nhật sản phẩm
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Lấy sản phẩm hiện tại
      const product = await ProductModel.findById(id);
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      // Lấy dữ liệu text từ form-data
      const { ten_san_pham, mo_ta, loai_id, gia_co_ban } = req.body;

      let imageUrl = product.hinh_anh; // giữ ảnh cũ nếu không upload ảnh mới

      // Nếu có file ảnh mới, upload lên ImgBB
      if (req.file) {
        const formData = new FormData();
        formData.append("image", req.file.buffer.toString("base64"));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData,
          { headers: formData.getHeaders() }
        );

        imageUrl = response.data.data.url;
      }

      const affected = await ProductModel.update(id, {
        ten_san_pham,
        mo_ta,
        loai_id,
        hinh_anh: imageUrl,
        gia_co_ban,
      });

      if (affected > 0)
        res.json({ message: "Cập nhật sản phẩm thành công!", imageUrl });
      else res.status(400).json({ message: "Không có thay đổi nào được áp dụng." });
    } catch (error) {
      console.error("Lỗi upload ảnh:", error.message);
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
