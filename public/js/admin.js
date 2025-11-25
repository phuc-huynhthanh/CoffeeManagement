
  // Toast function
  function showToast(message, type = "success", duration = 3000) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

    toast.className = `${bgColor} text-white px-4 py-2 rounded shadow-lg animate-slide-in`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => container.removeChild(toast), 500);
    }, duration);
  }

  // CSS animation for toast
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes slide-in {
      0% { transform: translateX(100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.5s ease-out; }
  `;
  document.head.appendChild(style);

  // Hiển thị tên người dùng
  const user = JSON.parse(localStorage.getItem("user"));
  const usernameElement = document.getElementById("username");

  if (!user || !user.tai_khoan_id) {
    window.location.href = "/taikhoan/dangnhap";
  } else {
    fetch(`http://localhost:3000/nhanvien/taikhoan/${user.tai_khoan_id}`)
      .then(res => res.json())
      .then(data => {
        usernameElement.textContent = data.ho_ten ? `👤 ${data.ho_ten}` : "👤 Không rõ tên";
        if (data.ten_vai_tro !== "Admin") {
          window.location.href = "/view/pos";
        }
      })
      .catch(err => {
        console.error("❌ Lỗi khi lấy thông tin nhân viên:", err);
        usernameElement.textContent = "❌ Lỗi tải tên người dùng";
      });
  }

  // Thêm nhân viên
  document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const roleId = parseInt(document.getElementById("role").value);

    if (!username || !password || !name || !phone || !roleId) {
      showToast("⚠️ Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    const payload = {
      tai_khoan: { ten_dang_nhap: username, mat_khau: password, vai_tro_id: roleId },
      nhan_vien: {
        ho_ten: name,
        gioi_tinh: "Nam",
        ngay_sinh: "2000-05-14",
        so_dien_thoai: phone,
        email: email || "",
        dia_chi: "Chưa cập nhật",
        ngay_vao_lam: new Date().toISOString().split("T")[0],
        luong: 8500000
      }
    };

    try {
      const response = await fetch("http://localhost:3000/taikhoan/dangky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể thêm nhân viên");

      showToast("✅ Thêm tài khoản nhân viên thành công!", "success");
      document.getElementById("employeeModal").classList.add("hidden");
      e.target.reset();
      loadAccounts();
    } catch (error) {
      console.error("❌ Lỗi khi thêm nhân viên:", error);
      showToast("❌ Đã xảy ra lỗi: " + error.message, "error");
    }
  });

  // Hủy form
  document.getElementById("btnCancel").addEventListener("click", () => {
    document.getElementById("employeeModal").classList.add("hidden");
    document.getElementById("employeeForm").reset();
  });

  // Hiển thị form thêm nhân viên
  document.getElementById("btnAdd").addEventListener("click", () => {
    document.getElementById("modalTitle").textContent = "Thêm tài khoản nhân viên";
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeModal").classList.remove("hidden");
  });

  // Đăng xuất
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/taikhoan/dangnhap";
  });

  // Load danh sách tài khoản
  async function loadAccounts() {
    try {
      const res = await fetch("http://localhost:3000/taikhoan/chitiet");
      const data = await res.json();
      const tbody = document.getElementById("accountTable");
      tbody.innerHTML = "";

      if (!data.du_lieu || data.du_lieu.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-500">Chưa có tài khoản nào.</td></tr>`;
        return;
      }

      data.du_lieu.forEach((item, index) => {
        const nv = item.nhan_vien;
        const tk = item.tai_khoan;
        const canDelete = tk?.ten_vai_tro !== "Admin";

        const row = document.createElement("tr");
        row.classList.add("hover:bg-gray-50");
        row.innerHTML = `
          <td class="px-4 py-3">${index + 1}</td>
          <td class="px-4 py-3">${nv?.ho_ten || "—"}</td>
          <td class="px-4 py-3">${nv?.sdt || "—"}</td>
          <td class="px-4 py-3">${nv?.email || "—"}</td>
          <td class="px-4 py-3">${tk?.ten_vai_tro || "—"}</td>
          <td class="px-4 py-3">${tk?.ten_dang_nhap || "—"}</td>
          <td class="px-4 py-3 text-center">
            ${
              canDelete
                ? `<button onclick="xoaTaiKhoan(${tk.tai_khoan_id})" 
                     class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                     Xóa
                   </button>`
                : `<span class="text-gray-400 italic">Không thể xóa</span>`
            }
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách tài khoản:", err);
      document.getElementById("accountTable").innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>`;
    }
  }

  // Xóa tài khoản
  // Xóa tài khoản (thêm debug)
async function xoaTaiKhoan(id) {
  console.log("🧩 Đang yêu cầu xóa tài khoản ID:", id);

  // Lấy toàn bộ thông tin tài khoản trước khi xóa
  try {
    const infoRes = await fetch(`http://localhost:3000/taikhoan/${id}`);
    const infoData = await infoRes.json();
    console.log("📋 Thông tin tài khoản cần xóa:", infoData);
  } catch (err) {
    console.warn("⚠️ Không thể lấy thông tin tài khoản trước khi xóa:", err);
  }

  if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;

  try {
    const res = await fetch(`http://localhost:3000/taikhoan/xoa/${id}`, {
      method: "DELETE",
    });

    const resultText = await res.text(); // đọc text để xem có lỗi gì
    console.log("📦 Kết quả phản hồi thô từ server:", resultText);

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    if (!res.ok) throw new Error(result.message || "Không thể xóa tài khoản");

    showToast("✅ Xóa tài khoản thành công!", "success");
    loadAccounts();
  } catch (err) {
    console.error("❌ Lỗi khi xóa tài khoản:", err);
    showToast("❌ Đã xảy ra lỗi: " + err.message, "error");
  }
}


  window.addEventListener("DOMContentLoaded", loadAccounts);

  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Xóa active cũ
      tabLinks.forEach(l => l.classList.remove("active"));
      tabContents.forEach(c => c.classList.add("hidden"));

      // Kích hoạt tab mới
      link.classList.add("active");
      const tabId = "tab-" + link.dataset.tab;
      document.getElementById(tabId).classList.remove("hidden");
    });
  });

  // Khi load trang, tab tài khoản là mặc định
  document.getElementById("tab-tai-khoan").classList.remove("hidden");
  async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/sanpham/laytatca");
    const data = await res.json();
    const tbody = document.getElementById("productTable");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-gray-500">Chưa có sản phẩm nào.</td></tr>`;
      return;
    }

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class="px-4 py-3">${index + 1}</td>
        <td class="px-4 py-3">${item.ten_san_pham}</td>
        <td class="px-4 py-3">${item.ten_loai || "—"}</td>
        <td class="px-4 py-3">${item.gia_co_ban}</td>
        <td class="px-4 py-3">
          ${item.hinh_anh ? `<img src="${item.hinh_anh}" class="w-16 h-16 object-cover rounded">` : "—"}
        </td>
        <td class="px-4 py-3 text-center">
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-1"
          onclick="editProductFromRow(this, ${item.san_pham_id})">Sửa</button>
          <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onclick="deleteProduct(${item.san_pham_id})">Xóa</button>
</td>

      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải sản phẩm:", err);
  }
}

// Gọi khi load trang
window.addEventListener("DOMContentLoaded", () => {
  loadAccounts();
  loadProducts();
});

// Load danh sách loại sản phẩm và điền vào select
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:3000/loaisanpham/laytatca");
    const data = await res.json();

    const select = document.getElementById("productCategory");
    select.innerHTML = `<option value="">-- Chọn loại --</option>`; // reset

    data.forEach(loai => {
      const option = document.createElement("option");
      option.value = loai.loai_id;
      option.textContent = loai.ten_loai;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải loại sản phẩm:", err);
    showToast("❌ Không thể tải danh sách loại sản phẩm", "error");
  }
}

// Hiển thị modal thêm sản phẩm
document.getElementById("btnAddProduct").addEventListener("click", async () => {
  document.getElementById("productModalTitle").textContent = "Thêm sản phẩm";
  document.getElementById("productForm").reset();
  
  // Load danh sách loại trước khi hiển thị form
  await loadCategories();
  
  document.getElementById("productModal").classList.remove("hidden");
});

// Hủy form
document.getElementById("btnCancelProduct").addEventListener("click", () => {
  document.getElementById("productModal").classList.add("hidden");
  document.getElementById("productForm").reset();
});

// Submit form thêm sản phẩm
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Lấy ID để biết là thêm hay sửa
  const productId = document.getElementById("productId").value;
  const url = productId 
              ? `http://localhost:3000/sanpham/sua/${productId}` 
              : "http://localhost:3000/sanpham/them";

  try {
    const res = await fetch(url, {
      method: productId ? "PUT" : "POST",
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Lỗi khi lưu sản phẩm");

    showToast(productId ? "✅ Cập nhật sản phẩm thành công!" : "✅ Thêm sản phẩm thành công!", "success");
    document.getElementById("productModal").classList.add("hidden");
    form.reset();
    loadProducts();
  } catch (err) {
    console.error("❌ Lỗi khi lưu sản phẩm:", err);
    showToast("❌ Lỗi: " + err.message, "error");
  }
});

// Gọi loadCategories() khi trang load để đảm bảo select luôn có dữ liệu
window.addEventListener("DOMContentLoaded", loadCategories);

async function editProduct(id) {
  try {
    // Lấy thông tin sản phẩm từ API
    const res = await fetch(`http://localhost:3000/sanpham/${id}`);
    const product = await res.json();

    if (!product) {
      showToast("❌ Không tìm thấy sản phẩm", "error");
      return;
    }

    // Load danh sách loại sản phẩm trước
    await loadCategories();

    // Điền dữ liệu vào form
    document.getElementById("productModalTitle").textContent = "Sửa sản phẩm";
    document.getElementById("productId").value = product.san_pham_id;
    document.getElementById("productName").value = product.ten_san_pham;
    document.getElementById("productDesc").value = product.mo_ta || "";
    document.getElementById("productPrice").value = product.gia_co_ban;
    document.getElementById("productCategory").value = product.loai_id;

    document.getElementById("productModal").classList.remove("hidden");
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm:", err);
    showToast("❌ Lỗi khi tải dữ liệu sản phẩm", "error");
  }
}

async function editProductFromRow(button, productId) {
  const row = button.closest("tr"); // Lấy hàng <tr> của nút Sửa
  const cells = row.children;

  // Lấy dữ liệu từ cột
  const ten_san_pham = cells[1].textContent.trim();
  const loai_text = cells[2].textContent.trim();
  const gia_co_ban = cells[3].textContent.trim();

  // Load danh sách loại sản phẩm để select có dữ liệu
  await loadCategories();

  // Chọn giá trị đúng trong select
  const select = document.getElementById("productCategory");
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].textContent === loai_text) {
      select.selectedIndex = i;
      break;
    }
  }

  // Điền dữ liệu vào form
  document.getElementById("productModalTitle").textContent = "Sửa sản phẩm";
  document.getElementById("productId").value = productId;
  document.getElementById("productName").value = ten_san_pham;
  document.getElementById("productPrice").value = gia_co_ban;
  document.getElementById("productDesc").value = ""; // Nếu muốn, có thể thêm cột mô tả vào bảng
  document.getElementById("productModal").classList.remove("hidden");
}

// Hiển thị modal thêm bàn
document.getElementById("btnAddTable").addEventListener("click", () => {
  document.getElementById("tableModalTitle").textContent = "Thêm bàn";
  document.getElementById("tableForm").reset();
  document.getElementById("tableModal").classList.remove("hidden");
});

// Hủy form
document.getElementById("btnCancelTable").addEventListener("click", () => {
  document.getElementById("tableModal").classList.add("hidden");
  document.getElementById("tableForm").reset();
});

// Load danh sách bàn
async function loadTables() {
  try {
    const res = await fetch("http://localhost:3000/ban/laytatca");
    const data = await res.json();
    const tbody = document.getElementById("tableTable");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Chưa có bàn nào.</td></tr>`;
      return;
    }

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class="px-4 py-3">${index + 1}</td>
        <td class="px-4 py-3">${item.ten_ban}</td>
        <td class="px-4 py-3">${item.trang_thai}</td>
        <td class="px-4 py-3 text-center">
          <button onclick="deleteTable(${item.ban_id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            Xóa
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải danh sách bàn:", err);
  }
}

// Thêm bàn
document.getElementById("tableForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const ten_ban = document.getElementById("tableName").value.trim();
  const trang_thai = document.getElementById("tableStatus").value;

  if (!ten_ban) {
    alert("Tên bàn không được để trống!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/ban/them", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ten_ban, trang_thai })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Không thể thêm bàn");

    document.getElementById("tableModal").classList.add("hidden");
    document.getElementById("tableForm").reset();
    loadTables();
  } catch (err) {
    console.error("❌ Lỗi khi thêm bàn:", err);
    alert("Lỗi: " + err.message);
  }
});

// Xóa bàn
async function deleteTable(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa bàn này không?")) return;
  try {
    const res = await fetch(`http://localhost:3000/ban/xoa/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Không thể xóa bàn");

    loadTables();
  } catch (err) {
    console.error("❌ Lỗi khi xóa bàn:", err);
    alert("Lỗi: " + err.message);
  }
}

// Gọi khi load trang
window.addEventListener("DOMContentLoaded", () => {
  loadTables();
});

// Load danh sách đơn hàng
let allOrders = []; // Lưu tất cả đơn hàng để lọc

async function loadOrders() {
  try {
    const res = await fetch("http://localhost:3000/donhang/laytatca");
    const data = await res.json();
    allOrders = data || []; // lưu toàn bộ dữ liệu
    renderOrders(allOrders);
  } catch (err) {
    console.error("❌ Lỗi khi tải danh sách đơn hàng:", err);
    document.getElementById("orderTable").innerHTML = `
      <tr><td colspan="9" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>
    `;
  }
}

// Hàm render danh sách đơn hàng
function renderOrders(orders) {
  const tbody = document.getElementById("orderTable");
  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-gray-500">Chưa có đơn hàng nào.</td></tr>`;
    return;
  }

  orders.forEach((item, index) => {
    const ngayDat = new Date(item.ngay_dat).toLocaleString("vi-VN");

    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-50");
    row.innerHTML = `
      <td class="px-4 py-3">${index + 1}</td>
      <td class="px-4 py-3">${ngayDat}</td>
      <td class="px-4 py-3">${item.tong_tien}</td>
      <td class="px-4 py-3">${item.tien_sau_giam}</td>
      <td class="px-4 py-3">${item.trang_thai}</td>
      <td class="px-4 py-3">${item.ban?.ten_ban || "—"}</td>
      <td class="px-4 py-3">${item.thanh_vien?.ho_ten || "Khách vãng lai"}</td>
      <td class="px-4 py-3">${item.nhan_vien_tao_don?.ho_ten || "—"}</td>
    `;
    tbody.appendChild(row);
  });
}

// Xử lý lọc
document.getElementById("btnFilterOrders").addEventListener("click", () => {
  const startDateStr = document.getElementById("filterStartDate").value;
  const endDateStr = document.getElementById("filterEndDate").value;
  const staffName = document.getElementById("filterStaff").value.toLowerCase();
  const customerType = document.getElementById("filterCustomer").value;

  const filtered = allOrders.filter(order => {
    let match = true;

    const orderDate = new Date(order.ngay_dat);

    if (startDateStr) {
      const startDate = new Date(startDateStr + "T00:00:00");
      match = match && orderDate >= startDate;
    }

    if (endDateStr) {
      const endDate = new Date(endDateStr + "T23:59:59");
      match = match && orderDate <= endDate;
    }

    if (staffName) match = match && order.nhan_vien_tao_don?.ho_ten?.toLowerCase().includes(staffName);

    // Lọc khách hàng
    if (customerType) {
      if (customerType === "khach_vang_lai") {
        match = match && !order.thanh_vien?.ho_ten;
      } else if (customerType === "thanh_vien") {
        match = match && !!order.thanh_vien?.ho_ten;
      }
    }

    return match;
  });

  renderOrders(filtered);
});



// Reset filter
document.getElementById("btnResetFilter").addEventListener("click", () => {
  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";
  document.getElementById("filterStaff").value = "";
  document.getElementById("filterCustomer").value = "";
  renderOrders(allOrders);
});


// Gọi khi load trang
window.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

// Mở modal và điền dữ liệu
  function viewOrderDetail(order) {
    const tbody = document.getElementById("orderDetailTable");
    tbody.innerHTML = "";

    if (!order.chi_tiet || order.chi_tiet.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-gray-500">Chưa có chi tiết nào.</td></tr>`;
    } else {
      order.chi_tiet.forEach((item, index) => {
        const row = document.createElement("tr");
        row.classList.add("hover:bg-gray-50");
        row.innerHTML = `
          <td class="px-4 py-2">${index + 1}</td>
          <td class="px-4 py-2">${item.ten_san_pham || "—"}</td>
          <td class="px-4 py-2">${item.ten_kich_co || "—"}</td>
          <td class="px-4 py-2">${item.ten_topping || "—"}</td>
          <td class="px-4 py-2">${item.don_gia}</td>
          <td class="px-4 py-2">${item.so_luong}</td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById("orderDetailModal").classList.remove("hidden");
  }

  function closeOrderDetailModal() {
    document.getElementById("orderDetailModal").classList.add("hidden");
  }

  // Sửa renderOrders để thêm nút xem chi tiết
  function renderOrders(orders) {
    const tbody = document.getElementById("orderTable");
    tbody.innerHTML = "";

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-gray-500">Chưa có đơn hàng nào.</td></tr>`;
      return;
    }

    orders.forEach((item, index) => {
      const ngayDat = new Date(item.ngay_dat).toLocaleString("vi-VN");

      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class="px-4 py-3">${index + 1}</td>
        <td class="px-4 py-3">${ngayDat}</td>
        <td class="px-4 py-3">${item.tong_tien}</td>
        <td class="px-4 py-3">${item.tien_sau_giam}</td>
        <td class="px-4 py-3">${item.trang_thai}</td>
        <td class="px-4 py-3">${item.ban?.ten_ban || "—"}</td>
        <td class="px-4 py-3">${item.thanh_vien?.ho_ten || "Khách vãng lai"}</td>
        <td class="px-4 py-3">${item.nhan_vien_tao_don?.ho_ten || "—"}</td>
        <td class="px-4 py-3 text-center">
          <button onclick='viewOrderDetail(${JSON.stringify(item).replaceAll("'", "&apos;")})' class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Xem Chi Tiết
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

 const discountModal = document.getElementById("discountModal");
const btnAddDiscount = document.getElementById("btnAddDiscount");
const btnCancelDiscount = document.getElementById("btnCancelDiscount");
const discountForm = document.getElementById("discountForm");
const discountTable = document.getElementById("discountTable");

const discountModalTitle = document.getElementById("discountModalTitle");
const discountIdInput = document.getElementById("discountId");
const discountCodeInput = document.getElementById("discountCode");
const discountPercentInput = document.getElementById("discountPercent");
const discountDescInput = document.getElementById("discountDesc");
const discountMemberSelect = document.getElementById("discountMember");
const discountExpiryInput = document.getElementById("discountExpiry");

// Load danh sách thành viên
async function loadMembers() {
  try {
    const res = await fetch("http://localhost:3000/thanhvien/laytatca");
    const data = await res.json();
    discountMemberSelect.innerHTML = `<option value="">— Tất cả —</option>`;
    data.forEach(tv => {
      const option = document.createElement("option");
      option.value = tv.thanh_vien_id;
      option.textContent = tv.ho_ten;
      discountMemberSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Lỗi loadMembers:", err);
  }
}

// Load danh sách khuyến mãi
async function loadDiscounts() {
  try {
    const res = await fetch("http://localhost:3000/mucgiamgia/laytatca");
    const data = await res.json();
    
    discountTable.innerHTML = data
      .map((item, index) => `
        <tr>
          <td class="px-4 py-2 border-b">${index + 1}</td>
          <td class="px-4 py-2 border-b">${item.ma_khuyen_mai || ""}</td>
          <td class="px-4 py-2 border-b">${item.phan_tram_giam}%</td>
          <td class="px-4 py-2 border-b">${item.mo_ta || ""}</td>
          <td class="px-4 py-2 border-b">${item.ten_thanh_vien || "Tất cả"}</td>
          <td class="px-4 py-2 border-b">${item.ngay_het_han || "—"}</td>
          <td class="px-4 py-2 border-b text-center">
            <button onclick="editDiscount(${item.muc_giam_gia_id})" class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Sửa</button>
            <button onclick="deleteDiscount(${item.muc_giam_gia_id})" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Xóa</button>
          </td>
        </tr>
      `).join("");
  } catch (err) {
    console.error("Lỗi loadDiscounts:", err);
    discountTable.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>`;
  }
}

// Mở modal thêm
btnAddDiscount.addEventListener("click", async () => {
  discountModalTitle.textContent = "Thêm khuyến mãi";
  discountForm.reset();
  discountIdInput.value = "";
  await loadMembers();
  discountModal.classList.remove("hidden");
});

// Đóng modal
btnCancelDiscount.addEventListener("click", () => discountModal.classList.add("hidden"));

// Thêm hoặc sửa
discountForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = discountIdInput.value;
  const payload = {
    ma_khuyen_mai: discountCodeInput.value.trim(),
    phan_tram_giam: discountPercentInput.value,
    mo_ta: discountDescInput.value.trim(),
    thanh_vien_id: discountMemberSelect.value || null,
    ngay_het_han: discountExpiryInput.value || null,
  };

  try {
    const url = id 
      ? `http://localhost:3000/mucgiamgia/sua/${id}` 
      : "http://localhost:3000/mucgiamgia/them";
    
    const method = id ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const result = await res.json();
    
    if (!res.ok) throw new Error(result.message || "Lỗi khi lưu khuyến mãi");
    
    showToast(id ? "✅ Cập nhật khuyến mãi thành công!" : "✅ Thêm khuyến mãi thành công!", "success");
    discountModal.classList.add("hidden");
    loadDiscounts();
  } catch (err) {
    console.error("Lỗi submit:", err);
    showToast("❌ Lỗi: " + err.message, "error");
  }
});

// Sửa
window.editDiscount = async function (id) {
  try {
    const res = await fetch(`http://localhost:3000/mucgiamgia/layid/${id}`);
    
    if (!res.ok) throw new Error("Không thể tải dữ liệu khuyến mãi");
    
    const data = await res.json();

    discountModalTitle.textContent = "Cập nhật khuyến mãi";
    discountIdInput.value = id;
    discountCodeInput.value = data.ma_khuyen_mai || "";
    discountPercentInput.value = data.phan_tram_giam;
    discountDescInput.value = data.mo_ta || "";
    discountExpiryInput.value = data.ngay_het_han || "";
    
    await loadMembers();
    discountMemberSelect.value = data.thanh_vien_id || "";

    discountModal.classList.remove("hidden");
  } catch (err) {
    console.error("Lỗi editDiscount:", err);
    showToast("❌ Không thể tải dữ liệu khuyến mãi!", "error");
  }
};

// Xóa
window.deleteDiscount = async function (id) {
  if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
  
  try {
    const res = await fetch(`http://localhost:3000/mucgiamgia/xoa/${id}`, { 
      method: "DELETE" 
    });
    
    const result = await res.json();
    
    if (!res.ok) throw new Error(result.message || "Không thể xóa khuyến mãi");
    
    showToast("✅ Xóa khuyến mãi thành công!", "success");
    loadDiscounts();
  } catch (err) {
    console.error("Lỗi deleteDiscount:", err);
    showToast("❌ Lỗi: " + err.message, "error");
  }
};

// Load khi mở tab
document.querySelector('[data-tab="khuyen-mai"]')?.addEventListener("click", loadDiscounts);


// Elements
const memberTable = document.getElementById("memberTable");
const memberModal = document.getElementById("memberModal");
const memberForm = document.getElementById("memberForm");
const btnAddMember = document.getElementById("btnAddMember");
const btnCancelMember = document.getElementById("btnCancelMember");

// Load danh sách thành viên
async function loadMembers() {
  try {
    const res = await fetch("/thanhvien/laytatca");
    const data = await res.json();
    memberTable.innerHTML = "";
    data.forEach((m, index) => {
      memberTable.innerHTML += `
  <tr>
    <td class="px-4 py-2 border-b">${index + 1}</td>
    <td class="px-4 py-2 border-b">${m.ho_ten}</td>
    <td class="px-4 py-2 border-b">${m.sdt}</td>
    <td class="px-4 py-2 border-b">${m.email || ""}</td>
    <td class="px-4 py-2 border-b">${m.tong_don_da_mua}</td> <!-- Read-only -->
    <td class="px-4 py-2 border-b text-center space-x-2">
      <button onclick="editMember(${m.thanh_vien_id})" class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Sửa</button>
      <button onclick="deleteMember(${m.thanh_vien_id})" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Xóa</button>
    </td>
  </tr>
`;

    });
  } catch (err) {
    console.error(err);
  }
}

// Mở modal thêm
btnAddMember.addEventListener("click", () => {
  memberForm.reset();
  memberModal.classList.remove("hidden");
  document.getElementById("memberModalTitle").innerText = "Thêm thành viên";
  document.getElementById("memberId").value = "";
});

// Hủy modal
btnCancelMember.addEventListener("click", () => {
  memberModal.classList.add("hidden");
});

// Thêm/Sửa thành viên
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("memberId").value;

  const data = {
    ho_ten: document.getElementById("memberName").value,
    sdt: document.getElementById("memberPhone").value,
    email: document.getElementById("memberEmail").value
  };

  try {
    const url = id ? `/thanhvien/sua/${id}` : "/thanhvien/them";
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("✅ Kết quả API:", result);

    memberModal.classList.add("hidden");
    loadMembers();
  } catch (err) {
    console.error("❌ Lỗi khi thêm/sửa thành viên:", err);
  }
});



// Edit member
window.editMember = async (id) => {
  const res = await fetch(`/thanhvien/layid/${id}`);
  const data = await res.json();
  document.getElementById("memberId").value = data.thanh_vien_id;
  document.getElementById("memberName").value = data.ho_ten;
  document.getElementById("memberPhone").value = data.sdt;
  document.getElementById("memberEmail").value = data.email;
  document.getElementById("memberTotal").value = data.tong_don_da_mua || 0;
  memberModal.classList.remove("hidden");
  document.getElementById("memberModalTitle").innerText = "Sửa thành viên";
};

// Delete member
window.deleteMember = async (id) => {
  if (confirm("Bạn có chắc muốn xóa thành viên này?")) {
    await fetch(`/thanhvien/xoa/${id}`, { method: "DELETE" });
    loadMembers();
  }
};

// Load khi trang sẵn sàng
loadMembers();

