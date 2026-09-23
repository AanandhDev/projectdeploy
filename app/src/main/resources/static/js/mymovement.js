// ================================================== 
// API URLS 
// ================================================== 
 
const MOVEMENT_API_URL = "/api/movements/my"; 
 
const MOVEMENT_HISTORY_API_URL = 
    "/api/movements/my/history"; 
 
const MOVEMENT_OUT_URL = 
    "/api/movements/my/out"; 
 
const MOVEMENT_IN_URL = 
    "/api/movements/my/in"; 
 
const NOTIFICATION_API_URL = 
    "/api/notifications/my"; 
 
 
// ================================================== 
// GLOBAL VARIABLES 
// ================================================== 
 
let movement = null; 
 
let movementHistory = []; 
 
let notifications = []; 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener( 
    "DOMContentLoaded", 
    function () { 
 
        loadProfile(); 
 
        loadMovements(); 
 
        loadNotifications(); 
 
    } 
); 
 
 
// ================================================== 
// PROFILE 
// ================================================== 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
 
    if (!username) { 
 
        return; 
 
    } 
 
 
    const usernameElement = 
        document.getElementById("loggedUsername"); 
 
 
    if (usernameElement) { 
 
        usernameElement.textContent = 
            username; 
 
    } 
 
} 
 
 
// ================================================== 
// LOAD MOVEMENTS 
// ================================================== 
 
async function loadMovements() { 
 
    try { 
 
        // Current movement 
        movement = 
            await fetchData( 
                MOVEMENT_API_URL 
            ); 
 
 
        // Movement history 
        movementHistory = 
            await fetchData( 
                MOVEMENT_HISTORY_API_URL 
            ); 
 
 
        if ( 
            !movement || 
            Array.isArray(movement) 
        ) { 
 
            movement = null; 
 
        } 
 
 
        if ( 
            !Array.isArray( 
                movementHistory 
            ) 
        ) { 
 
            movementHistory = []; 
 
        } 
 
 
        displayMovements(); 
 
        updateSummary(); 
 
    } catch (error) { 
 
        console.error( 
            "Movement loading error:", 
            error 
        ); 
 
        movement = null; 
 
        movementHistory = []; 
 
        displayMovements(); 
 
        updateSummary(); 
 
    } 
 
} 
 
 
// ================================================== 
// DISPLAY CURRENT MOVEMENT 
// ================================================== 
 
// ================================================== 
// DISPLAY CURRENT MOVEMENT 
// ================================================== 
 
function displayMovements() { 
 
    const body = 
        document.getElementById( 
            "movementTableBody" 
        ); 
 
 
    if (!body) { 
 
        return; 
 
    } 
 
 
    body.innerHTML = ""; 
 
 
    // ---------------------------------------------- 
    // NO MOVEMENT 
    // ---------------------------------------------- 
 
    if (!movement) { 
 
        body.innerHTML = ` 
 
            <tr> 
 
                <td colspan="5" 
                    class="loading-cell"> 
 
                    No movement record found 
 
                </td> 
 
            </tr> 
 
        `; 
        return; 
 
    } 
 
 
    // ---------------------------------------------- 
    // TENANT DETAILS 
    // ---------------------------------------------- 
 
    const tenant = 
        movement.tenant; 
 
 
    const tenantName = 
        tenant?.user?.fullName || "-"; 
 
 
    const roomNo = 
        tenant?.room?.roomNo || "-"; 
 
 
    // ---------------------------------------------- 
    // STATUS 
    // ---------------------------------------------- 
 
    const status = 
        ( 
            movement.status || 
            "IN" 
        ).toUpperCase(); 
 
 
    const statusClass = 
        status === "IN" 
            ? "in" 
            : "out"; 
 
 
    // ---------------------------------------------- 
    // ACTION 
    // ---------------------------------------------- 
 
    const action = 
        status === "IN" 
            ? "OUT" 
            : "IN"; 
 
 
    const actionClass = 
        status === "IN" 
            ? "out" 
            : "in"; 
 
 
    // ---------------------------------------------- 
    // DATE & TIME 
    // ---------------------------------------------- 
 
    const movementTime = 
        formatDateTime( 
            movement.movementTime 
        ); 
 
 
    // ---------------------------------------------- 
    // CREATE ROW 
    // ---------------------------------------------- 
 
    const row = 
        document.createElement("tr"); 
 
 
    row.innerHTML = ` 
 
        <!-- TENANT NAME --> 
 
        <td> 
 
            ${tenantName} 
 
        </td> 
 
 
        <!-- ROOM NO --> 
 
        <td> 
 
            ${roomNo} 
 
        </td> 
 
 
        <!-- DATE & TIME --> 
 
        <td> 
 
            ${movementTime} 
 
        </td> 
 
 
        <!-- STATUS --> 
 
        <td> 
 
            <span 
                class="movement-status ${statusClass}"> 
 
                ${status} 
 
            </span> 
 
        </td> 
 
 
        <!-- ACTION --> 
 
        <td> 
 
            <button 
                class="movement-action ${actionClass}" 
                onclick="toggleMovement('${action}')"> 
 
                ${action} 
 
            </button> 
 
        </td> 
 
    `; 
 
 
    body.appendChild(row); 
 
} 
 
// ================================================== 
// TOGGLE MOVEMENT 
// ================================================== 
 
async function toggleMovement( 
    newStatus 
) { 
 
    const confirmed = 
        confirm( 
            "Change movement status to " + 
            newStatus + 
            "?" 
        ); 
 
 
    if (!confirmed) { 
 
        return; 
 
    } 
 
 
    try { 
 
        let url; 
 
 
        if (newStatus === "OUT") { 
 
            url = 
                MOVEMENT_OUT_URL; 
 
        } else { 
 
            url = 
                MOVEMENT_IN_URL; 
 
        } 
 
 
        const token = 
            sessionStorage.getItem("token"); 
 
        const response = 
            await fetch( 
                url, 
                { 
 
                    method: "PUT", 
 
                    headers: { 
 
                        "Content-Type": 
                            "application/json", 
 
                        Authorization: 
                            "Bearer " + 
                            token 
 
                    } 
 
                } 
            ); 
 
 
        if (!response.ok) { 
 
            let message = 
                "Unable to update movement status."; 
 
 
            try { 
 
                const errorData = 
                    await response.json(); 
 
                if (errorData.message) { 
 
                    message = 
                        errorData.message; 
 
                } 
 
            } catch (e) { 
 
                // Ignore JSON parsing error 
 
            } 
 
 
            throw new Error(message); 
 
        } 
 
 
        // Reload current movement 
        // and history 
        await loadMovements(); 
 
 
    } catch (error) { 
 
        console.error( 
            "Movement update error:", 
            error 
        ); 
 
 
        alert( 
            error.message || 
            "Unable to update movement status." 
        ); 
 
    } 
 
} 
 
 
// ================================================== 
// UPDATE SUMMARY CARDS 
// ================================================== 
 
function updateSummary() { 
 
    // ---------------------------------------------- 
    // TOTAL MOVEMENTS 
    // ---------------------------------------------- 
 
    const totalMovements = 
        movementHistory.length; 
 
 
    const totalElement = 
        document.getElementById( 
            "totalMovements" 
        ); 
 
 
    if (totalElement) { 
 
        totalElement.textContent = 
            totalMovements; 
 
    } 
 
 
    // ---------------------------------------------- 
    // CURRENT STATUS 
    // ---------------------------------------------- 
 
    const currentStatusElement = 
        document.getElementById( 
            "currentStatus" 
        ); 
 
 
    if (currentStatusElement) { 
 
        if (movement) { 
 
            currentStatusElement.textContent = 
                ( 
                    movement.status || 
                    "-" 
                ).toUpperCase(); 
 
        } else { 
 
            currentStatusElement.textContent = 
                "-"; 
 
        } 
 
    } 
 
 
    // ---------------------------------------------- 
    // ENTRY MOVEMENTS 
    // ---------------------------------------------- 
 
    const entryMovements = 
        movementHistory.filter( 
            function (record) { 
 
                return ( 
                    record.status && 
                    record.status.toUpperCase() === 
                    "IN" 
                ); 
 
            } 
        ).length; 
 
 
    const entryElement = 
        document.getElementById( 
            "entryMovements" 
        ); 
 
 
    if (entryElement) { 
 
        entryElement.textContent = 
            entryMovements; 
 
    } 
 
 
    // ---------------------------------------------- 
    // EXIT MOVEMENTS 
    // ---------------------------------------------- 
 
    const exitMovements = 
        movementHistory.filter( 
            function (record) { 
 
                return ( 
                    record.status && 
                    record.status.toUpperCase() === 
                    "OUT" 
                ); 
 
            } 
        ).length; 
 
 
    const exitElement = 
        document.getElementById( 
            "exitMovements" 
        ); 
 
 
    if (exitElement) { 
 
        exitElement.textContent = 
            exitMovements; 
 
    } 
 
} 
 
 
// ================================================== 
// FILTER MOVEMENTS 
// ================================================== 
 
function filterMovements() { 
 
    const fromDateElement = 
        document.getElementById( 
            "fromDate" 
        ); 
 
 
    const toDateElement = 
        document.getElementById( 
            "toDate" 
        ); 
 
 
    const statusFilterElement = 
        document.getElementById( 
            "statusFilter" 
        ); 
 
 
    const fromDate = 
        fromDateElement 
            ? fromDateElement.value 
            : ""; 
 
 
    const toDate = 
        toDateElement 
            ? toDateElement.value 
            : ""; 
 
 
    const statusFilter = 
        statusFilterElement 
            ? statusFilterElement.value 
            : "ALL"; 
 
 
    const filteredHistory = 
        movementHistory.filter( 
            function (record) { 
 
                if (!record.movementTime) { 
 
                    return false; 
 
                } 
 
 
                const movementDate = 
                    new Date( 
                        record.movementTime 
                    ); 
 
 
                // ---------------------------------- 
                // FROM DATE 
                // ---------------------------------- 
 
                if (fromDate) { 
 
                    const startDate = 
                        new Date( 
                            fromDate + 
                            "T00:00:00" 
                        ); 
 
 
                    if ( 
                        movementDate < 
                        startDate 
                    ) { 
 
                        return false; 
 
                    } 
 
                } 
 
 
                // ---------------------------------- 
                // TO DATE 
                // ---------------------------------- 
 
                if (toDate) { 
 
                    const endDate = 
                        new Date( 
                            toDate + 
                            "T23:59:59" 
                        ); 
 
 
                    if ( 
                        movementDate > 
                        endDate 
                    ) { 
 
                        return false; 
 
                    } 
 
                } 
 
 
                // ---------------------------------- 
                // STATUS 
                // ---------------------------------- 
 
                if ( 
                    statusFilter !== "ALL" && 
                    record.status?.toUpperCase() !== 
                    statusFilter 
                ) { 
 
                    return false; 
 
                } 
 
 
                return true; 
 
            } 
        ); 
 
 
    displayHistoryAsCurrentTable( 
        filteredHistory 
    ); 
 
} 
 
 
// ================================================== 
// DISPLAY FILTERED HISTORY 
// ================================================== 
 
function displayHistoryAsCurrentTable(history) { 
 
    const body = document.getElementById("movementTableBody"); 
 
    if (!body) return; 
 
    body.innerHTML = ""; 
 
    if (!history || history.length === 0) { 
 
        body.innerHTML = ` 
            <tr> 
                <td colspan="5" class="loading-cell"> 
                    No movement records found 
                </td> 
            </tr> 
        `; 
 
        return; 
 
    } 
 
    // Current movement-la irundhu tenant details edukkrom 
    const tenant = movement?.tenant; 
 
    const tenantName = tenant?.user?.fullName || "-"; 
    const roomNo = tenant?.room?.roomNo || "-"; 
 
    history.forEach(function (record) { 
 
        const status = (record.status || "-").toUpperCase(); 
 
        const statusClass = 
            status === "IN" ? "in" : "out"; 
 
        const row = document.createElement("tr"); 
 
        row.innerHTML = ` 
            <td>${tenantName}</td> 
 
            <td>${roomNo}</td> 
 
            <td> 
                ${formatDateTime(record.movementTime)} 
            </td> 
 
            <td> 
                <span class="movement-status ${statusClass}"> 
                    ${status} 
                </span> 
            </td> 
 
            <td>-</td> 
        `; 
 
        body.appendChild(row); 
    }); 
} 
// ================================================== 
// FILTER EVENTS 
// ================================================== 
 
const fromDateElement = 
    document.getElementById( 
        "fromDate" 
    ); 
 
 
if (fromDateElement) { 
 
    fromDateElement.addEventListener( 
        "change", 
        filterMovements 
    ); 
 
} 
 
 
const toDateElement = 
    document.getElementById( 
        "toDate" 
    ); 
 
 
if (toDateElement) { 
 
    toDateElement.addEventListener( 
        "change", 
        filterMovements 
    ); 
 
} 
 
 
const statusFilterElement = 
    document.getElementById( 
        "statusFilter" 
    ); 
 
 
if (statusFilterElement) { 
 
    statusFilterElement.addEventListener( 
        "change", 
        filterMovements 
    ); 
 
} 
 
 
// ================================================== 
// CLEAR FILTERS 
// ================================================== 
 
function clearFilters() { 
 
    const fromDate = 
        document.getElementById( 
            "fromDate" 
        ); 
 
 
    const toDate = 
        document.getElementById( 
            "toDate" 
        ); 
 
 
    const statusFilter = 
        document.getElementById( 
            "statusFilter" 
        ); 
 
 
    if (fromDate) { 
 
        fromDate.value = ""; 
 
    } 
 
 
    if (toDate) { 
 
        toDate.value = ""; 
 
    } 
 
 
    if (statusFilter) { 
 
        statusFilter.value = "ALL"; 
 
    } 
 
 
    displayMovements(); 
 
} 
 
 
// ================================================== 
// FETCH DATA 
// ================================================== 
 
async function fetchData(url) { 
 
    const token = 
        sessionStorage.getItem("token"); 
 
 
    const headers = { 
 
        "Content-Type": 
            "application/json" 
 
    }; 
 
 
    if (token) { 
 
        headers.Authorization = 
            "Bearer " + token; 
 
    } 
 
 
    const response = 
        await fetch( 
            url, 
            { 
                headers: headers 
            } 
        ); 
 
 
    if (!response.ok) { 
 
        throw new Error( 
            "API Error: " + 
            response.status 
        ); 
 
    } 
 
 
    const data = 
        await response.json(); 
 
 
    // Handle wrapped response 
    if ( 
        data && 
        !Array.isArray(data) 
    ) { 
 
        if ( 
            data.data !== undefined 
        ) { 
 
            return data.data; 
 
        } 
 
 
        if ( 
            data.content !== undefined 
        ) { 
 
            return data.content; 
 
        } 
 
    } 
 
 
    return data; 
 
} 
 
 
// ================================================== 
// LOAD NOTIFICATIONS 
// ================================================== 
 
async function loadNotifications() { 
 
    try { 
 
        notifications = 
            await fetchData( 
                NOTIFICATION_API_URL 
            ); 
 
 
        if ( 
            !Array.isArray( 
                notifications 
            ) 
        ) { 
 
            notifications = []; 
 
        } 
 
 
        displayNotifications(); 
 
    } catch (error) { 
 
        console.error( 
            "Notification error:", 
            error 
        ); 
 
 
        notifications = []; 
 
        displayNotifications(); 
 
    } 
 
} 
 
 
// ================================================== 
// DISPLAY NOTIFICATIONS 
// ================================================== 
 
function displayNotifications() { 
 
    const list = 
        document.getElementById( 
            "notificationList" 
        ); 
 
 
    const count = 
        document.getElementById( 
            "notificationCount" 
        ); 
 
 
    if (!list || !count) { 
 
        return; 
 
    } 
 
 
    const unread = 
        notifications.filter( 
            function (notification) { 
 
                return ( 
                    notification.read !== true && 
                    notification.isRead !== true 
                ); 
 
            } 
        ); 
 
 
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
        .forEach( 
            function (notification) { 
 
                const unreadClass = 
                    notification.read !== true && 
                    notification.isRead !== true 
                        ? "unread" 
                        : ""; 
 
                list.innerHTML += ` 
 
                    <div 
                        class="notification-item ${unreadClass}" 
                        onclick="openNotification( 
                            ${notification.id} 
                        )"> 
 
 
                        <div class="notification-icon"> 
 
                            <i class="fa-solid fa-message"></i> 
 
                        </div> 
 
 
                        <div 
                            class="notification-content"> 
 
 
                            <strong> 
 
                                ${ 
                                    notification.title || 
                                    "Complaint Update" 
                                } 
 
                            </strong> 
 
 
                            <p> 
 
                                ${ 
                                    notification.message || 
                                    "Your complaint has been updated." 
                                } 
 
                            </p> 
 
 
                            <div 
                                class="notification-time"> 
 
                                ${ 
                                    formatDateTime( 
                                        notification.createdAt || 
                                        notification.date 
                                    ) 
                                } 
 
                            </div> 
 
 
                        </div> 
 
 
                    </div> 
 
                `; 
 
            } 
        ); 
 
} 
 
 
// ================================================== 
// OPEN NOTIFICATION 
// ================================================== 
 
async function openNotification(id) { 
 
    await markNotificationRead(id); 
 
 
    window.location.href = 
        "my-complaints.html"; 
 
} 
 
 
// ================================================== 
// MARK ONE NOTIFICATION READ 
// ================================================== 
 
async function markNotificationRead(id) { 
 
    try { 
 
        const token = 
            sessionStorage.getItem("token"); 
 
 
        await fetch( 
            `${NOTIFICATION_API_URL}/${id}/read`, 
            { 
 
                method: "PUT", 
 
                headers: { 
 
                    "Content-Type": 
                        "application/json", 
 
                    Authorization: 
                        "Bearer " + 
                        token 
 
                } 
 
            } 
        ); 
 
    } catch (error) { 
 
        console.error( 
            "Notification update error:", 
            error 
        ); 
 
    } 
 
} 
 
 
// ================================================== 
// MARK ALL NOTIFICATIONS READ 
// ================================================== 
 
async function markAllNotificationsRead() { 
 
    try { 
 
        const token = 
            sessionStorage.getItem("token"); 
 
 
        await fetch( 
            `${NOTIFICATION_API_URL}/read-all`, 
            { 
 
                method: "PUT", 
 
                headers: { 
 
                    "Content-Type": 
                        "application/json", 
 
                    Authorization: 
                        "Bearer " + 
                        token 
 
                } 
 
            } 
        ); 
 
 
        notifications.forEach( 
            function (notification) { 
 
                notification.read = true; 
 
            } 
        ); 
 
 
        displayNotifications(); 
 
    } catch (error) { 
 
        console.error( 
            "Notification update error:", 
            error 
        ); 
 
    } 
 
} 
 
 
// ================================================== 
// TOGGLE NOTIFICATIONS 
// ================================================== 
 
function toggleNotifications() { 
 
    const dropdown = 
        document.getElementById( 
            "notificationDropdown" 
        ); 
 
 
    if (!dropdown) { 
 
        return; 
 
    } 
 
 
    dropdown.classList.toggle( 
        "show" 
    ); 
 
} 
 
 
// ================================================== 
// CLOSE NOTIFICATIONS 
// ================================================== 
 
document.addEventListener( 
    "click", 
    function (event) { 
 
        const wrapper = 
            document.querySelector( 
                ".notification-wrapper" 
            ); 
 
 
        const dropdown = 
            document.getElementById( 
                "notificationDropdown" 
            ); 
 
 
        if ( 
            wrapper && 
            dropdown && 
            !wrapper.contains( 
                event.target 
            ) 
        ) { 
 
            dropdown.classList.remove( 
                "show" 
            ); 
 
        } 
 
    } 
); 
 
 
// ================================================== 
// DATE + TIME FORMAT 
// ================================================== 
 
function formatDateTime(date) { 
 
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
 
        return "-"; 
 
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
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
function logout() { 
 
    sessionStorage.removeItem( 
        "username" 
    ); 
 
    sessionStorage.removeItem( 
        "role" 
    ); 
 
    sessionStorage.removeItem( 
        "token" 
    ); 
 
 
    window.location.href = 
        "login.html"; 
 
} 