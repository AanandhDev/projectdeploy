const PAYMENT_API_URL = "/api/payments";


let payments = [];



// ==========================================
// GET JWT TOKEN
// ==========================================

function getToken() {

    return sessionStorage.getItem("token");

}



// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPayments();

        loadProfile();

        setupSearchAndFilter();

        setupPaymentModal();

        setupHistoryModal();

    }
);



// ==========================================
// LOAD PAYMENTS
// ==========================================

async function loadPayments() {

    try {

        const token = getToken();


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "/html/login.html";

            return;

        }


        const response =
            await fetch(
                PAYMENT_API_URL,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Session expired. Please login again."
            );

            sessionStorage.removeItem("token");

            sessionStorage.removeItem("username");

            sessionStorage.removeItem("role");

            window.location.href =
                "/html/login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load payments."
            );

        }


        payments =
            await response.json();


        displayPayments(
            payments
        );


        updatePaymentCards(
            payments
        );


    }

    catch (error) {

        console.error(
            "Payment loading error:",
            error
        );

    }

}



// ==========================================
// DISPLAY PAYMENT TABLE
// ==========================================

function displayPayments(data) {

    const tableBody =
        document.getElementById(
            "paymentTableBody"
        );


    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="empty-message">

                    No payment records

                </td>
            </tr>
        `;

        return;

    }


    data.forEach(function (payment) {

        const tenant =
            payment.tenant;


        const tenantName =
            tenant?.user?.fullName || "-";


        const roomNo =
            tenant?.room?.roomNo || "-";


        const rent =
            Number(
                payment.amount || 0
            );


        const dueDate =
            formatDate(
                payment.dueDate
            );


        const paymentDate =
            formatDate(
                payment.paymentDate
            );


        const status =
            (
                payment.status ||
                "PENDING"
            ).toUpperCase();


        const row =
            document.createElement("tr");



        // ======================================
        // ACTION BUTTONS
        // ======================================

        /*
         * EYE ICON
         * --------------------------------------
         * Eye icon ALWAYS appears.
         */

        let actionHTML = `

            <button
                class="view-history-btn"
                title="Payment History"
                onclick="viewPaymentHistory(${tenant.tenantId})">

                <i class="fa-solid fa-eye"></i>

            </button>

        `;



        /*
         * BILL-WAVE ICON
         * --------------------------------------
         * Bill-wave appears ONLY when:
         *
         * WAITING_FOR_CONFIRMATION
         */

        if (
            status ===
            "WAITING_FOR_CONFIRMATION"
        ) {

            actionHTML += `

                <button
                    class="receive-payment-btn"
                    title="Receive Payment"
                    onclick="openPaymentModal(${payment.paymentId})">

                    <i class="fa-solid fa-money-bill-wave"></i>

                </button>

            `;

        }



        // ======================================
        // TABLE ROW
        // ======================================

        row.innerHTML = `

            <td>
                ${tenantName}
            </td>


            <td>
                ${roomNo}
            </td>


            <td>
                ₹${rent.toFixed(2)}
            </td>


            <td>
                ${dueDate}
            </td>


            <td>
                ${paymentDate}
            </td>


            <td>

                <span
                    class="status ${status.toLowerCase()}">

                    ${status}

                </span>

            </td>


            <td>

                ${actionHTML}

            </td>

        `;


        tableBody.appendChild(
            row
        );

    });

}



// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const d =
        new Date(date);


    if (isNaN(d.getTime())) {

        return "-";

    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}



// ==========================================
// UPDATE SUMMARY CARDS
// ==========================================

function updatePaymentCards(data) {

    const total =
        data.length;


    const paid =
        data.filter(
            function (payment) {

                return (
                    payment.status &&
                    payment.status.toUpperCase() ===
                    "PAID"
                );

            }
        ).length;


    const pending =
        data.filter(
            function (payment) {

                return (
                    payment.status &&
                    payment.status.toUpperCase() ===
                    "PENDING"
                );

            }
        ).length;


    const overdue =
        data.filter(
            function (payment) {

                return (
                    payment.status &&
                    payment.status.toUpperCase() ===
                    "OVERDUE"
                );

            }
        ).length;


    const totalElement =
        document.getElementById(
            "totalTenants"
        );


    const paidElement =
        document.getElementById(
            "paidTenants"
        );


    const pendingElement =
        document.getElementById(
            "pendingTenants"
        );


    const overdueElement =
        document.getElementById(
            "overdueTenants"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (paidElement) {

        paidElement.textContent =
            paid;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (overdueElement) {

        overdueElement.textContent =
            overdue;

    }

}



// ==========================================
// SEARCH + FILTER SETUP
// ==========================================

function setupSearchAndFilter() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterPayments
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterPayments
        );

    }

}



// ==========================================
// SEARCH + FILTER
// ==========================================

function filterPayments() {

    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const statusElement =
        document.getElementById(
            "statusFilter"
        );


    const searchValue =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    const statusValue =
        statusElement
            ? statusElement.value
            : "ALL";


    const filtered =
        payments.filter(
            function (payment) {

                const tenant =
                    payment.tenant;


                const tenantName =
                    tenant?.user?.fullName || "";


                const roomNo =
                    tenant?.room?.roomNo || "";


                const matchesSearch =

                    tenantName
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    roomNo
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const paymentStatus =
                    (
                        payment.status ||
                        ""
                    ).toUpperCase();


                const matchesStatus =

                    statusValue === "ALL"

                    ||

                    paymentStatus ===
                    statusValue;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayPayments(
        filtered
    );

}



// ==========================================
// OPEN RECEIVE PAYMENT MODAL
// ==========================================

function openPaymentModal(
    paymentId
) {

    const payment =
        payments.find(
            function (p) {

                return (
                    p.paymentId ===
                    paymentId
                );

            }
        );


    if (!payment) {

        alert(
            "Payment record not found."
        );

        return;

    }


    const status =
        (
            payment.status ||
            ""
        ).toUpperCase();


    /*
     * Backend/frontend safety:
     * Receive button should work ONLY
     * for WAITING_FOR_CONFIRMATION.
     */

    if (
        status !==
        "WAITING_FOR_CONFIRMATION"
    ) {

        alert(
            "This payment is not waiting for cash confirmation."
        );

        return;

    }


    const tenant =
        payment.tenant;


    const tenantName =
        tenant?.user?.fullName || "-";


    const roomNo =
        tenant?.room?.roomNo || "-";


    const amount =
        Number(
            payment.amount || 0
        );



    // ======================================
    // TENANT NAME
    // ======================================

    const tenantNameElement =
        document.getElementById(
            "paymentTenantName"
        );


    if (tenantNameElement) {

        tenantNameElement.value =
            tenantName;

    }



    // ======================================
    // ROOM NUMBER
    // ======================================

    const roomElement =
        document.getElementById(
            "paymentRoomNo"
        );


    if (roomElement) {

        roomElement.value =
            roomNo;

    }



    // ======================================
    // RENT
    // ======================================

    const rentElement =
        document.getElementById(
            "paymentRent"
        );


    if (rentElement) {

        rentElement.value =
            "₹" +
            amount.toFixed(2);

    }



    // ======================================
    // CURRENT DATE
    // ======================================

    const dateElement =
        document.getElementById(
            "paymentDate"
        );


    if (dateElement) {

        dateElement.value =
            getToday();

    }



    // ======================================
    // STORE PAYMENT ID
    // ======================================

    const paymentForm =
        document.getElementById(
            "paymentForm"
        );


    if (paymentForm) {

        paymentForm.dataset.paymentId =
            paymentId;

    }



    // ======================================
    // OPEN MODAL
    // ======================================

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}



// ==========================================
// GET TODAY
// ==========================================

function getToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}



// ==========================================
// SETUP PAYMENT MODAL
// ==========================================

function setupPaymentModal() {

    const paymentForm =
        document.getElementById(
            "paymentForm"
        );


    if (paymentForm) {

        paymentForm.addEventListener(
            "submit",
            receivePayment
        );

    }


    const closeButton =
        document.getElementById(
            "closePaymentModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePaymentModal
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelPaymentBtn"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePaymentModal
        );

    }

}



// ==========================================
// RECEIVE PAYMENT
// ==========================================

async function receivePayment(
    event
) {

    event.preventDefault();


    const paymentForm =
        event.target;


    const paymentId =
        paymentForm.dataset.paymentId;


    if (!paymentId) {

        alert(
            "Payment record not selected."
        );

        return;

    }


    try {

        const token =
            getToken();


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "/html/login.html";

            return;

        }


        const response =
            await fetch(
                `${PAYMENT_API_URL}/${paymentId}/receive`,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "You are not authorized to receive this payment."
            );

            return;

        }


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message
            );

        }


        alert(
            "Payment received successfully."
        );


        closePaymentModal();


        await loadPayments();


    }

    catch (error) {

        console.error(
            "Receive payment error:",
            error
        );


        alert(
            error.message ||
            "Failed to receive payment."
        );

    }

}



// ==========================================
// CLOSE PAYMENT MODAL
// ==========================================

function closePaymentModal() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}



// ==========================================
// PAYMENT HISTORY
// ==========================================

async function viewPaymentHistory(
    tenantId
) {

    try {

        const token =
            getToken();


        if (!token) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "/html/login.html";

            return;

        }


        const response =
            await fetch(
                `${PAYMENT_API_URL}/tenant/${tenantId}/history`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load payment history."
            );

        }


        const history =
            await response.json();


        showPaymentHistory(
            history
        );

    }

    catch (error) {

        console.error(
            "History error:",
            error
        );


        alert(
            "Failed to load payment history."
        );

    }

}



// ==========================================
// SHOW PAYMENT HISTORY
// ==========================================

function showPaymentHistory(
    history
) {

    const tableBody =
        document.getElementById(
            "historyTableBody"
        );


    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (
        !history ||
        history.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="3"
                    class="empty-message">

                    No payment history

                </td>
            </tr>
        `;

        return;

    }


    let totalPaid = 0;


    history.forEach(
        function (payment) {

            const status =
                (
                    payment.status ||
                    ""
                ).toUpperCase();


            if (
                status === "PAID"
            ) {

                totalPaid +=
                    Number(
                        payment.amount || 0
                    );

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${formatDate(
                        payment.paymentDate
                    )}
                </td>


                <td>
                    ₹${Number(
                        payment.amount || 0
                    ).toFixed(2)}
                </td>


                <td>

                    <span
                        class="status ${status.toLowerCase()}">

                        ${status}

                    </span>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    const tenant =
        history[0]?.tenant;


    const tenantName =
        tenant?.user?.fullName ||
        "Tenant";


    const historyName =
        document.getElementById(
            "historyTenantName"
        );


    if (historyName) {

        historyName.textContent =
            tenantName +
            " payment history";

    }


    const totalElement =
        document.getElementById(
            "historyTotalPaid"
        );


    if (totalElement) {

        totalElement.textContent =
            "₹" +
            totalPaid.toFixed(2);

    }


    const countElement =
        document.getElementById(
            "historyPaymentCount"
        );


    if (countElement) {

        countElement.textContent =
            history.length;

    }


    const historyModal =
        document.getElementById(
            "historyModal"
        );


    if (historyModal) {

        historyModal.classList.add(
            "show"
        );

    }

}



// ==========================================
// SETUP HISTORY MODAL
// ==========================================

function setupHistoryModal() {

    const closeHistoryButton =
        document.getElementById(
            "closeHistoryModal"
        );


    if (closeHistoryButton) {

        closeHistoryButton.addEventListener(
            "click",
            function () {

                const historyModal =
                    document.getElementById(
                        "historyModal"
                    );


                if (historyModal) {

                    historyModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }

}



// ==========================================
// PROFILE
// ==========================================

function loadProfile() {

    const username =
        sessionStorage.getItem(
            "username"
        );


    const role =
        sessionStorage.getItem(
            "role"
        )
        ||
        sessionStorage.getItem(
            "userRole"
        );


    const usernameElement =
        document.getElementById(
            "profileUsername"
        );


    const roleElement =
        document.getElementById(
            "profileRole"
        );


    if (usernameElement) {

        usernameElement.textContent =
            username ||
            "User";

    }


    if (roleElement) {

        roleElement.textContent =
            role
                ? role.toUpperCase()
                : "USER";

    }

}