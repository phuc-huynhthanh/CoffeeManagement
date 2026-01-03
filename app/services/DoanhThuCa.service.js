// services/DoanhThuCa.service.js
import { DoanhThuCaModel } from "../models/DoanhThuCa.model.js";
import { CaLamModel } from "../models/CaLam.model.js";

/** "HH:MM:SS" (hoặc "HH:MM") -> seconds */
function toSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  return h * 3600 + m * 60 + s;
}

/** Date -> YYYY-MM-DD */
function formatDateYYYYMMDD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Tìm ca_id dựa theo giờ của ngay_dat (hỗ trợ ca qua đêm).
 * Quy ước: ca_lam có thoi_gian_bat_dau, thoi_gian_ket_thuc kiểu TIME.
 */
export async function findCaIdByDateTime(ngay_dat, conn) {
  const caList = await CaLamModel.layTatCa(conn);

  const dt = new Date(ngay_dat);
  const sec = dt.getHours() * 3600 + dt.getMinutes() * 60 + dt.getSeconds();

  for (const ca of caList) {
    const start = toSeconds(ca.thoi_gian_bat_dau);
    const end = toSeconds(ca.thoi_gian_ket_thuc);

    // ca bình thường
    if (start <= end) {
      if (sec >= start && sec < end) return ca.ca_id;
    } else {
      // ca qua đêm (vd 22:00 -> 06:00)
      if (sec >= start || sec < end) return ca.ca_id;
    }
  }
  return null;
}

/**
 * Snapshot tối thiểu của đơn hàng để tính doanh thu.
 * Trả về: { don_hang_id, ngay_dat, trang_thai, tong_tien, tien_sau_giam }
 */
export async function getDonHangSnapshot(don_hang_id, conn) {
  const [rows] = await conn.query(
    `
    SELECT don_hang_id, ngay_dat, trang_thai, tong_tien, tien_sau_giam
    FROM don_hang
    WHERE don_hang_id = ?
    `,
    [don_hang_id]
  );
  return rows[0] || null;
}

/**
 * Quy tắc: chỉ tính doanh thu khi "Đã thanh toán"
 * (Nếu hệ bạn dùng chuỗi khác, sửa ở đây)
 */
function isTinhDoanhThu(trang_thai) {
  return trang_thai === "Đã thanh toán";
}

/** Số tiền tính doanh thu */
function getTienTinhDoanhThu(dh) {
  const v = Number(dh?.tien_sau_giam ?? dh?.tong_tien ?? 0);
  return Number.isFinite(v) ? v : 0;
}

/**
 * applyDoanhThuChange(oldDH, newDH)
 * - oldDH/newDH có thể null
 * - tự xử lý: thêm, sửa, xóa, đổi ngày, đổi trạng thái, đổi tiền
 */
export async function applyDoanhThuChange(oldDH, newDH, conn) {
  const buildEffect = async (dh) => {
    if (!dh) return null;
    if (!isTinhDoanhThu(dh.trang_thai)) return null;

    const ca_id = await findCaIdByDateTime(dh.ngay_dat, conn);
    if (!ca_id) return null;

    const ngay = formatDateYYYYMMDD(new Date(dh.ngay_dat));
    const tien = getTienTinhDoanhThu(dh);
    if (!tien || tien <= 0) return null;

    return { ca_id, ngay, tien };
  };

  const oldEff = await buildEffect(oldDH);
  const newEff = await buildEffect(newDH);

  // 1) trừ effect cũ
  if (oldEff) {
    await DoanhThuCaModel.congDon(
      { ca_id: oldEff.ca_id, ngay: oldEff.ngay, delta: -oldEff.tien },
      conn
    );
  }

  // 2) cộng effect mới
  if (newEff) {
    await DoanhThuCaModel.congDon(
      { ca_id: newEff.ca_id, ngay: newEff.ngay, delta: newEff.tien },
      conn
    );
  }
}

/**
 * ✅ rebuildDoanhThuCa
 * - Dùng cho endpoint /doanh-thu-ca/rebuild
 * - Xóa doanh_thu_ca theo khoảng ngày (optional)
 * - Duyệt các đơn đã thanh toán và apply vào doanh_thu_ca
 *
 * body: { tu_ngay?: 'YYYY-MM-DD', den_ngay?: 'YYYY-MM-DD' }
 */
export async function rebuildDoanhThuCa({ tu_ngay, den_ngay } = {}, conn) {
  if (!conn) throw new Error("Thiếu connection (conn) trong rebuildDoanhThuCa");

  // 1) Xóa bảng doanh_thu_ca theo khoảng ngày (nếu truyền)
  await DoanhThuCaModel.xoaTheoKhoangNgay({ tu_ngay, den_ngay }, conn);

  // 2) Lấy các đơn đã thanh toán trong khoảng
  const cond = ["trang_thai = ?"];
  const params = ["Đã thanh toán"];

  if (tu_ngay) {
    cond.push("DATE(ngay_dat) >= ?");
    params.push(tu_ngay);
  }
  if (den_ngay) {
    cond.push("DATE(ngay_dat) <= ?");
    params.push(den_ngay);
  }

  const where = `WHERE ${cond.join(" AND ")}`;

  const [rows] = await conn.query(
    `
    SELECT don_hang_id, ngay_dat, trang_thai, tong_tien, tien_sau_giam
    FROM don_hang
    ${where}
    ORDER BY don_hang_id ASC
    `,
    params
  );

  let so_don_da_xu_ly = 0;
  for (const dh of rows) {
    await applyDoanhThuChange(null, dh, conn);
    so_don_da_xu_ly++;
  }

  return { so_don_da_xu_ly };
}
