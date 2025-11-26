-- =========================
-- TẠO CƠ SỞ DỮ LIỆU
-- =========================
CREATE DATABASE IF NOT EXISTS QuanLyQuanCaPhe;
USE QuanLyQuanCaPhe;

-- =========================
-- BẢNG VAI TRÒ
-- =========================
CREATE TABLE IF NOT EXISTS vai_tro (
    vai_tro_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_vai_tro VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- BẢNG TÀI KHOẢN
-- =========================
CREATE TABLE IF NOT EXISTS tai_khoan (
    tai_khoan_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro_id INT,
    FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(vai_tro_id)
);

-- =========================
-- BẢNG CA LÀM
-- =========================
CREATE TABLE IF NOT EXISTS ca_lam (
    ca_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_ca VARCHAR(50) NOT NULL,
    thoi_gian_bat_dau TIME NOT NULL,
    thoi_gian_ket_thuc TIME NOT NULL
);

-- =========================
-- BẢNG NHÂN VIÊN
-- =========================
CREATE TABLE IF NOT EXISTS nhan_vien (
    nhan_vien_id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    sdt CHAR(10) NOT NULL,
    email VARCHAR(100),
    tai_khoan_id INT,
    ca_id INT,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(tai_khoan_id),
    FOREIGN KEY (ca_id) REFERENCES ca_lam(ca_id)
);

-- =========================
-- BẢNG LƯƠNG
-- =========================
CREATE TABLE IF NOT EXISTS luong (
    luong_id INT PRIMARY KEY AUTO_INCREMENT,
    nhan_vien_id INT NOT NULL,
    thang INT NOT NULL CHECK (thang BETWEEN 1 AND 12),
    nam INT NOT NULL CHECK (nam >= 2000),
    luong_co_ban DECIMAL(12,0) NOT NULL,
    so_ca_lam INT DEFAULT 0 CHECK (so_ca_lam >= 0),
    tong_thuong DECIMAL(12,0) DEFAULT 0,
    tong_phat DECIMAL(12,0) DEFAULT 0,
    tong_luong DECIMAL(12,0) DEFAULT 0,
    ngay_tinh_luong DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(nhan_vien_id)
);

-- =========================
-- BẢNG CHI TIẾT THƯỞNG PHẠT
-- =========================
CREATE TABLE IF NOT EXISTS chi_tiet_thuong_phat (
    chi_tiet_id INT PRIMARY KEY AUTO_INCREMENT,
    luong_id INT NOT NULL,
    loai ENUM('Thuong', 'Phat') NOT NULL,
    so_tien DECIMAL(12,0) NOT NULL CHECK (so_tien >= 0),
    ly_do VARCHAR(255),
    ngay_ap_dung DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (luong_id) REFERENCES luong(luong_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- BẢNG LỊCH LÀM VIỆC
-- =========================
CREATE TABLE IF NOT EXISTS lich_lam_viec (
    lich_id INT PRIMARY KEY AUTO_INCREMENT,
    nhan_vien_id INT,
    ca_id INT,
    ngay_lam DATE NOT NULL,
    trang_thai VARCHAR(20) DEFAULT 'Đăng ký',
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(nhan_vien_id),
    FOREIGN KEY (ca_id) REFERENCES ca_lam(ca_id)
);

-- =========================
-- BẢNG DOANH THU CA
-- =========================
CREATE TABLE IF NOT EXISTS doanh_thu_ca (
    doanh_thu_id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT,
    ngay DATE NOT NULL,
    tong_doanh_thu DECIMAL(18,0) DEFAULT 0,
    FOREIGN KEY (ca_id) REFERENCES ca_lam(ca_id)
);

-- =========================
-- BẢNG BÀN
-- =========================
CREATE TABLE IF NOT EXISTS ban (
    ban_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_ban VARCHAR(50) NOT NULL,
    trang_thai VARCHAR(30) DEFAULT 'Trống'
);

-- =========================
-- BẢNG LOẠI SẢN PHẨM
-- =========================
CREATE TABLE IF NOT EXISTS loai_san_pham (
    loai_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(50) NOT NULL
);

-- =========================
-- BẢNG KÍCH CỠ
-- =========================
CREATE TABLE IF NOT EXISTS kich_co (
    kich_co_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_kich_co VARCHAR(50) NOT NULL,
    gia_them DECIMAL(10,0) NOT NULL DEFAULT 0
);

-- =========================
-- BẢNG TOPPING
-- =========================
CREATE TABLE IF NOT EXISTS topping (
    topping_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_topping VARCHAR(100) NOT NULL,
    gia_them DECIMAL(9,0) DEFAULT 0
);

-- =========================
-- BẢNG SẢN PHẨM
-- =========================
CREATE TABLE IF NOT EXISTS san_pham (
    san_pham_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_san_pham VARCHAR(100) NOT NULL,
    mo_ta VARCHAR(255),
    loai_id INT,
    hinh_anh VARCHAR(255),
    gia_co_ban DECIMAL(9,0) NOT NULL,
    FOREIGN KEY (loai_id) REFERENCES loai_san_pham(loai_id)
);

-- =========================
-- BẢNG THÀNH VIÊN
-- =========================
CREATE TABLE IF NOT EXISTS thanh_vien (
    thanh_vien_id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    sdt CHAR(10) UNIQUE,
    email VARCHAR(100),
    tong_don_da_mua INT DEFAULT 0
);

-- =========================
-- BẢNG MỨC GIẢM GIÁ
-- =========================
CREATE TABLE IF NOT EXISTS muc_giam_gia_thanh_vien (
    muc_giam_gia_id INT NOT NULL,
    thanh_vien_id INT NOT NULL,
    da_su_dung BOOLEAN DEFAULT FALSE,  -- đánh dấu thành viên đã dùng chưa
    ngay_su_dung DATE,
    PRIMARY KEY (muc_giam_gia_id, thanh_vien_id),
    FOREIGN KEY (muc_giam_gia_id) REFERENCES muc_giam_gia(muc_giam_gia_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (thanh_vien_id) REFERENCES thanh_vien(thanh_vien_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================
-- BẢNG ĐƠN HÀNG (SỬA: dùng tai_khoan_id thay cho nhan_vien_id)
-- =========================
CREATE TABLE IF NOT EXISTS don_hang (
    don_hang_id INT PRIMARY KEY AUTO_INCREMENT,
    thanh_vien_id INT,
    ban_id INT,
    tai_khoan_id INT,
    ngay_dat DATETIME DEFAULT CURRENT_TIMESTAMP,
    tong_tien DECIMAL(12,0) DEFAULT 0,
    tien_sau_giam DECIMAL(12,0) DEFAULT 0,
    muc_giam_gia_id INT,
    trang_thai VARCHAR(50) DEFAULT 'Đang xử lý',
    FOREIGN KEY (thanh_vien_id) REFERENCES thanh_vien(thanh_vien_id),
    FOREIGN KEY (ban_id) REFERENCES ban(ban_id),
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(tai_khoan_id),
    FOREIGN KEY (muc_giam_gia_id) REFERENCES muc_giam_gia(muc_giam_gia_id)
);

-- =========================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- =========================
CREATE TABLE IF NOT EXISTS chi_tiet_don_hang (
    chi_tiet_id INT PRIMARY KEY AUTO_INCREMENT,
    don_hang_id INT,
    san_pham_id INT,
    kich_co_id INT,
    topping_id INT,
    so_luong INT CHECK(so_luong > 0),
    don_gia DECIMAL(9,0) NOT NULL,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(don_hang_id),
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(san_pham_id),
    FOREIGN KEY (kich_co_id) REFERENCES kich_co(kich_co_id),
    FOREIGN KEY (topping_id) REFERENCES topping(topping_id)
);

-- =========================
-- BẢNG CHI TIẾT TOPPING
-- =========================
CREATE TABLE IF NOT EXISTS chi_tiet_topping (
    chi_tiet_topping_id INT PRIMARY KEY AUTO_INCREMENT,
    chi_tiet_id INT,
    topping_id INT,
    so_luong INT DEFAULT 1 CHECK(so_luong > 0),
    gia_them DECIMAL(9,0) NOT NULL,
    FOREIGN KEY (chi_tiet_id) REFERENCES chi_tiet_don_hang(chi_tiet_id),
    FOREIGN KEY (topping_id) REFERENCES topping(topping_id)
);

-- =========================
-- BẢNG COMBO
-- =========================
CREATE TABLE IF NOT EXISTS combo (
    combo_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_combo VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    gia_combo DECIMAL(12,0) NOT NULL,
    hinh_anh VARCHAR(500),
    trang_thai ENUM('active', 'inactive') DEFAULT 'active',
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    gia_goc DECIMAL(12,0) NOT NULL DEFAULT 0
);

-- =========================
-- BẢNG CHI TIẾT COMBO (SẢN PHẨM TRONG COMBO)
-- =========================
CREATE TABLE IF NOT EXISTS chi_tiet_combo (
    chi_tiet_combo_id INT PRIMARY KEY AUTO_INCREMENT,
    combo_id INT NOT NULL,
    san_pham_id INT NOT NULL,
    so_luong INT DEFAULT 1 CHECK(so_luong > 0),
    ghi_chu VARCHAR(255),
    FOREIGN KEY (combo_id) REFERENCES combo(combo_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(san_pham_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- DỮ LIỆU MẪU
-- =========================
INSERT INTO vai_tro (ten_vai_tro) VALUES
('Admin'), ('Thu ngân'), ('Phục vụ'), ('Pha chế');

INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro_id) VALUES
('tphuc123', '$2b$10$W644ceZAg3rqJM33b9PucO7x45bQvZJs41RvkU/NrY2bOEzjjKm3W', 1);

INSERT INTO ca_lam (ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc) VALUES
('Ca sáng', '08:00:00', '14:00:00'),
('Ca tối', '14:00:00', '20:00:00');

INSERT INTO nhan_vien (ho_ten, sdt, email, tai_khoan_id, ca_id) VALUES
('Admin Hệ thống', '0999999999', 'admin@quanlycaphe.vn', 1, 1);

INSERT INTO loai_san_pham (ten_loai) VALUES
('Trà sữa'),
('Cà phê'),
('Nước ép'),
('Đá xay');

INSERT INTO kich_co (ten_kich_co, gia_them) VALUES
('Nhỏ', 0),
('Vừa', 5000),
('Lớn', 10000);

INSERT INTO topping (ten_topping, gia_them) VALUES
('Trân châu đen', 5000),
('Thạch cà phê', 7000),
('Pudding trứng', 10000),
('Kem cheese', 12000),
('Hạt dẻ', 8000);

INSERT INTO san_pham (san_pham_id, ten_san_pham, mo_ta, loai_id, hinh_anh, gia_co_ban) VALUES
(1, 'Trà thạch vải', 'Trà thạch vải cực kì thơm, vải mọng nước', 1, 'https://i.ibb.co/dsLcxsWM/d920086fa7a1.jpg', 30000),
(2, 'Trà xanh đậu đỏ', 'Trà xanh đậu đỏ, kết hợp hương vị cực kì hài hòa giữa trà và đậu đỏ ', 1, 'https://i.ibb.co/whGr8crQ/7cfe0d93c439.jpg', 32000),
(3, 'Cà phê sữa', 'Cà phê sữa ', 2, 'https://i.ibb.co/VGW5nG0/e50a4a3452eb.webp', 20000),
(4, 'Cà phê đen', 'Cà phê đen pha phin', 2, 'https://i.ibb.co/jkZ1VfNS/d7e9281e03e6.jpg', 20000),
(5, 'Nước ép cam', 'Nước ép cam nguyên chất cực ngon', 3, 'https://i.ibb.co/Z6Xd0kyS/5a8c5f27adb2.png', 30000),
(6, 'Nước ép dưa hấu', 'Nước ép dưa hấu nguyên chất cực ngon mọng nước', 3, 'https://i.ibb.co/q3dPnz0w/13d1f716628e.png', 35000),
(7, 'Đá xay cookies', 'Đá xay kết hợp bánh cookies theo kiểu phương Tây mới lạ, vị hấp dẫn', 4, 'https://i.ibb.co/TMf5FZw5/7cc869c7c538.jpg', 37000),
(8, 'Đá xay socola', 'Đá xay kết hợp socola thơm ngon béo ngậy', 4, 'https://i.ibb.co/zVG8Wsjc/36f8e0be281c.jpg', 35000),
(9, 'Bạc Xỉu', 'Bạc xỉu', 2, 'https://i.ibb.co/VYwtJs6N/04b43cbd4ae8.jpg', 25000),
(10, 'Trà Ổi Hồng', 'Trà ổi hồng đậm vị trà, hòa vị ổi', 1, 'https://i.ibb.co/x8hydTK9/de481eb2845b.jpg', 30000),
(11, 'Trà Đào Cam Sả', 'Trà đào cam sả cực kì ngon', 1, 'https://i.ibb.co/Pzcgx0gj/8a63ea33056f.png', 32000),
(12, 'Sữa tươi cà phê', 'Sữa tươi kết hợp cà phê cực kì ngon', 2, 'https://i.ibb.co/whgpnsMx/63f8222f5a24.png', 17000);


INSERT INTO ban (ten_ban, trang_thai) VALUES
('Bàn 1', 'Trống'),
('Bàn 2', 'Trống'),
('Bàn 3', 'Trống'),
('Bàn 4', 'Trống'),
('Bàn 5', 'Trống');
