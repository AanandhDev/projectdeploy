let complaints = [];

let selectedComplaintId = null;


/* ==================================================
   API URL
================================================== */

const COMPLAINT_API_URL = "/api/complaints";


/* ==================================================
   DOM ELEMENTS
================================================== */

const tableBody =
    document.getElementById("complaintTableBody");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const emptyMessage =
    document.getElementById("emptyMessage");


/* ==================================================
   GET TOKEN
================================================== */

function getToken() {

    return sessionStorage.getItem("token");

}


/* ==================================================
   COMMON AUTH HEADERS
================================================== */

function getAuthHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };

}


/* ==================================================
   LOAD PROFILE
================================================== */

function loadProfile() {

    const username =
        sessionStorage.getItem("username");

    const role =
        sessionStorage.getItem("role");

    document.getElementById("profileUsername")
        .textContent = username || "User";

    document.getElementById("profileRole")
        .textContent =
        role ? role.toUpperCase() : "";

}


/* ==================================================
   LOAD COMPLAINTS FROM BACKEND
================================================== */

async function loadComplaints() {

    try {

        const token = getToken();

        if (!token) {

            window.location.href = "login.html";

            return;

        }


        const response = await fetch(
            COMPLAINT_API_URL,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "login.html";

            return;

        }


        if (response.status === 403) {

            alert(
                "You do not have permission to access complaints."
            );

            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Unable to load complaints."
            );

        }


        complaints =
            await response.json();


        displayComplaints();


    }
    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );

        tableBody.innerHTML = "";

        emptyMessage.style.display = "block";

        emptyMessage.textContent =
            "Unable to load complaints.";

    }

}


/* ==================================================
   DISPLAY COMPLAINTS
================================================== */

function displayComplaints() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    let selectedStatus =
        statusFilter.value;


    /*
     * Support old HTML filter values also.
     *
     * Old:
     * IN PROGRESS
     * WAITING
     * CLOSED
     *
     * Backend:
     * IN_PROGRESS
     * WAITING_FOR_CONFIRMATION
     * RESOLVED
     * CANCELLED
     */

    if (selectedStatus === "IN PROGRESS") {

        selectedStatus = "IN_PROGRESS";

    }

    else if (selectedStatus === "WAITING") {

        selectedStatus =
            "WAITING_FOR_CONFIRMATION";

    }

    else if (selectedStatus === "CLOSED") {

        selectedStatus = "RESOLVED";

    }


    const filteredComplaints =
        complaints.filter(function (complaint) {


            const tenantName =
                complaint.tenantName
                    ? complaint.tenantName.toLowerCase()
                    : "";


            const roomNo =
                complaint.roomNo
                    ? complaint.roomNo.toLowerCase()
                    : "";


            const title =
                complaint.title
                    ? complaint.title.toLowerCase()
                    : "";


            const category =
                complaint.category
                    ? complaint.category.toLowerCase()
                    : "";


            const description =
                complaint.description
                    ? complaint.description.toLowerCase()
                    : "";


            const matchesSearch =
                tenantName.includes(searchText) ||
                roomNo.includes(searchText) ||
                title.includes(searchText) ||
                category.includes(searchText) ||
                description.includes(searchText);


            const matchesStatus =
                selectedStatus === "ALL" ||
                complaint.status === selectedStatus;


            return matchesSearch && matchesStatus;

        });


    tableBody.innerHTML = "";


    if (filteredComplaints.length === 0) {

        emptyMessage.style.display = "block";

        emptyMessage.textContent =
            "No complaints found.";

        updateCards();

        return;

    }


    emptyMessage.style.display = "none";


    filteredComplaints.forEach(function (complaint) {

        const row =
            document.createElement("tr");


        const statusClass =
            getStatusClass(complaint.status);


        const statusText =
            getStatusText(complaint.status);


        /* ==========================================
           VIEW BUTTON
        ========================================== */

        let actionHTML = `

            <button
                class="action-btn view-btn"
                onclick="viewComplaint(${complaint.complaintId})"
                title="View Complaint">

                👁

            </button>

        `;


        /* ==========================================
           UPDATE BUTTON
           
           Only OPEN and IN_PROGRESS
        ========================================== */

        if (
            complaint.status === "OPEN" ||
            complaint.status === "IN_PROGRESS"
        ) {

            actionHTML += `

                <button
                    class="action-btn update-btn"
                    onclick="openUpdateModal(${complaint.complaintId})"
                    title="Update Status">

                    🔄

                </button>

            `;

        }


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    complaint.tenantName || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    complaint.roomNo || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    complaint.title || "-"
                )}
            </td>

            <td>
                ${formatDate(
                    complaint.submittedDate
                )}
            </td>

            <td>

                <span class="status ${statusClass}">

                    ${statusText}

                </span>

            </td>

            <td>

                ${actionHTML}

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateCards();

}


/* ==================================================
   STATUS CLASS
================================================== */

function getStatusClass(status) {

    switch (status) {

        case "OPEN":
            return "open";

        case "IN_PROGRESS":
            return "in-progress";

        case "WAITING_FOR_CONFIRMATION":
            return "waiting";

        case "RESOLVED":
            return "closed";

        case "CANCELLED":
            return "closed";

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
   UPDATE SUMMARY CARDS
================================================== */

function updateCards() {


    const total =
        complaints.length;


    const open =
        complaints.filter(function (complaint) {

            return complaint.status === "OPEN";

        }).length;


    const inProgress =
        complaints.filter(function (complaint) {

            return complaint.status === "IN_PROGRESS";

        }).length;


    /*
     * Only actual RESOLVED complaints
     * are counted as resolved.
     *
     * WAITING_FOR_CONFIRMATION is NOT resolved yet.
     */

    const resolved =
        complaints.filter(function (complaint) {

            return complaint.status === "RESOLVED";

        }).length;


    document.getElementById("totalComplaints")
        .textContent = total;


    document.getElementById("openComplaints")
        .textContent = open;


    document.getElementById("inProgressComplaints")
        .textContent = inProgress;


    document.getElementById("resolvedComplaints")
        .textContent = resolved;

}


/* ==================================================
   VIEW COMPLAINT
================================================== */

async function viewComplaint(complaintId) {

    try {

        const response =
            await fetch(
                COMPLAINT_API_URL +
                "/" +
                complaintId,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "login.html";

            return;

        }


        if (response.status === 403) {

            alert(
                "You do not have permission to view this complaint."
            );

            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Unable to load complaint."
            );

        }


        const complaint =
            await response.json();


        document.getElementById("viewTenantName")
            .textContent =
            complaint.tenantName || "-";


        document.getElementById("viewRoomNo")
            .textContent =
            complaint.roomNo || "-";


        document.getElementById("viewPhone")
            .textContent =
            complaint.phone || "-";


        document.getElementById("viewComplaint")
            .textContent =
            complaint.title || "-";


        document.getElementById("viewDescription")
            .textContent =
            complaint.description || "-";


        document.getElementById("viewDate")
            .textContent =
            formatDate(complaint.submittedDate);


        document.getElementById("viewStatus")
            .textContent =
            getStatusText(complaint.status);


        document.getElementById("viewComplaintModal")
            .classList.add("show");

    }
    catch (error) {

        console.error(
            "Error viewing complaint:",
            error
        );

        alert(
            "Unable to load complaint details."
        );

    }

}


/* ==================================================
   OPEN UPDATE MODAL
================================================== */

function openUpdateModal(complaintId) {

    const complaint =
        complaints.find(function (item) {

            return item.complaintId === complaintId;

        });


    if (!complaint) {

        return;

    }


    /*
     * Only OPEN and IN_PROGRESS
     * complaints can be updated.
     */

    if (
        complaint.status !== "OPEN" &&
        complaint.status !== "IN_PROGRESS"
    ) {

        return;

    }


    selectedComplaintId =
        complaintId;


    document.getElementById("updateTenantName")
        .textContent =
        complaint.tenantName || "-";


    document.getElementById("updateComplaintName")
        .textContent =
        complaint.title || "-";


    document.getElementById("updateStatus")
        .value =
        complaint.status;


    document.getElementById("updateStatusModal")
        .classList.add("show");

}


/* ==================================================
   SAVE STATUS
================================================== */

async function saveStatus() {

    if (selectedComplaintId === null) {

        return;

    }


    const newStatus =
        document.getElementById("updateStatus").value;


    /*
     * Only these statuses can be sent
     * from Admin/Warden.
     */

    if (
        newStatus !== "OPEN" &&
        newStatus !== "IN_PROGRESS" &&
        newStatus !== "RESOLVED"
    ) {

        alert("Invalid complaint status.");

        return;

    }


    try {

        const response =
            await fetch(
                COMPLAINT_API_URL +
                "/" +
                selectedComplaintId +
                "/status?status=" +
                encodeURIComponent(newStatus),
                {
                    method: "PUT",
                    headers: getAuthHeaders()
                }
            );


        if (response.status === 401) {

            sessionStorage.clear();

            window.location.href = "login.html";

            return;

        }


        if (response.status === 403) {

            const errorText =
                await response.text();

            alert(
                errorText ||
                "You do not have permission to update this complaint."
            );

            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Unable to update complaint status."
            );

        }


        /*
         * Backend returns ComplaintResponse.
         *
         * Important:
         *
         * Admin selects RESOLVED
         *          ↓
         * Backend changes it to
         * WAITING_FOR_CONFIRMATION
         *          ↓
         * Tenant gets notification
         */

        const updatedComplaint =
            await response.json();


        closeUpdateModal();


        /*
         * Show appropriate message
         */

        if (
            updatedComplaint.status ===
            "WAITING_FOR_CONFIRMATION"
        ) {

            alert(
                "Complaint marked as waiting for confirmation. Tenant has been notified."
            );

        }

        else if (
            updatedComplaint.status ===
            "IN_PROGRESS"
        ) {

            alert(
                "Complaint status updated to In Progress."
            );

        }

        else if (
            updatedComplaint.status ===
            "OPEN"
        ) {

            alert(
                "Complaint status updated to Open."
            );

        }

        else {

            alert(
                "Complaint status updated successfully."
            );

        }


        /*
         * Reload latest data from database.
         */

        await loadComplaints();

    }
    catch (error) {

        console.error(
            "Error updating complaint:",
            error
        );

        alert(
            error.message ||
            "Unable to update complaint status."
        );

    }

}


/* ==================================================
   CLOSE VIEW MODAL
================================================== */

function closeViewModal() {

    document.getElementById("viewComplaintModal")
        .classList.remove("show");

}


/* ==================================================
   CLOSE UPDATE MODAL
================================================== */

function closeUpdateModal() {

    document.getElementById("updateStatusModal")
        .classList.remove("show");


    selectedComplaintId = null;

}


/* ==================================================
   SEARCH
================================================== */

searchInput.addEventListener(
    "input",
    displayComplaints
);


/* ==================================================
   STATUS FILTER
================================================== */

statusFilter.addEventListener(
    "change",
    displayComplaints
);


/* ==================================================
   CLOSE VIEW BUTTON
================================================== */

document.getElementById("closeViewModal")
    .addEventListener(
        "click",
        closeViewModal
    );


document.getElementById("closeViewBtn")
    .addEventListener(
        "click",
        closeViewModal
    );


/* ==================================================
   CLOSE UPDATE BUTTON
================================================== */

document.getElementById("closeUpdateModal")
    .addEventListener(
        "click",
        closeUpdateModal
    );


document.getElementById("cancelUpdateBtn")
    .addEventListener(
        "click",
        closeUpdateModal
    );


/* ==================================================
   MODAL OUTSIDE CLICK
================================================== */

window.addEventListener(
    "click",
    function (event) {


        const viewModal =
            document.getElementById(
                "viewComplaintModal"
            );


        const updateModal =
            document.getElementById(
                "updateStatusModal"
            );


        if (event.target === viewModal) {

            closeViewModal();

        }


        if (event.target === updateModal) {

            closeUpdateModal();

        }

    }
);


/* ==================================================
   SAVE STATUS BUTTON
================================================== */

document.getElementById("saveStatusBtn")
    .addEventListener(
        "click",
        saveStatus
    );


/* ==================================================
   LOGOUT
================================================== */

document.getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            sessionStorage.clear();

            window.location.href =
                "login.html";

        }
    );


/* ==================================================
   FORMAT DATE
================================================== */

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    /*
     * Backend LocalDate normally returns:
     * 2026-08-29
     */

    const parts =
        dateValue.split("-");


    if (parts.length !== 3) {

        return dateValue;

    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==================================================
   INITIAL LOAD
================================================== */

loadProfile();

loadComplaints();