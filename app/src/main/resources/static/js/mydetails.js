// ================================================== 
// API URL 
// ================================================== 
 
const TENANT_API_URL = "/api/tenants/my"; 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadMyDetails(); 
    loadProfile(); 
 
}); 
 
 
// ================================================== 
// LOAD MY DETAILS 
// ================================================== 
 
async function loadMyDetails() { 
 
    const token = sessionStorage.getItem("token"); 
 
    if (!token) { 
 
        window.location.href = "/html/login.html"; 
        return; 
    } 
 
 
    try { 
 
        const response = await fetch(TENANT_API_URL, { 
 
            method: "GET", 
 
            headers: { 
 
                "Authorization": "Bearer " + token 
 
            } 
 
        }); 
 
 
        const data = await response.json(); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                data.message || "Failed to load your details." 
            ); 
        } 
 
 
        console.log("My Details:", data); 
 
 
        displayMyDetails(data); 
 
 
    } catch (error) { 
 
        console.error("Error loading my details:", error); 
 
        alert(error.message); 
 
    } 
 
} 
 
 
// ================================================== 
// DISPLAY MY DETAILS 
// ================================================== 
 
function displayMyDetails(tenant) { 
 
 
    // ================================================== 
    // USER DETAILS 
    // ================================================== 
 
    if (tenant.user) { 
 
        document.getElementById("displayName").textContent = 
            tenant.user.fullName || "-"; 
 
 
        document.getElementById("fullName").textContent = 
            tenant.user.fullName || "-"; 
 
 
        document.getElementById("phone").textContent = 
            tenant.user.phone || "-"; 
 
 
        document.getElementById("email").textContent = 
            tenant.user.email || "-"; 
 
    } 
 
 
    // ================================================== 
    // TENANT ID 
    // ================================================== 
 
    document.getElementById("displayTenantId").textContent = 
        "Tenant ID: " + (tenant.tenantId || "-"); 
 
 
    // ================================================== 
    // STAY DETAILS 
    // ================================================== 
 
    document.getElementById("checkInDate").textContent = 
        tenant.checkInDate || "-"; 
 
 
    // ================================================== 
    // ROOM DETAILS 
    // ================================================== 
 
    if (tenant.room) { 
 
        document.getElementById("roomNumber").textContent = 
            tenant.room.roomNo || "-"; 
 
 
        document.getElementById("roomType").textContent = 
            tenant.room.roomType || "-"; 
 
    } else { 
 
        document.getElementById("roomNumber").textContent = "-"; 
 
        document.getElementById("roomType").textContent = "-"; 
 
    } 
 
 
    // ================================================== 
    // FOOD 
    // ================================================== 
 
    if (tenant.foodPlan === "WITH_FOOD") { 
 
        document.getElementById("food").textContent = 
            "With Food"; 
 
    } else if (tenant.foodPlan === "WITHOUT_FOOD") { 
 
        document.getElementById("food").textContent = 
            "Without Food"; 
 
    } else { 
 
        document.getElementById("food").textContent = "-"; 
 
    } 
 
 
    // ================================================== 
    // MONTHLY RENT 
    // ================================================== 
 
    const rent = Number(tenant.rent || 0); 
 
    document.getElementById("monthlyRent").textContent = 
        "₹" + rent.toFixed(2); 
 
 
    // ================================================== 
    // STATUS 
    // ================================================== 
 
    const statusElement = 
        document.getElementById("status"); 
 
 
    if (tenant.status) { 
 
        statusElement.textContent = 
            tenant.status; 
 
 
        if (tenant.status.toUpperCase() === "ACTIVE") { 
 
            statusElement.className = 
                "status-active"; 
 
        } else { 
 
            statusElement.className = 
                "status-inactive"; 
 
        } 
 
    } else { 
 
        statusElement.textContent = "-"; 
 
    } 
 
} 
 
 
// ================================================== 
// LOAD PROFILE 
// ================================================== 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
 
    document.getElementById("loggedUsername").textContent = 
        username || "Tenant"; 
 
} 
 
 
// ================================================== 
// NOTIFICATION 
// ================================================== 
 
function toggleNotifications() { 
 
    const dropdown = 
        document.getElementById("notificationDropdown"); 
 
 
    dropdown.classList.toggle("show"); 
 
} 
 
 
// ================================================== 
// MARK ALL NOTIFICATIONS READ 
// ================================================== 
 
function markAllNotificationsRead() { 
 
    const count = 
        document.getElementById("notificationCount"); 
 
 
    count.textContent = ""; 
 
 
    const notificationList = 
        document.getElementById("notificationList"); 
 
 
    notificationList.innerHTML = ` 
        <div class="notification-empty"> 
            No notifications 
        </div> 
    `; 
 
} 
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
function logout() { 
 
    sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 
 
    window.location.href = "/html/login.html"; 
 
}