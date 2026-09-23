const MY_PAYMENT_API_URL = "/api/payments/my";


let payments = [];

let selectedPayment = null;



document.addEventListener("DOMContentLoaded", function () {

    loadLoggedUsername();

    loadMyPayments();

    setupFilters();

    setupPaymentMethods();

});



// ==================================================
// GET JWT TOKEN
// ==================================================

function getToken() {

    return sessionStorage.getItem("token");

}



// ==================================================
// LOAD LOGGED-IN USERNAME
// ==================================================

function loadLoggedUsername() {

    const username =
        sessionStorage.getItem("username");


    const usernameElement =
        document.getElementById("loggedUsername");


    if (usernameElement && username) {

        usernameElement.textContent = username;

    }

}



// ==================================================
// LOAD MY PAYMENTS
// ==================================================

async function loadMyPayments() {

    try {

        const token = getToken();


        if (!token) {

            alert("Session expired. Please login again.");

            window.location.href = "/html/login.html";

            return;

        }


        const response =
            await fetch(MY_PAYMENT_API_URL, {

                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " + token,

                    "Content-Type":
                        "application/json"

                }

            });


        if (response.status === 401) {

            alert("Session expired. Please login again.");

            sessionStorage.removeItem("token");

            sessionStorage.removeItem("username");

            sessionStorage.removeItem("role");

            window.location.href =
                "/html/login.html";

            return;

        }


        if (response.status === 403) {

            throw new Error(
                "You are not authorized to access payment records."
            );

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load payments."
            );

        }


        payments = await response.json();


        displayPayments(payments);

        updateSummary(payments);

    }


    catch (error) {

        console.error(
            "Payment loading error:",
            error
        );


        const body =
            document.getElementById(
                "paymentTableBody"
            );


        if (body) {

            body.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="loading-cell">

                        Unable to load payment records.

                    </td>
                </tr>
            `;

        }

    }

}



// ==================================================
// DISPLAY PAYMENTS
// ==================================================

function displayPayments(paymentList) {

    const body =
        document.getElementById(
            "paymentTableBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (
        !paymentList ||
        paymentList.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td colspan="8"
                    class="loading-cell">

                    No payment records found.

                </td>
            </tr>
        `;

        return;

    }


    paymentList.forEach(function (payment) {

        const row =
            document.createElement("tr");



        // ------------------------------------------
        // TENANT
        // ------------------------------------------

        const tenantName =
            payment.tenant?.user?.fullName || "-";



        // ------------------------------------------
        // ROOM
        // ------------------------------------------

        const roomNo =
            payment.tenant?.room?.roomNo || "-";



        // ------------------------------------------
        // ROOM TYPE
        // ------------------------------------------

        const roomType =
            payment.tenant?.room?.roomType || "-";



        // ------------------------------------------
        // RENT
        // ------------------------------------------

        const amount =
            Number(payment.amount || 0);



        // ------------------------------------------
        // DUE DATE
        // ------------------------------------------

        const dueDate =
            formatDate(payment.dueDate);



        // ------------------------------------------
        // PAYMENT DATE
        // ------------------------------------------

        const paymentDate =
            payment.paymentDate
                ? formatDate(payment.paymentDate)
                : "-";



        // ------------------------------------------
        // STATUS
        // ------------------------------------------

        const status =
            (payment.status || "PENDING")
                .toUpperCase();


        let statusClass = "pending";


        if (status === "PAID") {

            statusClass = "paid";

        }

        else if (status === "OVERDUE") {

            statusClass = "overdue";

        }

        else if (
            status === "WAITING_FOR_CONFIRMATION"
        ) {

            statusClass = "pending";

        }



        // ------------------------------------------
        // ACTION
        // ------------------------------------------

        let actionHTML = "-";


        /*
         * PENDING / OVERDUE
         * ----------------
         * Tenant can make payment.
         *
         * WAITING_FOR_CONFIRMATION
         * ------------------------
         * Cash request already submitted.
         *
         * PAID
         * ----
         * Payment completed.
         */


        if (
            status === "PENDING" ||
            status === "OVERDUE"
        ) {

            actionHTML = `
                <button
                    class="payment-action-btn"
                    title="Make Payment"
                    onclick="openPaymentModal(${payment.paymentId})">

                    <i class="fa-solid fa-credit-card"></i>

                </button>
            `;

        }



        // ------------------------------------------
        // ROW
        // ------------------------------------------

        row.innerHTML = `

            <td>
                ${tenantName}
            </td>


            <td>
                ${roomNo}
            </td>


            <td>
                ${roomType}
            </td>


            <td>
                ₹${amount.toLocaleString("en-IN")}
            </td>


            <td>
                ${dueDate}
            </td>


            <td>
                ${paymentDate}
            </td>


            <td>

                <span class="payment-status ${statusClass}">
                    ${status}
                </span>

            </td>


            <td>
                ${actionHTML}
            </td>

        `;


        body.appendChild(row);

    });

}



// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}



// ==================================================
// UPDATE SUMMARY CARDS
// ==================================================

function updateSummary(paymentList) {

    if (
        !paymentList ||
        paymentList.length === 0
    ) {

        setText("currentRent", "₹0");

        setText("paymentStatus", "-");

        setText("totalPaid", "₹0");

        setText("pendingAmount", "₹0");

        return;

    }



    // ------------------------------------------
    // SORT BY DUE DATE
    // ------------------------------------------

    const sortedPayments =
        [...paymentList].sort(function (a, b) {

            return new Date(b.dueDate)
                - new Date(a.dueDate);

        });



    // ------------------------------------------
    // CURRENT / LATEST PAYMENT
    // ------------------------------------------

    const latestPayment =
        sortedPayments[0];


    const currentRent =
        Number(latestPayment.amount || 0);


    setText(
        "currentRent",
        "₹" +
        currentRent.toLocaleString("en-IN")
    );



    // ------------------------------------------
    // CURRENT PAYMENT STATUS
    // ------------------------------------------

    const latestStatus =
        (latestPayment.status || "-")
            .toUpperCase();


    setText(
        "paymentStatus",
        latestStatus
    );


    const statusInfo =
        document.getElementById(
            "paymentStatusInfo"
        );


    if (statusInfo) {

        if (latestStatus === "PAID") {

            statusInfo.textContent =
                "Payment completed";

        }

        else if (latestStatus === "OVERDUE") {

            statusInfo.textContent =
                "Payment overdue";

        }

        else if (
            latestStatus ===
            "WAITING_FOR_CONFIRMATION"
        ) {

            statusInfo.textContent =
                "Waiting for payment confirmation";

        }

        else {

            statusInfo.textContent =
                "Payment due";

        }

    }



    // ------------------------------------------
    // TOTAL PAID
    // ------------------------------------------

    let totalPaid = 0;


    paymentList.forEach(function (payment) {

        if (
            (payment.status || "")
                .toUpperCase() === "PAID"
        ) {

            totalPaid +=
                Number(payment.amount || 0);

        }

    });


    setText(
        "totalPaid",
        "₹" +
        totalPaid.toLocaleString("en-IN")
    );



    // ------------------------------------------
    // PENDING / OVERDUE AMOUNT
    // ------------------------------------------

    let pendingAmount = 0;


    paymentList.forEach(function (payment) {

        const status =
            (payment.status || "")
                .toUpperCase();


        if (
            status === "PENDING" ||
            status === "OVERDUE"
        ) {

            pendingAmount +=
                Number(payment.amount || 0);

        }

    });


    setText(
        "pendingAmount",
        "₹" +
        pendingAmount.toLocaleString("en-IN")
    );

}



// ==================================================
// SET TEXT HELPER
// ==================================================

function setText(elementId, value) {

    const element =
        document.getElementById(elementId);


    if (element) {

        element.textContent = value;

    }

}



// ==================================================
// FILTER SETUP
// ==================================================

function setupFilters() {

    const searchInput =
        document.getElementById(
            "searchPayment"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const monthFilter =
        document.getElementById(
            "monthFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (monthFilter) {

        monthFilter.addEventListener(
            "change",
            applyFilters
        );

    }

}



// ==================================================
// APPLY FILTERS
// ==================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchPayment"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const monthFilter =
        document.getElementById(
            "monthFilter"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "ALL";


    const selectedMonth =
        monthFilter
            ? monthFilter.value
            : "";


    const filteredPayments =
        payments.filter(function (payment) {


            // --------------------------------------
            // SEARCH
            // --------------------------------------

            const tenantName =
                payment.tenant?.user?.fullName || "";


            const roomNo =
                payment.tenant?.room?.roomNo || "";


            const roomType =
                payment.tenant?.room?.roomType || "";


            const searchableText =
                (
                    tenantName +
                    " " +
                    roomNo +
                    " " +
                    roomType
                ).toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    searchText
                );



            // --------------------------------------
            // STATUS
            // --------------------------------------

            const paymentStatus =
                (payment.status || "")
                    .toUpperCase();


            const matchesStatus =
                selectedStatus === "ALL" ||
                paymentStatus === selectedStatus;



            // --------------------------------------
            // MONTH
            // --------------------------------------

            let matchesMonth = true;


            if (selectedMonth) {

                matchesMonth =
                    payment.month === selectedMonth;

            }



            return (
                matchesSearch &&
                matchesStatus &&
                matchesMonth
            );

        });


    displayPayments(filteredPayments);

}



// ==================================================
// OPEN PAYMENT MODAL
// ==================================================

function openPaymentModal(paymentId) {

    selectedPayment =
        payments.find(function (payment) {

            return payment.paymentId === paymentId;

        });


    if (!selectedPayment) {

        alert("Payment record not found.");

        return;

    }



    // ------------------------------------------
    // CHECK STATUS
    // ------------------------------------------

    const status =
        (selectedPayment.status || "")
            .toUpperCase();


    if (status === "PAID") {

        alert(
            "This payment is already completed."
        );

        return;

    }


    if (
        status === "WAITING_FOR_CONFIRMATION"
    ) {

        alert(
            "Cash payment request is already waiting for confirmation."
        );

        return;

    }



    // ------------------------------------------
    // AMOUNT
    // ------------------------------------------

    const amount =
        Number(
            selectedPayment.amount || 0
        );


    setText(
        "modalAmount",
        "₹" +
        amount.toLocaleString("en-IN")
    );



    // ------------------------------------------
    // DUE DATE
    // ------------------------------------------

    setText(
        "modalDueDate",
        formatDate(
            selectedPayment.dueDate
        )
    );



    // ------------------------------------------
    // RESET PAYMENT METHOD
    // ------------------------------------------

    document
        .querySelectorAll(
            'input[name="paymentMethod"]'
        )
        .forEach(function (radio) {

            radio.checked = false;

        });


    hidePaymentDetails();



    // ------------------------------------------
    // CLEAR OLD QR
    // ------------------------------------------

    const qrImage =
        document.getElementById(
            "paymentQrCode"
        );


    if (qrImage) {

        qrImage.removeAttribute("src");

        qrImage.style.display = "none";

    }


    setText(
        "qrAmount",
        ""
    );



    // ------------------------------------------
    // OPEN MODAL
    // ------------------------------------------

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.classList.add("show");

    }

}



// ==================================================
// CLOSE PAYMENT MODAL
// ==================================================

function closePaymentModal() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.classList.remove("show");

    }


    selectedPayment = null;


    hidePaymentDetails();


    const qrImage =
        document.getElementById(
            "paymentQrCode"
        );


    if (qrImage) {

        qrImage.removeAttribute("src");

        qrImage.style.display = "none";

    }

}



// ==================================================
// PAYMENT METHOD SETUP
// ==================================================

function setupPaymentMethods() {

    const methods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    methods.forEach(function (radio) {

        radio.addEventListener(
            "change",
            function () {

                showPaymentDetails(
                    this.value
                );

            }
        );

    });

}



// ==================================================
// SHOW PAYMENT DETAILS
// ==================================================

function showPaymentDetails(method) {

    hidePaymentDetails();



    // ------------------------------------------
    // QR CODE
    // ------------------------------------------

    if (method === "QR") {

        showElement("qrDetails");

        prepareQRCode();

    }



    // ------------------------------------------
    // CREDIT CARD
    // ------------------------------------------

    else if (method === "CREDIT_CARD") {

        showElement("cardDetails");

    }



    // ------------------------------------------
    // CASH
    // ------------------------------------------

    else if (method === "CASH") {

        showElement("cashDetails");

    }

}



// ==================================================
// HIDE PAYMENT DETAILS
// ==================================================

function hidePaymentDetails() {

    const sections =
        document.querySelectorAll(
            ".payment-option-details"
        );


    sections.forEach(function (section) {

        section.style.display = "none";

    });

}



// ==================================================
// SHOW ELEMENT
// ==================================================

function showElement(elementId) {

    const element =
        document.getElementById(elementId);


    if (element) {

        element.style.display = "block";

    }

}



// ==================================================
// PREPARE QR CODE
// ==================================================

function prepareQRCode() {

    if (!selectedPayment) return;


    const amount =
        Number(
            selectedPayment.amount || 0
        );


    setText(
        "qrAmount",
        "₹" +
        amount.toLocaleString("en-IN")
    );


    const qrImage =
        document.getElementById(
            "paymentQrCode"
        );


    if (qrImage) {

        qrImage.removeAttribute("src");

        qrImage.style.display = "none";

    }

}



// ==================================================
// PROCESS PAYMENT
// ==================================================

function processPayment() {

    const selectedMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selectedMethod) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    const method =
        selectedMethod.value;



    // ------------------------------------------
    // QR CODE
    // ------------------------------------------

    if (method === "QR") {

        generatePaymentQR();

    }



    // ------------------------------------------
    // CREDIT CARD
    // ------------------------------------------

    else if (method === "CREDIT_CARD") {

        startCardPayment();

    }



    // ------------------------------------------
    // CASH
    // ------------------------------------------

    else if (method === "CASH") {

        requestCashPayment();

    }

}



// ==================================================
// GENERATE PAYMENT QR
// ==================================================

function generatePaymentQR(paymentId, amount) {

    const qrImage = document.getElementById("paymentQrCode");

    if (!qrImage) {
        console.error("QR image element not found.");
        return;
    }

    // Fake QR for demo purpose
    qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Aadhya-Mens-PG-Payment-" + paymentId;

    qrImage.style.display = "block";

    console.log("Fake QR displayed for Payment ID:", paymentId);
    console.log("Amount: ₹" + amount);
}



// ==================================================
// CREDIT CARD PAYMENT
// ==================================================

async function startCardPayment() {

    if (!selectedPayment) {

        alert(
            "Payment record not selected."
        );

        return;

    }


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



        // ------------------------------------------
        // CREATE RAZORPAY ORDER
        // ------------------------------------------

        const response =
            await fetch(
                "/api/payments/" +
                selectedPayment.paymentId +
                "/create-order",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (response.status === 401) {

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


        if (response.status === 403) {

            const errorText =
                await response.text();

            console.error(
                "Card payment 403:",
                errorText
            );


            alert(
                "Card payment is not authorized for this account."
            );


            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText
            );

        }


        const order =
            await response.json();



        // ------------------------------------------
        // RAZORPAY CHECKOUT
        // ------------------------------------------

        const options = {

            key:
                order.keyId,

            amount:
                order.amount,

            currency:
                order.currency,

            name:
                "Aadhya Mens PG",

            description:
                "PG Rent Payment",

            order_id:
                order.orderId,



            handler:
                async function (response) {

                    console.log(
                        "Razorpay Payment Response:",
                        response
                    );


                    try {

                        const token =
                            getToken();


                        const verifyResponse =
                            await fetch(
                                "/api/payments/" +
                                selectedPayment.paymentId +
                                "/verify",
                                {

                                    method: "POST",

                                    headers: {

                                        "Authorization":
                                            "Bearer " +
                                            token,

                                        "Content-Type":
                                            "application/json"

                                    },


                                    body:
                                        JSON.stringify({

                                            razorpay_payment_id:
                                                response.razorpay_payment_id,

                                            razorpay_order_id:
                                                response.razorpay_order_id,

                                            razorpay_signature:
                                                response.razorpay_signature

                                        })

                                }
                            );


                        if (verifyResponse.status === 401) {

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


                        if (!verifyResponse.ok) {

                            const errorText =
                                await verifyResponse.text();


                            throw new Error(
                                errorText
                            );

                        }


                        const verifiedPayment =
                            await verifyResponse.json();


                        console.log(
                            "Payment verified:",
                            verifiedPayment
                        );


                        alert(
                            "Payment successful!"
                        );


                        closePaymentModal();


                        await loadMyPayments();

                    }


                    catch (error) {

                        console.error(
                            "Payment verification error:",
                            error
                        );


                        alert(
                            "Payment verification failed: " +
                            error.message
                        );

                    }

                },



            prefill: {

                name:
                    selectedPayment
                        .tenant
                        ?.user
                        ?.fullName || "",


                email:
                    selectedPayment
                        .tenant
                        ?.user
                        ?.email || "",


                contact:
                    selectedPayment
                        .tenant
                        ?.user
                        ?.phone || ""

            },



            theme: {

                color: "#1A6B72"

            }

        };



        // ------------------------------------------
        // OPEN RAZORPAY
        // ------------------------------------------

        const razorpay =
            new Razorpay(options);


        razorpay.open();

    }


    catch (error) {

        console.error(
            "Credit card payment error:",
            error
        );


        alert(
            "Unable to start card payment: " +
            error.message
        );

    }

}



// ==================================================
// CASH PAYMENT
// ==================================================

async function requestCashPayment() {

    if (!selectedPayment) {

        alert(
            "Payment record not selected."
        );

        return;

    }


    const confirmCash =
        confirm(
            "Do you want to request cash payment verification?"
        );


    if (!confirmCash) {

        return;

    }


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


        // ------------------------------------------
        // SEND CASH REQUEST
        // ------------------------------------------

        const response =
            await fetch(
                "/api/payments/" +
                selectedPayment.paymentId +
                "/cash-request",
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


        if (response.status === 401) {

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


        if (response.status === 403) {

            const errorText =
                await response.text();

            console.error(
                "Cash request 403:",
                errorText
            );


            alert(
                "You are not authorized to request this payment."
            );


            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText
            );

        }


        const updatedPayment =
            await response.json();


        console.log(
            "Cash payment request submitted:",
            updatedPayment
        );


        selectedPayment =
            updatedPayment;


        alert(
            "Cash payment request submitted. Waiting for Admin / Warden confirmation."
        );


        closePaymentModal();


        await loadMyPayments();

    }


    catch (error) {

        console.error(
            "Cash payment request error:",
            error
        );


        alert(
            error.message ||
            "Failed to submit cash payment request."
        );

    }

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