const DASHBOARD_API = "/api/tenant-dashboard"; 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadTenantDashboard(); 
 
}); 
 
 
/* ================================================== 
   LOAD TENANT DASHBOARD 
================================================== */ 
 
async function loadTenantDashboard() { 
 
    try { 
 
        const token = sessionStorage.getItem("token"); 
 
        if (!token) { 
 
            console.error("Token not found"); 
 
            return; 
        } 
 
 
        const response = await fetch( 
            DASHBOARD_API, 
            { 
                method: "GET", 
 
                headers: { 
                    "Authorization": "Bearer " + token, 
                    "Content-Type": "application/json" 
                } 
            } 
        ); 
 
 
        if (!response.ok) { 
 
            const errorText = 
                await response.text(); 
 
            console.error( 
                "Dashboard API Error:", 
                response.status, 
                errorText 
            ); 
 
            throw new Error( 
                "Failed to load tenant dashboard" 
            ); 
        } 
 
 
        const data = 
            await response.json(); 
 
 
        console.log( 
            "Tenant Dashboard Data:", 
            data 
        ); 
 
 
        // ================================================== 
        // LOAD ALL SECTIONS 
        // ================================================== 
 
        loadProfile(data); 
 
        loadSummaryCards(data); 
 
        loadRoom(data); 
 
        loadCurrentPayment(data); 
 
        loadLatestNotices(data); 
 
        loadMyComplaints(data); 
 
 
    } catch (error) { 
 
        console.error( 
            "Dashboard loading error:", 
            error 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   PROFILE 
================================================== */ 
 
function loadProfile(data) { 
 
    const usernameElement = 
        document.getElementById("loggedUsername"); 
 
    const welcomeElement = 
        document.getElementById("welcomeText"); 
 
 
    if (usernameElement) { 
 
        usernameElement.textContent = 
            data.username || "Tenant"; 
 
    } 
 
 
    if (welcomeElement) { 
 
        welcomeElement.textContent = 
            data.username 
                ? `Welcome back, ${data.username}` 
                : "Welcome back"; 
 
    } 
 
} 
 
 
/* ================================================== 
   SUMMARY CARDS 
================================================== */ 
 
function loadSummaryCards(data) { 
 
    // ================================================== 
    // CURRENT RENT 
    // ================================================== 
 
    const currentRent = 
        document.getElementById("currentRent"); 
 
    const rentPeriod = 
        document.getElementById("rentPeriod"); 
 
 
    if (currentRent) { 
 
        currentRent.textContent = 
            formatCurrency(data.currentRent); 
 
    } 
 
 
    if (rentPeriod) { 
 
        rentPeriod.textContent = 
            data.currentRentPeriod || 
            "Current month"; 
 
    } 
 
 
    // ================================================== 
    // PAYMENT STATUS 
    // ================================================== 
 
    const paymentStatus = 
        document.getElementById("paymentStatus"); 
 
    const paymentInfo = 
        document.getElementById("paymentInfo"); 
 
 
    if (paymentStatus) { 
 
        paymentStatus.textContent = 
            data.paymentStatus || "-"; 
 
    } 
 
 
    if (paymentInfo) { 
 
        paymentInfo.textContent = 
            data.paymentPeriod || 
            "Current month"; 
 
    } 
 
 
    // ================================================== 
    // OPEN COMPLAINTS 
    // ================================================== 
 
    const openComplaints = 
        document.getElementById("openComplaints"); 
 
 
    if (openComplaints) { 
 
        openComplaints.textContent = 
            data.openComplaintsCount ?? 0; 
 
    } 
 
} 
 
 
/* ================================================== 
   MY ROOM 
================================================== */ 
 
function loadRoom(data) { 
 
    const room = data.room; 
 
 
    const roomNumber = 
        document.getElementById("roomNumber"); 
 
    const roomType = 
        document.getElementById("roomType"); 
 
    const foodType = 
        document.getElementById("foodType"); 
 
    const roomRent = 
        document.getElementById("roomRent"); 
 
    const roomStatus = 
        document.getElementById("roomStatus"); 
 
 
    if (!room) { 
 
        if (roomNumber) { 
            roomNumber.textContent = "-"; 
        } 
 
        if (roomType) { 
            roomType.textContent = "-"; 
        } 
 
        if (foodType) { 
            foodType.textContent = "-"; 
        } 
 
        if (roomRent) { 
            roomRent.textContent = "₹0"; 
        } 
 
        if (roomStatus) { 
            roomStatus.textContent = "-"; 
        } 
 
        return; 
    } 
 
 
    // Room Number 
 
    if (roomNumber) { 
 
        roomNumber.textContent = 
            room.roomNo || "-"; 
 
    } 
 
 
    // Room Type 
 
    if (roomType) { 
 
        roomType.textContent = 
            room.roomType || "-"; 
 
    } 
 
 
    // Food Plan 
 
    if (foodType) { 
 
        foodType.textContent = 
            room.food || "-"; 
 
    } 
 
 
    // Room Rent 
 
    if (roomRent) { 
 
        roomRent.textContent = 
            formatCurrency(room.rent); 
 
    } 
 
 
    // Room Status 
 
    if (roomStatus) { 
 
        roomStatus.textContent = 
            room.status || "-"; 
 
    } 
 
} 
 
 
/* ================================================== 
   CURRENT PAYMENT 
================================================== */ 
 
function loadCurrentPayment(data) { 
 
    const tbody = 
        document.getElementById( 
            "currentPaymentBody" 
        ); 
 
 
    if (!tbody) { 
        return; 
    } 
 
 
    const payment = 
        data.currentPayment; 
 
 
    if (!payment) { 
 
        tbody.innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="loading-cell"> 
                    No payment record for current month 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    const status = 
        payment.status || "-"; 
 
 
    // ================================================== 
    // PAYMENT DATE 
    // Only PAID payment should show payment date 
    // ================================================== 
 
    const paymentDate = 
        status.toUpperCase() === "PAID" && 
        payment.paymentDate 
            ? formatDate(payment.paymentDate) 
            : "-"; 
 
 
    tbody.innerHTML = ` 
 
        <tr> 
 
            <td> 
                ${payment.rentPeriod || "-"} 
            </td> 
 
            <td> 
                ${formatCurrency(payment.amount)} 
            </td> 
 
            <td> 
                ${formatDate(payment.dueDate)} 
            </td> 
 
            <td> 
                ${paymentDate} 
            </td> 
 
            <td> 
 
                <span class="payment-status ${getStatusClass(status)}"> 
 
                    ${status} 
 
                </span> 
 
            </td> 
 
        </tr> 
 
    `; 
 
} 
 
 
/* ================================================== 
   LATEST NOTICES 
================================================== */ 
 
function loadLatestNotices(data) { 
 
    const list = 
        document.getElementById("noticeList"); 
 
 
    if (!list) { 
        return; 
    } 
 
 
    const notices = 
        data.latestNotices || []; 
 
 
    if (notices.length === 0) { 
 
        list.innerHTML = ` 
            <div class="loading-box"> 
                No notices available 
            </div> 
        `; 
 
        return; 
    } 
 
 
    list.innerHTML = notices 
        .slice(0, 3) 
        .map(notice => ` 
 
            <div class="notice-item"> 
 
                <div class="notice-content"> 
 
                    <h4> 
                        ${escapeHtml( 
                            notice.title || "Notice" 
                        )} 
                    </h4> 
 
                    <p> 
                        ${escapeHtml( 
                            notice.message || "" 
                        )} 
                    </p> 
 
                    <small> 
                        ${formatDate( 
                            notice.createdAt 
                        )} 
                    </small> 
 
                </div> 
 
            </div> 
 
        `) 
        .join(""); 
 
} 
 
 
/* ================================================== 
   MY COMPLAINTS 
================================================== */ 
 
function loadMyComplaints(data) { 
 
    const list = 
        document.getElementById("complaintList"); 
 
 
    if (!list) { 
        return; 
    } 
 
 
    const complaints = 
        data.latestComplaints || []; 
 
 
    if (complaints.length === 0) { 
 
        list.innerHTML = ` 
            <div class="loading-box"> 
                No complaints found 
            </div> 
        `; 
 
        return; 
    } 
 
 
    list.innerHTML = complaints 
        .slice(0, 3) 
        .map(complaint => ` 
 
            <div class="complaint-item"> 
 
                <div class="complaint-content"> 
 
                    <h4> 
                        ${escapeHtml( 
                            complaint.subject || 
                            "Complaint" 
                        )} 
                    </h4> 
 
                    <p> 
                        ${escapeHtml( 
                            complaint.description || 
                            "" 
                        )} 
                    </p> 
 
                    <small> 
                        ${formatDate( 
                            complaint.createdAt 
                        )} 
                    </small> 
 
                </div> 
 
 
                <span class="complaint-status ${getStatusClass(complaint.status)}"> 
 
                    ${complaint.status || "-"} 
 
                </span> 
 
            </div> 
 
        `) 
        .join(""); 
 
} 
 
 
/* ================================================== 
   FORMAT CURRENCY 
================================================== */ 
 
function formatCurrency(amount) { 
 
    if ( 
        amount === null || 
        amount === undefined 
    ) { 
 
        return "₹0"; 
    } 
 
 
    return "₹" + 
        Number(amount).toLocaleString("en-IN"); 
 
} 
 
 
/* ================================================== 
   FORMAT DATE 
================================================== */ 
 
function formatDate(date) { 
 
    if (!date) { 
 
        return "-"; 
    } 
 
 
    const d = 
        new Date(date); 
 
 
    if (isNaN(d.getTime())) { 
 
        return date; 
    } 
 
 
    return d.toLocaleDateString("en-IN"); 
 
} 
 
 
/* ================================================== 
   STATUS CLASS 
================================================== */ 
 
function getStatusClass(status) { 
 
    if (!status) { 
 
        return ""; 
    } 
 
 
    return status 
        .toLowerCase() 
        .replace(/\s+/g, "-"); 
 
} 
 
 
/* ================================================== 
   ESCAPE HTML 
================================================== */ 
 
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