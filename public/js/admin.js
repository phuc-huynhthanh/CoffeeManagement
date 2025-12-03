
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


