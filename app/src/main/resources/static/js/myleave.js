const LEAVE_API_URL = "/api/leaves"; 
 
 
// ================================================== 
// TOKEN 
// ================================================== 
 
function getToken() { 
 
    return sessionStorage.getItem("token"); 
} 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener( 
    "DOMContentLoaded", 
    function () { 
 
        loadMyLeaves(); 
        loadLeaveHistory(); 
        loadUsername(); 
 
        document 
            .getElementById("leaveForm") 
            .addEventListener( 
                "submit", 
                handleLeaveSubmit 
            ); 
    } 
); 
 
 
// ================================================== 
// LOAD USERNAME 
// ================================================== 
 
function loadUsername() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
    if (username) { 
 
        document.getElementById( 
            "loggedUsername" 
        ).textContent = username; 
    } 
} 
 
 
// ================================================== 
// LOAD UPCOMING / ON LEAVE 
// ================================================== 
 
async function loadMyLeaves() { 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + "/my", 
                { 
                    headers: { 
                        "Authorization": 
                            "Bearer " + getToken() 
                    } 
                } 
            ); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                "Unable to load leave records." 
            ); 
        } 
 
 
        const leaves = 
            await response.json(); 
 
 
        displayUpcomingLeaves(leaves); 
 
 
    } catch (error) { 
 
        console.error( 
            "Leave loading error:", 
            error 
        ); 
 
 
        document.getElementById( 
            "upcomingLeaveBody" 
        ).innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="loading-cell"> 
 
                    Unable to load leave records 
 
                </td> 
            </tr> 
        `; 
    } 
} 
 
 
// ================================================== 
// DISPLAY UPCOMING LEAVES 
// ================================================== 
 
function displayUpcomingLeaves(leaves) { 
 
    const tbody = 
        document.getElementById( 
            "upcomingLeaveBody" 
        ); 
 
 
    if ( 
        !leaves || 
        leaves.length === 0 
    ) { 
 
        tbody.innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="loading-cell"> 
 
                    No upcoming leaves 
 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    tbody.innerHTML = ""; 
 
 
    leaves.forEach( 
        function (leave) { 
 
            const row = 
                document.createElement( 
                    "tr" 
                ); 
 
 
            row.innerHTML = ` 
 
                <td> 
                    ${formatDate(leave.fromDate)} 
                </td> 
 
                <td> 
                    ${formatDate(leave.returnDate)} 
                </td> 
 
                <td> 
                    ${leave.reason || "-"} 
                </td> 
 
                <td> 
 
                    <span class="status-badge 
                        ${getStatusClass(leave.status)}"> 
 
                        ${leave.status} 
 
                    </span> 
 
                </td> 
 
                <td> 
 
                    <button 
                        class="edit-btn" 
                        title="Edit" 
                        onclick="editLeave(${leave.leaveId})"> 
 
                        <i class="fa-solid fa-pen"></i> 
 
                    </button> 
 
 
                    <button 
                        class="cancel-leave-btn" 
                        title="Cancel Leave" 
                        onclick="cancelLeave(${leave.leaveId})"> 
 
                        <i class="fa-solid fa-xmark"></i> 
 
                    </button> 
 
                </td> 
            `; 
 
 
            tbody.appendChild(row); 
        } 
    ); 
} 
 
 
// ================================================== 
// LOAD HISTORY 
// ================================================== 
 
async function loadLeaveHistory() { 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + "/my/history", 
                { 
                    headers: { 
                        "Authorization": 
                            "Bearer " + getToken() 
                    } 
                } 
            ); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                "Unable to load leave history." 
            ); 
        } 
 
 
        const history = 
            await response.json(); 
 
 
        displayLeaveHistory(history); 
 
 
    } catch (error) { 
 
        console.error( 
            "History loading error:", 
            error 
        ); 
 
 
        document.getElementById( 
            "leaveHistoryBody" 
        ).innerHTML = ` 
            <tr> 
                <td colspan="4" 
                    class="loading-cell"> 
 
                    Unable to load leave history 
 
                </td> 
            </tr> 
        `; 
    } 
} 
 
 
// ================================================== 
// DISPLAY HISTORY 
// ================================================== 
 
function displayLeaveHistory(history) { 
 
    const tbody = 
        document.getElementById( 
            "leaveHistoryBody" 
        ); 
 
 
    if ( 
        !history || 
        history.length === 0 
    ) { 
 
        tbody.innerHTML = ` 
            <tr> 
                <td colspan="4" 
                    class="loading-cell"> 
 
                    No leave history 
 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    tbody.innerHTML = ""; 
 
 
    history.forEach( 
        function (leave) { 
 
            const row = 
                document.createElement( 
                    "tr" 
                ); 
 
 
            row.innerHTML = ` 
 
                <td> 
                    ${formatDate(leave.fromDate)} 
                </td> 
 
                <td> 
                    ${formatDate(leave.returnDate)} 
                </td> 
 
                <td> 
                    ${leave.reason || "-"} 
                </td> 
 
                <td> 
 
                    <span class="status-badge 
                        ${getStatusClass(leave.status)}"> 
 
                        ${leave.status} 
 
                    </span> 
 
                </td> 
 
            `; 
 
 
            tbody.appendChild(row); 
        } 
    ); 
} 
 
 
// ================================================== 
// OPEN ADD LEAVE MODAL 
// ================================================== 
 
function openLeaveModal() { 
 
    const form = 
        document.getElementById( 
            "leaveForm" 
        ); 
 
 
    // Remove old edit ID 
 
    delete form.dataset.leaveId; 
 
 
    document.getElementById( 
        "modalTitle" 
    ).textContent = "Inform Leave"; 
 
 
    form.reset(); 
 
 
    document.getElementById( 
        "leaveModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE MODAL 
// ================================================== 
 
function closeLeaveModal() { 
 
    document.getElementById( 
        "leaveModal" 
    ).classList.remove("show"); 
} 
 
 
// ================================================== 
// FORM SUBMIT 
// ================================================== 
 
async function handleLeaveSubmit(event) { 
 
    event.preventDefault(); 
 
 
    const form = 
        document.getElementById( 
            "leaveForm" 
        ); 
 
 
    const leaveId = 
        form.dataset.leaveId; 
 
 
    if (leaveId) { 
 
        await updateLeave(leaveId); 
 
    } else { 
 
        await saveNewLeave(); 
    } 
} 
 
 
// ================================================== 
// ADD NEW LEAVE 
// ================================================== 
 
async function saveNewLeave() { 
 
    const fromDate = 
        document.getElementById( 
            "leaveDate" 
        ).value; 
 
 
    const returnDate = 
        document.getElementById( 
            "returnDate" 
        ).value; 
 
 
    const reason = 
        document.getElementById( 
            "leaveReason" 
        ).value.trim(); 
 
 
    // Validation 
 
    if ( 
        !fromDate || 
        !returnDate || 
        !reason 
    ) { 
 
        alert( 
            "Please fill all fields." 
        ); 
 
        return; 
    } 
 
 
    if ( 
        returnDate < fromDate 
    ) { 
 
        alert( 
            "Return date cannot be before leave date." 
        ); 
 
        return; 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + "/my", 
                { 
                    method: "POST", 
 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + getToken(), 
 
                        "Content-Type": 
                            "application/json" 
                    }, 
 
                    body: JSON.stringify({ 
 
                        fromDate: fromDate, 
 
                        returnDate: returnDate, 
 
                        reason: reason 
                    }) 
                } 
            ); 
 
 
        const data = 
            await response.json(); 
 
 
        if (!response.ok) { 
 
            alert( 
                data.message || 
                "Unable to add leave." 
            ); 
 
            return; 
        } 
 
 
        alert( 
            "Leave added successfully." 
        ); 
 
 
        closeLeaveModal(); 
 
 
        document 
            .getElementById("leaveForm") 
            .reset(); 
 
 
        loadMyLeaves(); 
 
        loadLeaveHistory(); 
 
 
    } catch (error) { 
 
        console.error( 
            "Add leave error:", 
            error 
        ); 
 
 
        alert( 
            "Unable to add leave." 
        ); 
    } 
} 
 
 
// ================================================== 
// EDIT LEAVE 
// ================================================== 
 
async function editLeave(leaveId) { 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + "/my", 
                { 
                    headers: { 
                        "Authorization": 
                            "Bearer " + getToken() 
                    } 
                } 
            ); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                "Unable to load leave." 
            ); 
        } 
 
 
        const leaves = 
            await response.json(); 
 
 
        const leave = 
            leaves.find( 
                function (item) { 
 
                    return ( 
                        item.leaveId === 
                        leaveId 
                    ); 
                } 
            ); 
 
 
        if (!leave) { 
 
            alert( 
                "Leave record not found." 
            ); 
 
            return; 
        } 
 
 
        // Open edit modal 
 
        document.getElementById( 
            "modalTitle" 
        ).textContent = "Edit Leave"; 
 
 
        document.getElementById( 
            "leaveDate" 
        ).value = 
            leave.fromDate; 
 
 
        document.getElementById( 
            "returnDate" 
        ).value = 
            leave.returnDate; 
 
 
        document.getElementById( 
            "leaveReason" 
        ).value = 
            leave.reason; 
 
 
        // Store leave ID 
 
        document.getElementById( 
            "leaveForm" 
        ).dataset.leaveId = 
            leaveId; 
 
 
        document.getElementById( 
            "leaveModal" 
        ).classList.add("show"); 
 
 
    } catch (error) { 
 
        console.error( 
            "Edit leave error:", 
            error 
        ); 
 
 
        alert( 
            "Unable to load leave record." 
        ); 
    } 
} 
 
 
// ================================================== 
// UPDATE LEAVE 
// ================================================== 
 
async function updateLeave(leaveId) { 
 
    const fromDate = 
        document.getElementById( 
            "leaveDate" 
        ).value; 
 
 
    const returnDate = 
        document.getElementById( 
            "returnDate" 
        ).value; 
 
 
    const reason = 
        document.getElementById( 
            "leaveReason" 
        ).value.trim(); 
 
 
    // Validation 
 
    if ( 
        !fromDate || 
        !returnDate || 
        !reason 
    ) { 
 
        alert( 
            "Please fill all fields." 
        ); 
 
        return; 
    } 
 
 
    if ( 
        returnDate < fromDate 
    ) { 
 
        alert( 
            "Return date cannot be before leave date." 
        ); 
 
        return; 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + 
                "/my/" + 
                leaveId, 
                { 
                    method: "PUT", 
 
                    headers: { 
 
                        "Authorization": 
                            "Bearer " + getToken(), 
 
                        "Content-Type": 
                            "application/json" 
                    }, 
 
                    body: JSON.stringify({ 
 
                        fromDate: fromDate, 
 
                        returnDate: returnDate, 
 
                        reason: reason 
                    }) 
                } 
            ); 
 
 
        const data = 
            await response.json(); 
 
 
        if (!response.ok) { 
 
            alert( 
                data.message || 
                "Unable to update leave." 
            ); 
 
            return; 
        } 
 
 
        alert( 
            "Leave updated successfully." 
        ); 
 
 
        closeLeaveModal(); 
 
 
        const form = 
            document.getElementById( 
                "leaveForm" 
            ); 
 
 
        form.reset(); 
 
 
        delete form.dataset.leaveId; 
 
 
        loadMyLeaves(); 
 
        loadLeaveHistory(); 
 
 
    } catch (error) { 
 
        console.error( 
            "Update leave error:", 
            error 
        ); 
 
 
        alert( 
            "Unable to update leave." 
        ); 
    } 
} 
 
 
// ================================================== 
// CANCEL LEAVE 
// ================================================== 
 
async function cancelLeave(leaveId) { 
 
    const confirmCancel = 
        confirm( 
            "Are you sure you want to cancel this leave?" 
        ); 
 
 
    if (!confirmCancel) { 
 
        return; 
    } 
 
 
    try { 
 
        const response = 
            await fetch( 
                LEAVE_API_URL + 
                "/my/" + 
                leaveId + 
                "/cancel", 
                { 
                    method: "PUT", 
 
                    headers: { 
                        "Authorization": 
                            "Bearer " + getToken() 
                    } 
                } 
            ); 
 
 
        const data = 
            await response.json(); 
 
 
        if (!response.ok) { 
 
            alert( 
                data.message || 
                "Unable to cancel leave." 
            ); 
 
            return; 
        } 
 
 
        alert( 
            "Leave cancelled successfully." 
        ); 
 
 
        loadMyLeaves(); 
 
        loadLeaveHistory(); 
 
 
    } catch (error) { 
 
        console.error( 
            "Cancel leave error:", 
            error 
        ); 
 
 
        alert( 
            "Unable to cancel leave." 
        ); 
    } 
} 
 
 
// ================================================== 
// STATUS CLASS 
// ================================================== 
 
function getStatusClass(status) { 
 
    status = 
        ( 
            status || 
            "" 
        ).toUpperCase(); 
 
 
    if ( 
        status === "UPCOMING" 
    ) { 
 
        return "upcoming"; 
    } 
 
 
    if ( 
        status === "ON LEAVE" 
    ) { 
 
        return "on-leave"; 
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
 
 
    return "pending"; 
} 
 
 
// ================================================== 
// DATE FORMAT 
// ================================================== 
 
function formatDate(date) { 
 
    if (!date) { 
 
        return "-"; 
    } 
 
 
    const parts = 
        date.split("-"); 
 
 
    if ( 
        parts.length !== 3 
    ) { 
 
        return date; 
    } 
 
 
    return ( 
        parts[2] + 
        " " + 
        getMonthName(parts[1]) + 
        " " + 
        parts[0] 
    ); 
} 
 
 
// ================================================== 
// MONTH NAME 
// ================================================== 
 
function getMonthName(month) { 
 
    const months = [ 
 
        "Jan", 
        "Feb", 
        "Mar", 
        "Apr", 
        "May", 
        "Jun", 
        "Jul", 
        "Aug", 
        "Sep", 
        "Oct", 
        "Nov", 
        "Dec" 
    ]; 
 
 
    return months[ 
        parseInt(month) - 1 
    ]; 
} 
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
function logout() { 
 
    sessionStorage.clear(); 
 
    window.location.href = 
        "login.html"; 
}