const MOVEMENT_API_URL = "/api/movements"; 
 
const token = sessionStorage.getItem("token"); 
 
let movements = []; 
 
 
// ================================ 
// PAGE LOAD 
// ================================ 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadMovements(); 
 
}); 
 
 
// ================================ 
// LOAD MOVEMENTS 
// ================================ 
 
async function loadMovements() { 
 
    try { 
 
        const response = await fetch(MOVEMENT_API_URL, { 
 
            headers: { 
                "Authorization": "Bearer " + token 
            } 
 
        }); 
 
        if (!response.ok) { 
 
            throw new Error("Failed to load movements"); 
 
        } 
 
        movements = await response.json(); 
 
        displayMovements(movements); 
        updateCards(movements); 
 
    } catch (error) { 
 
        console.error("Error loading movements:", error); 
 
    } 
} 
 
 
// ================================ 
// DISPLAY MOVEMENTS 
// ================================ 
 
function displayMovements(data) { 
 
    const tableBody = 
        document.getElementById("movementTableBody"); 
 
    tableBody.innerHTML = ""; 
 
 
    if (data.length === 0) { 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="6" style="text-align:center;"> 
                    No movement records found 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    data.forEach(function (movement) { 
 
        const tenant = movement.tenant; 
 
        const tenantName = 
            tenant?.user?.fullName || "-"; 
 
        const phone = 
            tenant?.user?.phone || "-"; 
 
        const roomNo = 
            tenant?.room?.roomNo || "-"; 
 
        const movementTime = 
            formatDateTime(movement.movementTime); 
 
 
        const row = document.createElement("tr"); 
 
 
        row.innerHTML = ` 
 
            <td>${tenantName}</td> 
 
            <td>${roomNo}</td> 
 
            <td>${phone}</td> 
 
            <td>${movementTime}</td> 
 
            <td> 
                <span class="status ${movement.status.toLowerCase()}"> 
                    ${movement.status} 
                </span> 
            </td> 
 
            <td> 
                <button 
                    class="view-history-btn" 
                    onclick="viewHistory(${tenant.tenantId})" 
                    title="View History"> 
 
                    <i class="fa-solid fa-eye"></i> 
 
                </button> 
            </td> 
 
        `; 
 
 
        tableBody.appendChild(row); 
 
    }); 
} 
 
 
// ================================ 
// DATE & TIME FORMAT 
// ================================ 
 
function formatDateTime(dateTime) { 
 
    if (!dateTime) { 
        return "-"; 
    } 
 
 
    const date = new Date(dateTime); 
 
 
    return date.toLocaleString("en-IN", { 
 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
 
        hour: "2-digit", 
        minute: "2-digit" 
 
    }); 
} 
 
 
// ================================ 
// UPDATE SUMMARY CARDS 
// ================================ 
 
function updateCards(data) { 
 
    const total = 
        data.length; 
 
    const inCount = 
        data.filter( 
            movement => movement.status === "IN" 
        ).length; 
 
    const outCount = 
        data.filter( 
            movement => movement.status === "OUT" 
        ).length; 
 
 
    document.getElementById("totalTenants") 
        .textContent = total; 
 
    document.getElementById("inCount") 
        .textContent = inCount; 
 
    document.getElementById("outCount") 
        .textContent = outCount; 
} 
 
 
// ================================ 
// SEARCH + FILTER 
// ================================ 
 
function filterMovements() { 
 
    const searchValue = 
        document.getElementById("searchInput") 
        .value 
        .toLowerCase(); 
 
 
    const statusValue = 
        document.getElementById("statusFilter") 
        .value; 
 
 
    const filtered = 
        movements.filter(function (movement) { 
 
            const tenant = movement.tenant; 
 
            const tenantName = 
                tenant?.user?.fullName || ""; 
 
            const phone = 
                tenant?.user?.phone || ""; 
 
            const roomNo = 
                tenant?.room?.roomNo || ""; 
 
 
            const matchesSearch = 
 
                tenantName 
                    .toLowerCase() 
                    .includes(searchValue) 
 
                || 
 
                phone 
                    .toLowerCase() 
                    .includes(searchValue) 
 
                || 
 
                roomNo 
                    .toLowerCase() 
                    .includes(searchValue); 
 
 
            const matchesStatus = 
 
                statusValue === "ALL" 
                || 
                movement.status === statusValue; 
 
 
            return matchesSearch && matchesStatus; 
 
        }); 
 
 
    displayMovements(filtered); 
} 
 
 
// ================================ 
// SEARCH EVENT 
// ================================ 
 
document.getElementById("searchInput") 
    .addEventListener("input", filterMovements); 
 
 
// ================================ 
// STATUS FILTER EVENT 
// ================================ 
 
document.getElementById("statusFilter") 
    .addEventListener("change", filterMovements); 
 
 
// ================================ 
// VIEW HISTORY 
// ================================ 
 
async function viewHistory(tenantId) { 
 
    try { 
 
        const movement = movements.find( 
            m => m.tenant?.tenantId === tenantId 
        ); 
 
        if (movement) { 
 
            document.getElementById("historyTenant") 
                .textContent = 
                movement.tenant?.user?.fullName || "-"; 
 
            document.getElementById("historyRoom") 
                .textContent = 
                movement.tenant?.room?.roomNo || "-"; 
 
        } 
 
 
        const response = await fetch( 
            `${MOVEMENT_API_URL}/${tenantId}/history`, 
            { 
                headers: { 
                    "Authorization": "Bearer " + token 
                } 
            } 
        ); 
 
 
        if (!response.ok) { 
 
            throw new Error("Failed to load history"); 
 
        } 
 
 
        const history = await response.json(); 
 
        showHistory(history); 
 
 
    } catch (error) { 
 
        console.error( 
            "Error loading history:", 
            error 
        ); 
 
    } 
} 
 
 
// ================================ 
// SHOW HISTORY MODAL 
// ================================ 
 
function showHistory(history) { 
 
    const tableBody = 
        document.getElementById("historyTableBody"); 
 
    tableBody.innerHTML = ""; 
 
 
    if (history.length === 0) { 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="2"> 
                    No history found 
                </td> 
            </tr> 
        `; 
 
    } else { 
 
        history.forEach(function (record) { 
 
            const row = 
                document.createElement("tr"); 
 
 
            row.innerHTML = ` 
 
                <td> 
                    ${formatDateTime(record.movementTime)} 
                </td> 
 
                <td> 
                    <span class="status ${record.status.toLowerCase()}"> 
                        ${record.status} 
                    </span> 
                </td> 
 
            `; 
 
 
            tableBody.appendChild(row); 
 
        }); 
 
    } 
 
 
    document.getElementById("historyModal") 
        .classList.add("show"); 
} 
 
 
// ================================ 
// CLOSE HISTORY MODAL 
// ================================ 
 
document.getElementById("closeHistoryBtn") 
    .addEventListener("click", function () { 
 
        document.getElementById("historyModal") 
            .classList.remove("show"); 
 
    }); 
 
 
document.getElementById("historyCloseButton") 
    .addEventListener("click", function () { 
 
        document.getElementById("historyModal") 
            .classList.remove("show"); 
 
    }); 
 
    document.getElementById("logoutBtn").addEventListener("click",function(){ 
 
      sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 
 
    window.location.href = "/html/login.html"; 
})