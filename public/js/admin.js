
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
  loadCombos();
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

async function loadMembersForDiscount() {
  try {
    const res = await fetch("http://localhost:3000/thanhvien/laytatca");
    const data = await res.json();
    discountMemberSelect.innerHTML = `<option value="">— Tất cả —</option>`;
    data.forEach(tv => {
      const option = document.createElement("option");
      option.value = tv. thanh_vien_id;
      option.textContent = tv. ho_ten;
      discountMemberSelect.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Lỗi loadMembersForDiscount:", err);
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
  await loadMembersForDiscount();
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
    
    await loadMembersForDiscount();
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


// ============================================
// QUẢN LÝ COMBO (ĐÃ SỬA LỖI)
// ============================================
let allProducts = []; // Lưu danh sách sản phẩm

// Load combo khi mở tab
document.querySelector('[data-tab="combo"]')?.addEventListener('click', () => {
  loadCombos();
  loadProductsForCombo();
});

async function loadCombos() {
  try {
    const res = await fetch('http://localhost:3000/combo/laytatca');
    if (!res.ok) throw new Error('Không thể tải danh sách combo');
    
    const result = await res.json();
    
    // ✅ Sửa lại để lấy data từ response
    const combos = result.success ?  result.data : result;
    
    console.log('📦 Danh sách combo:', combos);
    renderComboTable(combos);
  } catch (error) {
    console. error('❌ Lỗi load combo:', error);
    showToast('Không thể tải danh sách combo', 'error');
  }
}

async function loadProductsForCombo() {
  try {
    const res = await fetch('http://localhost:3000/sanpham/laytatca');
    if (! res.ok) throw new Error('Không thể tải sản phẩm');
    allProducts = await res.json();
  } catch (error) {
    console.error('❌ Lỗi load sản phẩm:', error);
    showToast('Không thể tải danh sách sản phẩm', 'error');
  }
}

function renderComboTable(combos) {
  const tbody = document.getElementById('comboTable');
  tbody.innerHTML = '';

  if (! combos || combos.length === 0) {
    tbody. innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Chưa có combo nào</td></tr>';
    return;
  }

  combos.forEach((combo, index) => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-gray-50');
    
    // Format danh sách sản phẩm
    const sanPhamText = combo.san_pham && combo.san_pham.length > 0
      ? combo. san_pham.map(sp => `${sp.ten_san_pham} (x${sp.so_luong})`).join(', ')
      : 'Không có sản phẩm';
    
    // Format giá tiền
    const giaCombo = Number(combo.gia_combo). toLocaleString('vi-VN');
    
    // Xử lý hình ảnh
    const imageUrl = combo.hinh_anh || '/assets/coffee.png';
    
    row.innerHTML = `
      <td class="px-4 py-3 border-b">${index + 1}</td>
      <td class="px-4 py-3 border-b font-medium">${combo.ten_combo}</td>
      <td class="px-4 py-3 border-b text-orange-600 font-semibold">${giaCombo}đ</td>
      <td class="px-4 py-3 border-b text-sm text-gray-600">${sanPhamText}</td>
      <td class="px-4 py-3 border-b">
        <span class="px-2 py-1 rounded-full text-xs font-medium ${
          combo.trang_thai === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }">
          ${combo.trang_thai === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td class="px-4 py-3 border-b">
        <img src="${imageUrl}" 
             alt="${combo.ten_combo}" 
             class="w-16 h-16 object-cover rounded-lg shadow-sm"
             onerror="this. src='/assets/coffee.png'">
      </td>
      <td class="px-4 py-3 border-b text-center space-x-2">
        <button onclick="editCombo(${combo.combo_id})" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
          Sửa
        </button>
        <button onclick="deleteCombo(${combo.combo_id})" 
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
          Xóa
        </button>
      </td>
    `;
    tbody. appendChild(row);
  });
}

// Mở modal thêm combo
document.getElementById('btnAddCombo')?.addEventListener('click', async () => {
  document.getElementById('comboModalTitle').textContent = 'Thêm combo';
  document.getElementById('comboForm').reset();
  document.getElementById('comboId').value = '';
  
  // Load sản phẩm trước khi hiển thị
  if (allProducts.length === 0) {
    await loadProductsForCombo();
  }
  
  renderProductSelection([]);
  document. getElementById('comboModal').classList. remove('hidden');
});

// Đóng modal
document.getElementById('btnCancelCombo')?.addEventListener('click', () => {
  document.getElementById('comboModal').classList.add('hidden');
});

// Render danh sách sản phẩm để chọn
function renderProductSelection(selectedProducts = []) {
  const container = document.getElementById('comboProductList');
  container. innerHTML = '';

  if (allProducts.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Không có sản phẩm nào</p>';
    return;
  }

  allProducts. forEach(product => {
    const existing = selectedProducts.find(sp => sp.san_pham_id === product.san_pham_id);
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50';
    div.innerHTML = `
      <div class="flex items-center gap-3 flex-1">
        <input type="checkbox" 
               id="product_${product.san_pham_id}" 
               class="combo-product-checkbox w-4 h-4" 
               data-id="${product.san_pham_id}" 
               data-name="${product.ten_san_pham}"
               ${existing ? 'checked' : ''}>
        <img src="${product.hinh_anh || '/assets/no-image.png'}" 
             class="w-12 h-12 object-cover rounded"
             onerror="this. src='/assets/coffee.png'">
        <label for="product_${product.san_pham_id}" class="cursor-pointer flex-1">
          ${product.ten_san_pham} - ${Number(product.gia_co_ban).toLocaleString('vi-VN')}đ
        </label>
      </div>
      <input type="number" 
             id="qty_${product.san_pham_id}" 
             class="w-20 px-2 py-1 border rounded" 
             placeholder="SL" 
             min="1" 
             value="${existing ? existing.so_luong : 1}"
             ${!existing ? 'disabled' : ''}>
    `;

    // Toggle số lượng khi check/uncheck
    const checkbox = div.querySelector(`#product_${product.san_pham_id}`);
    const qtyInput = div.querySelector(`#qty_${product.san_pham_id}`);
    
    checkbox.addEventListener('change', () => {
      qtyInput.disabled = !checkbox. checked;
      if (checkbox.checked && !qtyInput.value) qtyInput.value = 1;
    });

    container.appendChild(div);
  });
}

// Submit form combo
document.getElementById('comboForm')?.addEventListener('submit', async (e) => {
  e. preventDefault();

  const comboId = document.getElementById('comboId').value;
  
  // Thu thập sản phẩm đã chọn
  const selectedProducts = [];
  document.querySelectorAll('.combo-product-checkbox:checked').forEach(checkbox => {
    const productId = checkbox.dataset.id;
    const qtyInput = document.getElementById(`qty_${productId}`);
    const qty = parseInt(qtyInput.value) || 1;
    
    selectedProducts.push({
      san_pham_id: parseInt(productId),
      so_luong: qty
    });
  });

  // Validate
  if (selectedProducts.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 sản phẩm!', 'error');
    return;
  }

  const ten_combo = document.getElementById('comboName').value. trim();
  const gia_combo = document.getElementById('comboPrice').value;
  
  if (!ten_combo || ! gia_combo) {
    showToast('Vui lòng nhập đầy đủ thông tin! ', 'error');
    return;
  }

  // Chuẩn bị FormData
  const formData = new FormData();
  formData. append('ten_combo', ten_combo);
  formData.append('mo_ta', document.getElementById('comboDesc').value. trim());
  formData.append('gia_combo', gia_combo);
  formData. append('trang_thai', document.getElementById('comboStatus').value);
  formData.append('san_pham', JSON.stringify(selectedProducts));

  // Kiểm tra file ảnh
  const imageFile = document.getElementById('comboImage').files[0];
  if (imageFile) {
    // Validate kích thước file (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 5MB! ', 'error');
      return;
    }
    formData.append('hinh_anh', imageFile);
  } else if (! comboId) {
    // Nếu thêm mới mà không có ảnh thì dùng ảnh mặc định
    showToast('Sẽ sử dụng hình ảnh mặc định', 'info');
  }

  try {
    const url = comboId 
      ? `http://localhost:3000/combo/sua/${comboId}` 
      : 'http://localhost:3000/combo/them';
    
    const method = comboId ? 'PUT' : 'POST';

    console.log('🚀 Gửi request:', { url, method });

    const res = await fetch(url, {
      method,
      body: formData
    });

    const contentType = res.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error('❌ Response không phải JSON:', text);
      throw new Error('Server trả về định dạng không hợp lệ');
    }

    if (!res. ok) {
      throw new Error(data.message || `Lỗi ${res.status}: ${res.statusText}`);
    }

    showToast(data. message || 'Lưu combo thành công!', 'success');
    document.getElementById('comboModal').classList.add('hidden');
    loadCombos();
    
  } catch (error) {
    console.error('❌ Lỗi khi lưu combo:', error);
    showToast('Không thể lưu combo: ' + error.message, 'error');
  }
});

// Sửa combo
window.editCombo = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/combo/layid/${id}`);
    if (! res.ok) throw new Error('Không thể tải thông tin combo');
    
    const result = await res.json();
    const combo = result.success ? result. data : result;

    document.getElementById('comboModalTitle').textContent = 'Sửa combo';
    document.getElementById('comboId').value = combo.combo_id;
    document.getElementById('comboName').value = combo.ten_combo;
    document.getElementById('comboDesc').value = combo.mo_ta || '';
    document.getElementById('comboPrice').value = combo.gia_combo;
    document.getElementById('comboStatus').value = combo. trang_thai;

    // Load sản phẩm nếu chưa có
    if (allProducts.length === 0) {
      await loadProductsForCombo();
    }

    renderProductSelection(combo.san_pham || []);
    document.getElementById('comboModal').classList.remove('hidden');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    showToast('Không thể tải thông tin combo', 'error');
  }
};

// Xóa combo
window.deleteCombo = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa combo này? ')) return;

  try {
    const res = await fetch(`http://localhost:3000/combo/xoa/${id}`, { 
      method: 'DELETE' 
    });
    
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data. message || 'Không thể xóa combo');
    }

    showToast(data.message || 'Xóa combo thành công!', 'success');
    loadCombos();
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    showToast('Không thể xóa combo: ' + error.message, 'error');
  }
};

// ========== MỚI: QUẢN LÝ KÍCH CỠ ==========
const sizeTable = document.getElementById("sizeTable");
const sizeModal = document.getElementById("sizeModal");
const sizeForm = document.getElementById("sizeForm");
const btnAddSize = document.getElementById("btnAddSize");
const btnCancelSize = document.getElementById("btnCancelSize");

// Load danh sách kích cỡ
async function loadSizes() {
  // console.log("🔎 [Sizes] Bắt đầu loadSizes()");
  try {
    const res = await fetch("http://localhost:3000/kichco/laytatca");
    const contentType = res.headers.get("content-type");
    // console.log("📡 [Sizes] Response status:", res.status, res.statusText);
    // console.log("📡 [Sizes] Content-Type:", contentType);

    let raw;
    if (contentType && contentType.includes("application/json")) {
      raw = await res.json();
    } else {
      const text = await res.text();
      // console.warn("⚠️ [Sizes] Response không phải JSON, text:", text);
      throw new Error("Response không phải JSON");
    }

    // Một số API có thể trả {success: true, data: [...]}, hoặc {du_lieu: [...]}
    const data = Array.isArray(raw) ? raw : (raw.data ?? raw.du_lieu ?? raw);
    // console.log("✅ [Sizes] Payload nhận được (raw):", raw);
    // console.log("✅ [Sizes] Dữ liệu để render (data):", data);

    sizeTable.innerHTML = "";
    if (!data || !Array.isArray(data) || data.length === 0) {
      // console.log("ℹ️ [Sizes] Không có dữ liệu kích cỡ để hiển thị.");
      sizeTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Chưa có kích cỡ nào.</td></tr>`;
      return;
    }

    data.forEach((kc, index) => {
      if (!kc) {
        // console.warn("⚠️ [Sizes] Phần tử null/undefined tại index", index, kc);
        return;
      }
      if (kc.ten_kich_co === undefined || kc.gia_them === undefined) {
        // console.warn("⚠️ [Sizes] Thiếu trường trong phần tử:", kc);
      }

      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class="px-4 py-3 border-b">${index + 1}</td>
        <td class="px-4 py-3 border-b">${kc.ten_kich_co ?? "—"}</td>
        <td class="px-4 py-3 border-b">${Number(kc.gia_them ?? 0).toLocaleString('vi-VN')}</td>
        <td class="px-4 py-3 border-b text-center space-x-2">
          <button onclick="editSize(${kc.kich_co_id})" class="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600">Sửa</button>
          <button onclick="deleteSize(${kc.kich_co_id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Xóa</button>
        </td>
      `;
      sizeTable.appendChild(row);
    });

    // console.log("🧮 [Sizes] Đã render số dòng:", sizeTable.querySelectorAll("tr").length);
  } catch (err) {
    // console.error("❌ [Sizes] Lỗi loadSizes:", err);
    sizeTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>`;
  }
}

// Mở modal thêm kích cỡ
btnAddSize?.addEventListener("click", () => {
  // console.log("🟢 [Sizes] Mở modal Thêm kích cỡ");
  sizeForm.reset();
  document.getElementById("sizeId").value = "";
  document.getElementById("sizeModalTitle").textContent = "Thêm kích cỡ";
  sizeModal.classList.remove("hidden");
});

// Đóng modal
btnCancelSize?.addEventListener("click", () => {
  // console.log("🔴 [Sizes] Đóng modal kích cỡ");
  sizeModal.classList.add("hidden");
});

// Submit thêm/sửa kích cỡ
sizeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("sizeId").value;
  const ten_kich_co = document.getElementById("sizeName").value.trim();
  const gia_them = parseInt(document.getElementById("sizePrice").value, 10);

  // console.log("📝 [Sizes] Submit form:", { id, ten_kich_co, gia_them });

  if (!ten_kich_co || isNaN(gia_them)) {
    showToast("⚠️ Vui lòng nhập đầy đủ và hợp lệ!", "error");
    return;
  }

  try {
    const url = id ? `http://localhost:3000/kichco/sua/${id}` : "http://localhost:3000/kichco/them";
    const method = id ? "PUT" : "POST";
    // console.log("📤 [Sizes] Gửi request:", { url, method, body: { ten_kich_co, gia_them } });

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ten_kich_co, gia_them })
    });

    const contentType = res.headers.get("content-type");
    // console.log("📡 [Sizes] Submit status:", res.status, res.statusText, "CT:", contentType);

    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      // console.warn("⚠️ [Sizes] Submit response không phải JSON:", text);
      throw new Error(text || "Response không phải JSON");
    }

    // console.log("✅ [Sizes] Kết quả submit:", result);

    if (!res.ok) throw new Error(result.message || result.error || "Lỗi khi lưu kích cỡ");

    showToast(id ? "✅ Cập nhật kích cỡ thành công!" : "✅ Thêm kích cỡ thành công!", "success");
    sizeModal.classList.add("hidden");

    // console.log("🔁 [Sizes] Gọi lại loadSizes() để cập nhật bảng");
    await loadSizes();
  } catch (err) {
    // console.error("❌ [Sizes] Lỗi submit kích cỡ:", err);
    showToast("❌ Lỗi: " + err.message, "error");
  }
});

// Sửa kích cỡ
window.editSize = async (id) => {
  // console.log("✏️ [Sizes] editSize id =", id);
  try {
    const res = await fetch(`http://localhost:3000/kichco/layid/${id}`);
    // console.log("📡 [Sizes] editSize status:", res.status, res.statusText);
    const contentType = res.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      // console.warn("⚠️ [Sizes] editSize response không phải JSON:", text);
      throw new Error("Response không phải JSON");
    }

    // console.log("✅ [Sizes] Dữ liệu kích cỡ để sửa:", data);

    document.getElementById("sizeId").value = data.kich_co_id;
    document.getElementById("sizeName").value = data.ten_kich_co;
    document.getElementById("sizePrice").value = data.gia_them;

    document.getElementById("sizeModalTitle").textContent = "Sửa kích cỡ";
    sizeModal.classList.remove("hidden");
  } catch (err) {
    // console.error("❌ [Sizes] Lỗi editSize:", err);
    showToast("❌ Không thể tải dữ liệu kích cỡ!", "error");
  }
};

// Xóa kích cỡ
window.deleteSize = async (id) => {
  // console.log("🗑️ [Sizes] deleteSize id =", id);
  if (!confirm("Bạn có chắc muốn xóa kích cỡ này?")) return;
  try {
    const res = await fetch(`http://localhost:3000/kichco/xoa/${id}`, { method: "DELETE" });
    const contentType = res.headers.get("content-type");
    // console.log("📡 [Sizes] delete status:", res.status, res.statusText, "CT:", contentType);

    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      // console.warn("⚠️ [Sizes] delete response không phải JSON:", text);
      result = { message: text };
    }

    // console.log("✅ [Sizes] Kết quả delete:", result);

    if (!res.ok) throw new Error(result.message || result.error || "Không thể xóa kích cỡ");
    showToast("✅ Xóa kích cỡ thành công!", "success");
    // console.log("🔁 [Sizes] Gọi lại loadSizes()");
    await loadSizes();
  } catch (err) {
    // console.error("❌ [Sizes] Lỗi deleteSize:", err);
    showToast("❌ Lỗi: " + err.message, "error");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  // console.log("[DOMContentLoaded] Auto call loadSizes()");
  loadSizes();
})

/* Elements */
const toppingTable = document.getElementById("toppingTable");
const toppingModal = document.getElementById("toppingModal");
const toppingForm = document.getElementById("toppingForm");
const btnAddTopping = document.getElementById("btnAddTopping");
const btnCancelTopping = document.getElementById("btnCancelTopping");

/* Load danh sách topping */
async function loadToppings() {
  try {
    const res = await fetch("http://localhost:3000/topping/laytatca");
    const contentType = res.headers.get("content-type");
    let raw;
    if (contentType && contentType.includes("application/json")) {
      raw = await res.json();
    } else {
      const text = await res.text();
      throw new Error("Response không phải JSON: " + text);
    }
    const data = Array.isArray(raw) ? raw : (raw.data ?? raw.du_lieu ?? raw);
    toppingTable.innerHTML = "";
    if (!data || !Array.isArray(data) || data.length === 0) {
      toppingTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Chưa có topping nào.</td></tr>`;
      return;
    }
    data.forEach((tp, index) => {
      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-50");
      row.innerHTML = `
        <td class="px-4 py-3 border-b">${index + 1}</td>
        <td class="px-4 py-3 border-b">${tp.ten_topping ?? "—"}</td>
        <td class="px-4 py-3 border-b">${Number(tp.gia_them ?? 0).toLocaleString('vi-VN')}</td>
        <td class="px-4 py-3 border-b text-center space-x-2">
          <button onclick="editTopping(${tp.topping_id})" class="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600">Sửa</button>
          <button onclick="deleteTopping(${tp.topping_id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Xóa</button>
        </td>
      `;
      toppingTable.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Lỗi loadToppings:", err);
    toppingTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>`;
  }
}

/* Mở modal thêm topping */
btnAddTopping?.addEventListener("click", () => {
  toppingForm.reset();
  document.getElementById("toppingId").value = "";
  document.getElementById("toppingModalTitle").textContent = "Thêm topping";
  toppingModal.classList.remove("hidden");
});

/* Đóng modal */
btnCancelTopping?.addEventListener("click", () => {
  toppingModal.classList.add("hidden");
});

/* Submit thêm/sửa topping */
toppingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("toppingId").value;
  const ten_topping = document.getElementById("toppingName").value.trim();
  const gia_them = parseInt(document.getElementById("toppingPrice").value, 10);
  if (!ten_topping || isNaN(gia_them)) {
    Toast?.error ? Toast.error("⚠️ Vui lòng nhập đầy đủ và hợp lệ!") : showToast("⚠️ Vui lòng nhập đầy đủ và hợp lệ!", "error");
    return;
  }
  try {
    const url = id ? `http://localhost:3000/topping/sua/${id}` : "http://localhost:3000/topping/them";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ten_topping, gia_them })
    });
    const contentType = res.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || "Response không phải JSON");
    }
    if (!res.ok) throw new Error(result.message || result.error || "Lỗi khi lưu topping");
    Toast?.success ? Toast.success(id ? "✅ Cập nhật topping thành công!" : "✅ Thêm topping thành công!") : showToast(id ? "✅ Cập nhật topping thành công!" : "✅ Thêm topping thành công!", "success");
    toppingModal.classList.add("hidden");
    await loadToppings();
  } catch (err) {
    console.error("❌ Lỗi submit topping:", err);
    Toast?.error ? Toast.error("❌ Lỗi: " + err.message) : showToast("❌ Lỗi: " + err.message, "error");
  }
});

/* Sửa topping */
window.editTopping = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/topping/layid/${id}`);
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error("Response không phải JSON: " + text);
    }
    document.getElementById("toppingId").value = data.topping_id;
    document.getElementById("toppingName").value = data.ten_topping;
    document.getElementById("toppingPrice").value = data.gia_them;
    document.getElementById("toppingModalTitle").textContent = "Sửa topping";
    toppingModal.classList.remove("hidden");
  } catch (err) {
    console.error("❌ Lỗi editTopping:", err);
    Toast?.error ? Toast.error("❌ Không thể tải dữ liệu topping!") : showToast("❌ Không thể tải dữ liệu topping!", "error");
  }
};

/* Xóa topping */
window.deleteTopping = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa topping này?")) return;
  try {
    const res = await fetch(`http://localhost:3000/topping/xoa/${id}`, { method: "DELETE" });
    const contentType = res.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      result = { message: text };
    }
    if (!res.ok) throw new Error(result.message || result.error || "Không thể xóa topping");
    Toast?.success ? Toast.success("✅ Xóa topping thành công!") : showToast("✅ Xóa topping thành công!", "success");
    await loadToppings();
  } catch (err) {
    console.error("❌ Lỗi deleteTopping:", err);
    Toast?.error ? Toast.error("❌ Lỗi: " + err.message) : showToast("❌ Lỗi: " + err.message, "error");
  }
};

/* Tự load khi mở tab topping */
document.querySelector('[data-tab="topping"]')?.addEventListener("click", loadToppings);

/* Nếu muốn auto load khi trang sẵn sàng, có thể thêm: */
window.addEventListener("DOMContentLoaded", () => {
  loadToppings();
});

// Điều hướng Parent/Child tabs trong sidebar
  document.addEventListener('DOMContentLoaded', () => {
    const parentTabs = document.querySelectorAll('.parent-tab');
    const parentSections = {
      'san-pham': document.getElementById('parent-san-pham'),
      'nhan-vien': document.getElementById('parent-nhan-vien'),
      'thanh-vien': document.getElementById('parent-thanh-vien'),
    };

    function showChildList(parentKey) {
      document.querySelectorAll('.child-list').forEach(list => {
        const match = list.dataset.parentList === parentKey;
        list.classList.toggle('hidden', !match);
      });
    }

    function activateParent(parentKey) {
      // Active trạng thái parent
      parentTabs.forEach(t => t.classList.toggle('active', t.dataset.parent === parentKey));
      // Hiển thị section tương ứng
      Object.entries(parentSections).forEach(([key, section]) => {
        if (!section) return;
        section.classList.toggle('hidden', key !== parentKey);
      });
      // Hiển thị danh sách tab con trong sidebar cho parent này
      showChildList(parentKey);

      // Bật tab con đầu tiên của parent
      const firstChildLink = document.querySelector(`.child-list[data-parent-list="${parentKey}"] .child-tab`);
      if (firstChildLink) activateChild(parentKey, firstChildLink.dataset.tab);
    }

    function activateChild(parentKey, tabKey) {
      // Active trạng thái tab con trong sidebar
      document.querySelectorAll(`.child-list[data-parent-list="${parentKey}"] .child-tab`).forEach(a => {
        a.classList.toggle('active', a.dataset.tab === tabKey);
      });
      // Hiển thị nội dung tab trong section tương ứng
      const parentSectionEl = parentSections[parentKey];
      if (!parentSectionEl) return;
      parentSectionEl.querySelectorAll('.tab-content').forEach(content => {
        const id = content.id.replace('tab-', '');
        const active = id === tabKey;
        content.classList.toggle('active', active);
        content.classList.toggle('hidden', !active);
      });

      // Hook sự kiện để /js/admin.js biết tab hiện tại
      window.dispatchEvent(new CustomEvent('childTabChanged', {
        detail: { parent: parentKey, tab: tabKey }
      }));
    }

    // Bind click cho parent
    parentTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activateParent(tab.dataset.parent);
      });
    });

    // Bind click cho child (trong sidebar)
    document.querySelectorAll('.child-list .child-tab').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const parentKey = link.closest('.child-list').dataset.parentList;
        activateChild(parentKey, link.dataset.tab);
      });
    });

    // Khởi tạo mặc định
    activateParent('san-pham');
  });
// Lắng nghe tab con để load dữ liệu
window.addEventListener('childTabChanged', (e) => {
  const { parent, tab } = e.detail;
  console.log('Child tab changed:', parent, tab);

  switch (tab) {
    case 'san-pham':
      // loadProducts();
      break;
    case 'combo':
      // loadCombos();
      break;
    case 'ban':
      // loadTables();
      break;
    case 'kich-co':
      // loadSizes();
      break;
    case 'topping':
      // loadToppings();
      break;
    case 'tai-khoan':
      // loadEmployees();
      break;
    case 'lich-lam':
      // loadSchedules();
      break;
    case 'luong':
      // loadPayrolls();
      break;
    case 'doanh-thu':
      // loadRevenues();
      break;
    case 'thanh-vien':
      // loadMembers();
      break;
    case 'khuyen-mai':
      // loadDiscounts();
      break;
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const parentTabs = document.querySelectorAll('.parent-tab');
    const childLists = document.querySelectorAll('.child-list');
    const parentSections = {
      'san-pham': document.getElementById('parent-san-pham'),
      'nhan-vien': document.getElementById('parent-nhan-vien'),
      'thanh-vien': document.getElementById('parent-thanh-vien'),
    };
    const ordersSection = document.getElementById('orders-alone');
    const ordersLink = document.querySelector('aside a[href="#orders-alone"]');

    const openState = { 'san-pham': true, 'nhan-vien': false, 'thanh-vien': false };

    function hideOrders() {
      if (ordersSection && !ordersSection.classList.contains('hidden')) {
        ordersSection.classList.add('hidden');
      }
    }

    function setChildListVisibility(parentKey, shouldOpen) {
      childLists.forEach(list => {
        const isTarget = list.dataset.parentList === parentKey;
        list.classList.toggle('hidden', !isTarget || !shouldOpen);
      });
      openState[parentKey] = shouldOpen;
    }

    function activateParent(parentKey) {
      // LUÔN ẨN phần đơn hàng khi chuyển parent
      hideOrders();

      // Active trạng thái parent
      parentTabs.forEach(t => t.classList.toggle('active', t.dataset.parent === parentKey));

      // Hiển thị section tương ứng
      Object.entries(parentSections).forEach(([key, section]) => {
        if (!section) return;
        section.classList.toggle('hidden', key !== parentKey);
      });

      // Mở child list của parent và đóng các list khác
      setChildListVisibility(parentKey, true);

      // Kích hoạt tab con đầu tiên
      const firstChildLink = document.querySelector(`.child-list[data-parent-list="${parentKey}"] .child-tab`);
      if (firstChildLink) activateChild(parentKey, firstChildLink.dataset.tab);
    }

    function activateChild(parentKey, tabKey) {
      // LUÔN ẨN phần đơn hàng khi chuyển child
      hideOrders();

      // Active child tab
      document.querySelectorAll(`.child-list[data-parent-list="${parentKey}"] .child-tab`).forEach(a => {
        a.classList.toggle('active', a.dataset.tab === tabKey);
      });

      // Hiển thị nội dung trong section
      const parentSectionEl = parentSections[parentKey];
      if (!parentSectionEl) return;
      parentSectionEl.querySelectorAll('.tab-content').forEach(content => {
        const id = content.id.replace('tab-', '');
        const isActive = id === tabKey;
        content.classList.toggle('active', isActive);
        content.classList.toggle('hidden', !isActive);
      });

      // Hook cho admin.js
      window.dispatchEvent(new CustomEvent('childTabChanged', {
        detail: { parent: parentKey, tab: tabKey }
      }));
    }

    // Click parent: chuyển parent hoặc toggle child list (nhưng luôn ẩn orders)
    parentTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const parentKey = tab.dataset.parent;
        const isActiveParent = tab.classList.contains('active');

        if (!isActiveParent) {
          activateParent(parentKey);
        } else {
          // Toggle child list hiện tại, không thay đổi section
          const shouldOpen = !openState[parentKey];
          setChildListVisibility(parentKey, shouldOpen);
          hideOrders(); // đảm bảo orders ẩn nếu đang mở
        }
      });
    });

    // Click child: hiển thị nội dung tương ứng, giữ child list mở và ẩn orders
    document.querySelectorAll('.child-list .child-tab').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const parentKey = link.closest('.child-list').dataset.parentList;
        setChildListVisibility(parentKey, true);
        activateChild(parentKey, link.dataset.tab);
      });
    });

    // Click "Quản lý đơn hàng": ẩn toàn bộ group, hiển thị riêng orders
    if (ordersLink && ordersSection) {
      ordersLink.addEventListener('click', (e) => {
        e.preventDefault();

        // Ẩn mọi group
        Object.values(parentSections).forEach(sec => sec && sec.classList.add('hidden'));
        // Ẩn mọi child list
        childLists.forEach(list => list.classList.add('hidden'));
        // Bỏ active các parent/child
        parentTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.child-tab').forEach(ct => ct.classList.remove('active'));

        // Hiển thị orders-alone
        ordersSection.classList.remove('hidden');

        // Thông báo cho admin.js
        window.dispatchEvent(new CustomEvent('childTabChanged', {
          detail: { parent: 'orders', tab: 'orders' }
        }));
      });
    }

    // Khởi tạo mặc định
    activateParent('san-pham');
  });

  // QUẢN LÝ LỊCH LÀM VIỆC
// ============================================

const MIN_EMPLOYEES_PER_SHIFT = 3;
const MAX_EMPLOYEES_PER_SHIFT = 9;

let scheduleData = [];
let shiftsData = [];
let currentWeekDates = [];
let scheduleEmployees = [];

// Khởi tạo khi load tab lịch làm
function initScheduleTab() {
    const today = new Date();
    const weekPicker = document.getElementById('weekPicker');
    if (weekPicker) {
        const year = today.getFullYear();
        const week = getWeekNumber(today);
        weekPicker.value = `${year}-W${week.toString().padStart(2, '0')}`;
        loadScheduleByWeek();
    }
    loadShiftsForSelect();
    loadEmployeesForScheduleSelect();
}

// Lấy số tuần trong năm
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Lấy ngày từ tuần
function getDateFromWeek(weekStr) {
    const [year, week] = weekStr.split('-W');
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

// Chuyển tuần trước
function goToPreviousWeek() {
    const weekPicker = document.getElementById('weekPicker');
    if (!weekPicker.value) return;
    
    const startDate = getDateFromWeek(weekPicker.value);
    startDate.setDate(startDate.getDate() - 7);
    
    const year = startDate.getFullYear();
    const week = getWeekNumber(startDate);
    weekPicker.value = `${year}-W${week.toString().padStart(2, '0')}`;
    loadScheduleByWeek();
}

// Chuyển tuần sau
function goToNextWeek() {
    const weekPicker = document.getElementById('weekPicker');
    if (!weekPicker.value) return;
    
    const startDate = getDateFromWeek(weekPicker.value);
    startDate.setDate(startDate.getDate() + 7);
    
    const year = startDate.getFullYear();
    const week = getWeekNumber(startDate);
    weekPicker.value = `${year}-W${week.toString().padStart(2, '0')}`;
    loadScheduleByWeek();
}

// Load lịch làm theo tuần
async function loadScheduleByWeek() {
    const weekPicker = document.getElementById('weekPicker');
    if (!weekPicker || !weekPicker.value) {
        Toast.warning('Vui lòng chọn tuần');
        return;
    }

    const startDate = getDateFromWeek(weekPicker.value);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Tạo mảng ngày trong tuần
    currentWeekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        currentWeekDates.push(d.toISOString().split('T')[0]);
    }

    // Cập nhật header ngày
    updateDateHeaders();

    try {
        const response = await fetch(`/api/lich-lam-viec/theo-tuan?tuan_bat_dau=${currentWeekDates[0]}&tuan_ket_thuc=${currentWeekDates[6]}`);
        const result = await response.json();

        if (result.success) {
            scheduleData = result.data || [];
            shiftsData = result.ca_lam || [];
            renderScheduleTable();
            renderPendingList();
            updateScheduleStats();
        } else {
            Toast.error(result.message || 'Lỗi tải lịch làm');
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');
    }
}

// Cập nhật header ngày
function updateDateHeaders() {
    const dateHeaderRow = document.getElementById('dateHeaderRow');
    if (!dateHeaderRow) return;

    const dayNames = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    let html = '<th class="px-4 py-2 border-b"></th>';
    
    currentWeekDates.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const today = new Date().toISOString().split('T')[0];
        const isToday = dateStr === today;
        
        html += `<th class="px-4 py-2 border-b text-center text-sm ${isToday ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500'}">
            ${day}/${month}${isToday ? ' (Hôm nay)' : ''}
        </th>`;
    });
    dateHeaderRow.innerHTML = html;
}

// Render bảng lịch làm
function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    if (!tbody) return;

    if (shiftsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-gray-500">
            <div class="flex flex-col items-center gap-2">
                <span class="text-4xl">⚠️</span>
                <span>Chưa có ca làm nào được thiết lập</span>
            </div>
        </td></tr>`;
        return;
    }

    let html = '';

    shiftsData.forEach(shift => {
        html += `<tr class="border-b hover:bg-gray-50">`;
        html += `<td class="px-4 py-3 font-medium bg-gray-50">
            <div class="font-semibold text-gray-800">${shift.ten_ca || 'N/A'}</div>
            <div class="text-xs text-gray-500">${formatTime(shift.thoi_gian_bat_dau)} - ${formatTime(shift.thoi_gian_ket_thuc)}</div>
        </td>`;

        currentWeekDates.forEach(dateStr => {
            const cellSchedules = scheduleData.filter(s => {
                const scheduleDate = s.ngay_lam ? s.ngay_lam.split('T')[0] : '';
                return scheduleDate === dateStr && s.ca_id === shift.ca_id;
            });

            const approvedCount = cellSchedules.filter(s => s.trang_thai === 'Đã duyệt').length;
            const pendingCount = cellSchedules.filter(s => s.trang_thai === 'Đăng ký').length;

            let statusClass = '';
            let statusIcon = '';

            if (approvedCount >= MAX_EMPLOYEES_PER_SHIFT) {
                statusClass = 'bg-orange-50 border-l-4 border-orange-400';
                statusIcon = '<span class="text-orange-600" title="Đầy ca">⚠️</span>';
            } else if (approvedCount >= MIN_EMPLOYEES_PER_SHIFT) {
                statusClass = 'bg-green-50 border-l-4 border-green-400';
                statusIcon = '<span class="text-green-600" title="Đủ nhân viên">✅</span>';
            } else if (approvedCount > 0 || pendingCount > 0) {
                statusClass = 'bg-red-50 border-l-4 border-red-400';
                statusIcon = '<span class="text-red-600" title="Thiếu nhân viên">⚠️</span>';
            } else {
                statusClass = 'bg-gray-50';
            }

            html += `<td class="px-2 py-2 text-center ${statusClass} cursor-pointer hover:bg-blue-50 transition-colors" 
                        onclick="openShiftDetail('${dateStr}', ${shift.ca_id}, '${shift.ten_ca}')">
                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        ${statusIcon}
                        <span class="text-sm font-bold ${approvedCount >= MIN_EMPLOYEES_PER_SHIFT ? 'text-green-700' : 'text-red-700'}">${approvedCount}/${MAX_EMPLOYEES_PER_SHIFT}</span>
                    </div>`;

            if (pendingCount > 0) {
                html += `<span class="text-xs bg-yellow-200 text-yellow-800 px-1 rounded">+${pendingCount} chờ</span>`;
            }

            // Hiển thị tên nhân viên đã duyệt (tối đa 2)
            const approvedSchedules = cellSchedules.filter(s => s.trang_thai === 'Đã duyệt').slice(0, 2);
            if (approvedSchedules.length > 0) {
                html += `<div class="text-xs text-gray-600 mt-1 space-y-0.5">`;
                approvedSchedules.forEach(s => {
                    const shortName = s.ho_ten ? s.ho_ten.split(' ').slice(-2).join(' ') : 'N/A';
                    html += `<div class="truncate max-w-[80px]" title="${s.ho_ten}">${shortName}</div>`;
                });
                if (approvedCount > 2) {
                    html += `<div class="text-gray-400">+${approvedCount - 2} người...</div>`;
                }
                html += `</div>`;
            }

            html += `</div></td>`;
        });

        html += `</tr>`;
    });

    tbody.innerHTML = html;
}

// Format time
function formatTime(timeStr) {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
}

// Render danh sách chờ duyệt
function renderPendingList() {
    const tbody = document.getElementById('pendingScheduleList');
    const pendingCountEl = document.getElementById('pendingCount');
    if (!tbody) return;

    const pendingSchedules = scheduleData.filter(s => s.trang_thai === 'Đăng ký');
    
    if (pendingCountEl) {
        pendingCountEl.textContent = pendingSchedules.length;
    }

    if (pendingSchedules.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500">
            <div class="flex flex-col items-center gap-2">
                <span class="text-3xl">✅</span>
                <span>Không có lịch chờ duyệt</span>
            </div>
        </td></tr>`;
        return;
    }

    // Sắp xếp theo thời gian đăng ký (ai đăng ký trước được hiển thị trước)
    pendingSchedules.sort((a, b) => a.lich_id - b.lich_id);

    let html = '';
    pendingSchedules.forEach((s, index) => {
        const ngayLam = s.ngay_lam ? new Date(s.ngay_lam).toLocaleDateString('vi-VN') : 'N/A';
        const thoiGianCa = `${formatTime(s.thoi_gian_bat_dau)} - ${formatTime(s.thoi_gian_ket_thuc)}`;

        html += `<tr class="border-b hover:bg-yellow-50">
            <td class="px-4 py-3">
                <input type="checkbox" class="pending-checkbox w-4 h-4" value="${s.lich_id}" />
            </td>
            <td class="px-4 py-3">
                <div class="font-medium">${s.ho_ten || 'N/A'}</div>
                <div class="text-xs text-gray-500">#${index + 1} trong hàng đợi</div>
            </td>
            <td class="px-4 py-3 text-gray-600">${s.sdt || 'N/A'}</td>
            <td class="px-4 py-3">
                <div class="font-medium">${ngayLam}</div>
            </td>
            <td class="px-4 py-3">
                <div class="font-medium">${s.ten_ca || 'N/A'}</div>
                <div class="text-xs text-gray-500">${thoiGianCa}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
                ${s.lich_id ? `ID: ${s.lich_id}` : ''}
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="approveSchedule(${s.lich_id})" 
                        class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-1 text-sm" 
                        title="Duyệt">✓</button>
                <button onclick="rejectSchedule(${s.lich_id})" 
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm" 
                        title="Từ chối">✕</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

// Cập nhật thống kê
function updateScheduleStats() {
    let totalShifts = shiftsData.length * 7;
    let filledShifts = 0;
    let understaffedShifts = 0;
    let fullShifts = 0;
    let emptyShifts = 0;

    shiftsData.forEach(shift => {
        currentWeekDates.forEach(dateStr => {
            const cellSchedules = scheduleData.filter(s => {
                const scheduleDate = s.ngay_lam ? s.ngay_lam.split('T')[0] : '';
                return scheduleDate === dateStr && s.ca_id === shift.ca_id && s.trang_thai === 'Đã duyệt';
            });

            const count = cellSchedules.length;

            if (count >= MAX_EMPLOYEES_PER_SHIFT) {
                fullShifts++;
            } else if (count >= MIN_EMPLOYEES_PER_SHIFT) {
                filledShifts++;
            } else if (count > 0) {
                understaffedShifts++;
            } else {
                emptyShifts++;
            }
        });
    });

    document.getElementById('statTotal').textContent = totalShifts;
    document.getElementById('statFilled').textContent = filledShifts;
    document.getElementById('statUnderstaffed').textContent = understaffedShifts;
    document.getElementById('statFull').textContent = fullShifts;
    document.getElementById('statEmpty').textContent = emptyShifts;
}

// Mở modal chi tiết ca
async function openShiftDetail(date, shiftId, shiftName) {
    const modal = document.getElementById('shiftDetailModal');
    const title = document.getElementById('shiftDetailTitle');
    const content = document.getElementById('shiftDetailContent');

    const dateObj = new Date(date);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    title.textContent = `${shiftName} - ${dayNames[dateObj.getDay()]} ${dateObj.toLocaleDateString('vi-VN')}`;

    content.innerHTML = `<div class="text-center py-8"><span class="text-2xl">⏳</span> Đang tải...</div>`;
    modal.classList.remove('hidden');

    try {
        const response = await fetch(`/api/lich-lam-viec/chi-tiet-ca?ngay=${date}&ca_id=${shiftId}`);
        const result = await response.json();

        if (result.success) {
            let html = `
                <div class="mb-4 p-4 rounded-lg ${result.du_nhan_vien ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold text-lg">
                                Số nhân viên: <span class="font-bold">${result.so_luong}/${MAX_EMPLOYEES_PER_SHIFT}</span>
                            </p>
                            <p class="text-sm ${result.du_nhan_vien ? 'text-green-700' : 'text-red-700'}">
                                ${result.du_nhan_vien ? 
                                    '✅ Đủ nhân viên (tối thiểu 3)' : 
                                    `⚠️ Thiếu ${MIN_EMPLOYEES_PER_SHIFT - result.so_luong} nhân viên nữa`
                                }
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600">Còn trống: <span class="font-bold">${result.con_trong}</span> vị trí</p>
                        </div>
                    </div>
                </div>
            `;

            if (result.data && result.data.length > 0) {
                html += `<div class="overflow-x-auto">
                    <table class="w-full border">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-3 py-2 text-left border">#</th>
                                <th class="px-3 py-2 text-left border">Nhân viên</th>
                                <th class="px-3 py-2 text-left border">SĐT</th>
                                <th class="px-3 py-2 text-left border">Trạng thái</th>
                                <th class="px-3 py-2 text-center border">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>`;

                result.data.forEach((item, index) => {
                    const statusClass = item.trang_thai === 'Đã duyệt' ? 'bg-green-100 text-green-700' :
                                       item.trang_thai === 'Đăng ký' ? 'bg-yellow-100 text-yellow-700' :
                                       'bg-red-100 text-red-700';

                    html += `<tr class="border-b hover:bg-gray-50">
                        <td class="px-3 py-2 border">${index + 1}</td>
                        <td class="px-3 py-2 border font-medium">${item.ho_ten || 'N/A'}</td>
                        <td class="px-3 py-2 border">${item.sdt || 'N/A'}</td>
                        <td class="px-3 py-2 border">
                            <span class="px-2 py-1 rounded text-sm font-medium ${statusClass}">${item.trang_thai}</span>
                        </td>
                        <td class="px-3 py-2 border text-center">
                            ${item.trang_thai === 'Đăng ký' ? `
                                <button onclick="approveSchedule(${item.lich_id})" class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 mr-1">Duyệt</button>
                                <button onclick="rejectSchedule(${item.lich_id})" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">Từ chối</button>
                            ` : `
                                <button onclick="deleteSchedule(${item.lich_id})" class="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600">Xóa</button>
                            `}
                        </td>
                    </tr>`;
                });

                html += `</tbody></table></div>`;
            } else {
                html += `<div class="text-center py-8 text-gray-500">
                    <span class="text-3xl">📭</span>
                    <p class="mt-2">Chưa có nhân viên đăng ký ca này</p>
                </div>`;
            }

            // Nút thêm nhanh
            if (result.con_trong > 0) {
                html += `
                    <div class="mt-4 pt-4 border-t">
                        <button onclick="openAddScheduleModalWithDate('${date}', ${shiftId})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
                            + Thêm nhân viên vào ca này
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div class="mt-4 pt-4 border-t">
                        <button disabled class="bg-gray-400 text-white px-4 py-2 rounded-lg w-full cursor-not-allowed">
                            Ca này đã đầy (${MAX_EMPLOYEES_PER_SHIFT}/${MAX_EMPLOYEES_PER_SHIFT})
                        </button>
                    </div>
                `;
            }

            content.innerHTML = html;
        } else {
            content.innerHTML = `<div class="text-center py-8 text-red-500">❌ ${result.message || 'Lỗi tải dữ liệu'}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        content.innerHTML = `<div class="text-center py-8 text-red-500">❌ Lỗi kết nối server</div>`;
    }
}

function closeShiftDetailModal() {
    document.getElementById('shiftDetailModal').classList.add('hidden');
}

// Mở modal thêm lịch làm
async function openAddScheduleModal() {
    document.getElementById('scheduleModalTitle').textContent = 'Thêm lịch làm';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleDate').min = new Date().toISOString().split('T')[0];
    
    // Reset các trường
    const shiftTimePreview = document.getElementById('shiftTimePreview');
    const shiftStatus = document.getElementById('shiftStatus');
    if (shiftTimePreview) shiftTimePreview.innerHTML = '';
    if (shiftStatus) shiftStatus.innerHTML = '';
    
    // Load danh sách nhân viên và ca làm
    await loadEmployeesForScheduleSelect();
    await loadShiftsForSelect();
    
    // Render time selects cho khung giờ tùy chỉnh
    renderTimeSelects();
    
    document.getElementById('scheduleModal').classList.remove('hidden');
}

async function openAddScheduleModalWithDate(date, shiftId) {
    document.getElementById('scheduleModalTitle').textContent = 'Thêm lịch làm';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = '';
    
    const shiftTimePreview = document.getElementById('shiftTimePreview');
    const shiftStatus = document.getElementById('shiftStatus');
    if (shiftTimePreview) shiftTimePreview.innerHTML = '';
    if (shiftStatus) shiftStatus.innerHTML = '';
    
    // Load danh sách nhân viên và ca làm
    await loadEmployeesForScheduleSelect();
    await loadShiftsForSelect();
    
    // Render time selects
    renderTimeSelects();
    
    // Set giá trị ngày và ca
    document.getElementById('scheduleDate').value = date;
    document.getElementById('scheduleShiftId').value = shiftId;
    
    // Kiểm tra tình trạng ca
    checkShiftAvailability();
    
    document.getElementById('scheduleModal').classList.remove('hidden');
}

// Load nhân viên cho select
async function loadEmployeesForScheduleSelect() {
    try {
        // Gọi API lấy danh sách tài khoản chi tiết (bao gồm thông tin nhân viên và tài khoản)
        const response = await fetch('http://localhost:3000/taikhoan/chitiet');
        const result = await response.json();

        const select = document.getElementById('scheduleEmployeeId');
        if (!select) return;

        select.innerHTML = '<option value="">-- Chọn nhân viên --</option>';

        if (result.du_lieu && result.du_lieu.length > 0) {
            result.du_lieu.forEach(item => {
                const nv = item.nhan_vien;
                const tk = item.tai_khoan;
                
                // Chỉ hiển thị nhân viên (không phải Admin) và có tài khoản
                if (nv && tk && tk.ten_vai_tro !== 'Admin') {
                    select.innerHTML += `<option value="${nv.nhan_vien_id}">
                        ${tk.ten_dang_nhap} - ${nv.ho_ten} ${nv.sdt ? `(${nv.sdt})` : ''}
                    </option>`;
                }
            });
        }

        scheduleEmployees = result.du_lieu || [];
    } catch (error) {
        console.error('Error loadEmployeesForScheduleSelect:', error);
        showToast('Không thể tải danh sách nhân viên', 'error');
    }
}

// Load ca làm cho select
async function loadShiftsForSelect() {
    try {
        const response = await fetch('/api/lich-lam-viec/ca-lam');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('scheduleShiftId');
            if (select) {
                select.innerHTML = '<option value="">-- Chọn ca làm --</option>';
                (result.data || []).forEach(shift => {
                    select.innerHTML += `<option value="${shift.ca_id}">${shift.ten_ca} (${formatTime(shift.thoi_gian_bat_dau)} - ${formatTime(shift.thoi_gian_ket_thuc)})</option>`;
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Kiểm tra số lượng nhân viên khi chọn ngày/ca
async function checkShiftAvailability() {
    const date = document.getElementById('scheduleDate').value;
    const shiftId = document.getElementById('scheduleShiftId').value;
    const statusEl = document.getElementById('shiftStatus');
    const submitBtn = document.getElementById('scheduleSubmitBtn');

    if (!date || !shiftId) {
        statusEl.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/lich-lam-viec/chi-tiet-ca?ngay=${date}&ca_id=${shiftId}`);
        const result = await response.json();

        if (result.success) {
            if (result.con_trong <= 0) {
                statusEl.innerHTML = `<div class="bg-red-100 text-red-700 p-2 rounded">⚠️ Ca này đã đầy (${MAX_EMPLOYEES_PER_SHIFT}/${MAX_EMPLOYEES_PER_SHIFT})</div>`;
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (result.so_luong >= MIN_EMPLOYEES_PER_SHIFT) {
                statusEl.innerHTML = `<div class="bg-green-100 text-green-700 p-2 rounded">✅ Đủ nhân viên (${result.so_luong}/${MAX_EMPLOYEES_PER_SHIFT}), còn ${result.con_trong} vị trí</div>`;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                statusEl.innerHTML = `<div class="bg-yellow-100 text-yellow-700 p-2 rounded">📝 Còn ${result.con_trong} vị trí (${result.so_luong}/${MAX_EMPLOYEES_PER_SHIFT})</div>`;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Submit form thêm lịch làm
// Submit form thêm lịch làm
document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const startTime = document.getElementById('scheduleStartTime').value;
            const endTime = document.getElementById('scheduleEndTime').value;
            
            // Validate khung giờ
            if (!startTime || !endTime) {
                showToast('Vui lòng chọn khung giờ làm việc', 'error');
                return;
            }

            const validation = validateShiftTime(startTime, endTime);
            if (!validation.valid) {
                showToast(validation.message, 'error');
                return;
            }

            const data = {
                nhan_vien_id: document.getElementById('scheduleEmployeeId').value,
                ngay_lam: document.getElementById('scheduleDate').value,
                trang_thai: document.getElementById('scheduleStatus').value,
                thoi_gian_bat_dau: startTime,
                thoi_gian_ket_thuc: endTime,
                ca_id: null // Không dùng ca_id nữa, dùng khung giờ tùy chỉnh
            };

            if (!data.nhan_vien_id || !data.ngay_lam) {
                showToast('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            try {
                const response = await fetch('/api/lich-lam-viec', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showToast(result.message || 'Thêm lịch làm thành công', 'success');
                    closeScheduleModal();
                    closeShiftDetailModal();
                    loadScheduleByWeek();
                } else {
                    showToast(result.message || 'Lỗi thêm lịch làm', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Lỗi kết nối server', 'error');
            }
        });
    }
});

// Duyệt lịch làm
async function approveSchedule(lichId) {
    try {
        const response = await fetch(`/api/lich-lam-viec/duyet/${lichId}`, { method: 'PUT' });
        const result = await response.json();

        if (result.success) {
            Toast.success(result.message || 'Duyệt thành công');
            loadScheduleByWeek();
            closeShiftDetailModal();
        } else {
            Toast.error(result.message || 'Lỗi duyệt lịch làm');
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');scheduleForm
    }
}
// Đóng modal thêm lịch làm
function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.add('hidden');
}

// Đóng modal chi tiết ca
function closeShiftDetailModal() {
    document.getElementById('shiftDetailModal').classList.add('hidden');
}

// Từ chối lịch làm
async function rejectSchedule(lichId) {
    if (!confirm('Bạn có chắc muốn từ chối lịch làm này?')) return;

    try {
        const response = await fetch(`/api/lich-lam-viec/tu-choi/${lichId}`, { method: 'PUT' });
        const result = await response.json();

        if (result.success) {
            Toast.success(result.message || 'Đã từ chối');
            loadScheduleByWeek();
            closeShiftDetailModal();
        } else {
            Toast.error(result.message || 'Lỗi từ chối lịch làm');
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');
    }
}

// Xóa lịch làm
async function deleteSchedule(lichId) {
    if (!confirm('Bạn có chắc muốn xóa lịch làm này?')) return;

    try {
        const response = await fetch(`/api/lich-lam-viec/${lichId}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            Toast.success(result.message || 'Xóa thành công');
            loadScheduleByWeek();
            closeShiftDetailModal();
        } else {
            Toast.error(result.message || 'Lỗi xóa lịch làm');
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');
    }
}

// Duyệt nhiều lịch làm cùng lúc
async function approveSelectedSchedules() {
    const checkboxes = document.querySelectorAll('.pending-checkbox:checked');
    if (checkboxes.length === 0) {
        Toast.warning('Vui lòng chọn ít nhất một lịch làm');
        return;
    }

    const lichIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (!confirm(`Bạn có chắc muốn duyệt ${lichIds.length} lịch làm đã chọn?`)) return;

    try {
        const response = await fetch('/api/lich-lam-viec/duyet-nhieu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lichIds })
        });

        const result = await response.json();

        if (result.success) {
            Toast.success(result.message);
            loadScheduleByWeek();
        } else {
            Toast.error(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');
    }
}

// Từ chối nhiều lịch làm cùng lúc
async function rejectSelectedSchedules() {
    const checkboxes = document.querySelectorAll('.pending-checkbox:checked');
    if (checkboxes.length === 0) {
        Toast.warning('Vui lòng chọn ít nhất một lịch làm');
        return;
    }

    const lichIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (!confirm(`Bạn có chắc muốn từ chối ${lichIds.length} lịch làm đã chọn?`)) return;

    try {
        const response = await fetch('/api/lich-lam-viec/tu-choi-nhieu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lichIds })
        });

        const result = await response.json();

        if (result.success) {
            Toast.success(result.message);
            loadScheduleByWeek();
        } else {
            Toast.error(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Lỗi kết nối server');
    }
}

const MIN_SHIFT_HOURS = 4; // Tối thiểu 4 tiếng
const MAX_SHIFT_HOURS = 8; // Tối đa 8 tiếng

// Tạo danh sách khung giờ (từ 8:00 đến 22:00, cách nhau 1 tiếng)
function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
}

// Tính số giờ giữa 2 thời điểm
function calculateHours(startTime, endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH + endM/60) - (startH + startM/60);
}

// Validate khung giờ ca làm
function validateShiftTime(startTime, endTime) {
    if (!startTime || !endTime) {
        return { valid: false, message: 'Vui lòng chọn giờ bắt đầu và kết thúc' };
    }
    
    const hours = calculateHours(startTime, endTime);
    
    if (hours < MIN_SHIFT_HOURS) {
        return { valid: false, message: `Ca làm phải tối thiểu ${MIN_SHIFT_HOURS} tiếng (hiện tại: ${hours} tiếng)` };
    }
    
    if (hours > MAX_SHIFT_HOURS) {
        return { valid: false, message: `Ca làm không được quá ${MAX_SHIFT_HOURS} tiếng (hiện tại: ${hours} tiếng)` };
    }
    
    if (startTime >= endTime) {
        return { valid: false, message: 'Giờ kết thúc phải sau giờ bắt đầu' };
    }
    
    return { valid: true, hours };
}

// Render select giờ bắt đầu và kết thúc
function renderTimeSelects() {
    const startSelect = document.getElementById('scheduleStartTime');
    const endSelect = document.getElementById('scheduleEndTime');
    
    if (!startSelect || !endSelect) return;
    
    const timeSlots = generateTimeSlots();
    
    // Render giờ bắt đầu (từ 8:00 đến 18:00 - để còn chỗ cho ca tối thiểu 4 tiếng)
    startSelect.innerHTML = '<option value="">-- Chọn giờ bắt đầu --</option>';
    timeSlots.forEach(time => {
        const hour = parseInt(time.split(':')[0]);
        // Giờ bắt đầu tối đa là 18:00 (để ca 4 tiếng kết thúc lúc 22:00)
        if (hour <= 18) {
            startSelect.innerHTML += `<option value="${time}">${time}</option>`;
        }
    });
    
    // Render giờ kết thúc - sẽ được cập nhật khi chọn giờ bắt đầu
    endSelect.innerHTML = '<option value="">-- Chọn giờ bắt đầu trước --</option>';
}

// Cập nhật giờ kết thúc dựa trên giờ bắt đầu (4-8 tiếng)
function updateEndTimeOptions() {
    const startSelect = document.getElementById('scheduleStartTime');
    const endSelect = document.getElementById('scheduleEndTime');
    const startTime = startSelect.value;
    
    if (!startTime) {
        endSelect.innerHTML = '<option value="">-- Chọn giờ bắt đầu trước --</option>';
        updateShiftPreview();
        return;
    }
    
    const startHour = parseInt(startTime.split(':')[0]);
    const minEndHour = startHour + MIN_SHIFT_HOURS; // Tối thiểu 4 tiếng
    const maxEndHour = Math.min(startHour + MAX_SHIFT_HOURS, 22); // Tối đa 8 tiếng hoặc 22:00
    
    endSelect.innerHTML = '<option value="">-- Chọn giờ kết thúc --</option>';
    
    // Tạo các option từ minEndHour đến maxEndHour
    for (let hour = minEndHour; hour <= maxEndHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const hours = hour - startHour;
        endSelect.innerHTML += `<option value="${time}">${time} (${hours} tiếng)</option>`;
    }
    
    updateShiftPreview();
}

// Cập nhật preview ca làm
function updateShiftPreview() {
    const startTime = document.getElementById('scheduleStartTime')?.value;
    const endTime = document.getElementById('scheduleEndTime')?.value;
    const previewEl = document.getElementById('shiftTimePreview');
    
    if (!previewEl) return;
    
    if (!startTime || !endTime) {
        previewEl.innerHTML = '';
        return;
    }
    
    const validation = validateShiftTime(startTime, endTime);
    
    if (validation.valid) {
        previewEl.innerHTML = `
            <div class="bg-green-100 text-green-700 p-3 rounded-lg border border-green-300">
                <div class="flex items-center gap-2">
                    <span class="text-xl">✅</span>
                    <div>
                        <p class="font-semibold">Ca làm: ${startTime} - ${endTime}</p>
                        <p class="text-sm">Thời lượng: ${validation.hours} tiếng</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        previewEl.innerHTML = `
            <div class="bg-red-100 text-red-700 p-3 rounded-lg border border-red-300">
                <div class="flex items-center gap-2">
                    <span class="text-xl">⚠️</span>
                    <p>${validation.message}</p>
                </div>
            </div>
        `;
    }
}

// Chọn nhanh khung giờ
function setQuickShift(startTime, endTime) {
    const startSelect = document.getElementById('scheduleStartTime');
    const endSelect = document.getElementById('scheduleEndTime');
    
    if (startSelect && endSelect) {
        // Set giờ bắt đầu
        startSelect.value = startTime;
        
        // Cập nhật options giờ kết thúc
        updateEndTimeOptions();
        
        // Đợi một chút để options được render xong rồi set giá trị
        setTimeout(() => {
            endSelect.value = endTime;
            updateShiftPreview();
        }, 50);
    }
}
// Chọn/bỏ chọn tất cả checkbox
function toggleAllPendingCheckboxes() {
    const selectAll = document.getElementById('selectAllPending');
    const checkboxes = document.querySelectorAll('.pending-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

