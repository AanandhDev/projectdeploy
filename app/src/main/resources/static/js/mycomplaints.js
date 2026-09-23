/* ================================================== 
   VARIABLES 
================================================== */ 
 
let complaints = []; 
 
let notifications = []; 
 
let selectedComplaintId = null; 
 
 
/* ================================================== 
   API URL 
================================================== */ 
 
const COMPLAINT_API_URL = "/api/complaints"; 
 
const NOTIFICATION_API_URL = 
    "/api/complaint-notifications"; 
 
 
/* ================================================== 
   PAGE LOAD 
================================================== */ 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadProfile(); 
 
    loadComplaints(); 
 
    loadNotifications(); 
 
    setupEvents(); 
 
}); 
 
 
/* ================================================== 
   GET TOKEN 
================================================== */ 
 
function getToken() { 
 
    return sessionStorage.getItem("token"); 
 
} 
 
 
/* ================================================== 
   AUTH HEADERS 
================================================== */ 
 
function getAuthHeaders() { 
 
    return { 
 
        "Content-Type": "application/json", 
 
        "Authorization": 
            "Bearer " + getToken() 
 
    }; 
 
} 
 
 
/* ================================================== 
   PROFILE 
================================================== */ 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
    document.getElementById("loggedUsername") 
        .textContent = username || "Tenant"; 
 
} 
 
 
/* ================================================== 
   LOAD MY COMPLAINTS 
================================================== */ 
 
async function loadComplaints() { 
 
    try { 
 
        const token = getToken(); 
 
        if (!token) { 
 
            window.location.href = "login.html"; 
 
            return; 
 
        } 
 
 
        const response = await fetch( 
            COMPLAINT_API_URL + "/my", 
            { 
                method: "GET", 
                headers: getAuthHeaders() 
            } 
        ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        if (response.status === 403) { 
 
            const message = 
                await response.text(); 
 
            alert( 
                message || 
                "You do not have permission to access complaints." 
            ); 
 
            return; 
 
        } 
 
 
        if (!response.ok) { 
 
            const message = 
                await response.text(); 
 
            throw new Error( 
                message || 
                "Unable to load complaints." 
            ); 
 
        } 
 
 
        complaints = 
            await response.json(); 
 
 
        displayComplaints(); 
 
        updateCards(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Load complaints error:", 
            error 
        ); 
 
        alert( 
            error.message || 
            "Unable to connect to server." 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   DISPLAY COMPLAINTS 
================================================== */ 
 
function displayComplaints() { 
 
    const tableBody = 
        document.getElementById( 
            "complaintTableBody" 
        ); 
 
 
    const searchValue = 
        document.getElementById( 
            "searchComplaint" 
        ).value 
        .toLowerCase() 
        .trim(); 
 
 
    const statusValue = 
        document.getElementById( 
            "statusFilter" 
        ).value; 
 
 
    const filteredComplaints = 
        complaints.filter(function (complaint) { 
 
 
            const title = 
                (complaint.title || "") 
                .toLowerCase(); 
 
 
            const category = 
                (complaint.category || "") 
                .toLowerCase(); 
 
 
            const description = 
                (complaint.description || "") 
                .toLowerCase(); 
 
 
            const matchesSearch = 
                title.includes(searchValue) || 
                category.includes(searchValue) || 
                description.includes(searchValue); 
 
 
            const matchesStatus = 
                statusValue === "ALL" || 
                complaint.status === statusValue; 
 
 
            return ( 
                matchesSearch && 
                matchesStatus 
            ); 
 
        }); 
 
 
    tableBody.innerHTML = ""; 
 
 
    if (filteredComplaints.length === 0) { 
 
        tableBody.innerHTML = ` 
 
            <tr> 
 
                <td colspan="6" 
                    class="empty-row"> 
 
                    No complaints found 
 
                </td> 
 
            </tr> 
 
        `; 
 
        return; 
 
    } 
 
 
    filteredComplaints.forEach(function (complaint) { 
 
 
        const statusClass = 
            getStatusClass( 
                complaint.status 
            ); 
 
 
        const statusText = 
            getStatusText( 
                complaint.status 
            ); 
 
 
        /* ========================================== 
           VIEW BUTTON 
        ========================================== */ 
 
        let actions = ` 
 
            <button 
                class="view-btn" 
                onclick="viewComplaint(${complaint.complaintId})"> 
 
                <i class="fa-solid fa-eye"></i> 
 
                View 
 
            </button> 
 
        `; 
 
 
        /* ========================================== 
           CANCEL BUTTON 
           Only OPEN complaints 
        ========================================== */ 
 
        if ( 
            complaint.status === "OPEN" 
        ) { 
 
            actions += ` 
 
                <button 
                    class="cancel-complaint-btn" 
                    onclick="openCancelModal(${complaint.complaintId})"> 
 
                    <i class="fa-solid fa-xmark"></i> 
 
                    Cancel 
 
                </button> 
 
            `; 
 
        } 
 
 
        /* ========================================== 
           WAITING FOR CONFIRMATION 
        ========================================== */ 
 
        if ( 
            complaint.status === 
            "WAITING_FOR_CONFIRMATION" 
        ) { 
 
            actions += ` 
 
                <button 
                    class="view-btn" 
                    onclick="confirmComplaint(${complaint.complaintId})"> 
 
                    <i class="fa-solid fa-check"></i> 
 
                    Confirm 
 
                </button> 
 
 
                <button 
                    class="cancel-complaint-btn" 
                    onclick="rejectComplaint(${complaint.complaintId})"> 
 
                    <i class="fa-solid fa-xmark"></i> 
 
                    Reject 
 
                </button> 
 
            `; 
 
        } 
 
 
        tableBody.innerHTML += ` 
 
            <tr> 
 
                <td> 
 
                    <div class="complaint-title"> 
 
                        ${escapeHtml( 
                            complaint.title 
                        )} 
 
                    </div> 
 
                </td> 
 
 
                <td> 
 
                    <span class="category-badge"> 
 
                        ${escapeHtml( 
                            complaint.category 
                        )} 
 
                    </span> 
 
                </td> 
 
 
                <td> 
 
                    ${formatDate( 
                        complaint.submittedDate 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    ${formatDate( 
                        complaint.lastUpdated 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    <span 
                        class="status-badge ${statusClass}"> 
 
                        ${statusText} 
 
                    </span> 
 
                </td> 
 
 
                <td> 
 
                    <div class="action-buttons"> 
 
                        ${actions} 
 
                    </div> 
 
                </td> 
 
            </tr> 
 
        `; 
 
    }); 
 
} 
 
 
/* ================================================== 
   SUMMARY CARDS 
================================================== */ 
 
function updateCards() { 
 
    const total = 
        complaints.length; 
 
 
    const open = 
        complaints.filter(function (complaint) { 
 
            return complaint.status === "OPEN"; 
 
        }).length; 
 
 
    const progress = 
        complaints.filter(function (complaint) { 
 
            return complaint.status === "IN_PROGRESS"; 
 
        }).length; 
 
 
    /* 
     * WAITING_FOR_CONFIRMATION is NOT resolved. 
     * 
     * Only tenant confirmation changes it 
     * to RESOLVED. 
     */ 
 
    const resolved = 
        complaints.filter(function (complaint) { 
 
            return complaint.status === "RESOLVED"; 
 
        }).length; 
 
 
    document.getElementById( 
        "totalComplaints" 
    ).textContent = total; 
 
 
    document.getElementById( 
        "openComplaints" 
    ).textContent = open; 
 
 
    document.getElementById( 
        "progressComplaints" 
    ).textContent = progress; 
 
 
    document.getElementById( 
        "resolvedComplaints" 
    ).textContent = resolved; 
 
} 
 
 
/* ================================================== 
   STATUS CLASS 
================================================== */ 
 
function getStatusClass(status) { 
 
    switch (status) { 
 
        case "OPEN": 
            return "status-open"; 
 
        case "IN_PROGRESS": 
            return "status-in-progress"; 
 
        case "WAITING_FOR_CONFIRMATION": 
            return "status-waiting"; 
 
        case "RESOLVED": 
            return "status-resolved"; 
 
        case "CANCELLED": 
            return "status-cancelled"; 
 
        default: 
            return ""; 
 
    } 
 
} 
 
 
/* ================================================== 
   STATUS TEXT 
================================================== */ 
 
function getStatusText(status) { 
 
    switch (status) { 
 
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
 
        default: 
            return status || "-"; 
 
    } 
 
} 
 
 
/* ================================================== 
   OPEN COMPLAINT MODAL 
================================================== */ 
 
function openComplaintModal() { 
 
    document.getElementById( 
        "complaintModal" 
    ).classList.add("show"); 
 
} 
 
 
/* ================================================== 
   CLOSE COMPLAINT MODAL 
================================================== */ 
 
function closeComplaintModal() { 
 
    document.getElementById( 
        "complaintModal" 
    ).classList.remove("show"); 
 
 
    document.getElementById( 
        "complaintForm" 
    ).reset(); 
 
} 
 
 
/* ================================================== 
   SUBMIT COMPLAINT 
================================================== */ 
 
async function submitComplaint(event) { 
 
    event.preventDefault(); 
 
 
    const category = 
        document.getElementById( 
            "complaintCategory" 
        ).value; 
 
 
    const title = 
        document.getElementById( 
            "complaintTitle" 
        ).value 
        .trim(); 
 
 
    const description = 
        document.getElementById( 
            "complaintDescription" 
        ).value 
        .trim(); 
 
 
    if ( 
        !category || 
        !title || 
        !description 
    ) { 
 
        alert( 
            "Please fill all required fields." 
        ); 
 
        return; 
 
    } 
 
 
    const complaintData = { 
 
        category: category, 
 
        title: title, 
 
        description: description 
 
    }; 
 
 
    try { 
 
        const response = 
            await fetch( 
                COMPLAINT_API_URL, 
                { 
                    method: "POST", 
 
                    headers: 
                        getAuthHeaders(), 
 
                    body: 
                        JSON.stringify( 
                            complaintData 
                        ) 
                } 
            ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to submit complaint." 
            ); 
 
            return; 
 
        } 
 
 
        alert( 
            "Complaint submitted successfully." 
        ); 
 
 
        closeComplaintModal(); 
 
 
        await loadComplaints(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Submit complaint error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   VIEW COMPLAINT 
================================================== */ 
 
function viewComplaint(id) { 
 
    const complaint = 
        complaints.find(function (item) { 
 
            return item.complaintId === id; 
 
        }); 
 
 
    if (!complaint) { 
 
        return; 
 
    } 
 
 
    const content = 
        document.getElementById( 
            "viewComplaintContent" 
        ); 
 
    content.innerHTML = ` 
 
        <div class="view-item"> 
 
            <span>Complaint Title</span> 
 
            <strong> 
 
                ${escapeHtml( 
                    complaint.title 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="view-item"> 
 
            <span>Category</span> 
 
            <strong> 
 
                ${escapeHtml( 
                    complaint.category 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="view-item"> 
 
            <span>Submitted Date</span> 
 
            <strong> 
 
                ${formatDate( 
                    complaint.submittedDate 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="view-item"> 
 
            <span>Last Updated</span> 
 
            <strong> 
 
                ${formatDate( 
                    complaint.lastUpdated 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="view-item"> 
 
            <span>Status</span> 
 
            <strong> 
 
                ${getStatusText( 
                    complaint.status 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="view-item"> 
 
            <span>Description</span> 
 
            <div class="view-description"> 
 
                ${escapeHtml( 
                    complaint.description 
                )} 
 
            </div> 
 
        </div> 
 
    `; 
 
 
    document.getElementById( 
        "viewComplaintModal" 
    ).classList.add("show"); 
 
} 
 
 
/* ================================================== 
   CLOSE VIEW MODAL 
================================================== */ 
 
function closeViewModal() { 
 
    document.getElementById( 
        "viewComplaintModal" 
    ).classList.remove("show"); 
 
} 
 
 
/* ================================================== 
   OPEN CANCEL MODAL 
================================================== */ 
 
function openCancelModal(id) { 
 
    selectedComplaintId = id; 
 
 
    document.getElementById( 
        "cancelComplaintModal" 
    ).classList.add("show"); 
 
} 
 
 
/* ================================================== 
   CLOSE CANCEL MODAL 
================================================== */ 
 
function closeCancelModal() { 
 
    selectedComplaintId = null; 
 
 
    document.getElementById( 
        "cancelComplaintModal" 
    ).classList.remove("show"); 
 
} 
 
 
/* ================================================== 
   CONFIRM CANCEL 
================================================== */ 
 
async function confirmCancelComplaint() { 
 
    if (!selectedComplaintId) { 
 
        return; 
 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                COMPLAINT_API_URL + 
                "/" + 
                selectedComplaintId + 
                "/cancel", 
                { 
                    method: "PUT", 
 
                    headers: 
                        getAuthHeaders() 
                } 
            ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to cancel complaint." 
            ); 
 
            return; 
 
        } 
 
 
        alert( 
            "Complaint cancelled successfully." 
        ); 
 
 
        closeCancelModal(); 
 
 
        await loadComplaints(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Cancel complaint error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   CONFIRM RESOLUTION 
================================================== */ 
 
async function confirmComplaint(id) { 
 
    const confirmed = 
        confirm( 
            "Are you sure the complaint has been resolved?" 
        ); 
 
 
    if (!confirmed) { 
 
        return; 
 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                COMPLAINT_API_URL + 
                "/" + 
                id + 
                "/confirm", 
                { 
                    method: "PUT", 
 
                    headers: 
                        getAuthHeaders() 
                } 
 
            ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to confirm complaint." 
            ); 
 
            return; 
 
        } 
 
 
        alert( 
            "Complaint marked as resolved." 
        ); 
 
 
        await loadComplaints(); 
 
        await loadNotifications(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Confirm complaint error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   REJECT RESOLUTION 
================================================== */ 
 
async function rejectComplaint(id) { 
 
    const rejected = 
        confirm( 
            "Is the issue still not resolved?" 
        ); 
 
 
    if (!rejected) { 
 
        return; 
 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                COMPLAINT_API_URL + 
                "/" + 
                id + 
                "/reject", 
                { 
                    method: "PUT", 
 
                    headers: 
                        getAuthHeaders() 
 
                } 
            ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to reject resolution." 
            ); 
 
            return; 
 
        } 
 
 
        alert( 
            "Complaint has been reopened." 
        ); 
 
 
        await loadComplaints(); 
 
        await loadNotifications(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Reject complaint error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   SETUP EVENTS 
================================================== */ 
 
function setupEvents() { 
 
 
    document.getElementById( 
        "searchComplaint" 
    ).addEventListener( 
        "input", 
        displayComplaints 
    ); 
 
 
    document.getElementById( 
        "statusFilter" 
    ).addEventListener( 
        "change", 
        displayComplaints 
    ); 
 
 
    document.getElementById( 
        "complaintForm" 
    ).addEventListener( 
        "submit", 
        submitComplaint 
    ); 
 
} 
 
 
/* ================================================== 
   LOAD NOTIFICATIONS 
================================================== */ 
 
async function loadNotifications() { 
 
    try { 
 
        const response = 
            await fetch( 
                NOTIFICATION_API_URL + 
                "/my", 
                { 
                    method: "GET", 
 
                    headers: 
                        getAuthHeaders() 
                } 
            ); 
 
 
        if (response.status === 401) { 
 
            logout(); 
 
            return; 
 
        } 
 
 
        if (!response.ok) { 
 
            const message = 
                await response.text(); 
 
            console.error( 
                "Notification API Error:", 
                message 
            ); 
 
            return; 
 
        } 
 
 
        notifications = 
            await response.json(); 
 
        displayNotifications(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Notification loading error:", 
            error 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   DISPLAY NOTIFICATIONS 
================================================== */ 
 
function displayNotifications() { 
 
    const list = 
        document.getElementById( 
            "notificationList" 
        ); 
 
 
    const count = 
        document.getElementById( 
            "notificationCount" 
        ); 
 
 
    const unread = 
        notifications.filter(function ( 
            notification 
        ) { 
 
            return notification.read !== true; 
 
        }); 
 
 
    count.textContent = 
        unread.length > 0 
            ? unread.length 
            : ""; 
 
 
    if (notifications.length === 0) { 
 
        list.innerHTML = ` 
 
            <div class="notification-empty"> 
 
                No notifications 
 
            </div> 
 
        `; 
 
        return; 
 
    } 
 
 
    list.innerHTML = ""; 
 
 
    notifications 
        .slice(0, 10) 
        .forEach(function (notification) { 
 
 
            const unreadClass = 
                notification.read !== true 
                    ? "unread" 
                    : ""; 
 
 
            list.innerHTML += ` 
 
                <div 
                    class="notification-item ${unreadClass}" 
                    onclick="openNotification(${notification.notificationId})"> 
 
 
                    <div class="notification-icon"> 
 
                        <i class="fa-solid fa-message"></i> 
 
                    </div> 
 
 
                    <div class="notification-content"> 
 
 
                        <strong> 
 
                            ${escapeHtml( 
                                notification.title 
                            )} 
 
                        </strong> 
 
 
                        <p> 
 
                            ${escapeHtml( 
                                notification.message 
                            )} 
 
                        </p> 
 
 
                        <div class="notification-time"> 
 
                            ${formatDateTime( 
                                notification.createdAt 
                            )} 
 
                        </div> 
 
 
                    </div> 
 
 
                </div> 
 
            `; 
 
        }); 
 
} 
 
 
/* ================================================== 
   OPEN NOTIFICATION 
================================================== */ 
 
async function openNotification(id) { 
 
    const notification = 
        notifications.find(function (item) { 
 
            return item.notificationId === id; 
 
        }); 
 
 
    if (!notification) { 
 
        return; 
 
    } 
 
 
    /* 
     * Mark as read 
     */ 
 
    if (notification.read !== true) { 
 
        try { 
 
            const response = 
                await fetch( 
                    NOTIFICATION_API_URL + 
                    "/" + 
                    id + 
                    "/read", 
                    { 
                        method: "PUT", 
 
                        headers: 
                            getAuthHeaders() 
                    } 
 
                ); 
 
 
            if (response.ok) { 
 
                notification.read = true; 
 
                displayNotifications(); 
 
            } 
 
        } 
        catch (error) { 
 
            console.error( 
                "Mark notification read error:", 
                error 
            ); 
 
        } 
 
    } 
 
 
    /* 
     * Current backend returns 
     * ComplaintNotification entity. 
     * 
     * So complaint ID is: 
     * 
     * notification.complaint.complaintId 
     */ 
 
    if ( 
        notification.complaint && 
        notification.complaint.complaintId 
    ) { 
 
        viewComplaint( 
            notification.complaint.complaintId 
        ); 
 
    } 
 
} 
 
 
/* ================================================== 
   MARK ALL NOTIFICATIONS READ 
================================================== */ 
 
async function markAllNotificationsRead() { 
 
    const unreadNotifications = 
        notifications.filter(function ( 
            notification 
        ) { 
 
            return notification.read !== true; 
 
        }); 
 
 
    if ( 
        unreadNotifications.length === 0 
    ) { 
 
        return; 
 
    } 
 
 
    for ( 
        const notification 
        of unreadNotifications 
    ) { 
 
        try { 
 
            const response = 
                await fetch( 
                    NOTIFICATION_API_URL + 
                    "/" + 
                    notification.notificationId + 
                    "/read", 
                    { 
                        method: "PUT", 
 
                        headers: 
                            getAuthHeaders() 
                    } 
 
                ); 
 
 
            if (response.ok) { 
 
                notification.read = true; 
 
            } 
 
        } 
        catch (error) { 
 
            console.error( 
                "Mark notification error:", 
                error 
            ); 
 
        } 
 
    } 
 
 
    displayNotifications(); 
 
} 
 
 
/* ================================================== 
   TOGGLE NOTIFICATIONS 
================================================== */ 
 
function toggleNotifications() { 
 
    document.getElementById( 
        "notificationDropdown" 
    ).classList.toggle("show"); 
 
} 
 
 
/* ================================================== 
   CLOSE NOTIFICATION DROPDOWN 
================================================== */ 
 
document.addEventListener( 
    "click", 
    function (event) { 
 
        const wrapper = 
            document.querySelector( 
                ".notification-wrapper" 
            ); 
 
 
        if ( 
            wrapper && 
            !wrapper.contains( 
                event.target 
            ) 
        ) { 
 
            document.getElementById( 
                "notificationDropdown" 
            ).classList.remove("show"); 
 
        } 
 
    } 
); 
 
 
/* ================================================== 
   MODAL OUTSIDE CLICK 
================================================== */ 
 
window.addEventListener( 
    "click", 
    function (event) { 
 
 
        const complaintModal = 
            document.getElementById( 
                "complaintModal" 
            ); 
 
 
        const viewModal = 
            document.getElementById( 
                "viewComplaintModal" 
            ); 
 
 
        const cancelModal = 
            document.getElementById( 
                "cancelComplaintModal" 
            ); 
 
 
        if ( 
            event.target === complaintModal 
        ) { 
 
            closeComplaintModal(); 
 
        } 
 
 
        if ( 
            event.target === viewModal 
        ) { 
 
            closeViewModal(); 
 
        } 
 
 
        if ( 
            event.target === cancelModal 
        ) { 
 
            closeCancelModal(); 
 
        } 
 
    } 
 
); 
 
 
/* ================================================== 
   FORMAT DATE 
================================================== */ 
 
function formatDate(date) { 
 
    if (!date) { 
 
        return "-"; 
 
    } 
 
 
    const value = 
        new Date(date); 
 
 
    if ( 
        isNaN( 
            value.getTime() 
        ) 
    ) { 
 
        return date; 
 
    } 
 
 
    return value.toLocaleDateString( 
        "en-IN", 
        { 
            day: "2-digit", 
 
            month: "short", 
 
            year: "numeric" 
        } 
 
    ); 
 
} 
 
 
/* ================================================== 
   FORMAT DATE + TIME 
================================================== */ 
 
function formatDateTime(date) { 
 
    if (!date) { 
 
        return ""; 
 
    } 
 
 
    const value = 
        new Date(date); 
 
 
    if ( 
        isNaN( 
            value.getTime() 
        ) 
    ) { 
 
        return ""; 
 
    } 
 
 
    return value.toLocaleString( 
        "en-IN", 
        { 
            day: "2-digit", 
 
            month: "short", 
 
            year: "numeric", 
 
            hour: "2-digit", 
 
            minute: "2-digit" 
        } 
 
    ); 
 
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
 
        .replaceAll( 
            "&", 
            "&amp;" 
        ) 
 
        .replaceAll( 
            "<", 
            "&lt;" 
        ) 
 
        .replaceAll( 
            ">", 
            "&gt;" 
        ) 
 
        .replaceAll( 
            '"', 
            "&quot;" 
        ) 
 
        .replaceAll( 
            "'", 
            "&#039;" 
        ); 
 
} 
 
 
/* ================================================== 
   LOGOUT 
================================================== */ 
 
function logout() { 
 
    sessionStorage.removeItem("username"); 
 
    sessionStorage.removeItem("role"); 
 
    sessionStorage.removeItem("token"); 
 
 
    window.location.href = 
        "login.html"; 
 
}