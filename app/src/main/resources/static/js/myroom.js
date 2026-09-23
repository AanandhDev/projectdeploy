const TENANT_API_URL = "/api/tenants/my"; 


// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    loadMyRoom();

    loadProfile();

});


// ==================================================
// LOAD MY ROOM
// ==================================================

async function loadMyRoom() {

    const token = sessionStorage.getItem("token");


    // ------------------------------------------
    // CHECK LOGIN
    // ------------------------------------------

    if (!token) {

        window.location.href = "/html/login.html";

        return;
    }


    try {

        const response = await fetch(
            TENANT_API_URL,
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load room details."
            );
        }


        console.log("My Room Details:", data);


        displayMyRoom(data);


    } catch (error) {

        console.error(
            "Error loading my room:",
            error
        );

        alert(error.message);

    }

}


// ==================================================
// DISPLAY MY ROOM
// ==================================================

function displayMyRoom(tenant) {


    // ==================================================
    // ROOM DETAILS
    // ==================================================

    if (tenant.room) {

        // Room Overview

        document.getElementById(
            "overviewRoomNumber"
        ).textContent =
            tenant.room.roomNo || "-";


        document.getElementById(
            "overviewRoomType"
        ).textContent =
            tenant.room.roomType || "-";


        document.getElementById(
            "overviewStatus"
        ).textContent =
            tenant.room.status || "-";


        // Room Details

        document.getElementById(
            "roomNumber"
        ).textContent =
            tenant.room.roomNo || "-";


        document.getElementById(
            "roomType"
        ).textContent =
            tenant.room.roomType || "-";


    } else {

        document.getElementById(
            "overviewRoomNumber"
        ).textContent = "-";


        document.getElementById(
            "overviewRoomType"
        ).textContent = "-";


        document.getElementById(
            "overviewStatus"
        ).textContent = "-";


        document.getElementById(
            "roomNumber"
        ).textContent = "-";


        document.getElementById(
            "roomType"
        ).textContent = "-";

    }


    // ==================================================
    // FOOD
    // ==================================================

    if (
        tenant.foodPlan &&
        tenant.foodPlan.toUpperCase() === "WITH_FOOD"
    ) {

        document.getElementById(
            "foodType"
        ).textContent = "With Food";

    } else if (
        tenant.foodPlan &&
        tenant.foodPlan.toUpperCase() === "WITHOUT_FOOD"
    ) {

        document.getElementById(
            "foodType"
        ).textContent = "Without Food";

    } else {

        document.getElementById(
            "foodType"
        ).textContent = "-";

    }


    // ==================================================
    // MONTHLY RENT
    // ==================================================

    const rent = Number(tenant.rent || 0);


    document.getElementById(
        "monthlyRent"
    ).textContent =
        "₹" + rent.toFixed(2);


    // ==================================================
    // CHECK-IN DATE
    // ==================================================

    document.getElementById(
        "checkInDate"
    ).textContent =
        tenant.checkInDate || "-";


    // ==================================================
    // TENANT STATUS
    // ==================================================

    const roomStatus =
        document.getElementById("roomStatus");


    if (tenant.status) {

        roomStatus.textContent =
            tenant.status;


        if (
            tenant.status.toUpperCase() === "ACTIVE"
        ) {

            roomStatus.className =
                "room-status status-active";

        } else {

            roomStatus.className =
                "room-status status-inactive";

        }

    } else {

        roomStatus.textContent = "-";

    }


    // ==================================================
    // ROOM STATUS
    // ==================================================

    const overviewStatus =
        document.getElementById("overviewStatus");


    if (tenant.room && tenant.room.status) {

        overviewStatus.textContent =
            tenant.room.status;

    } else {

        overviewStatus.textContent = "-";

    }

}


// ==================================================
// LOAD PROFILE
// ==================================================

function loadProfile() {

    const username =
        sessionStorage.getItem("username");


    document.getElementById(
        "loggedUsername"
    ).textContent =
        username || "Tenant";

}


// ==================================================
// NOTIFICATIONS
// ==================================================

function toggleNotifications() {

    const dropdown =
        document.getElementById(
            "notificationDropdown"
        );


    dropdown.classList.toggle("show");

}


// ==================================================
// MARK ALL NOTIFICATIONS READ
// ==================================================

function markAllNotificationsRead() {

    document.getElementById(
        "notificationCount"
    ).textContent = "";


    document.getElementById(
        "notificationList"
    ).innerHTML = `
        <div class="notification-empty">
            No notifications
        </div>
    `;

}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    sessionStorage.removeItem("token");

    sessionStorage.removeItem("username");

    sessionStorage.removeItem("role");


    window.location.href =
        "/html/login.html";

}