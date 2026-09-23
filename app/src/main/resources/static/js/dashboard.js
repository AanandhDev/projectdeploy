// ================================================== 
// API URLS 
// ================================================== 
 
const TENANT_API_URL = "/api/tenants"; 
const ROOM_API_URL = "/api/rooms"; 
const PAYMENT_API_URL = "/api/payments"; 
const COMPLAINT_API_URL = "/api/complaints"; 
 
 
// ================================================== 
// GET TOKEN 
// ================================================== 
 
const token = sessionStorage.getItem("token"); 
 
 
// ================================================== 
// AUTH HEADER 
// ================================================== 
 
function getHeaders() { 
 
    return { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + token 
    }; 
} 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadProfile(); 
 
    loadDashboardData(); 
 
}); 
 
 
// ================================================== 
// LOAD PROFILE 
// ================================================== 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username") || "User"; 
 
    const role = 
        sessionStorage.getItem("role") || "ADMIN"; 
 
 
    document.getElementById("username").textContent = 
        username; 
 
    document.getElementById("profileUsername").textContent = 
        username; 
 
    document.getElementById("profileRole").textContent = 
        role.toUpperCase(); 
 
 
    // ------------------------------------------ 
    // WARDEN RESTRICTIONS 
    // ------------------------------------------ 
 
    if (role.toUpperCase() === "WARDEN") { 
 
        // Hide Monthly Collection 
        const monthlyCollectionCard = 
            document.getElementById( 
                "monthlyCollectionCard" 
            ); 
 
        if (monthlyCollectionCard) { 
            monthlyCollectionCard.style.display = "none"; 
        } 
 
 
        // Hide Accounts 
        const accountsMenu = 
            document.getElementById("accountsMenu"); 
 
        if (accountsMenu) { 
            accountsMenu.style.display = "none"; 
        } 
 
 
        // Hide User Management 
        const usersMenu = 
            document.getElementById("usersMenu"); 
 
        if (usersMenu) { 
            usersMenu.style.display = "none"; 
        } 
 
    } 
} 
 
// ================================================== 
// LOAD ALL DASHBOARD DATA 
// ================================================== 
 
async function loadDashboardData() { 
 
    try { 
 
        const [ 
            tenantResponse, 
            roomResponse, 
            paymentResponse, 
            complaintResponse 
        ] = await Promise.all([ 
 
            fetch(TENANT_API_URL, { 
                headers: getHeaders() 
            }), 
 
            fetch(ROOM_API_URL, { 
                headers: getHeaders() 
            }), 
 
            fetch(PAYMENT_API_URL, { 
                headers: getHeaders() 
            }), 
 
            fetch(COMPLAINT_API_URL, { 
                headers: getHeaders() 
            }) 
 
        ]); 
 
 
        // ------------------------------------------ 
        // CHECK RESPONSE 
        // ------------------------------------------ 
 
        if (!tenantResponse.ok) { 
 
            throw new Error( 
                "Unable to load tenant data." 
            ); 
        } 
 
        if (!roomResponse.ok) { 
 
            throw new Error( 
                "Unable to load room data." 
            ); 
        } 
 
        if (!paymentResponse.ok) { 
 
            throw new Error( 
                "Unable to load payment data." 
            ); 
        } 
 
        if (!complaintResponse.ok) { 
 
            throw new Error( 
                "Unable to load complaint data." 
            ); 
        } 
 
 
        // ------------------------------------------ 
        // CONVERT TO JSON 
        // ------------------------------------------ 
 
        const tenants = 
            await tenantResponse.json(); 
 
        const rooms = 
            await roomResponse.json(); 
 
        const payments = 
            await paymentResponse.json(); 
 
        const complaints = 
            await complaintResponse.json(); 
 
 
        // ------------------------------------------ 
        // UPDATE DASHBOARD 
        // ------------------------------------------ 
 
        updateTenantCard(tenants); 
 
        updateRoomCards(rooms); 
 
        updatePaymentCards(payments); 
 
        updateComplaintCard(complaints); 
 
        loadRecentPayments( 
            payments, 
            tenants 
        ); 
 
        loadRecentComplaints( 
            complaints 
        ); 
 
 
    } catch (error) { 
 
        console.error( 
            "Dashboard loading error:", 
            error 
        ); 
 
        showDashboardError( 
            error.message 
        ); 
    } 
} 
 
 
// ================================================== 
// TOTAL TENANTS 
// ================================================== 
 
function updateTenantCard(tenants) { 
 
    const totalTenants = 
        tenants.filter(tenant => 
            tenant.status && 
            tenant.status.toUpperCase() === "ACTIVE" 
        ).length; 
 
 
    document.getElementById("totalTenants").textContent = 
        totalTenants; 
} 
 
 
// ================================================== 
// ROOM CARDS 
// ================================================== 
 
function updateRoomCards(rooms) { 
 
    const occupiedRooms = 
        rooms.filter(room => 
            room.status && 
            room.status.toUpperCase() === "OCCUPIED" 
        ).length; 
 
 
    const availableRooms = 
        rooms.filter(room => 
            room.status && 
            room.status.toUpperCase() === "AVAILABLE" 
        ).length; 
 
 
    document.getElementById("occupiedRooms").textContent = 
        occupiedRooms; 
 
    document.getElementById("availableRooms").textContent = 
        availableRooms; 
} 
 
 
// ================================================== 
// PAYMENT CARDS 
// ================================================== 
 
function updatePaymentCards(payments) { 
 
    const today = 
        new Date(); 
 
 
    const currentMonth = 
        today.getMonth(); 
 
 
    const currentYear = 
        today.getFullYear(); 
 
 
    let monthlyCollection = 0; 
 
    let pendingRent = 0; 
 
 
    payments.forEach(payment => { 
 
        const status = 
            payment.status 
                ? payment.status.toUpperCase() 
                : ""; 
 
        const amount = 
            Number(payment.amount) || 0; 
 
 
        // ------------------------------------------ 
        // MONTHLY COLLECTION 
        // ------------------------------------------ 
 
        if (status === "PAID") { 
 
            const paymentDate = 
                payment.paymentDate; 
 
 
            if (paymentDate) { 
 
                const date = 
                    new Date(paymentDate); 
 
 
                if ( 
                    date.getMonth() === currentMonth && 
                    date.getFullYear() === currentYear 
                ) { 
 
                    monthlyCollection += amount; 
                } 
            } 
        } 
 
 
        // ------------------------------------------ 
        // PENDING RENT 
        // ------------------------------------------ 
 
        if ( 
            status === "PENDING" || 
            status === "OVERDUE" 
        ) { 
 
            pendingRent += amount; 
        } 
 
    }); 
 
 
    document.getElementById("monthlyCollection").textContent = 
        formatCurrency(monthlyCollection); 
 
 
    document.getElementById("pendingRent").textContent = 
        formatCurrency(pendingRent); 
} 
 
 
// ================================================== 
// OPEN COMPLAINTS 
// ================================================== 
 
function updateComplaintCard(complaints) { 
 
    const openComplaints = 
        complaints.filter(complaint => 
            complaint.status && 
            complaint.status.toUpperCase() === "OPEN" 
        ).length; 
 
 
    document.getElementById("openComplaints").textContent = 
        openComplaints; 
} 
 
 
// ================================================== 
// RECENT PAYMENTS 
// LAST 5 RECORDS 
// ================================================== 
 
function loadRecentPayments( 
    payments, 
    tenants 
) { 
 
    const tableBody = 
        document.getElementById( 
            "recentPaymentsTable" 
        ); 
 
 
    tableBody.innerHTML = ""; 
 
 
    if ( 
        !payments || 
        payments.length === 0 
    ) { 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="4" class="empty-message"> 
                    No payment records found 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    // ------------------------------------------ 
    // LATEST 5 PAYMENTS 
    // ------------------------------------------ 
 
    const recentPayments = 
        [...payments] 
            .sort((a, b) => 
                Number(a.paymentId || 0) - 
                Number(b.paymentId || 0) 
            ) 
            .slice(0,5); 
 
 
    recentPayments.forEach(payment => { 
 
        // ------------------------------------------ 
        // GET TENANT ID 
        // ------------------------------------------ 
 
        const paymentTenantId = 
            payment.tenantId ?? 
            payment.tenant?.tenantId ?? 
            payment.tenant?.id; 
 
 
        // ------------------------------------------ 
        // FIND TENANT 
        // ------------------------------------------ 
 
        const tenant = 
            tenants.find(tenant => 
                Number(tenant.tenantId) === 
                Number(paymentTenantId) 
            ); 
 
 
        // ------------------------------------------ 
        // GET TENANT NAME 
        // ------------------------------------------ 
 
        let tenantName = 
            "Unknown"; 
 
 
        if (payment.tenantName) { 
 
            tenantName = 
                payment.tenantName; 
 
        } else if ( 
            payment.tenant?.user?.fullName 
        ) { 
 
            tenantName = 
                payment.tenant.user.fullName; 
 
        } else if ( 
            payment.tenant?.fullName 
        ) { 
 
            tenantName = 
                payment.tenant.fullName; 
 
        } else if ( 
            tenant?.user?.fullName 
        ) { 
 
            tenantName = 
                tenant.user.fullName; 
 
        } else if ( 
            tenant?.fullName 
        ) { 
 
            tenantName = 
                tenant.fullName; 
 
        } else if ( 
            tenant?.user?.username 
        ) { 
 
            tenantName = 
                tenant.user.username; 
        } 
 
 
        // ------------------------------------------ 
        // AMOUNT 
        // ------------------------------------------ 
 
        const amount = 
            Number(payment.amount) || 0; 
 
 
        // ------------------------------------------ 
        // STATUS 
        // ------------------------------------------ 
 
        const status = 
            payment.status || "UNKNOWN"; 
 
 
        // ------------------------------------------ 
        // PAYMENT DATE 
        // PAID ONLY 
        // ------------------------------------------ 
 
        const date = 
            status.toUpperCase() === "PAID" && 
            payment.paymentDate 
                ? formatDate(payment.paymentDate) 
                : "-"; 
 
 
        // ------------------------------------------ 
        // STATUS CLASS 
        // ------------------------------------------ 
 
        const statusClass = 
            status.toLowerCase(); 
 
 
        // ------------------------------------------ 
        // CREATE TABLE ROW 
        // ------------------------------------------ 
 
        const row = 
            document.createElement("tr"); 
 
 
        row.innerHTML = ` 
 
            <td> 
                ${escapeHtml(tenantName)} 
            </td> 
 
            <td> 
                ${formatCurrency(amount)} 
            </td> 
 
            <td> 
                <span class="status ${statusClass}"> 
                    ${formatStatus(status)} 
                </span> 
            </td> 
 
            <td> 
                ${date} 
            </td> 
 
        `; 
 
 
        tableBody.appendChild(row); 
 
    }); 
} 
 
 
// ================================================== 
// RECENT COMPLAINTS 
// LAST 5 RECORDS 
// ================================================== 
 
function loadRecentComplaints( 
    complaints 
) { 
 
    const complaintContainer = 
        document.getElementById( 
            "recentComplaints" 
        ); 
 
 
    complaintContainer.innerHTML = ""; 
 
 
    if ( 
        !complaints || 
        complaints.length === 0 
    ) { 
 
        complaintContainer.innerHTML = ` 
            <div class="empty-message"> 
                No recent complaints 
            </div> 
        `; 
 
        return; 
    } 
 
 
    // ------------------------------------------ 
    // LATEST 5 COMPLAINTS 
    // ------------------------------------------ 
 
    const recentComplaints = 
        [...complaints] 
            .sort((a, b) => 
                Number(b.complaintId || 0) - 
                Number(a.complaintId || 0) 
            ) 
            .slice(0, 5); 
 
 
    recentComplaints.forEach(complaint => { 
 
        const status = 
            complaint.status || "UNKNOWN"; 
 
 
        const statusClass = 
            status.toLowerCase(); 
 
 
        const item = 
            document.createElement("div"); 
 
 
        item.className = 
            "complaint-item"; 
 
 
        item.innerHTML = ` 
 
            <div class="complaint-info"> 
 
                <strong> 
                    ${escapeHtml( 
                        complaint.title || 
                        "Untitled Complaint" 
                    )} 
                </strong> 
 
                <span> 
                    ${escapeHtml( 
                        complaint.tenantName || 
                        "Unknown Tenant" 
                    )} 
                </span> 
 
            </div> 
 
 
            <span class="status ${statusClass}"> 
                ${formatStatus(status)} 
            </span> 
 
        `; 
 
 
        complaintContainer.appendChild(item); 
 
    }); 
} 
 
 
// ================================================== 
// FORMAT STATUS 
// ================================================== 
 
function formatStatus(status) { 
 
    if (!status) { 
 
        return "-"; 
    } 
 
 
    switch (status.toUpperCase()) { 
 
        case "OPEN": 
            return "Open"; 
 
        case "IN_PROGRESS": 
            return "In Progress"; 
 
        case "WAITING_FOR_CONFIRMATION": 
            return "Waiting for Confirmation"; 
 
        case "RESOLVED": 
            return "Resolved"; 
 
        case "CANCELLED": 
            return "Cancelled"; 
 
        case "PENDING": 
            return "Pending"; 
 
        case "OVERDUE": 
            return "Overdue"; 
 
        case "PAID": 
            return "Paid"; 
 
        default: 
            return status; 
    } 
} 
 
 
// ================================================== 
// FORMAT CURRENCY 
// ================================================== 
 
function formatCurrency(amount) { 
 
    return "₹" + 
        Number(amount || 0) 
            .toLocaleString("en-IN"); 
} 
 
 
// ================================================== 
// FORMAT DATE 
// ================================================== 
 
function formatDate(dateString) { 
 
    if (!dateString) { 
 
        return "-"; 
    } 
 
 
    const date = 
        new Date(dateString); 
 
 
    if (isNaN(date.getTime())) { 
 
        return dateString; 
    } 
 
 
    return date.toLocaleDateString( 
        "en-IN", 
        { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric" 
        } 
    ); 
} 
 
 
// ================================================== 
// ESCAPE HTML 
// ================================================== 
 
function escapeHtml(value) { 
 
    if ( 
        value === null || 
        value === undefined 
    ) { 
 
        return ""; 
    } 
 
 
    return String(value) 
        .replace(/&/g, "&amp;") 
        .replace(/</g, "&lt;") 
        .replace(/>/g, "&gt;") 
        .replace(/"/g, "&quot;") 
        .replace(/'/g, "&#039;"); 
} 
 
 
// ================================================== 
// DASHBOARD ERROR 
// ================================================== 
 
function showDashboardError(message) { 
 
    console.error(message); 
 
 
    const paymentTable = 
        document.getElementById( 
            "recentPaymentsTable" 
        ); 
 
 
    const complaintContainer = 
        document.getElementById( 
            "recentComplaints" 
        ); 
 
 
    if (paymentTable) { 
 
        paymentTable.innerHTML = ` 
            <tr> 
                <td colspan="4" class="empty-message"> 
                    Unable to load payment data 
                </td> 
            </tr> 
        `; 
    } 
 
 
    if (complaintContainer) { 
 
        complaintContainer.innerHTML = ` 
            <div class="empty-message"> 
                Unable to load complaint data 
            </div> 
        `; 
    } 
} 
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
const logoutBtn = 
    document.getElementById("logoutBtn"); 
 
 
if (logoutBtn) { 
 
    logoutBtn.addEventListener( 
        "click", 
        function () { 
 
            sessionStorage.removeItem("token"); 
 
            sessionStorage.removeItem("username"); 
 
            sessionStorage.removeItem("role"); 
 
 
            window.location.href = 
                "/html/login.html"; 
 
        } 
    ); 
 
} 