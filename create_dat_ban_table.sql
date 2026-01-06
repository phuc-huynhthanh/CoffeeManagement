-- Script tạo bảng dat_ban cho hệ thống đặt bàn
-- Chạy script này trong MySQL Workbench hoặc command line

USE QuanLyQuanCaPhe;

-- Tạo bảng đặt bàn
CREATE TABLE IF NOT EXISTS dat_ban (
    dat_ban_id INT PRIMARY KEY AUTO_INCREMENT,
    ban_id INT NOT NULL,
    ten_khach_hang VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    ngay_dat DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    ghi_chu TEXT,
    trang_thai ENUM('Đã đặt', 'Đã đến', 'Đã hủy', 'Quá hạn') DEFAULT 'Đã đặt',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ban_id) REFERENCES ban(ban_id) ON DELETE CASCADE,
    INDEX idx_ngay_gio (ngay_dat, gio_bat_dau, gio_ket_thuc),
    INDEX idx_ban_trangthai (ban_id, trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kiểm tra bảng đã tạo thành công
SHOW TABLES LIKE 'dat_ban';
DESCRIBE dat_ban;

-- Thêm dữ liệu mẫu (tùy chọn)
-- INSERT INTO dat_ban (ban_id, ten_khach_hang, so_dien_thoai, email, ngay_dat, gio_bat_dau, gio_ket_thuc, ghi_chu)
-- VALUES (1, 'Nguyễn Văn A', '0123456789', 'nguyenvana@email.com', '2026-01-08', '16:00:00', '18:00:00', 'Đặt bàn cho 4 người');

SELECT 'Bảng dat_ban đã được tạo thành công!' AS Message;
