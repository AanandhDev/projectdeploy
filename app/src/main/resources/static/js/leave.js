const LEAVE_API_URL = "/api/leaves"; 


// ==================================================
// PAGINATION
// ==================================================

const RECORDS_PER_PAGE = 5;

let allLeaves = [];
let filteredLeaves = [];
let currentPage = 1;


// ==================================================
// GET TOKEN
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

        loadProfile();

        loadAllLeaves();


        // SEARCH

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyFilters
            );
        }


        // STATUS FILTER

        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        // FROM DATE

        const fromDate =
            document.getElementById(
                "fromDate"
            );

        if (fromDate) {

            fromDate.addEventListener(
                "change",
                applyFilters
            );
        }


        // TO DATE

        const toDate =
            document.getElementById(
                "toDate"
            );

        if (toDate) {

            toDate.addEventListener(
                "change",
                applyFilters
            );
        }


        // PREVIOUS BUTTON

        const previousBtn =
            document.getElementById(
                "previousBtn"
            );

        if (previousBtn) {

            previousBtn.addEventListener(
                "click",
                previousPage
            );
        }


        // NEXT BUTTON

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        if (nextBtn) {

            nextBtn.addEventListener(
                "click",
                nextPage
            );
        }
    }
);


// ==================================================
// LOAD PROFILE
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


    const usernameElement =
        document.getElementById(
            "profileUsername"
        );

    const roleElement =
        document.getElementById(
            "profileRole"
        );


    if (usernameElement && username) {

        usernameElement.textContent =
            username;
    }


    if (roleElement && role) {

        roleElement.textContent =
            role.toUpperCase();
    }
}


// ==================================================
// LOAD ALL LEAVES
// ==================================================

async function loadAllLeaves() {

    try {

        const token =
            getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return;
        }


        const response =
            await fetch(
                LEAVE_API_URL,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                alert(
                    "You are not authorized to view leave records."
                );

                return;
            }


            throw new Error(
                "Unable to load leave records."
            );
        }


        allLeaves =
            await response.json();


        // Make sure array

        if (!Array.isArray(allLeaves)) {

            allLeaves = [];
        }


        // Apply automatic client-side
        // status calculation also

        updateLeaveStatuses();


        // First page

        currentPage = 1;

        applyFilters();


    } catch (error) {

        console.error(
            "Leave loading error:",
            error
        );


        document.getElementById(
            "leaveTableBody"
        ).innerHTML = `
            <tr>
                <td colspan="7"
                    class="empty-message">

                    Unable to load leave records

                </td>
            </tr>
        `;


        updateSummary([]);
    }
}


// ==================================================
// UPDATE STATUS
// ==================================================

function updateLeaveStatuses() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    allLeaves.forEach(
        function (leave) {

            // Cancelled should remain cancelled

            if (
                leave.status &&
                leave.status.toUpperCase() ===
                "CANCELLED"
            ) {

                leave.status =
                    "CANCELLED";

                return;
            }


            if (
                !leave.fromDate ||
                !leave.returnDate
            ) {

                return;
            }


            const fromDate =
                new Date(
                    leave.fromDate
                );


            fromDate.setHours(
                0,
                0,
                0,
                0
            );


            const returnDate =
                new Date(
                    leave.returnDate
                );


            returnDate.setHours(
                0,
                0,
                0,
                0
            );


            // Before leave date

            if (
                today < fromDate
            ) {

                leave.status =
                    "UPCOMING";
            }


            // Leave date <= today < return date

            else if (
                today < returnDate
            ) {

                leave.status =
                    "ON LEAVE";
            }


            // Return date reached

            else {

                leave.status =
                    "COMPLETED";
            }
        }
    );
}


// ==================================================
// APPLY FILTERS
// ==================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const fromDateInput =
        document.getElementById(
            "fromDate"
        );


    const toDateInput =
        document.getElementById(
            "toDate"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "ALL";


    const filterFromDate =
        fromDateInput
            ? fromDateInput.value
            : "";


    const filterToDate =
        toDateInput
            ? toDateInput.value
            : "";


    filteredLeaves =
        allLeaves.filter(
            function (leave) {


                // ==========================================
                // SEARCH
                // ==========================================

                const tenantName =
                    (
                        leave.tenantName ||
                        ""
                    ).toLowerCase();


                const roomNo =
                    (
                        leave.roomNo ||
                        ""
                    ).toLowerCase();


                const phoneNumber =
                    (
                        leave.phoneNumber ||
                        ""
                    ).toLowerCase();


                const reason =
                    (
                        leave.reason ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    tenantName.includes(search) ||
                    roomNo.includes(search) ||
                    phoneNumber.includes(search) ||
                    reason.includes(search);


                if (!matchesSearch) {

                    return false;
                }


                // ==========================================
                // STATUS
                // ==========================================

                if (
                    selectedStatus !== "ALL" &&
                    leave.status !== selectedStatus
                ) {

                    return false;
                }


                // ==========================================
                // FROM DATE FILTER
                // ==========================================

                if (
                    filterFromDate &&
                    leave.fromDate < filterFromDate
                ) {

                    return false;
                }


                // ==========================================
                // TO DATE FILTER
                // ==========================================

                if (
                    filterToDate &&
                    leave.fromDate > filterToDate
                ) {

                    return false;
                }


                return true;
            }
        );


    currentPage = 1;


    displayLeaves(
        filteredLeaves
    );


    updateSummary(
        allLeaves
    );
}


// ==================================================
// DISPLAY LEAVES
// ==================================================

function displayLeaves(leaves) {

    const tbody =
        document.getElementById(
            "leaveTableBody"
        );


    if (
        !leaves ||
        leaves.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="empty-message">

                    No leave records found

                </td>
            </tr>
        `;


        updatePagination(
            0
        );

        return;
    }


    // ==========================================
    // PAGINATION
    // ==========================================

    const totalPages =
        Math.ceil(
            leaves.length /
            RECORDS_PER_PAGE
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;
    }


    const startIndex =
        (
            currentPage - 1
        ) *
        RECORDS_PER_PAGE;


    const endIndex =
        startIndex +
        RECORDS_PER_PAGE;


    const pageLeaves =
        leaves.slice(
            startIndex,
            endIndex
        );


    tbody.innerHTML = "";


    pageLeaves.forEach(
        function (leave) {

            const row =
                document.createElement(
                    "tr"
                );


            const tenantName =
                leave.tenantName ||
                "Unknown";


            const roomNo =
                leave.roomNo ||
                "-";


            const phoneNumber =
                leave.phoneNumber ||
                "-";


            const fromDate =
                formatDate(
                    leave.fromDate
                );


            const returnDate =
                formatDate(
                    leave.returnDate
                );


            const reason =
                leave.reason ||
                "-";


            const status =
                (
                    leave.status ||
                    "UPCOMING"
                ).toUpperCase();


            const statusClass =
                getStatusClass(
                    status
                );


            row.innerHTML = `

                <td>
                    ${tenantName}
                </td>


                <td>
                    ${roomNo}
                </td>


                <td>
                    ${phoneNumber}
                </td>


                <td>
                    ${fromDate}
                </td>


                <td>
                    ${returnDate}
                </td>


                <td>
                    ${reason}
                </td>


                <td>

                    <span class="status-badge ${statusClass}">

                        ${status}

                    </span>

                </td>

            `;


            tbody.appendChild(
                row
            );
        }
    );


    updatePagination(
        leaves.length
    );
}


// ==================================================
// SUMMARY CARDS
// ==================================================

function updateSummary(leaves) {

    let total =
        0;

    let upcoming =
        0;

    let onLeave =
        0;

    let completed =
        0;


    leaves.forEach(
        function (leave) {

            total++;


            const status =
                (
                    leave.status ||
                    ""
                ).toUpperCase();


            if (
                status === "UPCOMING"
            ) {

                upcoming++;
            }


            else if (
                status === "ON LEAVE"
            ) {

                onLeave++;
            }


            else if (
                status === "COMPLETED"
            ) {

                completed++;
            }
        }
    );


    const totalElement =
        document.getElementById(
            "totalLeaves"
        );


    const upcomingElement =
        document.getElementById(
            "upcomingLeaves"
        );


    const onLeaveElement =
        document.getElementById(
            "onLeave"
        );


    const completedElement =
        document.getElementById(
            "completedLeaves"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (upcomingElement) {

        upcomingElement.textContent =
            upcoming;
    }


    if (onLeaveElement) {

        onLeaveElement.textContent =
            onLeave;
    }


    if (completedElement) {

        completedElement.textContent =
            completed;
    }
}


// ==================================================
// STATUS CLASS
// ==================================================

function getStatusClass(status) {

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
// FORMAT DATE
// ==================================================

function formatDate(date) {

    if (!date) {

        return "-";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

        return date;
    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );
}


// ==================================================
// PAGINATION
// ==================================================

function updatePagination(
    totalRecords
) {

    const totalPages =
        Math.ceil(
            totalRecords /
            RECORDS_PER_PAGE
        );


    const previousBtn =
        document.getElementById(
            "previousBtn"
        );


    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    const pageNumbers =
        document.getElementById(
            "pageNumbers"
        );


    // ==========================================
    // PREVIOUS
    // ==========================================

    if (previousBtn) {

        previousBtn.disabled =
            currentPage <= 1;
    }


    // ==========================================
    // NEXT
    // ==========================================

    if (nextBtn) {

        nextBtn.disabled =
            currentPage >= totalPages;
    }


    // ==========================================
    // PAGE NUMBERS
    // ==========================================

    if (!pageNumbers) {

        return;
    }


    pageNumbers.innerHTML = "";


    if (totalPages <= 0) {

        return;
    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );
        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;


                displayLeaves(
                    filteredLeaves
                );
            }
        );


        pageNumbers.appendChild(
            button
        );
    }
}


// ==================================================
// PREVIOUS PAGE
// ==================================================

function previousPage() {

    if (
        currentPage > 1
    ) {

        currentPage--;


        displayLeaves(
            filteredLeaves
        );
    }
}


// ==================================================
// NEXT PAGE
// ==================================================

function nextPage() {

    const totalPages =
        Math.ceil(
            filteredLeaves.length /
            RECORDS_PER_PAGE
        );


    if (
        currentPage <
        totalPages
    ) {

        currentPage++;


        displayLeaves(
            filteredLeaves
        );
    }
}

document.getElementById("logoutBtn").addEventListener("click",function(){

      sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");

    window.location.href = "/html/login.html";
})