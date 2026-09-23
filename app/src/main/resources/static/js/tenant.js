const TENANT_API = "/api/tenants";
const ROOM_API = "/api/rooms";

let allTenants = [];
let availableUsers = [];
let availableRooms = [];

let currentPage = 1;
const pageSize = 5;

let rejoinTenantId = null;


// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    setCurrentDate();

    loadTenants();
    loadTenantUsers();
    loadAvailableRooms();

    document
        .getElementById("openAddTenantBtn")
        .addEventListener("click", openAddTenantModal);

    document
        .getElementById("closeAddTenantBtn")
        .addEventListener("click", closeAddTenantModal);

    document
        .getElementById("cancelTenantBtn")
        .addEventListener("click", closeAddTenantModal);

    document
        .getElementById("tenantForm")
        .addEventListener("submit", handleTenantSubmit);

    document
        .getElementById("roomSelect")
        .addEventListener("change", calculateRent);

    document
        .querySelectorAll('input[name="foodPlan"]')
        .forEach(radio => {

            radio.addEventListener(
                "change",
                calculateRent
            );
        });

    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            filterTenants
        );

    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            filterTenants
        );

    document
        .getElementById("previousBtn")
        .addEventListener(
            "click",
            previousPage
        );

    document
        .getElementById("nextBtn")
        .addEventListener(
            "click",
            nextPage
        );


    // ==================================================
    // REJOIN MODAL
    // ==================================================

    document
        .getElementById("closeRejoinTenantBtn")
        .addEventListener(
            "click",
            closeRejoinTenantModal
        );

    document
        .getElementById("cancelRejoinTenantBtn")
        .addEventListener(
            "click",
            closeRejoinTenantModal
        );

    document
        .getElementById("rejoinTenantForm")
        .addEventListener(
            "submit",
            handleRejoinSubmit
        );

    document
        .getElementById("rejoinRoomSelect")
        .addEventListener(
            "change",
            calculateRejoinRent
        );

    document
        .querySelectorAll('input[name="rejoinFoodPlan"]')
        .forEach(radio => {

            radio.addEventListener(
                "change",
                calculateRejoinRent
            );
        });


    // ==================================================
    // HISTORY MODAL
    // ==================================================

    document
        .getElementById("closeTenantHistoryModal")
        .addEventListener(
            "click",
            closeTenantHistoryModal
        );

    document
        .getElementById("tenantHistoryCloseBtn")
        .addEventListener(
            "click",
            closeTenantHistoryModal
        );

    loadProfile();
});


// ==================================================
// HANDLE TENANT FORM
// ==================================================

async function handleTenantSubmit(event) {

    const form =
        document.getElementById("tenantForm");

    const editingId =
        form.dataset.editingId;

    if (editingId) {

        await updateTenant(event);

    } else {

        await addTenant(event);
    }
}


// ==================================================
// TOKEN
// ==================================================

function getHeaders() {

    const token =
        sessionStorage.getItem("token");

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


// ==================================================
// LOAD TENANTS
// ==================================================

async function loadTenants() {

    try {

        const response =
            await fetch(
                TENANT_API,
                {
                    headers: getHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load tenants"
            );
        }

        allTenants =
            await response.json();

        updateSummary();

        displayTenants();

    } catch (error) {

        console.error(error);

        document
            .getElementById(
                "tenantTableBody"
            )
            .innerHTML = `
                <tr>
                    <td colspan="8"
                        class="loading-message">
                        Failed to load tenants
                    </td>
                </tr>
            `;
    }
}


// ==================================================
// LOAD TENANT USERS
// ==================================================

async function loadTenantUsers() {

    try {

        const response = await fetch(
            "/api/tenants/available-users",
            {
                headers: getHeaders()
            }
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load tenant users"
            );
        }

        const users =
            await response.json();

        const tenantSelect =
            document.getElementById("tenantUser");

        tenantSelect.innerHTML =
            '<option value="">Select Tenant</option>';

        availableUsers = users;

        users.forEach(function (user) {

            const option =
                document.createElement("option");

            option.value = user.id;

            option.textContent =
                `${user.fullName} (${user.username})`;

            tenantSelect.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Error loading tenant users:",
            error
        );
    }
}


// ==================================================
// LOAD AVAILABLE ROOMS
// ==================================================

async function loadAvailableRooms() {

    try {

        const response =
            await fetch(
                ROOM_API,
                {
                    headers: getHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load rooms"
            );
        }

        const rooms =
            await response.json();

        availableRooms =
            rooms.filter(
                room =>
                    room.status === "AVAILABLE"
            );

        fillRoomDropdown();

    } catch (error) {

        console.error(error);
    }
}


// ==================================================
// ROOM DROPDOWN
// ==================================================

function fillRoomDropdown() {

    const dropdown =
        document.getElementById(
            "roomSelect"
        );

    dropdown.innerHTML = `
        <option value="">
            Select Available Room
        </option>
    `;

    availableRooms.forEach(room => {

        const option =
            document.createElement("option");

        option.value = room.id;

        option.dataset.roomType =
            room.roomType;

        option.dataset.rent =
            room.rent;

        option.textContent =
            `${room.roomNo} - ${room.roomType}`;

        dropdown.appendChild(option);
    });
}


// ==================================================
// CALCULATE RENT
// ==================================================

function calculateRent() {

    const roomSelect =
        document.getElementById(
            "roomSelect"
        );

    const selectedOption =
        roomSelect.options[
            roomSelect.selectedIndex
        ];

    if (
        !selectedOption ||
        !selectedOption.value
    ) {

        document
            .getElementById(
                "monthlyRent"
            )
            .value = "0";

        return;
    }

    const roomRent =
        Number(
            selectedOption.dataset.rent
        );

    const foodPlan =
        document.querySelector(
            '#tenantForm input[name="foodPlan"]:checked'
        );

    if (!foodPlan) {

        document
            .getElementById(
                "monthlyRent"
            )
            .value = roomRent;

        return;
    }

    let finalRent =
        roomRent;

    if (
        foodPlan.value ===
        "WITH_FOOD"
    ) {

        finalRent += 2500;
    }

    document
        .getElementById(
            "monthlyRent"
        )
        .value =
        finalRent;
}


// ==================================================
// SET CURRENT DATE
// ==================================================

function setCurrentDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    document
        .getElementById(
            "checkInDate"
        )
        .value = today;
}


// ==================================================
// ADD TENANT
// ==================================================

async function addTenant(event) {

    event.preventDefault();

    const userId =
        document.getElementById(
            "tenantUser"
        ).value;

    const roomId =
        document.getElementById(
            "roomSelect"
        ).value;

    const foodPlan =
        document.querySelector(
            '#tenantForm input[name="foodPlan"]:checked'
        );

    const checkInDate =
        document.getElementById(
            "checkInDate"
        ).value;

    if (!userId) {

        alert(
            "Please select a tenant."
        );

        return;
    }

    if (!roomId) {

        alert(
            "Please select a room."
        );

        return;
    }

    if (!foodPlan) {

        alert(
            "Please select a food plan."
        );

        return;
    }

    try {

        const response =
            await fetch(
                TENANT_API,
                {
                    method: "POST",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({

                            userId:
                                Number(userId),

                            roomId:
                                Number(roomId),

                            foodPlan:
                                foodPlan.value,

                            checkInDate:
                                checkInDate
                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add tenant."
            );

            return;
        }

        alert(
            "Tenant added successfully."
        );

        closeAddTenantModal();

        document
            .getElementById(
                "tenantForm"
            )
            .reset();

        setCurrentDate();

        await loadTenants();

        await loadTenantUsers();

        await loadAvailableRooms();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );
    }
}


// ==================================================
// DISPLAY TENANTS
// ==================================================

function displayTenants() {

    const tbody =
        document.getElementById(
            "tenantTableBody"
        );

    let filtered =
        getFilteredTenants();

    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="loading-message">
                    No tenants found
                </td>
            </tr>
        `;

        renderPagination(0);

        return;
    }

    const start =
        (currentPage - 1)
        * pageSize;

    const end =
        start + pageSize;

    const pageData =
        filtered.slice(start, end);

    tbody.innerHTML = "";

    pageData.forEach(tenant => {

        const row =
            document.createElement("tr");

        const user =
            tenant.user || {};

        const room =
            tenant.room || {};

        const tenantName =
            user.fullName ||
            user.username ||
            "Unknown";

        const username =
            user.username ||
            "";

        const phone =
            user.phone ||
            "-";

        const roomNo =
            room.roomNo ||
            "-";

        const food =
            tenant.foodPlan ===
                "WITH_FOOD"
                ? "With Food"
                : "Without Food";

        row.innerHTML = `

            <td>
                <strong>
                    ${tenantName}
                </strong>

                <small>
                    ${username}
                </small>
            </td>

            <td>
                ${phone}
            </td>

            <td>
                ${roomNo}
            </td>

            <td>
                ${food}
            </td>

            <td>
                ₹${Number(
                    tenant.rent
                ).toLocaleString("en-IN")}
            </td>

            <td>
                ${tenant.checkInDate || "-"}
            </td>

            <td>

                <span class="status-badge
                    ${tenant.status.toLowerCase()}">

                    ${tenant.status}

                </span>

            </td>

            <td class="tenant-action-cell">

                <button
                    class="action-btn"
                    title="View Tenant History"
                    onclick="viewTenantHistory(
                        ${tenant.tenantId},
                        '${tenantName.replace(/'/g, "\\'")}'
                    )">

                    👁️

                </button>

                ${
                    tenant.status === "ACTIVE"

                    ? `

                        <button
                            class="action-btn"
                            title="Edit Tenant"
                            onclick="editTenant(${tenant.tenantId})">

                            ✏️

                        </button>

                        <button
                            class="action-btn"
                            title="Make Tenant Inactive"
                            onclick="makeInactive(${tenant.tenantId})">

                            ⏸

                        </button>

                    `

                    : `

                        <button
                            class="action-btn"
                            title="Rejoin Tenant"
                            onclick="openRejoinTenant(
                                ${tenant.tenantId}
                            )">

                            🔄

                        </button>

                    `
                }

            </td>
        `;

        tbody.appendChild(row);
    });

    renderPagination(
        filtered.length
    );
}


// ==================================================
// EDIT TENANT
// ==================================================

async function editTenant(tenantId) {

    const tenant = allTenants.find(
        t => t.tenantId === tenantId
    );

    if (!tenant) {

        alert("Tenant not found.");

        return;
    }

    const form =
        document.getElementById(
            "tenantForm"
        );

    document.getElementById(
        "tenantModalTitle"
    ).textContent =
        "Edit Tenant";

    document.getElementById(
        "tenantSubmitBtn"
    ).textContent =
        "Update Tenant";

    document.getElementById(
        "checkInDateGroup"
    ).style.display =
        "none";

    const tenantUser =
        document.getElementById(
            "tenantUser"
        );

    const tenantNameReadonly =
        document.getElementById(
            "tenantNameReadonly"
        );

    tenantUser.style.display =
        "none";

    tenantUser.required =
        false;

    tenantNameReadonly.style.display =
        "block";

    tenantNameReadonly.value =
        tenant.user.fullName ||
        tenant.user.username ||
        "";

    const foodPlan =
        document.querySelector(
            `#tenantForm input[name="foodPlan"][value="${tenant.foodPlan}"]`
        );

    if (foodPlan) {

        foodPlan.checked =
            true;
    }

    await loadRoomsForEdit(
        tenant.room.id
    );

    const roomSelect =
        document.getElementById(
            "roomSelect"
        );

    roomSelect.value =
        tenant.room.id;

    calculateRent();

    form.dataset.editingId =
        tenantId;

    document
        .getElementById(
            "addTenantModal"
        )
        .classList.add("show");
}


// ==================================================
// UPDATE TENANT
// ==================================================

async function updateTenant(event) {

    event.preventDefault();

    const form =
        document.getElementById(
            "tenantForm"
        );

    const tenantId =
        form.dataset.editingId;

    const roomId =
        document.getElementById(
            "roomSelect"
        ).value;

    const foodPlan =
        document.querySelector(
            '#tenantForm input[name="foodPlan"]:checked'
        );

    if (!roomId) {

        alert("Please select a room.");

        return;
    }

    if (!foodPlan) {

        alert(
            "Please select a food plan."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${TENANT_API}/${tenantId}/room`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({

                            roomId:
                                Number(roomId),

                            foodPlan:
                                foodPlan.value
                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update tenant."
            );

            return;
        }

        alert(
            "Tenant updated successfully."
        );

        closeAddTenantModal();

        form.reset();

        delete form.dataset.editingId;

        await loadTenants();

        await loadTenantUsers();

        await loadAvailableRooms();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );
    }
}


// ==================================================
// LOAD ROOMS FOR EDIT
// ==================================================

async function loadRoomsForEdit(currentRoomId) {

    try {

        const response =
            await fetch(
                ROOM_API,
                {
                    headers: getHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load rooms"
            );
        }

        const rooms =
            await response.json();

        const dropdown =
            document.getElementById(
                "roomSelect"
            );

        dropdown.innerHTML = `
            <option value="">
                Select Room
            </option>
        `;

        rooms.forEach(room => {

            if (
                room.status === "AVAILABLE" ||
                room.id === currentRoomId
            ) {

                const option =
                    document.createElement("option");

                option.value =
                    room.id;

                option.dataset.roomType =
                    room.roomType;

                option.dataset.rent =
                    room.rent;

                option.textContent =
                    `${room.roomNo} - ${room.roomType}`;

                dropdown.appendChild(option);
            }
        });

    } catch (error) {

        console.error(error);

        alert(
            "Failed to load rooms."
        );
    }
}


// ==================================================
// MAKE INACTIVE
// ==================================================

async function makeInactive(tenantId) {

    const confirmInactive =
        confirm(
            "Are you sure you want to make this tenant inactive?"
        );

    if (!confirmInactive) {

        return;
    }

    try {

        const response =
            await fetch(
                `${TENANT_API}/${tenantId}/inactive`,
                {
                    method: "PUT",

                    headers:
                        getHeaders()
                }
            );

        const responseText =
            await response.text();

        let data = {};

        if (responseText) {

            try {

                data =
                    JSON.parse(responseText);

            } catch (error) {

                data.message =
                    responseText;
            }
        }

        if (!response.ok) {

            alert(
                data.message ||
                "Tenant cannot be made inactive."
            );

            return;
        }

        alert(
            data.message ||
            "Tenant made inactive successfully."
        );

        await loadTenants();

        await loadTenantUsers();

        await loadAvailableRooms();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );
    }
}


// ==================================================
// OPEN REJOIN MODAL
// ==================================================

async function openRejoinTenant(tenantId) {

    const tenant =
        allTenants.find(
            t => t.tenantId === tenantId
        );

    if (!tenant) {

        alert("Tenant not found.");

        return;
    }

    rejoinTenantId =
        tenantId;

    const form =
        document.getElementById(
            "rejoinTenantForm"
        );

    form.reset();

    document
        .getElementById(
            "rejoinTenantName"
        )
        .value =
        tenant.user.fullName ||
        tenant.user.username ||
        "";

    document
        .getElementById(
            "rejoinMonthlyRent"
        )
        .value = "0";

    await loadRoomsForRejoin();

    document
        .getElementById(
            "rejoinTenantModal"
        )
        .classList.add("show");
}


// ==================================================
// LOAD AVAILABLE ROOMS FOR REJOIN
// ==================================================

async function loadRoomsForRejoin() {

    try {

        const response =
            await fetch(
                ROOM_API,
                {
                    headers: getHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load rooms"
            );
        }

        const rooms =
            await response.json();

        const dropdown =
            document.getElementById(
                "rejoinRoomSelect"
            );

        dropdown.innerHTML = `
            <option value="">
                Select Available Room
            </option>
        `;

        rooms
            .filter(
                room =>
                    room.status ===
                    "AVAILABLE"
            )
            .forEach(room => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    room.id;

                option.dataset.rent =
                    room.rent;

                option.textContent =
                    `${room.roomNo} - ${room.roomType}`;

                dropdown.appendChild(
                    option
                );
            });

    } catch (error) {

        console.error(error);

        alert(
            "Failed to load available rooms."
        );
    }
}


// ==================================================
// CALCULATE REJOIN RENT
// ==================================================

function calculateRejoinRent() {

    const roomSelect =
        document.getElementById(
            "rejoinRoomSelect"
        );

    const selectedOption =
        roomSelect.options[
            roomSelect.selectedIndex
        ];

    if (
        !selectedOption ||
        !selectedOption.value
    ) {

        document
            .getElementById(
                "rejoinMonthlyRent"
            )
            .value = "0";

        return;
    }

    const roomRent =
        Number(
            selectedOption.dataset.rent
        );

    const foodPlan =
        document.querySelector(
            '#rejoinTenantForm input[name="rejoinFoodPlan"]:checked'
        );

    if (!foodPlan) {

        document
            .getElementById(
                "rejoinMonthlyRent"
            )
            .value =
            roomRent;

        return;
    }

    let finalRent =
        roomRent;

    if (
        foodPlan.value ===
        "WITH_FOOD"
    ) {

        finalRent += 2500;
    }

    document
        .getElementById(
            "rejoinMonthlyRent"
        )
        .value =
        finalRent;
}


// ==================================================
// HANDLE REJOIN
// ==================================================

async function handleRejoinSubmit(event) {

    event.preventDefault();

    if (!rejoinTenantId) {

        alert(
            "Tenant not selected."
        );

        return;
    }

    const roomId =
        document.getElementById(
            "rejoinRoomSelect"
        ).value;

    const foodPlan =
        document.querySelector(
            '#rejoinTenantForm input[name="rejoinFoodPlan"]:checked'
        );

    if (!roomId) {

        alert(
            "Please select a room."
        );

        return;
    }

    if (!foodPlan) {

        alert(
            "Please select a food plan."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${TENANT_API}/${rejoinTenantId}/active`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({

                            roomId:
                                Number(roomId),

                            foodPlan:
                                foodPlan.value
                        })
                }
            );

        // ==========================================
        // SAFE RESPONSE HANDLING
        // ==========================================

        const responseText =
            await response.text();

        let data = {};

        if (responseText) {

            try {

                data =
                    JSON.parse(responseText);

            } catch (error) {

                data.message =
                    responseText;
            }
        }

        // ==========================================
        // ERROR
        // ==========================================

        if (!response.ok) {

            console.error(
                "Rejoin failed:",
                response.status,
                data
            );

            if (response.status === 401) {

                alert(
                    "Your session has expired. Please login again."
                );

                return;
            }

            if (response.status === 403) {

                alert(
                    data.message ||
                    "You do not have permission to rejoin this tenant."
                );

                return;
            }

            alert(
                data.message ||
                "Tenant cannot be rejoined."
            );

            return;
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        alert(
            data.message ||
            "Tenant rejoined successfully."
        );

        closeRejoinTenantModal();

        rejoinTenantId =
            null;

        await loadTenants();

        await loadTenantUsers();

        await loadAvailableRooms();

    } catch (error) {

        console.error(
            "Rejoin error:",
            error
        );

        alert(
            "Something went wrong while rejoining the tenant."
        );
    }
}


// ==================================================
// CLOSE REJOIN MODAL
// ==================================================

function closeRejoinTenantModal() {

    document
        .getElementById(
            "rejoinTenantModal"
        )
        .classList.remove("show");

    document
        .getElementById(
            "rejoinTenantForm"
        )
        .reset();

    document
        .getElementById(
            "rejoinMonthlyRent"
        )
        .value = "0";

    rejoinTenantId =
        null;
}


// ==================================================
// VIEW TENANT HISTORY
// ==================================================

async function viewTenantHistory(
    tenantId,
    tenantName
) {

    document
        .getElementById(
            "tenantHistoryTenantName"
        )
        .textContent =
        `${tenantName} - Stay History`;

    document
        .getElementById(
            "tenantHistoryTableBody"
        )
        .innerHTML = `
            <tr>
                <td colspan="6"
                    class="loading-message">
                    Loading history...
                </td>
            </tr>
        `;

    document
        .getElementById(
            "tenantHistoryModal"
        )
        .classList.add("show");

    try {

        const response =
            await fetch(
                `${TENANT_API}/${tenantId}/history`,
                {
                    headers:
                        getHeaders()
                }
            );

        const responseText =
            await response.text();

        let data = {};

        if (responseText) {

            try {

                data =
                    JSON.parse(responseText);

            } catch (error) {

                data.message =
                    responseText;
            }
        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tenant history."
            );
        }

        displayTenantHistory(
            data
        );

    } catch (error) {

        console.error(error);

        document
            .getElementById(
                "tenantHistoryTableBody"
            )
            .innerHTML = `
                <tr>
                    <td colspan="6"
                        class="loading-message">
                        Failed to load history
                    </td>
                </tr>
            `;
    }
}


// ==================================================
// DISPLAY TENANT HISTORY
// ==================================================

function displayTenantHistory(histories) {

    const tbody =
        document.getElementById(
            "tenantHistoryTableBody"
        );

    if (
        !histories ||
        histories.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="loading-message">
                    No history found
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = "";

    histories.forEach(history => {

        const row =
            document.createElement("tr");

        const food =
            history.foodPlan ===
                "WITH_FOOD"
                ? "With Food"
                : "Without Food";

        const vacateDate =
            history.vacateDate ||
            "-";

        row.innerHTML = `

            <td>
                ${history.roomNo || "-"}
            </td>

            <td>
                ${history.checkInDate || "-"}
            </td>

            <td>
                ${vacateDate}
            </td>

            <td>
                ${food}
            </td>

            <td>
                ₹${Number(
                    history.rent || 0
                ).toLocaleString("en-IN")}
            </td>

            <td>

                <span class="status-badge
                    ${history.status.toLowerCase()}">

                    ${history.status}

                </span>

            </td>
        `;

        tbody.appendChild(row);
    });
}


// ==================================================
// CLOSE HISTORY MODAL
// ==================================================

function closeTenantHistoryModal() {

    document
        .getElementById(
            "tenantHistoryModal"
        )
        .classList.remove("show");
}


// ==================================================
// FILTER
// ==================================================

function getFilteredTenants() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase();

    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;

    return allTenants.filter(
        tenant => {

            const user =
                tenant.user || {};

            const name =
                (
                    user.fullName ||
                    user.username ||
                    ""
                ).toLowerCase();

            const phone =
                (
                    user.phone ||
                    ""
                ).toLowerCase();

            const room =
                (
                    tenant.room?.roomNo ||
                    ""
                ).toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                phone.includes(search) ||
                room.includes(search);

            const matchesStatus =
                status === "ALL" ||
                tenant.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );
}


// ==================================================
// FILTER EVENT
// ==================================================

function filterTenants() {

    currentPage = 1;

    displayTenants();
}


// ==================================================
// SUMMARY
// ==================================================

function updateSummary() {

    document
        .getElementById(
            "totalTenants"
        )
        .textContent =
        allTenants.length;

    document
        .getElementById(
            "activeTenants"
        )
        .textContent =
        allTenants.filter(
            tenant =>
                tenant.status ===
                "ACTIVE"
        ).length;

    document
        .getElementById(
            "inactiveTenants"
        )
        .textContent =
        allTenants.filter(
            tenant =>
                tenant.status ===
                "INACTIVE"
        ).length;
}


// ==================================================
// OPEN ADD TENANT MODAL
// ==================================================

function openAddTenantModal() {

    const form =
        document.getElementById(
            "tenantForm"
        );

    document
        .getElementById(
            "tenantModalTitle"
        )
        .textContent =
        "Add New Tenant";

    document
        .getElementById(
            "tenantSubmitBtn"
        )
        .textContent =
        "Add Tenant";

    document
        .getElementById(
            "checkInDateGroup"
        )
        .style.display =
        "block";

    document
        .getElementById(
            "tenantUser"
        )
        .style.display =
        "block";

    document
        .getElementById(
            "tenantUser"
        )
        .required =
        true;

    document
        .getElementById(
            "tenantUser"
        )
        .disabled =
        false;

    document
        .getElementById(
            "tenantNameReadonly"
        )
        .style.display =
        "none";

    delete form.dataset.editingId;

    form.reset();

    setCurrentDate();

    loadTenantUsers();

    loadAvailableRooms();

    document
        .getElementById(
            "addTenantModal"
        )
        .classList.add("show");
}


// ==================================================
// CLOSE ADD / EDIT MODAL
// ==================================================

function closeAddTenantModal() {

    document
        .getElementById(
            "addTenantModal"
        )
        .classList.remove("show");
}


// ==================================================
// PAGINATION
// ==================================================

function renderPagination(totalItems) {

    const pageNumbers =
        document.getElementById(
            "pageNumbers"
        );

    const totalPages =
        Math.ceil(
            totalItems / pageSize
        );

    pageNumbers.innerHTML = "";

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            i;

        if (i === currentPage) {

            button.classList.add(
                "active"
            );
        }

        button.onclick = () => {

            currentPage = i;

            displayTenants();
        };

        pageNumbers.appendChild(
            button
        );
    }

    document
        .getElementById(
            "previousBtn"
        )
        .disabled =
        currentPage === 1;

    document
        .getElementById(
            "nextBtn"
        )
        .disabled =
        currentPage >= totalPages;
}


function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        displayTenants();
    }
}


function nextPage() {

    const totalPages =
        Math.ceil(
            getFilteredTenants().length
            / pageSize
        );

    if (currentPage < totalPages) {

        currentPage++;

        displayTenants();
    }
}


// ==================================================
// PROFILE
// ==================================================

function loadProfile() {

    const username =
        sessionStorage.getItem(
            "username"
        );

    const role =
        sessionStorage.getItem(
            "role"
        );

    if (username) {

        document
            .getElementById(
                "profileUsername"
            )
            .textContent =
            username;
    }

    if (role) {

        document
            .getElementById(
                "profileRole"
            )
            .textContent =
            role;
    }
}


// ==================================================
// LOGOUT
// ==================================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            sessionStorage.removeItem("token");

            sessionStorage.removeItem("username");

            sessionStorage.removeItem("role");

            window.location.href =
                "/html/login.html";
        }
    );