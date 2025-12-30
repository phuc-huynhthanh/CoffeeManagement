
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
        const canUpdate = tk?.ten_vai_tro !== "Admin";

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
              canUpdate
                ? `<button onclick="moModalSuaTaiKhoan(${tk?.tai_khoan_id})"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2">
                      Sửa
                      </button>`
                : `<span class="text-gray-400 italic mr-2">Không thể sửa</span>`
            }
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

function moModalSuaTaiKhoanUI() {
  const modal = document.getElementById("modalSuaTaiKhoan");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function dongModalSuaTaiKhoan() {
  const modal = document.getElementById("modalSuaTaiKhoan");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}
async function moModalSuaTaiKhoan(id) {
  // mở modal
  moModalSuaTaiKhoanUI();

  // lưu ID vào input hidden
  document.getElementById("edit_tai_khoan_id").value = id;

  // reset form
  document.getElementById("edit_ten_dang_nhap").value = "";
  document.getElementById("edit_mat_khau").value = "";
  document.getElementById("edit_vai_tro_id").value = "";

  try {
    const res = await fetch(`http://localhost:3000/taikhoan/${id}`);
    const data = await res.json();

    // API của bạn trả về trực tiếp taiKhoan
    document.getElementById("edit_ten_dang_nhap").value =
      data.ten_dang_nhap || "";

    document.getElementById("edit_vai_tro_id").value =
      data.vai_tro_id || "";
  } catch (err) {
    // console.error("❌ Không lấy được dữ liệu tài khoản:", err);
    // showToast("❌ Không lấy được dữ liệu tài khoản", "error");
  }
}
document
  .getElementById("formSuaTaiKhoan")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("edit_tai_khoan_id").value;
    const ten_dang_nhap = document
      .getElementById("edit_ten_dang_nhap")
      .value.trim();
    const mat_khau = document
      .getElementById("edit_mat_khau")
      .value.trim();
    const vai_tro_id = document
      .getElementById("edit_vai_tro_id")
      .value.trim();

    if (!ten_dang_nhap || !vai_tro_id) {
      showToast("❌ Vui lòng nhập đủ thông tin", "error");
      return;
    }

    const payload = {
      ten_dang_nhap,
      vai_tro_id,
    };

    // chỉ gửi mật khẩu nếu có nhập
    if (mat_khau) payload.mat_khau = mat_khau;

    try {
      const res = await fetch(
        `http://localhost:3000/taikhoan/sua/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.thong_bao);

      showToast("✅ Cập nhật tài khoản thành công", "success");
      dongModalSuaTaiKhoan();
      loadAccounts(); // reload bảng
    } catch (err) {
      console.error("❌ Lỗi sửa:", err);
      showToast("❌ " + err.message, "error");
    }
  });

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

// ============================================
// HỆ THỐNG BẬC THÀNH VIÊN
// ============================================

// Cấu hình bậc thành viên
// ==========================
// THÀNH VIÊN - LOAD + BẬC (API)
// ==========================

let TIER_MAP = new Map(); // bac_id -> tier object
let TIER_LIST = [];       // tier list sorted by diem_toi_thieu

// icon theo ma_icon từ DB
function iconFromMaIcon(ma_icon) {
  switch ((ma_icon || "").toUpperCase()) {
    case "BRONZE": return "🥉";
    case "SILVER": return "🥈";
    case "GOLD": return "🥇";
    case "DIAMOND": return "💎";
    default: return "⭐";
  }
}

// tailwind color theo ma_mau từ DB
function tailwindFromMaMau(ma_mau) {
  switch ((ma_mau || "").toUpperCase()) {
    case "AMBER": return { bg: "bg-amber-600", text: "text-amber-600" };
    case "GRAY": return { bg: "bg-gray-400", text: "text-gray-500" };
    case "YELLOW": return { bg: "bg-yellow-500", text: "text-yellow-500" };
    case "BLUE": return { bg: "bg-blue-500", text: "text-blue-500" };
    case "PURPLE": return { bg: "bg-purple-500", text: "text-purple-500" };
    case "GREEN": return { bg: "bg-green-500", text: "text-green-500" };
    case "RED": return { bg: "bg-red-500", text: "text-red-500" };
    default: return { bg: "bg-slate-500", text: "text-slate-500" };
  }
}

// Load danh sách bậc từ API và build map
async function loadTierMap() {
  const res = await fetch("http://localhost:3000/bacthanhvien/laytatca");
  if (!res.ok) throw new Error("Không thể tải bậc thành viên");
  const tiers = await res.json();

  TIER_LIST = (tiers || []).sort(
    (a, b) => (Number(a.diem_toi_thieu ?? 0) - Number(b.diem_toi_thieu ?? 0))
  );

  TIER_MAP = new Map(TIER_LIST.map(t => [Number(t.bac_id), t]));
  return TIER_LIST;
}

function getTierByBacId(bac_id) {
  if (bac_id === null || bac_id === undefined) return null;
  return TIER_MAP.get(Number(bac_id)) || null;
}

// 1000đ = 1 điểm
function calculatePoints(totalSpent) {
  return Math.floor(Number(totalSpent || 0) / 1000);
}

// Tính điểm cần để lên bậc tiếp theo dựa vào tier list từ API
function getPointsToNextTierByBacId(points, bac_id) {
  if (!TIER_LIST || TIER_LIST.length === 0) return { needed: 0, nextTier: null, currentTier: null };

  const current = getTierByBacId(bac_id);

  // nếu chưa có bac_id, coi như đang ở bậc thấp nhất
  if (!current) {
    const currentTier = TIER_LIST[0];
    const nextTier = TIER_LIST[1] || null;
    if (!nextTier) return { needed: 0, nextTier: null, currentTier };
    return {
      needed: Math.max(0, Number(nextTier.diem_toi_thieu ?? 0) - points),
      nextTier,
      currentTier
    };
  }

  const idx = TIER_LIST.findIndex(t => Number(t.bac_id) === Number(current.bac_id));
  const nextTier = idx >= 0 ? (TIER_LIST[idx + 1] || null) : null;

  if (!nextTier) return { needed: 0, nextTier: null, currentTier: current };

  return {
    needed: Math.max(0, Number(nextTier.diem_toi_thieu ?? 0) - points),
    nextTier,
    currentTier: current
  };
}

// ==========================
// Load danh sách thành viên với bậc từ API
// ==========================
async function loadMembers() {
  try {
    // load tier trước để render đúng bậc
    if (!TIER_LIST || TIER_LIST.length === 0) {
      await loadTierMap();
    }

    const res = await fetch("/thanhvien/laytatca");
    const data = await res.json();

    memberTable.innerHTML = "";

    // Thống kê theo tên bậc (từ DB)
    const tierStatsByName = {};
    TIER_LIST.forEach(t => { tierStatsByName[t.ten_bac] = 0; });

    data.forEach((m, index) => {
      // ✅ tổng chi tiêu đúng: tong_tien_da_mua
      const totalSpent = Number(m.tong_tien_da_mua || 0);
      const points = calculatePoints(totalSpent);

      const tierRaw = getTierByBacId(m.bac_id);
      const tierColor = tailwindFromMaMau(tierRaw?.ma_mau);
      const tier = {
        name: tierRaw?.ten_bac ?? "Chưa xếp bậc",
        minPoints: Number(tierRaw?.diem_toi_thieu ?? 0),
        discount: Number(tierRaw?.phan_tram_giam ?? 0),
        icon: iconFromMaIcon(tierRaw?.ma_icon),
        color: tierColor.bg,
        textColor: tierColor.text
      };

      if (tierRaw?.ten_bac) {
        tierStatsByName[tierRaw.ten_bac] = (tierStatsByName[tierRaw.ten_bac] || 0) + 1;
      }

      const nextTierInfo = getPointsToNextTierByBacId(points, m.bac_id);

      // progress bar
      let progressPercent = 100;
      if (nextTierInfo.nextTier && nextTierInfo.currentTier) {
        const curMin = Number(nextTierInfo.currentTier.diem_toi_thieu ?? 0);
        const nextMin = Number(nextTierInfo.nextTier.diem_toi_thieu ?? 0);
        const pointsInTier = points - curMin;
        const tierRange = nextMin - curMin;
        progressPercent = tierRange > 0 ? Math.min(100, (pointsInTier / tierRange) * 100) : 100;
      }

      const nextIcon = iconFromMaIcon(nextTierInfo.nextTier?.ma_icon);
      const nextColor = tailwindFromMaMau(nextTierInfo.nextTier?.ma_mau);

      memberTable.innerHTML += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 border-b text-center">${index + 1}</td>
          <td class="px-4 py-3 border-b">
            <div class="font-medium text-gray-800">${m.ho_ten}</div>
          </td>
          <td class="px-4 py-3 border-b text-gray-600">${m.sdt}</td>
          <td class="px-4 py-3 border-b text-gray-600">${m.email || "—"}</td>

          <td class="px-4 py-3 border-b text-center">
            <span class="font-bold text-orange-600">${points.toLocaleString("vi-VN")}</span>
          </td>

          <td class="px-4 py-3 border-b">
            <div class="flex items-center gap-2">
              <span class="${tier.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                ${tier.icon} ${tier.name}
              </span>
              <span class="text-xs text-green-600 font-medium">-${tier.discount}%</span>
            </div>

            ${nextTierInfo.nextTier ? `
              <div class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="${tier.color} h-2 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Còn <span class="font-semibold text-gray-700">${Number(nextTierInfo.needed).toLocaleString("vi-VN")}</span> điểm để lên 
                  <span class="${nextColor.text} font-semibold">${nextIcon} ${nextTierInfo.nextTier?.ten_bac}</span>
                </p>
              </div>
            ` : `
              <p class="text-xs text-blue-500 mt-1 font-medium">✨ Bậc cao nhất!</p>
            `}
          </td>

          <td class="px-4 py-3 border-b text-right font-medium text-gray-700">
            ${totalSpent.toLocaleString("vi-VN")}đ
          </td>

          <td class="px-4 py-3 border-b text-center space-x-2">
            <button onclick="viewMemberDetail(${m.thanh_vien_id})" 
                    class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm" title="Chi tiết">
              👁️
            </button>
            <button onclick="editMember(${m.thanh_vien_id})" 
                    class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
              Sửa
            </button>
            <button onclick="deleteMember(${m.thanh_vien_id})" 
                    class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
              Xóa
            </button>
          </td>
        </tr>
      `;
    });

    updateMemberTierStatsFromApi(tierStatsByName, data.length);

  } catch (err) {
    console.error("❌ Lỗi loadMembers:", err);
    memberTable.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-red-500">Lỗi tải dữ liệu</td></tr>`;
  }
}

// ==========================
// Thống kê bậc (từ API)
// ==========================
function updateMemberTierStatsFromApi(statsByName, total) {
  const statsContainer = document.getElementById("memberTierStats");
  if (!statsContainer) return;

  const tierCards = (TIER_LIST || []).map(t => {
    const icon = iconFromMaIcon(t.ma_icon);
    const c = tailwindFromMaMau(t.ma_mau);
    const count = statsByName[t.ten_bac] || 0;

    return `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">${icon}</div>
          <div>
            <p class="text-sm text-gray-500">${t.ten_bac}</p>
            <p class="text-2xl font-bold ${c.text}">${count}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  statsContainer.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-${Math.min(6, 1 + (TIER_LIST?.length || 0))} gap-4">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👥</div>
          <div>
            <p class="text-sm text-gray-500">Tổng thành viên</p>
            <p class="text-2xl font-bold text-gray-800">${total}</p>
          </div>
        </div>
      </div>
      ${tierCards}
    </div>
  `;
}

// ==========================
// Xem chi tiết thành viên
// ==========================
async function viewMemberDetail(thanhVienId) {
  try {
    if (!TIER_LIST || TIER_LIST.length === 0) {
      await loadTierMap();
    }

    const res = await fetch(`/thanhvien/layid/${thanhVienId}`);
    const member = await res.json();

    const totalSpent = Number(member.tong_tien_da_mua || 0);
    const points = calculatePoints(totalSpent);

    const tierRaw = getTierByBacId(member.bac_id);
    const tierColor = tailwindFromMaMau(tierRaw?.ma_mau);
    const tier = {
      name: tierRaw?.ten_bac ?? "Chưa xếp bậc",
      minPoints: Number(tierRaw?.diem_toi_thieu ?? 0),
      discount: Number(tierRaw?.phan_tram_giam ?? 0),
      icon: iconFromMaIcon(tierRaw?.ma_icon),
      color: tierColor.bg,
      textColor: tierColor.text
    };

    const nextTierInfo = getPointsToNextTierByBacId(points, member.bac_id);
    const nextIcon = iconFromMaIcon(nextTierInfo.nextTier?.ma_icon);
    const nextColor = tailwindFromMaMau(nextTierInfo.nextTier?.ma_mau);

    const progressPercent = (() => {
      if (nextTierInfo.nextTier && nextTierInfo.currentTier) {
        const curMin = Number(nextTierInfo.currentTier.diem_toi_thieu ?? 0);
        const nextMin = Number(nextTierInfo.nextTier.diem_toi_thieu ?? 0);
        const pointsInTier = points - curMin;
        const tierRange = nextMin - curMin;
        return tierRange > 0 ? Math.min(100, (pointsInTier / tierRange) * 100) : 100;
      }
      return 100;
    })();

    const modalHtml = `
      <div id="memberDetailModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
          <div class="${tier.color} text-white px-6 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                  ${tier.icon}
                </div>
                <div>
                  <h3 class="text-xl font-bold">${member.ho_ten}</h3>
                  <p class="text-white/80">Thành viên ${tier.name}</p>
                </div>
              </div>
              <button onclick="closeMemberDetailModal()" class="text-white/80 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-500">📞 Số điện thoại</p>
                <p class="font-semibold text-gray-800">${member.sdt}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-500">📧 Email</p>
                <p class="font-semibold text-gray-800">${member.email || "—"}</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl mb-6">
              <div class="flex justify-between items-center mb-3">
                <span class="text-gray-600 font-medium">Điểm tích lũy</span>
                <span class="text-2xl font-bold text-orange-600">${points.toLocaleString("vi-VN")} điểm</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 font-medium">Tổng chi tiêu</span>
                <span class="text-lg font-semibold text-gray-800">${totalSpent.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <div class="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-green-600 text-xl">🎁</span>
                <span class="font-semibold text-green-700">Ưu đãi hiện tại</span>
              </div>
              <p class="text-green-800 text-lg font-bold">Giảm ${tier.discount}% cho mọi đơn hàng</p>
            </div>

            ${nextTierInfo.nextTier ? `
              <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-blue-600 text-xl">🚀</span>
                  <span class="font-semibold text-blue-700">Tiến trình lên bậc ${nextTierInfo.nextTier.ten_bac}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div class="${nextColor.bg} h-3 rounded-full transition-all"
                       style="width: ${progressPercent}%"></div>
                </div>
                <p class="text-sm text-gray-600">
                  Đã đạt <span class="font-bold text-orange-600">${points.toLocaleString("vi-VN")}</span>/${Number(nextTierInfo.nextTier.diem_toi_thieu ?? 0).toLocaleString("vi-VN")} điểm.
                  Còn <span class="font-bold text-blue-600">${Number(nextTierInfo.needed).toLocaleString("vi-VN")}</span> điểm 
                  (tương đương <span class="font-bold">${(Number(nextTierInfo.needed) * 1000).toLocaleString("vi-VN")}đ</span>) để lên bậc 
                  <span class="${nextColor.text} font-bold">${nextIcon} ${nextTierInfo.nextTier.ten_bac}</span>
                </p>
              </div>
            ` : `
              <div class="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl text-white text-center">
                <span class="text-3xl">✨</span>
                <p class="font-bold text-lg mt-2">Chúc mừng! Bạn đã đạt bậc cao nhất!</p>
                <p class="text-white/80 text-sm">Tận hưởng ưu đãi tốt nhất cho mọi đơn hàng</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById("memberDetailModal");
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);

  } catch (err) {
    console.error("❌ Lỗi viewMemberDetail:", err);
    alert("Không thể tải thông tin thành viên");
  }
}

// Đóng modal chi tiết thành viên
function closeMemberDetailModal() {
  const modal = document.getElementById("memberDetailModal");
  if (modal) modal.remove();
}

// Lọc thành viên theo bậc (theo tên bậc hiển thị)
function filterMembersByTier(tierName) {
  const rows = memberTable.querySelectorAll("tr");
  rows.forEach(row => {
    if (tierName === "all") {
      row.style.display = "";
    } else {
      const tierCell = row.querySelector("td:nth-child(6)");
      if (tierCell && tierCell.textContent.includes(tierName)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  });
}

// Export functions
window.viewMemberDetail = viewMemberDetail;
window.closeMemberDetailModal = closeMemberDetailModal;
window.filterMembersByTier = filterMembersByTier;
window.calculatePoints = calculatePoints;

// ==========================
// MỞ MODAL THÊM / SỬA THÀNH VIÊN (giữ nguyên)
// ==========================

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
  document.getElementById("memberEmail").value = data.email || "";
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

// ✅ Load khi trang sẵn sàng: load tier trước, rồi load member
(async () => {
  try {
    await loadTierMap();
  } catch (e) {
    console.error("❌ Không load được bậc thành viên:", e);
  }
  loadMembers();
})();


// ==========================
// BẬC THÀNH VIÊN - CRUD (giữ nguyên phần của bạn)
// ==========================
const tierTable = document.getElementById("tierTable");
const tierModal = document.getElementById("tierModal");
const tierForm = document.getElementById("tierForm");
const btnAddTier = document.getElementById("btnAddTier");
const btnCancelTier = document.getElementById("btnCancelTier");

async function loadBacThanhVien() {
  if (!tierTable) return;
  try {
    const res = await fetch("http://localhost:3000/bacthanhvien/laytatca");
    if (!res.ok) throw new Error("Không thể tải bậc thành viên");
    const data = await res.json();
    renderTierTable(data);
  } catch (err) {
    console.error("Lỗi loadBacThanhVien:", err);
    tierTable.innerHTML = `<tr><td colspan=5 class='text-center py-4 text-red-500'>Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderTierTable(tiers) {
  if (!tierTable) return;
  tierTable.innerHTML = "";
  if (!tiers || tiers.length === 0) {
    tierTable.innerHTML = `<tr><td colspan=5 class='text-center py-6 text-gray-500'>Chưa có bậc thành viên nào.</td></tr>`;
    return;
  }

  tiers.forEach((t, idx) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
      <td class="px-4 py-3 border-b">${idx + 1}</td>
      <td class="px-4 py-3 border-b font-medium">${t.ten_bac}</td>
      <td class="px-4 py-3 border-b">${(t.diem_toi_thieu ?? 0).toLocaleString("vi-VN")}</td>
      <td class="px-4 py-3 border-b">${(t.phan_tram_giam ?? 0)}%</td>
      <td class="px-4 py-3 border-b text-center space-x-2">
        <button onclick="editTier(${t.bac_id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Sửa</button>
        <button onclick="deleteTier(${t.bac_id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Xóa</button>
      </td>
    `;
    tierTable.appendChild(tr);
  });
}

// Mở modal thêm
btnAddTier?.addEventListener("click", () => {
  if (!tierModal) return;
  document.getElementById("tierModalTitle").innerText = "Thêm bậc thành viên";
  tierForm.reset();
  document.getElementById("tierId").value = "";
  tierModal.classList.remove("hidden");
});

// Hủy modal
btnCancelTier?.addEventListener("click", () => {
  tierModal?.classList.add("hidden");
});

// Submit form thêm/sửa
tierForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("tierId").value;
  const payload = {
    ten_bac: document.getElementById("tierName").value,
    diem_toi_thieu: document.getElementById("tierMinPoints").value,
    phan_tram_giam: document.getElementById("tierDiscount").value,
    ma_icon: document.getElementById("tierIcon").value || null,
    ma_mau: document.getElementById("tierColor").value || null
  };

  try {
    const url = id ? `http://localhost:3000/bacthanhvien/sua/${id}` : "http://localhost:3000/bacthanhvien/them";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || "Lỗi server");
    tierModal.classList.add("hidden");
    loadBacThanhVien();

    // sau khi chỉnh tier, refresh map + reload member để áp màu/discount mới
    await loadTierMap();
    loadMembers();

    showToast(result.message || "Thao tác thành công", "success");
  } catch (err) {
    console.error("Lỗi khi lưu bậc:", err);
    showToast("❌ Lỗi: " + (err.message || err), "error");
  }
});

// Edit và Delete (toàn cục để gọi từ onclick)
window.editTier = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/bacthanhvien/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy bậc");
    const data = await res.json();
    document.getElementById("tierId").value = data.bac_id;
    document.getElementById("tierName").value = data.ten_bac || "";
    document.getElementById("tierMinPoints").value = data.diem_toi_thieu ?? 0;
    document.getElementById("tierDiscount").value = data.phan_tram_giam ?? 0;
    document.getElementById("tierIcon").value = data.ma_icon || "";
    document.getElementById("tierColor").value = data.ma_mau || "";
    document.getElementById("tierModalTitle").innerText = "Sửa bậc thành viên";
    tierModal.classList.remove("hidden");
  } catch (err) {
    console.error("Lỗi editTier:", err);
    showToast("❌ Lỗi khi lấy dữ liệu bậc", "error");
  }
};

window.deleteTier = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa bậc này?")) return;
  try {
    const res = await fetch(`http://localhost:3000/bacthanhvien/xoa/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || "Không thể xóa");

    showToast(result.message || "Xóa thành công", "success");
    loadBacThanhVien();

    // sau khi xóa tier, refresh map + reload member
    await loadTierMap();
    loadMembers();

  } catch (err) {
    console.error("Lỗi deleteTier:", err);
    showToast("❌ Lỗi: " + (err.message || err), "error");
  }
};

// load tier crud table nếu có
loadBacThanhVien();



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
      loadLuong();
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
    case 'thuong-phat':
        loadThuongPhat();
      break;
    case 'bac-thanh-vien':
      loadBacThanhVien();
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
        // 🔍 DEBUG CHI TIẾT
        console. log('📅 startDate:', startDate);
        console.log('📅 toISOString():', startDate.toISOString());
        console.log('📅 currentWeekDates[0]:', currentWeekDates[0]);
        console.log('📅 currentWeekDates[6]:', currentWeekDates[6]);

        const requestPayload = {
            tu_ngay: currentWeekDates[0],
            den_ngay: currentWeekDates[6]
        };
        console.log('📤 Request payload:', JSON.stringify(requestPayload));

        const response = await fetch('/lich-lam-viec/tim-khoang-ngay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        });

        console.log('📥 Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📥 Response body:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}:  ${responseText}`);
        }

        const result = JSON.parse(responseText);

        if (result.success) {
            scheduleData = result.data || [];
            shiftsData = result. ca_lam || [];
            renderScheduleTable();
            renderPendingList();
            updateScheduleStats();
        } else {
            Toast.error(result.message || 'Lỗi tải lịch làm');
        }
    } catch (error) {
        console.error('❌ Lỗi loadScheduleByWeek:', error);
        Toast.error('Lỗi:  ' + error.message);
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
        const response = await fetch(`/lich-lam-viec/chi-tiet-ca?ngay=${date}&ca_id=${shiftId}`);
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
        const response = await fetch('/lich-lam-viec/ca-lam');
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
        const response = await fetch(`/lich-lam-viec/chi-tiet-ca?ngay=${date}&ca_id=${shiftId}`);
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
                const response = await fetch('/lich-lam-viec', {
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
  if (!confirm("Bạn có chắc chắn muốn duyệt lịch này?")) return;

  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "Đã xác nhận" })
    });

    if (!response.ok) throw new Error("Lỗi duyệt lịch");

    showNotification("✓ Đã duyệt lịch làm việc", "success");
    
    // CẬP NHẬT STATE
    const scheduleIndex = allSchedules.findIndex(s => s.lich_id === lichId);
    if (scheduleIndex !== -1) {
      allSchedules[scheduleIndex].trang_thai = "Đã xác nhận";
    }
    
    // CẬP NHẬT UI NGAY (không cần reload)
    renderScheduleTable();
    loadPendingSchedules();
    calculateStats();
  } catch (error) {
    console.error("❌ Lỗi approveSchedule:", error);
    showNotification("❌ Lỗi: " + error.message, "error");
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
  if (!confirm("Bạn có chắc chắn muốn từ chối lịch này?")) return;

  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "Hủy" })
    });

    if (!response.ok) throw new Error("Lỗi từ chối lịch");

    showNotification("✓ Đã từ chối lịch làm việc", "success");
    
    // CẬP NHẬT STATE
    const scheduleIndex = allSchedules.findIndex(s => s.lich_id === lichId);
    if (scheduleIndex !== -1) {
      allSchedules[scheduleIndex].trang_thai = "Hủy";
    }
    
    // CẬP NHẬT UI NGAY (không cần reload)
    renderScheduleTable();
    loadPendingSchedules();
    calculateStats();
  } catch (error) {
    console.error("❌ Lỗi rejectSchedule:", error);
    showNotification("❌ Lỗi: " + error.message, "error");
  }
}

// Xóa lịch làm
async function deleteSchedule(lichId) {
    if (!confirm('Bạn có chắc muốn xóa lịch làm này?')) return;

    try {
        const response = await fetch(`/lich-lam-viec/${lichId}`, { method: 'DELETE' });
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
  const checkboxes = document.querySelectorAll(". pendingCheckbox:checked");
  
  if (checkboxes.length === 0) {
    showNotification("⚠️ Vui lòng chọn ít nhất 1 lịch để duyệt", "warning");
    return;
  }

  if (! confirm(`Bạn có chắc chắn muốn duyệt ${checkboxes.length} lịch?`)) {
    return;
  }

  showNotification(`⏳ Đang duyệt ${checkboxes.length} lịch... `, "info");

  let successCount = 0;
  let failCount = 0;

  for (const checkbox of checkboxes) {
    try {
      const lichId = checkbox.value;
      
      const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
        method: "PUT",
        headers: { "Content-Type":  "application/json" },
        body: JSON.stringify({ trang_thai: "Đã xác nhận" })
      });

      if (response.ok) {
        successCount++;
        
        // 1️⃣ CẬP NHẬT allSchedules ngay
        const scheduleIndex = allSchedules.findIndex(s => s.lich_id === lichId);
        if (scheduleIndex !== -1) {
          allSchedules[scheduleIndex].trang_thai = "Đã xác nhận";
          console.log(`✓ Cập nhật lịch ${lichId} thành "Đã xác nhận"`);
        }
      } else {
        failCount++;
        console.error(`❌ Lỗi duyệt lịch ${lichId}`);
      }
    } catch (error) {
      failCount++;
      console.error("❌ Lỗi duyệt lịch:", error);
    }
  }

  // 2️⃣ CẬP NHẬT UI NGAY
  if (successCount > 0) {
    renderScheduleTable();      // Bảng lịch làm
    loadPendingSchedules();     // Danh sách chờ duyệt (tự động mất)
    calculateStats();           // Thống kê
    
    // Xóa checkbox
    checkboxes.forEach(cb => cb.checked = false);
    document.getElementById("selectAllPending").checked = false;
  }

  // Thông báo kết quả
  if (successCount === checkboxes.length) {
    showNotification(`✓ Đã duyệt ${successCount}/${checkboxes.length} lịch`, "success");
  } else if (successCount > 0) {
    showNotification(`⚠️ Duyệt ${successCount}/${checkboxes.length} lịch.  Lỗi: ${failCount}`, "warning");
  } else {
    showNotification(`❌ Duyệt thất bại`, "error");
  }
}

// Từ chối nhiều lịch làm cùng lúc
async function rejectSelectedSchedules() {
  const checkboxes = document.querySelectorAll(".pendingCheckbox:checked");
  
  if (checkboxes.length === 0) {
    showNotification("⚠️ Vui lòng chọn ít nhất 1 lịch để từ chối", "warning");
    return;
  }

  if (!confirm(`Bạn có chắc chắn muốn từ chối ${checkboxes.length} lịch?`)) {
    return;
  }

  showNotification(`⏳ Đang từ chối ${checkboxes.length} lịch...`, "info");

  let successCount = 0;
  let failCount = 0;

  for (const checkbox of checkboxes) {
    try {
      const lichId = checkbox.value;
      
      const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
        method: "PUT",
        headers:  { "Content-Type": "application/json" },
        body:  JSON.stringify({ trang_thai: "Hủy" })
      });

      if (response.ok) {
        successCount++;
        
        // 1️⃣ CẬP NHẬT allSchedules ngay
        const scheduleIndex = allSchedules. findIndex(s => s. lich_id === lichId);
        if (scheduleIndex !== -1) {
          allSchedules[scheduleIndex].trang_thai = "Hủy";
          console.log(`✓ Cập nhật lịch ${lichId} thành "Hủy"`);
        }
      } else {
        failCount++;
        console.error(`❌ Lỗi từ chối lịch ${lichId}`);
      }
    } catch (error) {
      failCount++;
      console.error("❌ Lỗi từ chối lịch:", error);
    }
  }

  // 2️⃣ CẬP NHẬT UI NGAY
  if (successCount > 0) {
    renderScheduleTable();      // Bảng lịch làm
    loadPendingSchedules();     // Danh sách chờ duyệt (tự động mất)
    calculateStats();           // Thống kê
    
    // Xóa checkbox
    checkboxes.forEach(cb => cb.checked = false);
    document.getElementById("selectAllPending").checked = false;
  }

  // Thông báo kết quả
  if (successCount === checkboxes.length) {
    showNotification(`✓ Đã từ chối ${successCount}/${checkboxes.length} lịch`, "success");
  } else if (successCount > 0) {
    showNotification(`⚠️ Từ chối ${successCount}/${checkboxes.length} lịch. Lỗi: ${failCount}`, "warning");
  } else {
    showNotification(`❌ Từ chối thất bại`, "error");
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

// =============================================
// API BASE URL
// =============================================
const API_BASE = "http://localhost:3000";
const LICH_LAM_API = `${API_BASE}/lich-lam-viec`;
const NHAN_VIEN_API = `${API_BASE}/nhanvien/laytatca`;
const CA_LAM_API = `${API_BASE}/calam/laytatca`;

// =============================================
// STATE MANAGEMENT
// =============================================
let currentWeekStart = getMonday(new Date());
let allSchedules = [];
let allNhanVien = [];
let allCaLam = [];
let pendingSchedules = [];

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  setDefaultWeek();
  loadNhanVienData();
  loadCaLamData();
  loadScheduleByWeek();
  
  // Refresh every 30 seconds
  setInterval(loadScheduleByWeek, 30000);
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Lấy thứ 2 của tuần hiện tại
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Format ngày theo YYYY-MM-DD
 */
 function formatDate(date) {
  if (typeof date === 'string') {
    // Nếu là ISO string (có T), xử lý timezone
    if (date.includes('T')) {
      // Parse ISO date và chuyển sang local time
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d. getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } else {
      // Đã là YYYY-MM-DD
      return date. split('T')[0];
    }
  }
  
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Format ngày hiển thị
 */
function formatDateDisplay(date) {
  let d;
  if (typeof date === 'string') {
    d = new Date(date);
  } else {
    d = new Date(date);
  }
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/**
 * Format thời gian
 */
function formatTime(timeStr) {
  if (! timeStr) return "--:--";
  return timeStr.substring(0, 5);
}

/**
 * Lấy tên thứ
 */
function getDayName(date) {
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return days[new Date(date).getDay()];
}

/**
 * Thiết lập tuần mặc định (tuần hiện tại)
 */
function setDefaultWeek() {
  const today = new Date();
  const monday = getMonday(today);
  const weekString = getWeekString(monday);
  document.getElementById("weekPicker").value = weekString;
  currentWeekStart = monday;
}

/**
 * Lấy chuỗi tuần (YYYY-Www)
 */
function getWeekString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const startDate = new Date(year, 0, 4);
  const diff = d - startDate;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNo = Math.floor(diff / oneWeek) + 1;
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Lấy ngày đầu tuần từ chuỗi tuần
 */
function getWeekStartDate(weekString) {
  const [year, week] = weekString. split("-W");
  const simple = new Date(year, 0, 4);
  const dow = simple.getDay();
  const ISOWeekStart = simple;
  if (dow <= 4) ISOWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
  ISOWeekStart.setDate(ISOWeekStart.getDate() + 7 * (parseInt(week) - 1));
  return ISOWeekStart;
}

// =============================================
// API CALLS
// =============================================

/**
 * Lấy danh sách nhân viên
 */
async function loadNhanVienData() {
  try {
    const response = await fetch(NHAN_VIEN_API);
    if (!response. ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    allNhanVien = Array.isArray(data) ? data : (data.data || []);
    
    // Populate select thêm lịch
    const select = document.getElementById("nhanVienSelect");
    if (select) {
      select.innerHTML = '<option value="">-- Chọn nhân viên --</option>';
      allNhanVien.forEach(nv => {
        const option = document.createElement("option");
        option.value = nv.nhan_vien_id;
        option.textContent = `${nv.ho_ten} (${nv.sdt})`;
        select.appendChild(option);
      });
    }
    
    console.log("✓ Đã tải danh sách nhân viên:", allNhanVien.length);
  } catch (error) {
    console.error("❌ Lỗi loadNhanVienData:", error);
    showNotification("Lỗi tải danh sách nhân viên", "error");
  }
}

/**
 * Lấy danh sách ca làm
 */
async function loadCaLamData() {
  try {
    const response = await fetch(CA_LAM_API);
    if (!response. ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    allCaLam = Array.isArray(data) ? data : (data.data || []);
    
    // Populate select thêm lịch
    const select = document.getElementById("caLamSelect");
    if (select) {
      select.innerHTML = '<option value="">-- Chọn ca làm --</option>';
      allCaLam.forEach(ca => {
        const option = document.createElement("option");
        option.value = ca.ca_id;
        option.textContent = `${ca.ten_ca} (${formatTime(ca.thoi_gian_bat_dau)} - ${formatTime(ca.thoi_gian_ket_thuc)})`;
        select.appendChild(option);
      });
    }
    
    console.log("✓ Đã tải danh sách ca làm:", allCaLam. length);
  } catch (error) {
    console.error("❌ Lỗi loadCaLamData:", error);
    showNotification("Lỗi tải danh sách ca làm", "error");
  }
}

/**
 * Lấy lịch làm theo tuần
 */
async function loadScheduleByWeek() {
  try {
    const weekInput = document.getElementById("weekPicker").value;
    if (!weekInput) {
      showNotification("Vui lòng chọn tuần", "warning");
      return;
    }

    currentWeekStart = getWeekStartDate(weekInput);
    const sundayEnd = new Date(currentWeekStart);
    sundayEnd.setDate(sundayEnd.getDate() + 6);

    const tuNgay = formatDate(currentWeekStart);
    const denNgay = formatDate(sundayEnd);

    console.log(`📅 Tải lịch từ ${tuNgay} đến ${denNgay}`);

    const response = await fetch(`${LICH_LAM_API}/tim-khoang-ngay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tu_ngay: tuNgay, den_ngay: denNgay })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    allSchedules = Array.isArray(result) ? result : (result.data || []);
    
    console.log("✓ Đã tải lịch làm việc:", allSchedules.length);
    
    renderScheduleTable();
    loadPendingSchedules();
    calculateStats();
  } catch (error) {
    console.error("❌ Lỗi loadScheduleByWeek:", error);
    showNotification("Lỗi tải lịch làm việc", "error");
  }
}

/**
 * Lấy danh sách lịch chờ duyệt
 */
function loadPendingSchedules() {
  // ✨ Filter từ allSchedules những lịch có trang_thai = "Đăng ký"
  pendingSchedules = allSchedules. filter(s => s.trang_thai === "Đăng ký");
  
  console.log("✓ Đã lọc danh sách chờ duyệt:", pendingSchedules. length);
  console.log("Chi tiết:", pendingSchedules); // DEBUG
  
  // Cập nhật bảng danh sách chờ duyệt ngay
  renderPendingScheduleTable();
}

// =============================================
// RENDER FUNCTIONS
// =============================================

/**
 * Render bảng lịch làm theo tuần
 */
function renderScheduleTable() {
  const tableBody = document.getElementById("scheduleTableBody");
  const dateHeaderRow = document.getElementById("dateHeaderRow");

  if (!tableBody || !dateHeaderRow) {
    console.error("❌ Không tìm thấy elements bảng");
    return;
  }

  // Cập nhật header ngày
  const headerCells = dateHeaderRow.querySelectorAll("th");
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(dayDate.getDate() + i);
    if (headerCells[i + 1]) {
      const dayName = getDayName(dayDate);
      const dateDisplay = formatDateDisplay(dayDate);
      headerCells[i + 1].innerHTML = `<div>${dayName}</div><div class="text-xs text-gray-500">${dateDisplay}</div>`;
    }
  }

  // Render từng ca làm
  tableBody.innerHTML = "";
  
  if (allCaLam.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-gray-400">
          <div class="flex flex-col items-center gap-3">
            <span class="text-6xl opacity-50">📋</span>
            <span class="font-medium">Không có ca làm nào</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  allCaLam. forEach(ca => {
    const row = document.createElement("tr");
    row.classList.add("border-b", "border-gray-200", "hover:bg-gray-50");

    // Cột ca làm
    const caCell = document.createElement("td");
    caCell.classList.add("px-4", "py-3", "font-medium", "text-gray-700", "bg-gray-50", "sticky", "left-0", "z-10");
    caCell.innerHTML = `
      <div class="font-semibold">${ca.ten_ca}</div>
      <div class="text-sm text-gray-500">${formatTime(ca.thoi_gian_bat_dau)} - ${formatTime(ca.thoi_gian_ket_thuc)}</div>
    `;
    row.appendChild(caCell);

    // 7 cột ngày trong tuần
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dayStr = formatDate(dayDate);

      const dayCell = document.createElement("td");
      dayCell.classList.add("px-4", "py-3", "text-center", "border-r", "border-gray-200");

      // Lọc lịch cho ca và ngày này
      const schedulesForDay = allSchedules.filter(s => {
        const scheduleDate = formatDate(s.ngay_lam);
        const caMatch = s.ca_id === ca.ca_id;
        const dateMatch = scheduleDate === dayStr;
        
        // DEBUG
        if (s.ca_id === ca.ca_id) {
          console.log(
            `🔍 Schedule:  "${s.ho_ten}" | ca_id: ${s.ca_id} (expected ${ca.ca_id}) | date: ${scheduleDate} (expected ${dayStr}) | match: ${caMatch && dateMatch}`
          );
        }
        
        return caMatch && dateMatch;
      });

      if (schedulesForDay.length === 0) {
        // Trống
        dayCell.innerHTML = `
          <div class="bg-gray-100 rounded-lg p-2 min-h-[80px] flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
            <span class="text-gray-400 text-sm">Trống</span>
          </div>
        `;
      } else {
        // Hiển thị danh sách nhân viên
        let bgClass = "bg-gray-100 border-gray-300";
        let countText = `${schedulesForDay.length}/9`;

        if (schedulesForDay. length >= 9) {
          bgClass = "bg-orange-100 border-orange-300";
          countText = "Đầy";
        } else if (schedulesForDay. length >= 3) {
          bgClass = "bg-green-100 border-green-300";
          countText = `✓ ${schedulesForDay.length}/9`;
        } else {
          bgClass = "bg-red-100 border-red-300";
          countText = `⚠️ ${schedulesForDay.length}/9`;
        }

        const isPending = schedulesForDay.some(s => s.trang_thai === "Đăng ký");
        const borderClass = isPending ? "border-2 border-yellow-400" : "border border-gray-300";

        let html = `<div class="${bgClass} ${borderClass} rounded-lg p-2 min-h-[80px] overflow-y-auto">
          <div class="text-xs font-bold text-gray-700 mb-1">${countText}</div>`;
        
        schedulesForDay.forEach(schedule => {
          const statusColor = schedule.trang_thai === "Đã xác nhận" ? "bg-green-200 text-green-800" : 
                              schedule.trang_thai === "Hủy" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800";
          
          html += `
            <div class="text-xs mb-1 cursor-pointer hover:bg-white/50 p-1 rounded transition" onclick="openEditScheduleModal(${schedule.lich_id})" title="Click để chỉnh sửa">
              <div class="font-semibold text-gray-800 truncate">${schedule.ho_ten}</div>
              <div class="text-gray-600 text-xs">${formatTime(schedule.thoi_gian_thuc_te_bat_dau)} - ${formatTime(schedule.thoi_gian_thuc_te_ket_thuc)}</div>
              <span class="inline-block ${statusColor} px-1. 5 py-0.5 rounded text-xs font-medium mt-0.5">${schedule.trang_thai}</span>
            </div>
          `;
        });
        
        html += `</div>`;
        dayCell.innerHTML = html;
      }

      row.appendChild(dayCell);
    }

    tableBody.appendChild(row);
  });
}

/**
 * Render bảng danh sách chờ duyệt
 */
function renderPendingScheduleTable() {
  const tableBody = document.getElementById("pendingScheduleList");
  const pendingCount = document.getElementById("pendingCount");

  if (!tableBody || !pendingCount) {
    console.error("❌ Không tìm thấy elements danh sách chờ duyệt");
    return;
  }

  pendingCount.textContent = pendingSchedules.length;

  if (pendingSchedules.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-6 text-gray-400">
          <div class="flex flex-col items-center gap-2">
            <span class="text-3xl opacity-50">✓</span>
            <span>Không có lịch chờ duyệt</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = "";
  pendingSchedules.forEach(schedule => {
    const row = document. createElement("tr");
    row.classList.add("border-b", "border-gray-200", "hover:bg-yellow-50");

    // Checkbox
    const cbCell = document.createElement("td");
    cbCell.classList.add("px-4", "py-3");
    cbCell.innerHTML = `<input type="checkbox" class="pendingCheckbox w-4 h-4 cursor-pointer rounded" value="${schedule.lich_id}">`;
    row.appendChild(cbCell);

    // Nhân viên
    const nvCell = document.createElement("td");
    nvCell.classList.add("px-4", "py-3", "text-sm", "font-medium", "text-gray-800");
    nvCell.textContent = schedule.ho_ten || "N/A";
    row.appendChild(nvCell);

    // SĐT
    const sdtCell = document.createElement("td");
    sdtCell.classList.add("px-4", "py-3", "text-sm", "text-gray-600");
    sdtCell.textContent = schedule.sdt || "--";
    row.appendChild(sdtCell);

    // Email
    const emailCell = document. createElement("td");
    emailCell.classList.add("px-4", "py-3", "text-sm", "text-gray-600");
    emailCell.textContent = schedule.email || "--";
    row.appendChild(emailCell);

    // Ngày làm
    const dateCell = document.createElement("td");
    dateCell.classList.add("px-4", "py-3", "text-sm", "text-gray-700", "font-medium");
    dateCell.textContent = formatDateDisplay(new Date(schedule.ngay_lam));
    row.appendChild(dateCell);

    // Ca làm
    const caCell = document.createElement("td");
    caCell.classList.add("px-4", "py-3", "text-sm", "text-gray-700");
    caCell.textContent = schedule.ten_ca || "--";
    row.appendChild(caCell);

    // Giờ làm
    const timeCell = document.createElement("td");
    timeCell.classList.add("px-4", "py-3", "text-sm", "text-gray-600");
    timeCell.textContent = `${formatTime(schedule.thoi_gian_thuc_te_bat_dau)} - ${formatTime(schedule. thoi_gian_thuc_te_ket_thuc)}`;
    row.appendChild(timeCell);

    // Thao tác
    const actionCell = document.createElement("td");
    actionCell.classList.add("px-4", "py-3", "text-center");
    actionCell.innerHTML = `
      <div class="flex gap-2 justify-center flex-wrap">
        <button onclick="approveSchedule(${schedule. lich_id})" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition" title="Duyệt lịch">
          ✓
        </button>
        <button onclick="rejectSchedule(${schedule.lich_id})" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition" title="Từ chối lịch">
          ✕
        </button>
        <button onclick="openEditScheduleModal(${schedule. lich_id})" class="bg-blue-600 hover: bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition" title="Chỉnh sửa">
          ✎
        </button>
      </div>
    `;
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

// =============================================
// STATISTICS
// =============================================

/**
 * Tính toán thống kê
 */
function calculateStats() {
  const stats = {
    total: 0,
    filled: 0,      // >= 3 người
    understaffed: 0, // < 3 người
    full: 0,         // 9 người
    empty: 0         // 0 người
  };

  allCaLam. forEach(ca => {
    const schedulesForCa = allSchedules.filter(s => s.ca_id === ca.ca_id);
    const count = schedulesForCa.length;

    stats.total++;

    if (count === 0) {
      stats.empty++;
    } else if (count >= 9) {
      stats.full++;
    } else if (count >= 3) {
      stats.filled++;
    } else {
      stats.understaffed++;
    }
  });

  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statFilled").textContent = stats.filled;
  document.getElementById("statUnderstaffed").textContent = stats.understaffed;
  document.getElementById("statFull").textContent = stats.full;
  document.getElementById("statEmpty").textContent = stats.empty;
}

// =============================================
// MODAL FUNCTIONS
// =============================================

/**
 * Mở modal thêm lịch
 */
function openAddScheduleModal() {
  const form = document.getElementById("addScheduleForm");
  if (form) form.reset();
  const modal = document.getElementById("addScheduleModal");
  if (modal) modal.classList.remove("hidden");
}

/**
 * Đóng modal thêm lịch
 */
function closeAddScheduleModal() {
  const modal = document. getElementById("addScheduleModal");
  if (modal) modal.classList.add("hidden");
}

/**
 * Xử lý thay đổi ca làm (tự động fill giờ)
 */
function handleCaLamChange() {
  const caId = document.getElementById("caLamSelect")?.value;
  const batDauInput = document.getElementById("batDauInput");
  const ketThucInput = document.getElementById("ketThucInput");
  
  if (! caId || !batDauInput || !ketThucInput) return;

  const ca = allCaLam.find(c => c.ca_id == caId);
  if (ca) {
    batDauInput.value = ca. thoi_gian_bat_dau;
    ketThucInput.value = ca.thoi_gian_ket_thuc;
  }
}

/**
 * Xử lý thêm lịch làm
 */
async function handleAddSchedule(event) {
  event.preventDefault();

  const nhanVienId = document.getElementById("nhanVienSelect")?.value;
  const ngayLam = document.getElementById("ngayLamInput")?.value;
  const caId = document.getElementById("caLamSelect")?.value;
  const batDau = document.getElementById("batDauInput")?.value;
  const ketThuc = document.getElementById("ketThucInput")?.value;
  const trangThai = document.getElementById("trangThaiSelect")?.value;

  if (!nhanVienId || !ngayLam) {
    showNotification("❌ Vui lòng điền đủ thông tin bắt buộc", "error");
    return;
  }

  const data = {
    nhan_vien_id: parseInt(nhanVienId),
    ca_id: caId ?  parseInt(caId) : null,
    ngay_lam:  ngayLam,
    thoi_gian_bat_dau: batDau || null,
    thoi_gian_ket_thuc:  ketThuc || null,
    trang_thai: trangThai || "Đăng ký"
  };

  try {
    const response = await fetch(LICH_LAM_API, {
      method: "POST",
      headers:  { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (! response.ok) {
      throw new Error(result.message || "Lỗi thêm lịch làm");
    }

    showNotification("✓ Thêm lịch làm việc thành công", "success");
    closeAddScheduleModal();
    loadScheduleByWeek();
  } catch (error) {
    console.error("❌ Lỗi handleAddSchedule:", error);
    showNotification("❌ Lỗi:  " + error.message, "error");
  }
}

/**
 * Mở modal chỉnh sửa lịch
 */
async function openEditScheduleModal(lichId) {
  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`);
    if (!response.ok) throw new Error("Lỗi tải dữ liệu lịch");

    const result = await response.json();
    const schedule = Array.isArray(result) ? result[0] : (result.data || result);

    document.getElementById("editLichId").value = lichId;
    document.getElementById("editNhanVienDisplay").value = schedule.ho_ten;
    document.getElementById("editNgayLamInput").value = formatDate(schedule.ngay_lam);
    document.getElementById("editBatDauInput").value = schedule.thoi_gian_bat_dau || "";
    document.getElementById("editKetThucInput").value = schedule.thoi_gian_ket_thuc || "";
    document.getElementById("editTrangThaiSelect").value = schedule.trang_thai;

    // Populate ca lam select
    const caSelect = document.getElementById("editCaLamSelect");
    caSelect.innerHTML = "";
    allCaLam. forEach(ca => {
      const option = document.createElement("option");
      option.value = ca. ca_id;
      option. textContent = `${ca.ten_ca} (${formatTime(ca.thoi_gian_bat_dau)} - ${formatTime(ca.thoi_gian_ket_thuc)})`;
      if (ca.ca_id === schedule.ca_id) option.selected = true;
      caSelect.appendChild(option);
    });

    document.getElementById("editScheduleModal").classList.remove("hidden");
  } catch (error) {
    console.error("❌ Lỗi openEditScheduleModal:", error);
    showNotification("❌ Lỗi tải thông tin lịch:  " + error.message, "error");
  }
}

/**
 * Đóng modal chỉnh sửa lịch
 */
function closeEditScheduleModal() {
  const modal = document.getElementById("editScheduleModal");
  if (modal) modal.classList.add("hidden");
}

/**
 * Xử lý thay đổi ca làm trong modal chỉnh sửa
 */
function handleEditCaLamChange() {
  const caId = document.getElementById("editCaLamSelect")?.value;
  const batDauInput = document.getElementById("editBatDauInput");
  const ketThucInput = document.getElementById("editKetThucInput");
  
  if (!caId || !batDauInput || !ketThucInput) return;

  const ca = allCaLam.find(c => c.ca_id == caId);
  if (ca) {
    batDauInput.value = ca. thoi_gian_bat_dau;
    ketThucInput.value = ca.thoi_gian_ket_thuc;
  }
}

/**
 * Xử lý chỉnh sửa lịch làm
 */
async function handleEditSchedule(event) {
  event.preventDefault();

  const lichId = document.getElementById("editLichId")?.value;
  const caId = document.getElementById("editCaLamSelect")?.value;
  const ngayLam = document.getElementById("editNgayLamInput")?.value;
  const batDau = document.getElementById("editBatDauInput")?.value;
  const ketThuc = document.getElementById("editKetThucInput")?.value;
  const trangThai = document. getElementById("editTrangThaiSelect")?.value;

  const data = {
    ca_id: caId ?  parseInt(caId) : null,
    ngay_lam: ngayLam,
    thoi_gian_bat_dau: batDau || null,
    thoi_gian_ket_thuc: ketThuc || null,
    trang_thai:  trangThai
  };

  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Lỗi cập nhật lịch làm");
    }

    showNotification("✓ Cập nhật lịch làm việc thành công", "success");
    closeEditScheduleModal();
    loadScheduleByWeek();
  } catch (error) {
    console.error("❌ Lỗi handleEditSchedule:", error);
    showNotification("❌ Lỗi: " + error.message, "error");
  }
}

// =============================================
// APPROVAL FUNCTIONS
// =============================================

/**
 * Duyệt lịch làm
 */
async function approveSchedule(lichId) {
  if (!confirm("Bạn có chắc chắn muốn duyệt lịch này?")) return;

  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "Đã xác nhận" })
    });

    if (!response.ok) throw new Error("Lỗi duyệt lịch");

    showNotification("✓ Đã duyệt lịch làm việc", "success");
    loadScheduleByWeek();
  } catch (error) {
    console.error("❌ Lỗi approveSchedule:", error);
    showNotification("❌ Lỗi: " + error.message, "error");
  }
}

/**
 * Từ chối lịch làm
 */
async function rejectSchedule(lichId) {
  if (!confirm("Bạn có chắc chắn muốn từ chối lịch này?")) return;

  try {
    const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: "Hủy" })
    });

    if (!response.ok) throw new Error("Lỗi từ chối lịch");

    showNotification("✓ Đã từ chối lịch làm việc", "success");
    loadScheduleByWeek();
  } catch (error) {
    console.error("❌ Lỗi rejectSchedule:", error);
    showNotification("❌ Lỗi: " + error. message, "error");
  }
}

/**
 * Duyệt tất cả lịch đã chọn
 */
async function approveSelectedSchedules() {
  // FIX: Loại bỏ space trong selector
  const checkboxes = document.querySelectorAll(".pendingCheckbox:checked");
  
  if (checkboxes.length === 0) {
    showNotification("⚠️ Vui lòng chọn ít nhất 1 lịch để duyệt", "warning");
    return;
  }

  // Confirm trước khi duyệt
  if (! confirm(`Bạn có chắc chắn muốn duyệt ${checkboxes.length} lịch?`)) {
    return;
  }

  // Tạo loading state
  showNotification(`⏳ Đang duyệt ${checkboxes. length} lịch... `, "info");

  let successCount = 0;
  let failCount = 0;
  const failedIds = [];

  // Duyệt từng lịch
  for (const checkbox of checkboxes) {
    try {
      const lichId = checkbox.value;
      
      const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
        method: "PUT",
        headers:  { "Content-Type": "application/json" },
        body:  JSON.stringify({ trang_thai: "Đã xác nhận" })
      });

      const result = await response.json();

      if (response.ok) {
        successCount++;
        console.log(`✓ Duyệt lịch ${lichId} thành công`);
      } else {
        failCount++;
        failedIds.push(lichId);
        console.error(`❌ Lỗi duyệt lịch ${lichId}: `, result.message);
      }
    } catch (error) {
      failCount++;
      console.error("❌ Lỗi duyệt lịch:", error);
    }
  }

  // Hiển thị thông báo kết quả
  if (successCount === checkboxes.length) {
    showNotification(`✓ Đã duyệt ${successCount}/${checkboxes.length} lịch thành công`, "success");
  } else if (successCount > 0) {
    showNotification(
      `⚠️ Duyệt ${successCount}/${checkboxes.length} lịch.  Lỗi: ${failCount} lịch (ID:  ${failedIds.join(", ")})`,
      "warning"
    );
  } else {
    showNotification(`❌ Duyệt thất bại cho tất cả ${checkboxes.length} lịch`, "error");
  }

  // Reload dữ liệu sau 300ms
  setTimeout(() => {
    loadScheduleByWeek();
    loadPendingSchedules();
  }, 300);
}

/**
 * Từ chối tất cả lịch đã chọn
 */
async function rejectSelectedSchedules() {
  // FIX: Loại bỏ space trong selector
  const checkboxes = document.querySelectorAll(".pendingCheckbox:checked");
  
  if (checkboxes.length === 0) {
    showNotification("⚠️ Vui lòng chọn ít nhất 1 lịch để từ chối", "warning");
    return;
  }

  // Confirm trước khi từ chối
  if (!confirm(`Bạn có chắc chắn muốn từ chối ${checkboxes.length} lịch?`)) {
    return;
  }

  // Tạo loading state
  showNotification(`⏳ Đang từ chối ${checkboxes.length} lịch...`, "info");

  let successCount = 0;
  let failCount = 0;
  const failedIds = [];

  // Từ chối từng lịch
  for (const checkbox of checkboxes) {
    try {
      const lichId = checkbox. value;
      
      const response = await fetch(`${LICH_LAM_API}/${lichId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: "Hủy" })
      });

      const result = await response.json();

      if (response.ok) {
        successCount++;
        console. log(`✓ Từ chối lịch ${lichId} thành công`);
      } else {
        failCount++;
        failedIds.push(lichId);
        console.error(`❌ Lỗi từ chối lịch ${lichId}:`, result.message);
      }
    } catch (error) {
      failCount++;
      console.error("❌ Lỗi từ chối lịch:", error);
    }
  }

  // Hiển thị thông báo kết quả
  if (successCount === checkboxes.length) {
    showNotification(`✓ Đã từ chối ${successCount}/${checkboxes.length} lịch thành công`, "success");
  } else if (successCount > 0) {
    showNotification(
      `⚠️ Từ chối ${successCount}/${checkboxes.length} lịch. Lỗi: ${failCount} lịch (ID: ${failedIds.join(", ")})`,
      "warning"
    );
  } else {
    showNotification(`❌ Từ chối thất bại cho tất cả ${checkboxes.length} lịch`, "error");
  }

  // Reload dữ liệu sau 300ms
  setTimeout(() => {
    loadScheduleByWeek();
    loadPendingSchedules();
  }, 300);
}

/**
 * Toggle tất cả checkbox chờ duyệt
 */
function toggleAllPendingCheckboxes() {
  const allCheckbox = document.getElementById("selectAllPending");
  const checkboxes = document.querySelectorAll(".pendingCheckbox");
  checkboxes.forEach(cb => (cb.checked = allCheckbox. checked));
}

// =============================================
// NAVIGATION FUNCTIONS
// =============================================

/**
 * Đi tới tuần trước
 */
function goToPreviousWeek() {
  const weekPicker = document.getElementById("weekPicker");
  const [year, week] = weekPicker.value. split("-W");
  let weekNo = parseInt(week) - 1;
  let yearNo = parseInt(year);

  if (weekNo < 1) {
    yearNo--;
    weekNo = 52;
  }

  weekPicker.value = `${yearNo}-W${String(weekNo).padStart(2, "0")}`;
  loadScheduleByWeek();
}

/**
 * Đi tới tuần sau
 */
function goToNextWeek() {
  const weekPicker = document.getElementById("weekPicker");
  const [year, week] = weekPicker. value.split("-W");
  let weekNo = parseInt(week) + 1;
  let yearNo = parseInt(year);

  if (weekNo > 52) {
    yearNo++;
    weekNo = 1;
  }

  weekPicker.value = `${yearNo}-W${String(weekNo).padStart(2, "0")}`;
  loadScheduleByWeek();
}

// =============================================
// NOTIFICATION FUNCTION
// =============================================

/**
 * Hiển thị thông báo (chỉ dùng Tailwind)
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  const baseClasses = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-pulse";

  if (type === "success") {
    notification.className = baseClasses + " bg-green-600";
  } else if (type === "error") {
    notification.className = baseClasses + " bg-red-600";
  } else if (type === "warning") {
    notification.className = baseClasses + " bg-yellow-600";
  } else {
    notification.className = baseClasses + " bg-blue-600";
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ============================================= Gửi lịch làm qua email =============================================
// Mở modal gửi email
function sendScheduleByEmail() {
    document.getElementById('sendEmailModal').classList.remove('hidden');
    document.getElementById('recipientEmail').focus();
}

// Đóng modal
function closeEmailModal() {
    document.getElementById('sendEmailModal').classList.add('hidden');
    document.getElementById('recipientEmail').value = '';
    document.getElementById('emailNote').value = '';
    document.getElementById('emailError').classList.add('hidden');
    document.getElementById('emailError').textContent = '';
}

// Hàm lấy CHỈ tên nhân viên và thời gian ca làm từ bảng lịch theo tuần
function getScheduleDataFromTable() {
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    const dateHeaderRow = document.getElementById('dateHeaderRow');
    const dateHeaders = dateHeaderRow?.querySelectorAll('th');
    
    const scheduleData = {
        shifts: [],
        dates: []
    };
    
    // Lấy thông tin ngày
    if (dateHeaders && dateHeaders.length > 1) {
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        
        for (let i = 1; i < dateHeaders.length; i++) {
            const dateText = dateHeaders[i].textContent. trim();
            scheduleData.dates.push({
                dayName: dayNames[i - 1],
                date: dateText
            });
        }
    }

    // Lấy dữ liệu lịch từ tbody
    const rows = scheduleTableBody?.querySelectorAll('tr');
    
    if (rows) {
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
                const shiftName = cells[0].textContent. trim();
                
                // Bỏ qua dòng trống/placeholder
                if (shiftName.toLowerCase().includes('chọn tuần')) {
                    return;
                }

                const shiftData = {
                    name: shiftName,
                    days: []
                };

                // Lấy dữ liệu cho từng ngày
                for (let i = 1; i < cells.length; i++) {
                    let cellContent = cells[i].textContent. trim();
                    
                    // Trích xuất CHỈ tên nhân viên và thời gian
                    cellContent = cellContent
                        .replace(/✓/g, '')
                        .replace(/⚠️/g, '')
                        . replace(/\d+\/\d+/g, '')
                        .replace(/Đã xác nhận/gi, '')
                        .replace(/Hủy/gi, '')
                        .replace(/Trống/gi, '')
                        .replace(/\s+/g, ' ')
                        .trim();

                    shiftData.days.push({
                        day: i,
                        content: cellContent || '-'
                    });
                }

                scheduleData.shifts. push(shiftData);
            }
        });
    }

    return scheduleData;
}

// Hàm tách tên nhân viên và thời gian - lấy tất cả nhân viên
function parseEmployeeDataMultiple(content) {
    if (content === '-' || content === '') {
        return [];
    }

    // Split bằng ký tự xuống dòng hoặc theo pattern
    const lines = content.split(/\n+/);
    const employees = [];

    lines.forEach(line => {
        line = line.trim();
        if (line === '' || line === '-') return;

        // Tách dữ liệu theo định dạng "Tên Nhân Viên HH: MM - HH: MM"
        const timeRegex = /(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/;
        const match = line.match(timeRegex);
        
        if (match) {
            const time = match[1];
            const name = line.replace(timeRegex, '').trim();
            if (name) {
                employees. push({ name, time });
            }
        } else if (line.match(/\d{2}:\d{2}/)) {
            // Nếu có giờ nhưng không có format chuẩn
            const parts = line.split(/\s+/);
            const timeIdx = parts.findIndex(p => p.match(/\d{2}:\d{2}/));
            if (timeIdx !== -1) {
                const time = parts. slice(timeIdx).join(' ');
                const name = parts. slice(0, timeIdx).join(' ');
                if (name && time) {
                    employees. push({ name, time });
                }
            }
        }
    });

    return employees. length > 0 ? employees : [];
}

// Hàm tạo HTML email
function generateScheduleHtml(scheduleData, note) {
    const { shifts, dates } = scheduleData;

    // Tạo header ngày
    const dateHeaderHtml = dates.map((item) => `
        <th style="padding: 14px; text-align: center; font-weight: 600; font-size: 13px; border:  none; background-color: #f3f4f6;">
            <div style="font-size: 12px; color: #6b7280;">${item.dayName}</div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${item.date}</div>
        </th>
    `).join('');

    // Tạo hàng dữ liệu
    const shiftRowsHtml = shifts.map((shift, shiftIdx) => {
        const cellsHtml = shift.days.map((dayData) => {
            let bgColor = '#ffffff';
            let textColor = '#374151';
            
            // Nếu có dữ liệu (có nhân viên)
            if (dayData.content !== '-' && dayData.content !== '') {
                bgColor = '#dbeafe';
                textColor = '#1e40af';
            }

            // Tách tất cả nhân viên
            const employees = parseEmployeeDataMultiple(dayData.content);

            // Nếu không có nhân viên
            if (employees.length === 0) {
                return `
                    <td style="padding: 12px; text-align: left; font-size: 12px; color: ${textColor}; background-color: ${bgColor}; border: 1px solid #e5e7eb; min-height: 50px;">
                        -
                    </td>
                `;
            }

            // Tạo table con với 2 cột:  Thời gian | Tên nhân viên
            const employeeTable = `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    ${employees.map((emp, idx) => `
                        <tr>
                            <td style="padding: 4px 6px; border-right: 1px solid rgba(0,0,0,0.1); font-weight: 600; width: 70px; font-size: 11px;">
                                ${emp.time}
                            </td>
                            <td style="padding:  4px 6px; font-size: 11px;">
                                ${emp.name}
                            </td>
                        </tr>
                    `).join('')}
                </table>
            `;

            return `
                <td style="padding:  0; text-align: left; font-size: 12px; color: ${textColor}; background-color: ${bgColor}; border: 1px solid #e5e7eb; min-height: 50px;">
                    ${employeeTable}
                </td>
            `;
        }).join('');

        return `
            <tr style="border-bottom: 1px solid #e5e7eb; ${shiftIdx % 2 === 0 ?  'background-color: #f9fafb;' : ''}">
                <td style="padding: 12px; font-weight: 600; color: #1f2937; background-color: ${shiftIdx % 2 === 0 ? '#f9fafb' : '#ffffff'}; border: 1px solid #e5e7eb; min-width: 100px;">
                    ${shift.name}
                </td>
                ${cellsHtml}
            </tr>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lịch làm việc</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 1000px; background-color: white; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background:  linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 32px; font-weight: 700;">📊 Lịch Làm Việc Theo Tuần</h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding:  30px;">
                                    <!-- Schedule Table -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                                        <thead>
                                            <tr style="background-color: #e5e7eb;">
                                                <th style="padding: 14px; text-align: left; font-weight: 600; font-size: 13px; border: 1px solid #d1d5db; min-width: 100px;">
                                                    Ca làm
                                                </th>
                                                ${dateHeaderHtml}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${shiftRowsHtml}
                                        </tbody>
                                    </table>

                                    <!-- Note Section -->
                                    ${note ?  `
                                    <div style="background-color:  #f0f4ff; padding: 18px; border-left: 4px solid #2563eb; border-radius: 8px; margin-top: 20px;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #333; font-size: 14px;">📝 Ghi chú:</p>
                                        <p style="margin: 0; color: #555; white-space: pre-wrap; font-size: 13px; line-height: 1.6;">${note}</p>
                                    </div>
                                    ` : ''}
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                                    Email được gửi lúc ${new Date().toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

// Hiển thị toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
    
    if (type === 'success') {
        toast.classList.add('bg-green-500');
    } else if (type === 'error') {
        toast.classList.add('bg-red-500');
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re. test(email);
}

// Gửi email
async function confirmSendEmail() {
    const recipientEmail = document.getElementById('recipientEmail').value.trim();
    const note = document.getElementById('emailNote').value.trim();
    const emailError = document.getElementById('emailError');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const sendBtnText = document.getElementById('sendBtnText');
    const sendBtnSpinner = document.getElementById('sendBtnSpinner');

    // Clear previous error
    emailError.classList.add('hidden');
    emailError.textContent = '';

    // Validate email
    if (!recipientEmail) {
        emailError.textContent = '⚠️ Vui lòng nhập email người nhận! ';
        emailError.classList. remove('hidden');
        return;
    }

    if (!validateEmail(recipientEmail)) {
        emailError.textContent = '⚠️ Email không hợp lệ!';
        emailError.classList.remove('hidden');
        return;
    }

    try {
        // Lấy dữ liệu lịch từ bảng
        const scheduleData = getScheduleDataFromTable();

        if (! scheduleData. shifts || scheduleData.shifts. length === 0) {
            showToast('❌ Không có lịch làm nào để gửi!  Vui lòng chọn tuần trước. ', 'error');
            return;
        }

        // Disable button và show loading
        sendEmailBtn.disabled = true;
        sendBtnText.classList.add('hidden');
        sendBtnSpinner.classList.remove('hidden');

        // Tạo HTML email
        const htmlContent = generateScheduleHtml(scheduleData, note);

        // Gửi request đến API
        const response = await fetch('http://localhost:3000/mail/sendmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: recipientEmail,
                subject: `📊 Lịch làm việc - ${new Date().toLocaleDateString('vi-VN')}`,
                html: htmlContent,
                text: `Lịch làm việc được gửi vào ${new Date().toLocaleString('vi-VN')}`
            })
        });

        const result = await response.json();

        // Reset button
        sendEmailBtn.disabled = false;
        sendBtnText.classList.remove('hidden');
        sendBtnSpinner.classList.add('hidden');

        if (response.ok) {
            showToast('✅ Gửi email thành công! ', 'success');
            closeEmailModal();
        } else {
            showToast(`❌ Lỗi:  ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        
        // Reset button
        sendEmailBtn.disabled = false;
        sendBtnText.classList.remove('hidden');
        sendBtnSpinner. classList.add('hidden');
        
        showToast('❌ Lỗi:  ' + error.message, 'error');
    }
}

// Đóng modal khi click outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('sendEmailModal');
    
    modal?. addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEmailModal();
        }
    });

    // Enter key để gửi
    document.getElementById('recipientEmail')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmSendEmail();
        }
    });
});





//============================================== Lương =============================================
// QUẢN LÝ THƯỞNG PHẠT
// ============================================

const THUONG_PHAT_API = "/chitietthuongphat";
const LUONG_API_TP = "/luong";

let allThuongPhat = [];
let allLuongForSelect = [];
let employeesForThuongPhat = [];

// Load danh sách thưởng phạt
async function loadThuongPhat() {
    try {
        const res = await fetch(`${THUONG_PHAT_API}/laytatca`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        allThuongPhat = Array.isArray(data) ? data : (data.data || []);

        console.log("✓ Đã tải danh sách thưởng phạt:", allThuongPhat.length);
        
        // Load thêm dữ liệu liên quan
        await loadLuongForSelect();
        
        renderThuongPhatTable(allThuongPhat);
        calculateThuongPhatStats();
    } catch (error) {
        console.error("❌ Lỗi loadThuongPhat:", error);
        showToast("Không thể tải danh sách thưởng phạt", "error");

        const tbody = document.getElementById("thuongPhatTable");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">❌ Lỗi tải dữ liệu</td></tr>`;
        }
    }
}

// Load danh sách lương cho select
async function loadLuongForSelect() {
    try {
        const res = await fetch(`${LUONG_API_TP}/laytatca`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        allLuongForSelect = Array.isArray(data) ? data : (data.data || []);

        // Load thêm danh sách nhân viên để hiển thị tên
        const resNV = await fetch("/nhanvien/laytatca");
        const dataNV = await resNV.json();
        employeesForThuongPhat = Array.isArray(dataNV) ? dataNV : (dataNV.data || []);

        populateLuongSelects();
    } catch (error) {
        console.error("❌ Lỗi loadLuongForSelect:", error);
    }
}

// Populate các select lương
function populateLuongSelects() {
    const select = document.getElementById("thuongPhatLuongId");
    const filterSelect = document.getElementById("filterThuongPhatLuong");

    if (select) {
        select.innerHTML = '<option value="">-- Chọn bảng lương --</option>';
        allLuongForSelect.forEach(luong => {
            const nv = employeesForThuongPhat.find(e => e.nhan_vien_id === luong.nhan_vien_id);
            const tenNV = nv ? nv.ho_ten : `NV #${luong.nhan_vien_id}`;
            select.innerHTML += `<option value="${luong.luong_id}">${tenNV} - Tháng ${luong.thang}/${luong.nam}</option>`;
        });
    }

    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">-- Tất cả --</option>';
        allLuongForSelect.forEach(luong => {
            const nv = employeesForThuongPhat.find(e => e.nhan_vien_id === luong.nhan_vien_id);
            const tenNV = nv ? nv.ho_ten : `NV #${luong.nhan_vien_id}`;
            filterSelect.innerHTML += `<option value="${luong.luong_id}">${tenNV} - ${luong.thang}/${luong.nam}</option>`;
        });
    }
}

// Render bảng thưởng phạt
function renderThuongPhatTable(items) {
    const tbody = document.getElementById("thuongPhatTable");
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-500">
                    <div class="flex flex-col items-center gap-2">
                        <span class="text-4xl">📋</span>
                        <span>Chưa có dữ liệu thưởng phạt</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        const soTien = Number(item.so_tien || 0).toLocaleString('vi-VN');
        const ngayApDung = item.ngay_ap_dung
            ? new Date(item.ngay_ap_dung).toLocaleDateString('vi-VN')
            : '—';

        const isThuong = item.loai === 'Thuong' || item.loai === 'thuong';
        const loaiClass = isThuong ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        const loaiText = isThuong ? '🎁 Thưởng' : '⚠️ Phạt';
        const soTienClass = isThuong ? 'text-green-600' : 'text-red-600';
        const soTienPrefix = isThuong ? '+' : '-';

        // Tìm thông tin bảng lương và nhân viên
        const luong = allLuongForSelect.find(l => l.luong_id === item.luong_id);
        let luongInfo = `#${item.luong_id}`;
        if (luong) {
            const nv = employeesForThuongPhat.find(e => e.nhan_vien_id === luong.nhan_vien_id);
            const tenNV = nv ? nv.ho_ten : `NV #${luong.nhan_vien_id}`;
            luongInfo = `${tenNV} - T${luong.thang}/${luong.nam}`;
        }

        html += `
            <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-center text-gray-600">${index + 1}</td>
                <td class="px-4 py-3">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                        ${luongInfo}
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="${loaiClass} px-3 py-1 rounded-full text-sm font-semibold">
                        ${loaiText}
                    </span>
                </td>
                <td class="px-4 py-3 text-right">
                    <span class="${soTienClass} font-bold text-lg">${soTienPrefix}${soTien}đ</span>
                </td>
                <td class="px-4 py-3 text-gray-700 max-w-xs">
                    <span class="line-clamp-2" title="${item.ly_do || ''}">${item.ly_do || '—'}</span>
                </td>
                <td class="px-4 py-3 text-center text-sm text-gray-500">${ngayApDung}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex gap-1 justify-center">
                        <button onclick="editThuongPhat(${item.chi_tiet_id})" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors">
                            ✏️ Sửa
                        </button>
                        <button onclick="deleteThuongPhat(${item.chi_tiet_id})" 
                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors">
                            🗑️ Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Tính thống kê thưởng phạt
function calculateThuongPhatStats() {
    const totalThuong = allThuongPhat
        .filter(item => item.loai === 'Thuong' || item.loai === 'thuong')
        .reduce((sum, item) => sum + Number(item.so_tien || 0), 0);

    const totalPhat = allThuongPhat
        .filter(item => item.loai === 'Phat' || item.loai === 'phat')
        .reduce((sum, item) => sum + Number(item.so_tien || 0), 0);

    const countThuong = allThuongPhat.filter(item => item.loai === 'Thuong' || item.loai === 'thuong').length;
    const countPhat = allThuongPhat.filter(item => item.loai === 'Phat' || item.loai === 'phat').length;

    const statTotalThuong = document.getElementById("statTotalThuong");
    const statTotalPhat = document.getElementById("statTotalPhat");
    const statCountThuong = document.getElementById("statCountThuong");
    const statCountPhat = document.getElementById("statCountPhat");

    if (statTotalThuong) statTotalThuong.textContent = '+' + totalThuong.toLocaleString('vi-VN') + 'đ';
    if (statTotalPhat) statTotalPhat.textContent = '-' + totalPhat.toLocaleString('vi-VN') + 'đ';
    if (statCountThuong) statCountThuong.textContent = countThuong;
    if (statCountPhat) statCountPhat.textContent = countPhat;
}

// Lọc thưởng phạt
function filterThuongPhat() {
    const filterLoai = document.getElementById("filterThuongPhatLoai")?.value;
    const filterLuong = document.getElementById("filterThuongPhatLuong")?.value;

    let filtered = [...allThuongPhat];

    if (filterLoai) {
        filtered = filtered.filter(item => item.loai === filterLoai);
    }

    if (filterLuong) {
        filtered = filtered.filter(item => item.luong_id === parseInt(filterLuong));
    }

    renderThuongPhatTable(filtered);
}

// Reset bộ lọc
function resetThuongPhatFilter() {
    const filterLoai = document.getElementById("filterThuongPhatLoai");
    const filterLuong = document.getElementById("filterThuongPhatLuong");

    if (filterLoai) filterLoai.value = "";
    if (filterLuong) filterLuong.value = "";

    renderThuongPhatTable(allThuongPhat);
}

// Mở modal thêm thưởng phạt
async function openAddThuongPhatModal() {
    document.getElementById("thuongPhatModalTitle").textContent = "Thêm thưởng/phạt";
    document.getElementById("thuongPhatForm").reset();
    document.getElementById("thuongPhatId").value = "";

    // Set ngày hiện tại
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("thuongPhatNgay").value = today;

    await loadLuongForSelect();
    document.getElementById("thuongPhatModal").classList.remove("hidden");
    document.getElementById("thuongPhatModal").classList.add("flex");
}

// Đóng modal
function closeThuongPhatModal() {
    document.getElementById("thuongPhatModal").classList.add("hidden");
    document.getElementById("thuongPhatModal").classList.remove("flex");
}

// Sửa thưởng phạt - SỬA ENDPOINT
async function editThuongPhat(chiTietId) {
    try {
        // ✅ Đổi từ /layid/ sang /timtheoid/
        const res = await fetch(`${THUONG_PHAT_API}/timtheoid/${chiTietId}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu");

        const item = await res.json();

        await loadLuongForSelect();

        document.getElementById("thuongPhatModalTitle").textContent = "Sửa thưởng/phạt";
        document.getElementById("thuongPhatId").value = item.chi_tiet_id;
        document.getElementById("thuongPhatLuongId").value = item.luong_id;
        document.getElementById("thuongPhatLoai").value = item.loai;
        document.getElementById("thuongPhatSoTien").value = item.so_tien;
        document.getElementById("thuongPhatLyDo").value = item.ly_do || "";

        if (item.ngay_ap_dung) {
            const date = new Date(item.ngay_ap_dung).toISOString().split('T')[0];
            document.getElementById("thuongPhatNgay").value = date;
        }

        document.getElementById("thuongPhatModal").classList.remove("hidden");
        document.getElementById("thuongPhatModal").classList.add("flex");
    } catch (error) {
        console.error("❌ Lỗi editThuongPhat:", error);
        showToast("Không thể tải dữ liệu", "error");
    }
}

// Xóa thưởng phạt
async function deleteThuongPhat(chiTietId) {
    if (!confirm("Bạn có chắc muốn xóa mục thưởng/phạt này?")) return;

    try {
        const res = await fetch(`${THUONG_PHAT_API}/xoa/${chiTietId}`, { method: "DELETE" });

        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.error || result.message || "Không thể xóa");
        }

        showToast("Xóa thành công!", "success");
        loadThuongPhat();
    } catch (error) {
        console.error("❌ Lỗi deleteThuongPhat:", error);
        showToast("Lỗi: " + error.message, "error");
    }
}

// Submit form thưởng phạt - SỬA ENDPOINT
document.addEventListener("DOMContentLoaded", function () {
    const thuongPhatForm = document.getElementById("thuongPhatForm");
    if (thuongPhatForm) {
        thuongPhatForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const chiTietId = document.getElementById("thuongPhatId").value;
            const luongId = document.getElementById("thuongPhatLuongId").value;
            const loai = document.getElementById("thuongPhatLoai").value;
            const soTien = document.getElementById("thuongPhatSoTien").value;
            const lyDo = document.getElementById("thuongPhatLyDo").value.trim();
            const ngayApDung = document.getElementById("thuongPhatNgay").value;

            if (!luongId || !loai || !soTien) {
                showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
                return;
            }

            const payload = {
                luong_id: parseInt(luongId),
                loai: loai,
                so_tien: parseFloat(soTien),
                ly_do: lyDo || null,
                ngay_ap_dung: ngayApDung || null
            };

            console.log("📤 Payload gửi đi:", payload);

            try {
                // ✅ Đổi từ /sua/ sang /capnhat/
                const url = chiTietId
                    ? `${THUONG_PHAT_API}/capnhat/${chiTietId}`
                    : `${THUONG_PHAT_API}/them`;
                const method = chiTietId ? "PUT" : "POST";

                console.log("📤 URL:", url, "Method:", method);

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                console.log("📥 Response:", result);

                if (!res.ok) {
                    throw new Error(result.error || result.message || "Lỗi khi lưu");
                }

                showToast(chiTietId ? "Cập nhật thành công!" : "Thêm thành công!", "success");
                closeThuongPhatModal();
                loadThuongPhat();
            } catch (error) {
                console.error("❌ Lỗi submit thưởng phạt:", error);
                showToast("Lỗi: " + error.message, "error");
            }
        });
    }
});

// Export functions to window
window.openAddThuongPhatModal = openAddThuongPhatModal;
window.closeThuongPhatModal = closeThuongPhatModal;
window.editThuongPhat = editThuongPhat;
window.deleteThuongPhat = deleteThuongPhat;
window.filterThuongPhat = filterThuongPhat;
window.resetThuongPhatFilter = resetThuongPhatFilter;
window.loadThuongPhat = loadThuongPhat;

//=========================Quan ly luong =============================
// ...existing code...

// ============================================
// QUẢN LÝ LƯƠNG
// ============================================

const LUONG_API = "/luong";

let allLuong = [];
let employeesForLuong = [];

// Load danh sách lương
async function loadLuong() {
    try {
        const res = await fetch(`${LUONG_API}/laytatca`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        allLuong = Array.isArray(data) ? data : (data.data || []);

        console.log("✓ Đã tải danh sách lương:", allLuong.length);

        // Load nhân viên cho select
        await loadEmployeesForLuong();

        renderLuongTable(allLuong);
        calculateLuongStats();
    } catch (error) {
        console.error("❌ Lỗi loadLuong:", error);
        showToast("Không thể tải danh sách lương", "error");

        const tbody = document.getElementById("luongTable");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-red-500">❌ Lỗi tải dữ liệu</td></tr>`;
        }
    }
}

// Load danh sách nhân viên cho select
async function loadEmployeesForLuong() {
    try {
        const res = await fetch("/nhanvien/laytatca");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        employeesForLuong = Array.isArray(data) ? data : (data.data || []);

        populateLuongEmployeeSelects();
    } catch (error) {
        console.error("❌ Lỗi loadEmployeesForLuong:", error);
    }
}

// Populate select nhân viên
function populateLuongEmployeeSelects() {
    const select = document.getElementById("luongNhanVienId");
    const filterSelect = document.getElementById("filterLuongNhanVien");

    if (select) {
        select.innerHTML = '<option value="">-- Chọn nhân viên --</option>';
        employeesForLuong.forEach(nv => {
            select.innerHTML += `<option value="${nv.nhan_vien_id}">${nv.ho_ten} (${nv.sdt || 'N/A'})</option>`;
        });
    }

    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">-- Tất cả --</option>';
        employeesForLuong.forEach(nv => {
            filterSelect.innerHTML += `<option value="${nv.nhan_vien_id}">${nv.ho_ten}</option>`;
        });
    }
}

// Render bảng lương
function renderLuongTable(items) {
    const tbody = document.getElementById("luongTable");
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-8 text-gray-500">
                    <div class="flex flex-col items-center gap-2">
                        <span class="text-4xl">💰</span>
                        <span>Chưa có dữ liệu lương</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        const luongCoBan = Number(item.luong_co_ban || 0).toLocaleString('vi-VN');
        const tongThuong = Number(item.tong_thuong || 0).toLocaleString('vi-VN');
        const tongPhat = Number(item.tong_phat || 0).toLocaleString('vi-VN');
        const tongLuong = Number(item.tong_luong || 0).toLocaleString('vi-VN');
        const ngayTinhLuong = item.ngay_tinh_luong
            ? new Date(item.ngay_tinh_luong).toLocaleDateString('vi-VN')
            : '—';

        // Sử dụng tên từ JOIN hoặc fallback
        const tenNhanVien = item.ten_nhan_vien || `NV #${item.nhan_vien_id}`;

        html += `
            <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td class="px-3 py-3 text-center text-gray-600">${index + 1}</td>
                <td class="px-3 py-3">
                    <div class="font-medium text-gray-800">${tenNhanVien}</div>
                    <div class="text-xs text-gray-500">${item.sdt_nhan_vien || ''}</div>
                </td>
                <td class="px-3 py-3 text-center">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                        T${item.thang}/${item.nam}
                    </span>
                </td>
                <td class="px-3 py-3 text-right font-medium text-gray-700">${luongCoBan}đ</td>
                <td class="px-3 py-3 text-center">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-semibold">
                        ${item.so_ca_lam || 0}
                    </span>
                </td>
                <td class="px-3 py-3 text-right text-green-600 font-medium">+${tongThuong}đ</td>
                <td class="px-3 py-3 text-right text-red-600 font-medium">-${tongPhat}đ</td>
                <td class="px-3 py-3 text-right">
                    <span class="text-lg font-bold text-orange-600">${tongLuong}đ</span>
                </td>
                <td class="px-3 py-3 text-center text-sm text-gray-500">${ngayTinhLuong}</td>
                <td class="px-3 py-3 text-center">
                    <div class="flex gap-1 justify-center">
                        <button onclick="viewLuongDetail(${item.luong_id})" 
                                class="bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-sm transition-colors" title="Chi tiết">
                            👁️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Tính thống kê lương
function calculateLuongStats() {
    const totalLuong = allLuong.reduce((sum, item) => sum + Number(item.tong_luong || 0), 0);
    const totalThuong = allLuong.reduce((sum, item) => sum + Number(item.tong_thuong || 0), 0);
    const totalPhat = allLuong.reduce((sum, item) => sum + Number(item.tong_phat || 0), 0);
    const totalCaLam = allLuong.reduce((sum, item) => sum + Number(item.so_ca_lam || 0), 0);

    const statTotalLuong = document.getElementById("statTotalLuong");
    const statTotalThuongLuong = document.getElementById("statTotalThuongLuong");
    const statTotalPhatLuong = document.getElementById("statTotalPhatLuong");
    const statTotalCaLam = document.getElementById("statTotalCaLam");

    if (statTotalLuong) statTotalLuong.textContent = totalLuong.toLocaleString('vi-VN') + 'đ';
    if (statTotalThuongLuong) statTotalThuongLuong.textContent = '+' + totalThuong.toLocaleString('vi-VN') + 'đ';
    if (statTotalPhatLuong) statTotalPhatLuong.textContent = '-' + totalPhat.toLocaleString('vi-VN') + 'đ';
    if (statTotalCaLam) statTotalCaLam.textContent = totalCaLam + ' ca';
}

// Lọc lương
function filterLuong() {
    const filterThang = document.getElementById("filterLuongThang")?.value;
    const filterNam = document.getElementById("filterLuongNam")?.value;
    const filterNhanVien = document.getElementById("filterLuongNhanVien")?.value;

    let filtered = [...allLuong];

    if (filterThang) {
        filtered = filtered.filter(item => item.thang === parseInt(filterThang));
    }

    if (filterNam) {
        filtered = filtered.filter(item => item.nam === parseInt(filterNam));
    }

    if (filterNhanVien) {
        filtered = filtered.filter(item => item.nhan_vien_id === parseInt(filterNhanVien));
    }

    renderLuongTable(filtered);
}

// Reset bộ lọc
function resetLuongFilter() {
    const filterThang = document.getElementById("filterLuongThang");
    const filterNam = document.getElementById("filterLuongNam");
    const filterNhanVien = document.getElementById("filterLuongNhanVien");

    if (filterThang) filterThang.value = "";
    if (filterNam) filterNam.value = "";
    if (filterNhanVien) filterNhanVien.value = "";

    renderLuongTable(allLuong);
}

// Mở modal thêm lương
// async function openAddLuongModal() {
//     document.getElementById("luongModalTitle").textContent = "Thêm bảng lương";
//     document.getElementById("luongForm").reset();
//     document.getElementById("luongId").value = "";

//     // Set tháng/năm hiện tại
//     const now = new Date();
//     document.getElementById("luongThang").value = now.getMonth() + 1;
//     document.getElementById("luongNam").value = now.getFullYear();

//     // Reset preview
//     updateLuongPreview();

//     await loadEmployeesForLuong();
//     document.getElementById("luongModal").classList.remove("hidden");
//     document.getElementById("luongModal").classList.add("flex");
// }

// Đóng modal
function closeLuongModal() {
    document.getElementById("luongModal").classList.add("hidden");
    document.getElementById("luongModal").classList.remove("flex");
}

// Xem chi tiết lương (hiển thị chi tiết thưởng phạt)
async function viewLuongDetail(luongId) {
    try {
        // Lấy thông tin lương
        const resLuong = await fetch(`${LUONG_API}/timtheoid/${luongId}`);
        if (!resLuong.ok) throw new Error("Không thể tải thông tin lương");
        const luong = await resLuong.json();

        // Lấy chi tiết thưởng phạt của bảng lương này
        const resTP = await fetch(`/chitietthuongphat/timkiem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ luong_id: luongId })
        });

        let chiTietTP = [];
        if (resTP.ok) {
            chiTietTP = await resTP.json();
        }

        // Hiển thị modal chi tiết
        showLuongDetailModal(luong, chiTietTP);
    } catch (error) {
        console.error("❌ Lỗi viewLuongDetail:", error);
        showToast("Không thể tải chi tiết lương", "error");
    }
}

// Hiển thị modal chi tiết lương
function showLuongDetailModal(luong, chiTietTP) {
    const tenNV = luong.ten_nhan_vien || `NV #${luong.nhan_vien_id}`;

    let tpHtml = '';
    if (chiTietTP && chiTietTP.length > 0) {
        chiTietTP.forEach(tp => {
            const isThuong = tp.loai === 'Thuong' || tp.loai === 'thuong';
            const icon = isThuong ? '🎁' : '⚠️';
            const colorClass = isThuong ? 'text-green-600' : 'text-red-600';
            const prefix = isThuong ? '+' : '-';
            const ngay = tp.ngay_ap_dung ? new Date(tp.ngay_ap_dung).toLocaleDateString('vi-VN') : '—';

            tpHtml += `
                <tr class="border-b">
                    <td class="py-2">${icon} ${isThuong ? 'Thưởng' : 'Phạt'}</td>
                    <td class="py-2 ${colorClass} font-medium">${prefix}${Number(tp.so_tien).toLocaleString('vi-VN')}đ</td>
                    <td class="py-2 text-gray-600">${tp.ly_do || '—'}</td>
                    <td class="py-2 text-gray-500 text-sm">${ngay}</td>
                </tr>
            `;
        });
    } else {
        tpHtml = `<tr><td colspan="4" class="py-4 text-center text-gray-500">Không có chi tiết thưởng phạt</td></tr>`;
    }

    const modalHtml = `
        <div id="luongDetailModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold">💰 Chi tiết lương - ${tenNV}</h3>
                        <button onclick="closeLuongDetailModal()" class="text-white/80 hover:text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <!-- Thông tin chung -->
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-500">Kỳ lương</p>
                            <p class="text-lg font-bold text-blue-600">Tháng ${luong.thang}/${luong.nam}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-500">Số ca làm</p>
                            <p class="text-lg font-bold text-purple-600">${luong.so_ca_lam || 0} ca</p>
                        </div>
                    </div>

                    <!-- Bảng tính lương -->
                    <div class="bg-gray-50 p-4 rounded-lg mb-6">
                        <h4 class="font-semibold text-gray-700 mb-3">📊 Bảng tính lương</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Lương cơ bản:</span>
                                <span class="font-medium">${Number(luong.luong_co_ban).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div class="flex justify-between text-green-600">
                                <span>Tổng thưởng:</span>
                                <span class="font-medium">+${Number(luong.tong_thuong).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div class="flex justify-between text-red-600">
                                <span>Tổng phạt:</span>
                                <span class="font-medium">-${Number(luong.tong_phat).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <hr class="my-2">
                            <div class="flex justify-between text-lg">
                                <span class="font-bold text-gray-800">TỔNG LƯƠNG:</span>
                                <span class="font-bold text-orange-600">${Number(luong.tong_luong).toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chi tiết thưởng phạt -->
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3">📋 Chi tiết thưởng/phạt</h4>
                        <table class="w-full text-sm">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="py-2 px-2 text-left">Loại</th>
                                    <th class="py-2 px-2 text-left">Số tiền</th>
                                    <th class="py-2 px-2 text-left">Lý do</th>
                                    <th class="py-2 px-2 text-left">Ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tpHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("luongDetailModal");
    if (existingModal) existingModal.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Đóng modal chi tiết lương
function closeLuongDetailModal() {
    const modal = document.getElementById("luongDetailModal");
    if (modal) modal.remove();
}

// Sửa lương
async function editLuong(luongId) {
    try {
        const res = await fetch(`${LUONG_API}/timtheoid/${luongId}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu");

        const item = await res.json();

        await loadEmployeesForLuong();

        document.getElementById("luongModalTitle").textContent = "Sửa bảng lương";
        document.getElementById("luongId").value = item.luong_id;
        document.getElementById("luongNhanVienId").value = item.nhan_vien_id;
        document.getElementById("luongThang").value = item.thang;
        document.getElementById("luongNam").value = item.nam;
        document.getElementById("luongCoBan").value = item.luong_co_ban;
        document.getElementById("luongSoCaLam").value = item.so_ca_lam || 0;
        document.getElementById("luongTongThuong").value = item.tong_thuong || 0;
        document.getElementById("luongTongPhat").value = item.tong_phat || 0;

        updateLuongPreview();

        document.getElementById("luongModal").classList.remove("hidden");
        document.getElementById("luongModal").classList.add("flex");
    } catch (error) {
        console.error("❌ Lỗi editLuong:", error);
        showToast("Không thể tải dữ liệu lương", "error");
    }
}

// Xóa lương
async function deleteLuong(luongId) {
    if (!confirm("Bạn có chắc muốn xóa bảng lương này?\n⚠️ Các chi tiết thưởng/phạt liên quan cũng sẽ bị xóa!")) return;

    try {
        const res = await fetch(`${LUONG_API}/xoa/${luongId}`, { method: "DELETE" });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || result.message || "Không thể xóa");
        }

        showToast("Xóa bảng lương thành công!", "success");
        loadLuong();
    } catch (error) {
        console.error("❌ Lỗi deleteLuong:", error);
        showToast("Lỗi: " + error.message, "error");
    }
}

// Cập nhật preview tổng lương
function updateLuongPreview() {
    const luongCoBan = parseFloat(document.getElementById("luongCoBan")?.value) || 0;
    const tongThuong = parseFloat(document.getElementById("luongTongThuong")?.value) || 0;
    const tongPhat = parseFloat(document.getElementById("luongTongPhat")?.value) || 0;

    const tongLuong = luongCoBan + tongThuong - tongPhat;

    const previewEl = document.getElementById("luongTongLuongPreview");
    if (previewEl) {
        previewEl.textContent = tongLuong.toLocaleString('vi-VN') + 'đ';
        previewEl.className = tongLuong >= 0
            ? "text-2xl font-bold text-green-600"
            : "text-2xl font-bold text-red-600";
    }
}

// Submit form lương
document.addEventListener("DOMContentLoaded", function () {
    const luongForm = document.getElementById("luongForm");
    if (luongForm) {
        luongForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const luongId = document.getElementById("luongId").value;
            const nhanVienId = document.getElementById("luongNhanVienId").value;
            const thang = document.getElementById("luongThang").value;
            const nam = document.getElementById("luongNam").value;
            const luongCoBan = document.getElementById("luongCoBan").value;
            const soCaLam = document.getElementById("luongSoCaLam").value || 0;
            const tongThuong = document.getElementById("luongTongThuong").value || 0;
            const tongPhat = document.getElementById("luongTongPhat").value || 0;

            if (!nhanVienId || !thang || !nam || !luongCoBan) {
                showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
                return;
            }

            const tongLuong = parseFloat(luongCoBan) + parseFloat(tongThuong) - parseFloat(tongPhat);

            const payload = {
                nhan_vien_id: parseInt(nhanVienId),
                thang: parseInt(thang),
                nam: parseInt(nam),
                luong_co_ban: parseFloat(luongCoBan),
                so_ca_lam: parseInt(soCaLam),
                tong_thuong: parseFloat(tongThuong),
                tong_phat: parseFloat(tongPhat),
                tong_luong: tongLuong,
                ngay_tinh_luong: new Date().toISOString().split('T')[0]
            };

            console.log("📤 Payload gửi đi:", payload);

            try {
                const url = luongId
                    ? `${LUONG_API}/capnhat/${luongId}`
                    : `${LUONG_API}/them`;
                const method = luongId ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                console.log("📥 Response:", result);

                if (!res.ok) {
                    throw new Error(result.error || result.message || "Lỗi khi lưu");
                }

                showToast(luongId ? "Cập nhật lương thành công!" : "Thêm lương thành công!", "success");
                closeLuongModal();
                loadLuong();
            } catch (error) {
                console.error("❌ Lỗi submit lương:", error);
                showToast("Lỗi: " + error.message, "error");
            }
        });
    }

    // Event listeners cho tính tổng lương tự động
    ["luongCoBan", "luongTongThuong", "luongTongPhat"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", updateLuongPreview);
        }
    });
});

// Export functions to window
// window.openAddLuongModal = openAddLuongModal;
window.closeLuongModal = closeLuongModal;
// window.editLuong = editLuong;
// window.deleteLuong = deleteLuong;
window.viewLuongDetail = viewLuongDetail;
window.closeLuongDetailModal = closeLuongDetailModal;
window.filterLuong = filterLuong;
window.resetLuongFilter = resetLuongFilter;
window.loadLuong = loadLuong;
// window.updateLuongPreview = updateLuongPreview;


//=========================Send mail Luong =============================
async function guiBangLuongToanBo() {
  if (!confirm("Bạn có chắc muốn gửi bảng lương cho toàn bộ nhân viên?")) return;

  const thang = document.getElementById("filterLuongThang").value;
  const nam = document.getElementById("filterLuongNam").value;

  try {
    const res = await fetch(
      `http://localhost:3000/luong/laytatca?thang=${thang}&nam=${nam}`
    );
    const data = await res.json();

    if (!data.length) {
      alert("Không có dữ liệu lương để gửi");
      return;
    }

    // Gửi mail từng nhân viên
    for (const luong of data) {
      const html = taoNoiDungEmailLuong(luong);

      await fetch("http://localhost:3000/mail/sendmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: luong.email_nhan_vien,
          subject: `Bảng lương ${luong.thang}/${luong.nam}`,
          html,
        }),
      });
    }

showToast("✅ Đã gửi bảng lương thành công!", "success");  } catch (err) {
    console.error(err);
    showToast("❌ Lỗi khi gửi bảng lương", "error");
  }
}
function taoNoiDungEmailLuong(luong) {
  return `
  <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;
              background:#fff;border-radius:16px;padding:24px;
              box-shadow:0 20px 40px rgba(0,0,0,.15)">
    <h2 style="color:#ea580c;text-align:center;margin-bottom:20px">
      💰 BẢNG LƯƠNG ${luong.thang}/${luong.nam}
    </h2>

    <p><strong>👤 Nhân viên:</strong> ${luong.ten_nhan_vien}</p>
    <p><strong>📞 SĐT:</strong> ${luong.sdt_nhan_vien}</p>

    <hr style="margin:16px 0">

    <table width="100%" cellpadding="8" cellspacing="0"
           style="border-collapse:collapse">
      <tr>
        <td>Lương cơ bản</td>
        <td align="right">${luong.luong_co_ban.toLocaleString()} đ</td>
      </tr>
      <tr>
        <td>Số ca làm</td>
        <td align="right">${luong.so_ca_lam} ca</td>
      </tr>
      <tr>
        <td>Thưởng</td>
        <td align="right" style="color:green">
          +${luong.tong_thuong.toLocaleString()} đ
        </td>
      </tr>
      <tr>
        <td>Phạt</td>
        <td align="right" style="color:red">
          -${luong.tong_phat.toLocaleString()} đ
        </td>
      </tr>
      <tr style="font-weight:bold;border-top:1px solid #ddd">
        <td>TỔNG LƯƠNG</td>
        <td align="right" style="color:#ea580c">
          ${luong.tong_luong.toLocaleString()} đ
        </td>
      </tr>
    </table>

    <p style="margin-top:20px;font-size:13px;color:#666;text-align:center">
      Ngày tính lương: ${new Date(luong.ngay_tinh_luong).toLocaleDateString("vi-VN")}
    </p>
  </div>
  `;
}


