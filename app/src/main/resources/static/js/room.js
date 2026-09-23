const ROOM_API_URL = "/api/rooms"; 
 
let rooms = []; 
let editingRoomId = null; 
 
 
// ================================================== 
// PAGE LOAD 
// ================================================== 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadProfile(); 
    loadRooms(); 
 
    document 
        .getElementById("openAddRoomBtn") 
        .addEventListener("click", openAddRoomModal); 
 
    document 
        .getElementById("closeAddRoomBtn") 
        .addEventListener("click", closeRoomModal); 
 
    document 
        .getElementById("cancelRoomBtn") 
        .addEventListener("click", closeRoomModal); 
 
    document 
        .getElementById("roomForm") 
        .addEventListener("submit", saveRoom); 
 
    document 
        .getElementById("roomType") 
        .addEventListener("change", updateRent); 
 
    document 
        .getElementById("searchInput") 
        .addEventListener("input", filterRooms); 
 
    document 
        .getElementById("statusFilter") 
        .addEventListener("change", filterRooms); 
 
    document 
        .getElementById("logoutBtn") 
        .addEventListener("click", logout); 
}); 
 
 
// ================================================== 
// PROFILE 
// ================================================== 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
    const role = 
        sessionStorage.getItem("role"); 
 
    document.getElementById( 
        "profileUsername" 
    ).textContent = username || "User"; 
 
    document.getElementById( 
        "profileRole" 
    ).textContent = role || "ADMIN"; 
} 
 
 
// ================================================== 
// TOKEN 
// ================================================== 
 
function getAuthHeaders() { 
 
    return { 
 
        "Content-Type": 
            "application/json", 
 
        "Authorization": 
            "Bearer " + 
            sessionStorage.getItem("token") 
    }; 
} 
 
 
// ================================================== 
// LOAD ROOMS 
// ================================================== 
 
async function loadRooms() { 
 
    try { 
 
        const response = 
            await fetch( 
                ROOM_API_URL, 
                { 
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
 
            throw new Error(message); 
        } 
 
 
        rooms = 
            await response.json(); 
 
 
        updateCards(); 
 
        displayRooms(rooms); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Load rooms error:", 
            error 
        ); 
 
        alert( 
            error.message || 
            "Unable to load rooms." 
        ); 
    } 
} 
 
 
// ================================================== 
// UPDATE CARDS 
// ================================================== 
 
function updateCards() { 
 
    const total = 
        rooms.length; 
 
 
    const available = 
        rooms.filter(function (room) { 
 
            return room.status && 
                room.status.toUpperCase() === 
                "AVAILABLE"; 
 
        }).length; 
 
 
    const occupied = 
        rooms.filter(function (room) { 
 
            return room.status && 
                room.status.toUpperCase() === 
                "OCCUPIED"; 
 
        }).length; 
 
 
    document.getElementById( 
        "totalRooms" 
    ).textContent = total; 
 
 
    document.getElementById( 
        "availableRooms" 
    ).textContent = available; 
 
 
    document.getElementById( 
        "occupiedRooms" 
    ).textContent = occupied; 
} 
 
 
// ================================================== 
// DISPLAY ROOMS 
// ================================================== 
 
function displayRooms(roomList) { 
 
    const tableBody = 
        document.getElementById( 
            "roomTableBody" 
        ); 
 
 
    tableBody.innerHTML = ""; 
 
 
    if ( 
        !roomList || 
        roomList.length === 0 
    ) { 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="empty-message"> 
                    No room records 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    roomList.forEach(function (room) { 
 
        const status = 
            room.status 
                ? room.status.toUpperCase() 
                : "AVAILABLE"; 
 
 
        const statusClass = 
            status === "OCCUPIED" 
                ? "occupied" 
                : "available"; 
 
 
        const row = 
            document.createElement("tr"); 
 
 
        row.innerHTML = ` 
 
            <td> 
                ${escapeHtml(room.roomNo)} 
            </td> 
 
            <td> 
                ${escapeHtml(room.roomType)} 
            </td> 
 
            <td> 
                ₹${room.rent} 
            </td> 
 
            <td> 
                <span class="status-badge ${statusClass}"> 
                    ${status} 
                </span> 
            </td> 
 
            <!-- ROOM ACTION CELL --> 
            <td class="room-action-cell"> 
 
                <div class="action-buttons"> 
 
                    <button 
                        class="action-btn edit-btn" 
                        onclick="editRoom(${room.id})" 
                        title="Edit"> 
 
                        ✏️ 
 
                    </button> 
 
                </div> 
 
            </td> 
        `; 
 
 
        tableBody.appendChild(row); 
    }); 
} 
 
 
// ================================================== 
// OPEN ADD ROOM 
// ================================================== 
 
function openAddRoomModal() { 
 
    editingRoomId = null; 
 
 
    document.getElementById( 
        "roomForm" 
    ).reset(); 
 
 
    document.getElementById( 
        "roomRent" 
    ).value = "0"; 
 
 
    document.getElementById( 
        "openAddRoomBtn" 
    ); 
 
 
    document.querySelector( 
        ".modal-header h2" 
    ).textContent = 
        "Add New Room"; 
 
 
    document.querySelector( 
        ".modal-actions .save-btn" 
    ).textContent = 
        "Add Room"; 
 
 
    document.getElementById( 
        "addRoomModal" 
    ).classList.add("show"); 
} 
 
 
// ================================================== 
// CLOSE MODAL 
// ================================================== 
 
function closeRoomModal() { 
 
    document.getElementById( 
        "addRoomModal" 
    ).classList.remove("show"); 
 
    editingRoomId = null; 
} 
 
 
// ================================================== 
// AUTOMATIC RENT 
// ================================================== 
 
function updateRent() { 
 
    const roomType = 
        document.getElementById( 
            "roomType" 
        ).value; 
 
 
    const rent = 
        document.getElementById( 
            "roomRent" 
        ); 
 
 
    if (roomType === "2 SHARE") { 
 
        rent.value = "5000"; 
 
    } 
    else if (roomType === "4 SHARE") { 
 
        rent.value = "4000"; 
 
    } 
    else { 
 
        rent.value = "0"; 
    } 
} 
 
 
// ================================================== 
// SAVE ROOM 
// ================================================== 
 
async function saveRoom(event) { 
 
    event.preventDefault(); 
 
    const roomNo = 
        document.getElementById( 
            "roomNumber" 
        ).value.trim(); 
 
    const roomType = 
        document.getElementById( 
            "roomType" 
        ).value; 
 
    if (!roomNo) { 
 
        alert( 
            "Please enter room number." 
        ); 
 
        return; 
    } 
 
    if (!roomType) { 
 
        alert( 
            "Please select room type." 
        ); 
 
        return; 
    } 
 
    const roomData = { 
 
        roomNo: roomNo, 
 
        roomType: roomType, 
 
        rent: 
            roomType === "2 SHARE" 
                ? 5000 
                : 4000 
    }; 
 
    try { 
 
        let response; 
 
        // ================================================== 
        // CREATE 
        // ================================================== 
 
        if (!editingRoomId) { 
 
            response = 
                await fetch( 
                    ROOM_API_URL, 
                    { 
                        method: "POST", 
 
                        headers: 
                            getAuthHeaders(), 
 
                        body: 
                            JSON.stringify( 
                                roomData 
                            ) 
                    } 
                ); 
        } 
 
        // ================================================== 
        // UPDATE 
        // ================================================== 
 
        else { 
 
            response = 
                await fetch( 
                    ROOM_API_URL + 
                    "/" + 
                    editingRoomId, 
                    { 
                        method: "PUT", 
 
                        headers: 
                            getAuthHeaders(), 
 
                        body: 
                            JSON.stringify( 
                                roomData 
                            ) 
                    } 
                ); 
        } 
 
        const message = 
            await response.text(); 
 
        if (!response.ok) { 
 
            alert( 
                message || 
                "Unable to save room." 
            ); 
 
            return; 
        } 
 
        alert( 
            editingRoomId 
                ? "Room updated successfully." 
                : "Room added successfully." 
        ); 
 
        closeRoomModal(); 
 
        loadRooms(); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Save room error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
    } 
} 
 
 
// ================================================== 
// EDIT ROOM 
// ================================================== 
 
async function editRoom(id) { 
 
    try { 
 
        const response = 
            await fetch( 
                ROOM_API_URL + 
                "/" + 
                id, 
                { 
                    headers: 
                        getAuthHeaders() 
                } 
            ); 
 
        if (!response.ok) { 
 
            const message = 
                await response.text(); 
 
            alert( 
                message || 
                "Unable to load room." 
            ); 
 
            return; 
        } 
 
        const room = 
            await response.json(); 
 
        editingRoomId = id; 
 
        document.querySelector( 
            ".modal-header h2" 
        ).textContent = 
            "Edit Room"; 
 
        document.querySelector( 
            ".modal-actions .save-btn" 
        ).textContent = 
            "Update Room"; 
 
        document.getElementById( 
            "roomNumber" 
        ).value = 
            room.roomNo || ""; 
 
        document.getElementById( 
            "roomType" 
        ).value = 
            room.roomType || ""; 
 
        document.getElementById( 
            "roomRent" 
        ).value = 
            room.rent || "0"; 
 
        document.getElementById( 
            "addRoomModal" 
        ).classList.add("show"); 
 
    } 
    catch (error) { 
 
        console.error( 
            "Edit room error:", 
            error 
        ); 
 
        alert( 
            "Unable to connect to server." 
        ); 
    } 
} 
 
 
// ================================================== 
// SEARCH + FILTER 
// ================================================== 
 
function filterRooms() { 
 
    const search = 
        document.getElementById( 
            "searchInput" 
        ).value 
            .toLowerCase() 
            .trim(); 
 
 
    const status = 
        document.getElementById( 
            "statusFilter" 
        ).value; 
 
 
    const filtered = 
        rooms.filter(function (room) { 
 
            const matchesSearch = 
                (room.roomNo || "") 
                    .toLowerCase() 
                    .includes(search); 
 
 
            const matchesStatus = 
                status === "ALL" || 
                (room.status || "") 
                    .toUpperCase() === 
                    status; 
 
 
            return ( 
                matchesSearch && 
                matchesStatus 
            ); 
        }); 
 
 
    displayRooms(filtered); 
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
        .replace( 
            /&/g, 
            "&amp;" 
        ) 
        .replace( 
            /</g, 
            "&lt;" 
        ) 
        .replace( 
            />/g, 
            "&gt;" 
        ) 
        .replace( 
            /"/g, 
            "&quot;" 
        ) 
        .replace( 
            /'/g, 
            "&#039;" 
        ); 
} 
 
 
// ================================================== 
// LOGOUT 
// ================================================== 
 
function logout() { 
 
    sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 
    sessionStorage.removeItem("userRole"); 
 
    window.location.href = 
        "/html/login.html"; 
}