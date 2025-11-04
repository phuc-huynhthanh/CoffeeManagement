const SECRET_KEY = "$2a$12$ZF9spVgpLpcerM/C7KOmi.cLXid5TjXEIpks/CzXkAQGXbomUjfui";
import jwt from "jsonwebtoken";

export const xacThucJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ thong_bao: "Thiếu token" });

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.nguoi_dung = payload; // gán thông tin user vào request
    next();
  } catch (error) {
    res.status(403).json({ thong_bao: "Token không hợp lệ hoặc hết hạn" });
  }
};
