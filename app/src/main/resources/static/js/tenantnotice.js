const NOTICE_API_URL = "/api/notices"; 
 
let tenantNotices = []; 
 
let selectedNoticeId = null; 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener( 
    "DOMContentLoaded", 
    function () { 
 
        loadUsername(); 
 
        loadTenantNotices(); 
 
        setupEvents(); 
    } 
); 
 
 
// ================================================== 
// USERNAME 
// ================================================== 
 
function loadUsername() { 
 
    const username = 
        sessionStorage.getItem( 
            "username" 
        ); 
 
 
    if (username) { 
 
        document.getElementById( 
            "loggedUsername" 
        ).textContent = 
            username; 
    } 
} 
 
 
// ================================================== 
// EVENTS 
// ================================================== 
 
function setupEvents() { 
 
    document 
        .getElementById("searchNotice") 
        .addEventListener( 
            "input", 
            filterNotices 
        ); 
 
 
    document 
        .getElementById("statusFilter") 
        .addEventListener( 
            "change", 
            filterNotices 
        ); 
} 
 
 
// ================================================== 
// LOAD TENANT NOTICES 
// ================================================== 
 
async function loadTenantNotices() { 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL + "/my", 
                { 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + 
                            sessionStorage.getItem("token") 
                    } 
                } 
            ); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                "Unable to load notices." 
            ); 
        } 
 
 
        tenantNotices = 
            await response.json(); 
 
 
        renderNotices( 
            tenantNotices 
        ); 
 
 
        updateNotificationCount(); 
 
 
    } catch (error) { 
 
        console.error(error); 
 
        document.getElementById( 
            "noticeTableBody" 
        ).innerHTML = ` 
 
            <tr> 
 
                <td colspan="8" 
                    class="empty-row"> 
 
                    Unable to load notices 
 
                </td> 
 
            </tr> 
 
        `; 
    } 
} 
 
 
// ================================================== 
// RENDER 
// ================================================== 
 
function renderNotices( 
    list 
) { 
 
    const tbody = 
        document.getElementById( 
            "noticeTableBody" 
        ); 
 
 
    if ( 
        !list || 
        list.length === 0 
    ) { 
 
        tbody.innerHTML = ` 
 
            <tr> 
 
                <td colspan="8" 
                    class="empty-row"> 
 
                    No notices available 
 
                </td> 
 
            </tr> 
 
        `; 
 
        return; 
    } 
 
 
    tbody.innerHTML = ""; 
 
 
    list.forEach( 
        function (notice) { 
 
            const row = 
                document.createElement( 
                    "tr" 
                ); 
 
 
            let feedbackCell = "-"; 
 
 
            /* 
             * VERY IMPORTANT: 
             * 
             * feedbackRequired = true 
             *       AND 
             * feedbackSubmitted = false 
             * 
             * => Give Feedback button 
             */ 
 
 
            if ( 
                notice.feedbackRequired 
            ) { 
 
                if ( 
                    notice.feedbackSubmitted 
                ) { 
 
                    feedbackCell = ` 
 
                        <span class="feedback-submitted"> 
 
                            <i class="fa-solid fa-check"></i> 
 
                            Submitted 
 
                        </span> 
 
                    `; 
 
                } else { 
 
                    feedbackCell = ` 
 
                        <button 
                            class="feedback-btn" 
                            onclick="openFeedbackModal( 
                                ${notice.noticeId} 
                            )"> 
 
                            Give Feedback 
 
                        </button> 
 
                    `; 
                } 
            } 
 
 
            row.innerHTML = ` 
 
                <td> 
 
                    <strong> 
                        ${escapeHtml( 
                            notice.title 
                        )} 
                    </strong> 
 
                </td> 
 
 
                <td> 
 
                    ${escapeHtml( 
                        notice.description 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    ${formatDate( 
                        notice.postedDate 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    ${formatDate( 
                        notice.effectiveDate 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    ${formatTime( 
                        notice.fromTime 
                    )} 
 
                    - 
 
                    ${formatTime( 
                        notice.toTime 
                    )} 
 
                </td> 
 
 
                <td> 
 
                    ${feedbackCell} 
 
                </td> 
 
 
                <td> 
 
                    <span class="status-badge 
                        ${getStatusClass( 
                            notice.status 
                        )}"> 
 
                        ${notice.status} 
 
                    </span> 
 
                </td> 
 
 
                <td> 
 
                    <button 
                        class="action-btn" 
                        title="View" 
                        onclick="viewNotice( 
                            ${notice.noticeId} 
                        )"> 
 
                        <i class="fa-solid fa-eye"></i> 
 
                    </button> 
 
                </td> 
 
            `; 
 
 
            tbody.appendChild(row); 
        } 
    ); 
} 
 
 
// ================================================== 
// VIEW NOTICE 
// ================================================== 
 
function viewNotice(noticeId) { 
 
    const notice = 
        tenantNotices.find( 
            item => 
                item.noticeId === 
                noticeId 
        ); 
 
 
    if (!notice) { 
 
        return; 
    } 
 
 
    document.getElementById( 
        "viewNoticeContent" 
    ).innerHTML = ` 
 
        <div class="detail-row"> 
 
            <span>Notice</span> 
 
            <strong> 
                ${escapeHtml( 
                    notice.title 
                )} 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Description</span> 
 
            <strong> 
                ${escapeHtml( 
                    notice.description 
                )} 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Posted Date</span> 
 
            <strong> 
                ${formatDate( 
                    notice.postedDate 
                )} 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Effective Date</span> 
 
            <strong> 
                ${formatDate( 
                    notice.effectiveDate 
                )} 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Time</span> 
 
            <strong> 
 
                ${formatTime( 
                    notice.fromTime 
                )} 
 
                - 
 
                ${formatTime( 
                    notice.toTime 
                )} 
 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Status</span> 
 
            <strong> 
                ${notice.status} 
            </strong> 
 
        </div> 
 
    `; 
 
 
    document.getElementById( 
        "viewNoticeModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE VIEW 
// ================================================== 
 
function closeViewModal() { 
 
    document.getElementById( 
        "viewNoticeModal" 
    ).classList.remove("show"); 
} 
 
 
// ================================================== 
// OPEN FEEDBACK 
// ================================================== 
 
function openFeedbackModal( 
    noticeId 
) { 
 
    const notice = 
        tenantNotices.find( 
            item => 
                item.noticeId === 
                noticeId 
        ); 
 
 
    if (!notice) { 
 
        return; 
    } 
 
 
    if (!notice.feedbackRequired) { 
 
        alert( 
            "Feedback is not required for this notice." 
        ); 
 
        return; 
    } 
 
 
    if ( 
        notice.feedbackSubmitted 
    ) { 
 
        alert( 
            "You have already submitted feedback." 
        ); 
 
        return; 
    } 
 
 
    selectedNoticeId = 
        noticeId; 
 
 
    document.getElementById( 
        "feedbackNoticeTitle" 
    ).textContent = 
        notice.title; 
 
 
    document.getElementById( 
        "feedbackText" 
    ).value = ""; 
 
 
    document.getElementById( 
        "feedbackModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE FEEDBACK 
// ================================================== 
 
function closeFeedbackModal() { 
 
    selectedNoticeId = null; 
 
 
    document.getElementById( 
        "feedbackModal" 
    ).classList.remove("show"); 
} 
 
 
// ================================================== 
// SUBMIT FEEDBACK 
// ================================================== 
 
// ================================================== 
// SUBMIT FEEDBACK 
// ================================================== 
 
async function submitFeedback() { 
 
    if (!selectedNoticeId) { 
        return; 
    } 
 
 
    const feedback = 
        document.getElementById( 
            "feedbackText" 
        ).value.trim(); 
 
 
    if (!feedback) { 
 
        alert( 
            "Please enter your feedback." 
        ); 
 
        return; 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL + 
                "/" + 
                selectedNoticeId + 
                "/feedback", 
                { 
                    method: "POST", 
 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + 
                            sessionStorage.getItem("token"), 
 
                        "Content-Type": 
                            "application/json" 
                    }, 
 
                    body: 
                        JSON.stringify({ 
                            feedback: feedback 
                        }) 
                } 
            ); 
 
 
        // ------------------------------------------ 
        // READ RESPONSE AS TEXT 
        // ------------------------------------------ 
 
        const responseText = 
            await response.text(); 
 
 
        // ------------------------------------------ 
        // ERROR 
        // ------------------------------------------ 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to submit feedback." 
            ); 
 
            return; 
        } 
 
 
        // ------------------------------------------ 
        // SUCCESS 
        // ------------------------------------------ 
 
        alert( 
            responseText || 
            "Feedback submitted successfully." 
        ); 
 
 
        closeFeedbackModal(); 
 
 
        loadTenantNotices(); 
 
 
    } catch (error) { 
 
        console.error( 
            "Feedback error:", 
            error 
        ); 
 
 
        alert( 
            "Unable to submit feedback." 
        ); 
    } 
} 
// ================================================== 
// SEARCH + FILTER 
// ================================================== 
 
function filterNotices() { 
 
    const search = 
        document.getElementById( 
            "searchNotice" 
        ).value 
            .toLowerCase() 
            .trim(); 
 
 
    const status = 
        document.getElementById( 
            "statusFilter" 
        ).value; 
 
 
    const filtered = 
        tenantNotices.filter( 
            function (notice) { 
 
                const matchesSearch = 
                    notice.title 
                        .toLowerCase() 
                        .includes(search) 
                    || 
                    notice.description 
                        .toLowerCase() 
                        .includes(search); 
 
 
                const matchesStatus = 
                    status === "ALL" 
                    || 
                    notice.status === status; 
 
 
                return ( 
                    matchesSearch && 
                    matchesStatus 
                ); 
            } 
        ); 
 
 
    renderNotices( 
        filtered 
    ); 
} 
 
 
// ================================================== 
// NOTIFICATION COUNT 
// ================================================== 
 
function updateNotificationCount() { 
 
    const count = 
        tenantNotices.filter( 
            notice => 
                notice.status === "ACTIVE" 
        ).length; 
 
 
    const element = 
        document.getElementById( 
            "notificationCount" 
        ); 
 
 
    if (element) { 
 
        element.textContent = 
            count > 0 
                ? count 
                : ""; 
    } 
} 
 
 
// ================================================== 
// HELPERS 
// ================================================== 
 
function formatDate(date) { 
 
    if (!date) { 
 
        return "-"; 
    } 
 
 
    const parts = 
        date.split("-"); 
 
 
    return ( 
        parts[2] + 
        "-" + 
        parts[1] + 
        "-" + 
        parts[0] 
    ); 
} 
 
 
function formatTime(time) { 
 
    if (!time) { 
 
        return "-"; 
    } 
 
 
    return time.substring( 
        0, 
        5 
    ); 
} 
 
 
function getStatusClass(status) { 
 
    if ( 
        status === "ACTIVE" 
    ) { 
 
        return "active"; 
    } 
 
 
    if ( 
        status === "UPCOMING" 
    ) { 
 
        return "upcoming"; 
    } 
 
 
    if ( 
        status === "COMPLETED" 
    ) { 
 
        return "completed"; 
    } 
 
 
    if ( 
        status === "CANCELLED" 
    ) { 
 
        return "cancelled"; 
    } 
 
 
    return ""; 
} 
 
 
function escapeHtml(value) { 
 
    if (!value) { 
 
        return ""; 
    } 
 
 
    return value 
        .replaceAll("&", "&amp;") 
        .replaceAll("<", "&lt;") 
        .replaceAll(">", "&gt;") 
        .replaceAll('"', "&quot;") 
        .replaceAll("'", "&#039;"); 
} 
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
function logout() { 
 
    sessionStorage.clear(); 
 
    window.location.href = 
        "login.html"; 
} 
 
 
// ================================================== 
// NOTIFICATION DROPDOWN 
// ================================================== 
 
function toggleNotifications() { 
 
    const dropdown = 
        document.getElementById( 
            "notificationDropdown" 
        ); 
 
 
    dropdown.classList.toggle( 
        "show" 
    ); 
} 
 
 
function markAllNotificationsRead() { 
 
    const count = 
        document.getElementById( 
            "notificationCount" 
        ); 
 
 
    if (count) { 
 
        count.textContent = ""; 
    } 
}