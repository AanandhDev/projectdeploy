const NOTICE_API_URL = "/api/notices"; 
 
let notices = []; 
 
let selectedNoticeId = null; 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener( 
    "DOMContentLoaded", 
    function () { 
 
        loadProfile(); 
 
        loadNotices(); 
 
        setupEvents(); 
    } 
); 
 
 
// ================================================== 
// PROFILE 
// ================================================== 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
    const role = 
        sessionStorage.getItem("role"); 
 
 
    if (username) { 
 
        document.getElementById( 
            "profileUsername" 
        ).textContent = username; 
    } 
 
 
    if (role) { 
 
        document.querySelector( 
            ".profile small" 
        ).textContent = 
            role.toUpperCase(); 
    } 
} 
 
 
// ================================================== 
// EVENTS 
// ================================================== 
 
function setupEvents() { 
 
    document 
        .getElementById("openAddNoticeBtn") 
        .addEventListener( 
            "click", 
            openAddNoticeModal 
        ); 
 
 
    document 
        .getElementById("closeNoticeModal") 
        .addEventListener( 
            "click", 
            closeNoticeModal 
        ); 
 
 
    document 
        .getElementById("cancelNoticeBtn") 
        .addEventListener( 
            "click", 
            closeNoticeModal 
        ); 
 
 
    document 
        .getElementById("noticeForm") 
        .addEventListener( 
            "submit", 
            publishNotice 
        ); 
 
 
    // ================================================== 
    // VIEW NOTICE MODAL 
    // ================================================== 
 
    document 
        .getElementById("closeViewModal") 
        .addEventListener( 
            "click", 
            closeViewModal 
        ); 
 
 
    document 
        .getElementById("viewCloseBtn") 
        .addEventListener( 
            "click", 
            closeViewModal 
        ); 
 
 
    // ================================================== 
    // FEEDBACK MODAL 
    // ================================================== 
 
    document 
        .getElementById("closeFeedbackModal") 
        .addEventListener( 
            "click", 
            closeFeedbackModal 
        ); 
 
 
    document 
        .getElementById("feedbackCloseBtn") 
        .addEventListener( 
            "click", 
            closeFeedbackModal 
        ); 
 
 
    // ================================================== 
    // CANCEL NOTICE MODAL 
    // ================================================== 
 
    document 
        .getElementById("closeCancelModal") 
        .addEventListener( 
            "click", 
            closeCancelModal 
        ); 
 
 
    document 
        .getElementById("keepNoticeBtn") 
        .addEventListener( 
            "click", 
            closeCancelModal 
        ); 
 
 
    document 
        .getElementById("confirmCancelBtn") 
        .addEventListener( 
            "click", 
            confirmCancelNotice 
        ); 
 
 
    // ================================================== 
    // SEARCH + FILTER 
    // ================================================== 
 
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
 
 
    // ================================================== 
    // NOTICE TYPE 
    // ================================================== 
 
    document 
        .getElementById("noticeType") 
        .addEventListener( 
            "change", 
            handleNoticeType 
        ); 
} 
 
 
// ================================================== 
// LOAD NOTICES 
// ================================================== 
 
async function loadNotices() { 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL, 
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
 
 
        notices = 
            await response.json(); 
 
 
        updateSummary(); 
 
        renderNotices(); 
 
 
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
// SUMMARY 
// ================================================== 
 
function updateSummary() { 
 
    document.getElementById( 
        "totalNotice" 
    ).textContent = 
        notices.length; 
 
 
    document.getElementById( 
        "activeNotice" 
    ).textContent = 
        notices.filter( 
            notice => 
                notice.status === "ACTIVE" 
        ).length; 
 
 
    document.getElementById( 
        "completedNotice" 
    ).textContent = 
        notices.filter( 
            notice => 
                notice.status === "COMPLETED" 
        ).length; 
} 
 
 
// ================================================== 
// RENDER NOTICES 
// ================================================== 
 
function renderNotices( 
    list = notices 
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
 
 
            // ================================================== 
            // FEEDBACK BUTTON 
            // ================================================== 
 
            const feedbackText = 
                notice.feedbackRequired 
                    ? ` 
                        <button 
                            class="feedback-view-btn" 
                            onclick="viewFeedback( 
                                ${notice.noticeId}, 
                                '${escapeHtml(notice.title).replace(/'/g, "\\'")}' 
                            )"> 
 
                            <i class="fa-solid fa-comment-dots"></i> 
 
                            View Feedback 
 
                        </button> 
                      ` 
                    : "Not Required"; 
 
 
            row.innerHTML = ` 
 
                <td> 
 
                    <strong> 
                        ${escapeHtml( 
                            notice.title 
                        )} 
                    </strong> 
 
                </td> 
 
 
                <td> 
 
                    ${formatNoticeType( 
                        notice.noticeType 
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
 
                    <span class="feedback-badge"> 
 
                        ${feedbackText} 
 
                    </span> 
 
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
 
                    <!-- VIEW --> 
 
                    <button 
                        class="action-btn" 
                        title="View" 
                        onclick="viewNotice( 
                            ${notice.noticeId} 
                        )"> 
 
                        <i class="fa-solid fa-eye"></i> 
 
                    </button> 
 
 
                    <!-- CANCEL --> 
 
                    ${ 
                        notice.status !== "CANCELLED" 
 
                        ? 
 
                        ` 
                        <button 
                            class="action-btn danger" 
                            title="Cancel" 
                            onclick="openCancelModal( 
                                ${notice.noticeId} 
                            )"> 
 
                            <i class="fa-solid fa-xmark"></i> 
 
                        </button> 
                        ` 
 
                        : 
 
                        "" 
                    } 
 
                </td> 
 
            `; 
 
 
            tbody.appendChild(row); 
        } 
    ); 
} 
 
 
// ================================================== 
// OPEN ADD NOTICE MODAL 
// ================================================== 
 
function openAddNoticeModal() { 
 
    const form = 
        document.getElementById( 
            "noticeForm" 
        ); 
 
 
    form.reset(); 
 
 
    document.getElementById( 
        "modalTitle" 
    ).textContent = 
        "Add New Notice"; 
 
 
    hideDynamicFields(); 
 
 
    document.getElementById( 
        "noticeModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE ADD NOTICE MODAL 
// ================================================== 
 
function closeNoticeModal() { 
 
    document.getElementById( 
        "noticeModal" 
    ).classList.remove("show"); 
} 
 
 
// ================================================== 
// NOTICE TYPE 
// ================================================== 
 
function handleNoticeType() { 
 
    const type = 
        document.getElementById( 
            "noticeType" 
        ).value; 
 
 
    hideDynamicFields(); 
 
 
    if ( 
        type === "WATER" || 
        type === "POWER" || 
        type === "MAINTENANCE" 
    ) { 
 
        document.getElementById( 
            "scheduleFields" 
        ).classList.remove("hidden"); 
 
        return; 
    } 
 
 
    if ( 
        type === "RENT_UPDATE" 
    ) { 
 
        document.getElementById( 
            "rentFields" 
        ).classList.remove("hidden"); 
 
        return; 
    } 
 
 
    if ( 
        type === "FOOD_FEE_UPDATE" 
    ) { 
 
        document.getElementById( 
            "foodFields" 
        ).classList.remove("hidden"); 
 
        return; 
    } 
} 
 
 
// ================================================== 
// HIDE DYNAMIC FIELDS 
// ================================================== 
 
function hideDynamicFields() { 
 
    document.getElementById( 
        "scheduleFields" 
    ).classList.add("hidden"); 
 
 
    document.getElementById( 
        "rentFields" 
    ).classList.add("hidden"); 
 
 
    document.getElementById( 
        "foodFields" 
    ).classList.add("hidden"); 
} 
 
 
// ================================================== 
// PUBLISH NOTICE 
// ================================================== 
 
async function publishNotice(event) { 
 
    event.preventDefault(); 
 
 
    const type = 
        document.getElementById( 
            "noticeType" 
        ).value; 
 
 
    const title = 
        document.getElementById( 
            "noticeTitle" 
        ).value.trim(); 
 
 
    const description = 
        document.getElementById( 
            "noticeDescription" 
        ).value.trim(); 
 
 
    const feedbackRequired = 
        document.getElementById( 
            "requireFeedback" 
        ).checked; 
 
 
    let effectiveDate = null; 
 
    let fromTime = null; 
 
    let toTime = null; 
 
 
    // ================================================== 
    // SCHEDULE NOTICE 
    // ================================================== 
 
    if ( 
        type === "WATER" || 
        type === "POWER" || 
        type === "MAINTENANCE" 
    ) { 
 
        effectiveDate = 
            document.getElementById( 
                "validDate" 
            ).value; 
 
 
        fromTime = 
            document.getElementById( 
                "fromTime" 
            ).value; 
 
 
        toTime = 
            document.getElementById( 
                "toTime" 
            ).value; 
 
 
        if ( 
            !effectiveDate || 
            !fromTime || 
            !toTime 
        ) { 
 
            alert( 
                "Please fill schedule details." 
            ); 
 
            return; 
        } 
    } 
 
 
    // ================================================== 
    // RENT UPDATE 
    // ================================================== 
 
    else if ( 
        type === "RENT_UPDATE" 
    ) { 
 
        effectiveDate = 
            document.getElementById( 
                "rentEffectiveDate" 
            ).value; 
 
 
        if (!effectiveDate) { 
 
            alert( 
                "Please select effective date." 
            ); 
 
            return; 
        } 
 
 
        const increase = 
            document.getElementById( 
                "rentIncrease" 
            ).value; 
 
 
        if (!increase) { 
 
            alert( 
                "Please enter increase amount." 
            ); 
 
            return; 
        } 
    } 
 
 
    // ================================================== 
    // FOOD UPDATE 
    // ================================================== 
 
    else if ( 
        type === "FOOD_FEE_UPDATE" 
    ) { 
 
        effectiveDate = 
            document.getElementById( 
                "foodEffectiveDate" 
            ).value; 
 
 
        if (!effectiveDate) { 
 
            alert( 
                "Please select effective date." 
            ); 
 
            return; 
        } 
 
 
        const increase = 
            document.getElementById( 
                "foodIncrease" 
            ).value; 
 
 
        if (!increase) { 
 
            alert( 
                "Please enter increase amount." 
            ); 
 
            return; 
        } 
    } 
 
 
    // ================================================== 
    // VALIDATION 
    // ================================================== 
 
    if ( 
        !type || 
        !title || 
        !description 
    ) { 
 
        alert( 
            "Please fill all required fields." 
        ); 
 
        return; 
    } 
 
 
    // ================================================== 
    // FALLBACK DATE 
    // ================================================== 
 
    if (!effectiveDate) { 
 
        effectiveDate = 
            new Date() 
                .toISOString() 
                .split("T")[0]; 
    } 
 
 
    // ================================================== 
    // TIME VALIDATION 
    // ================================================== 
 
    if ( 
        fromTime && 
        toTime && 
        toTime < fromTime 
    ) { 
 
        alert( 
            "To time cannot be before from time." 
        ); 
 
        return; 
    } 
 
 
    // ================================================== 
    // NOTICE DATA 
    // ================================================== 
 
    const noticeData = { 
 
        noticeType: 
            type, 
 
        title: 
            title, 
 
        description: 
            description, 
 
        effectiveDate: 
            effectiveDate, 
 
        fromTime: 
            fromTime, 
 
        toTime: 
            toTime, 
 
        feedbackRequired: 
            feedbackRequired 
    }; 
 
 
    // ================================================== 
    // SAVE NOTICE 
    // ================================================== 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL, 
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
                        JSON.stringify( 
                            noticeData 
                        ) 
                } 
            ); 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to publish notice." 
            ); 
 
            return; 
        } 
 
 
        alert( 
            "Notice published successfully." 
        ); 
 
 
        closeNoticeModal(); 
 
 
        loadNotices(); 
 
 
    } catch (error) { 
 
        console.error(error); 
 
 
        alert( 
            "Unable to publish notice." 
        ); 
    } 
} 
 
 
// ================================================== 
// VIEW TENANT FEEDBACK 
// ================================================== 
 
async function viewFeedback( 
    noticeId, 
    noticeTitle 
) { 
 
    const modal = 
        document.getElementById( 
            "feedbackModal" 
        ); 
 
 
    const title = 
        document.getElementById( 
            "feedbackNoticeTitle" 
        ); 
 
 
    const content = 
        document.getElementById( 
            "feedbackContent" 
        ); 
 
 
    // Set notice title 
 
    title.textContent = 
        noticeTitle; 
 
 
    // Loading message 
 
    content.innerHTML = ` 
 
        <div class="feedback-loading"> 
 
            Loading feedback... 
 
        </div> 
 
    `; 
 
 
    // Open modal 
 
    modal.classList.add("show"); 
 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL + 
                "/" + 
                noticeId + 
                "/feedback", 
                { 
                    method: "GET", 
 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + 
                            sessionStorage.getItem("token") 
                    } 
                } 
            ); 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            content.innerHTML = ` 
 
                <div class="feedback-empty"> 
 
                    ${escapeHtml( 
                        responseText || 
                        "Unable to load feedback." 
                    )} 
 
                </div> 
 
            `; 
 
            return; 
        } 
 
 
        const feedbackList = 
            responseText 
                ? JSON.parse(responseText) 
                : []; 
 
 
        // No feedback 
 
        if ( 
            !feedbackList || 
            feedbackList.length === 0 
        ) { 
 
            content.innerHTML = ` 
 
                <div class="feedback-empty"> 
 
                    <i class="fa-solid fa-comment-slash"></i> 
 
                    <p> 
                        No feedback submitted yet. 
                    </p> 
 
                </div> 
 
            `; 
 
            return; 
        } 
 
 
        // Clear loading 
 
        content.innerHTML = ""; 
 
 
        // Display feedback 
 
        feedbackList.forEach( 
            function (feedback) { 
 
                const feedbackCard = 
                    document.createElement( 
                        "div" 
                    ); 
 
 
                feedbackCard.className = 
                    "feedback-card"; 
 
 
                const tenantName = 
                    feedback.tenant && 
                    feedback.tenant.user 
                        ? feedback.tenant.user.fullName 
                        : feedback.tenantName || 
                          "Tenant"; 
 
 
                const feedbackText = 
                    feedback.feedback || 
                    ""; 
 
 
                const feedbackDate = 
                    feedback.feedbackDate 
                        ? formatDate( 
                            feedback.feedbackDate 
                        ) 
                        : "-"; 
 
 
                feedbackCard.innerHTML = ` 
 
                    <div class="feedback-card-header"> 
 
                        <div class="feedback-tenant"> 
 
                            <div class="feedback-avatar"> 
 
                                <i class="fa-solid fa-user"></i> 
 
                            </div> 
 
 
                            <div> 
 
                                <strong> 
 
                                    ${escapeHtml( 
                                        tenantName 
                                    )} 
 
                                </strong> 
 
 
                                <small> 
 
                                    Tenant 
 
                                </small> 
 
                            </div> 
 
                        </div> 
 
 
                        <span class="feedback-date"> 
 
                            ${feedbackDate} 
 
                        </span> 
 
                    </div> 
 
 
                    <div class="feedback-message"> 
 
                        <p> 
 
                            ${escapeHtml( 
                                feedbackText 
                            )} 
 
                        </p> 
 
                    </div> 
 
                `; 
 
                content.appendChild( 
                    feedbackCard 
                ); 
            } 
        ); 
 
 
    } catch (error) { 
 
        console.error( 
            "Feedback error:", 
            error 
        ); 
 
 
        content.innerHTML = ` 
 
            <div class="feedback-empty"> 
 
                Unable to load feedback. 
 
            </div> 
 
        `; 
    } 
} 
 
 
// ================================================== 
// CLOSE FEEDBACK MODAL 
// ================================================== 
 
function closeFeedbackModal() { 
 
    document 
        .getElementById( 
            "feedbackModal" 
        ) 
        .classList.remove("show"); 
} 
 
 
// ================================================== 
// VIEW NOTICE 
// ================================================== 
 
function viewNotice(noticeId) { 
 
    const notice = 
        notices.find( 
            item => 
                item.noticeId === noticeId 
        ); 
 
 
    if (!notice) { 
 
        return; 
    } 
 
 
    document.getElementById( 
        "viewNoticeContent" 
    ).innerHTML = ` 
 
        <div class="detail-row"> 
 
            <span>Title</span> 
 
            <strong> 
                ${escapeHtml( 
                    notice.title 
                )} 
            </strong> 
 
        </div> 
 
 
        <div class="detail-row"> 
 
            <span>Type</span> 
 
            <strong> 
                ${formatNoticeType( 
                    notice.noticeType 
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
 
            <span>Feedback</span> 
 
            <strong> 
 
                ${ 
                    notice.feedbackRequired 
                        ? "Required" 
                        : "Not Required" 
                } 
 
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
// OPEN CANCEL MODAL 
// ================================================== 
 
function openCancelModal(noticeId) { 
 
    selectedNoticeId = 
        noticeId; 
 
 
    document.getElementById( 
        "cancelReason" 
    ).value = ""; 
 
 
    document.getElementById( 
        "cancelNoticeModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE CANCEL MODAL 
// ================================================== 
 
function closeCancelModal() { 
 
    selectedNoticeId = 
        null; 
 
 
    document.getElementById( 
        "cancelNoticeModal" 
    ).classList.remove("show"); 
} 
 
 
// ================================================== 
// CONFIRM CANCEL 
// ================================================== 
 
async function confirmCancelNotice() { 
 
    if (!selectedNoticeId) { 
 
        return; 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                NOTICE_API_URL + 
                "/" + 
                selectedNoticeId + 
                "/cancel", 
                { 
                    method: "PUT", 
 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + 
                            sessionStorage.getItem("token") 
                    } 
                } 
            ); 
 
 
        const responseText = 
            await response.text(); 
 
 
        if (!response.ok) { 
 
            alert( 
                responseText || 
                "Unable to cancel notice." 
            ); 
 
            return; 
        } 
 
 
        alert( 
            "Notice cancelled successfully." 
        ); 
 
 
        closeCancelModal(); 
 
 
        loadNotices(); 
 
 
    } catch (error) { 
 
        console.error(error); 
 
 
        alert( 
            "Unable to cancel notice." 
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
        notices.filter( 
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
 
                    notice.status === 
                        status; 
 
 
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
 
 
function formatNoticeType(type) { 
 
    const types = { 
 
        WATER: 
            "Water Supply", 
 
        POWER: 
            "Power Shutdown", 
 
        MAINTENANCE: 
            "Maintenance", 
 
        RENT_UPDATE: 
            "Rent Update", 
 
        FOOD_FEE_UPDATE: 
            "Food Fee Update" 
    }; 
 
 
    return ( 
        types[type] || 
        type 
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
 
document.getElementById("logoutBtn").addEventListener("click",function(){ 
 
      sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 
 
    window.location.href = "/html/login.html"; 
})