  // models/DoanhThuCa.model.js
  import { db } from "../config/db.conf.js";

  export const DoanhThuCaModel = {
    async layTatCa(conn = db) {
      const [rows] = await conn.query(
        "SELECT * FROM doanh_thu_ca ORDER BY ngay DESC, ca_id ASC"
      );
      return rows;
    },

    async timTheoId(id, conn = db) {
      const [rows] = await conn.query(
        "SELECT * FROM doanh_thu_ca WHERE doanh_thu_id = ?",
        [id]
      );
      return rows[0] || null;
    },

    async timTheoDieuKien(dieu_kien = {}, conn = db) {
      const entries = Object.entries(dieu_kien).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      );

      if (entries.length === 0) throw new Error("Cần ít nhất 1 điều kiện tìm kiếm.");

      const whereClause = entries.map(([col]) => `${col} = ?`).join(" AND ");
      const values = entries.map(([, val]) => val);

      const [rows] = await conn.query(
        `SELECT * FROM doanh_thu_ca WHERE ${whereClause} ORDER BY ngay DESC, ca_id ASC`,
        values
      );
      return rows;
    },

    /**
     * ✅ Upsert cộng dồn doanh thu theo (ca_id, ngay)
     * delta có thể âm (trừ doanh thu)
     * YÊU CẦU: UNIQUE KEY (ca_id, ngay)
     */
    async congDon({ ca_id, ngay, delta }, conn = db) {
      const d = Number(delta);
      if (!ca_id || !ngay || !Number.isFinite(d) || d === 0) return 0;

      const [result] = await conn.query(
        `
        INSERT INTO doanh_thu_ca (ca_id, ngay, tong_doanh_thu)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          tong_doanh_thu = GREATEST(0, tong_doanh_thu + VALUES(tong_doanh_thu))
        `,
        [ca_id, ngay, d]
      );

      return result.affectedRows || 0;
    },

    async xoaTheoKhoangNgay({ tu_ngay, den_ngay } = {}, conn = db) {
      const cond = [];
      const params = [];

      if (tu_ngay) {
        cond.push("ngay >= ?");
        params.push(tu_ngay);
      }
      if (den_ngay) {
        cond.push("ngay <= ?");
        params.push(den_ngay);
      }

      const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
      const [rs] = await conn.query(`DELETE FROM doanh_thu_ca ${where}`, params);
      return rs.affectedRows || 0;
    },

    async thongKeTheoNgay({ ngay }, conn = db) {
      const [rows] = await conn.query(
        `
        SELECT ca_id, ngay, tong_doanh_thu
        FROM doanh_thu_ca
        WHERE ngay = ?
        ORDER BY ca_id ASC
        `,
        [ngay]
      );
      return rows;
    },
  };
