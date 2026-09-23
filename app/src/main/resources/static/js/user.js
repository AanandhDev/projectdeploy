// ==================================================

// USER MANAGEMENT

// ==================================================

const USER_API_URL = "/api/users";

// ==================================================

// GLOBAL VARIABLES

// ==================================================

let users = [];

let editingUserId = null;

let statusUserId = null;

let statusNewValue = null;

// ==================================================

// PAGE LOAD

// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    // Check ADMIN access

    if (!checkAdminAccess()) {

        return;

    }

    loadLoggedUser();

    loadUsers();

    // Search

    const searchInput =

        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(

            "input",

            filterUsers

        );

    }

    // Status filter

    const statusFilter =

        document.getElementById("statusFilter");

    if (statusFilter) {

        statusFilter.addEventListener(

            "change",

            filterUsers

        );

    }

    // Role filter

    const roleFilter =

        document.getElementById("roleFilter");

    if (roleFilter) {

        roleFilter.addEventListener(

            "change",

            filterUsers

        );

    }

    // Form submit

    const userForm =

        document.getElementById("userForm");

    if (userForm) {

        userForm.addEventListener(

            "submit",

            saveUser

        );

    }

    // Close user modal

    const userModal =

        document.getElementById("userModal");

    if (userModal) {

        userModal.addEventListener(

            "click",

            function (event) {

                if (event.target === this) {

                    closeUserModal();

                }

            }

        );

    }

    // Close view modal

    const viewModal =

        document.getElementById("viewModal");

    if (viewModal) {

        viewModal.addEventListener(

            "click",

            function (event) {

                if (event.target === this) {

                    closeViewModal();

                }

            }

        );

    }

    // Close status modal

    const statusConfirmModal =

        document.getElementById(

            "statusConfirmModal"

        );

    if (statusConfirmModal) {

        statusConfirmModal.addEventListener(

            "click",

            function (event) {

                if (event.target === this) {

                    closeStatusConfirm();

                }

            }

        );

    }

});

// ==================================================

// CHECK ADMIN ACCESS

// ==================================================

function checkAdminAccess() {

    const role =

        sessionStorage.getItem("role");

    if (

        !role ||

        role.toUpperCase() !== "ADMIN"

    ) {

        alert(

            "Only ADMIN can access User Management."

        );

        window.location.href =

            "/html/tenant.html";

        return false;

    }

    return true;

}

// ==================================================

// GET JWT TOKEN

// ==================================================

function getToken() {

    return sessionStorage.getItem("token");

}

// ==================================================

// AUTH HEADERS

// ==================================================

function getAuthHeaders() {

    const token = getToken();

    return {

        "Content-Type": "application/json",

        "Authorization": "Bearer " + token

    };

}

// ==================================================

// LOAD LOGGED USER

// ==================================================

function loadLoggedUser() {

    const username =

        sessionStorage.getItem("username");

    const role =

        sessionStorage.getItem("role");

    const loggedUsername =

        document.getElementById(

            "loggedUsername"

        );

    const loggedRole =

        document.getElementById(

            "loggedRole"

        );

    if (loggedUsername) {

        loggedUsername.textContent =

            username || "Admin";

    }

    if (loggedRole) {

        loggedRole.textContent =

            role || "ADMIN";

    }

}

// ==================================================

// LOAD USERS

// ==================================================

async function loadUsers() {

    try {

        const token = getToken();

        // ------------------------------------------

        // TOKEN CHECK

        // ------------------------------------------

        if (!token) {

            alert(

                "Session expired. Please login again."

            );

            logout();

            return;

        }

        // ------------------------------------------

        // FETCH USERS

        // ------------------------------------------

        const response =

            await fetch(

                USER_API_URL,

                {

                    method: "GET",

                    headers: getAuthHeaders()

                }

            );

        // ------------------------------------------

        // DEBUG

        // ------------------------------------------

        console.log(

            "User API Status:",

            response.status

        );

        // ------------------------------------------

        // HANDLE 401

        // ------------------------------------------

        if (response.status === 401) {

            alert(

                "Session expired. Please login again."

            );

            logout();

            return;

        }

        // ------------------------------------------

        // HANDLE 403

        // ------------------------------------------

        if (response.status === 403) {

            const message =

                await response.text();

            console.error(

                "User API 403:",

                message

            );

            alert(

                message ||

                "Only ADMIN can access User Management."

            );

            return;

        }

        // ------------------------------------------

        // OTHER ERRORS

        // ------------------------------------------

        if (!response.ok) {

            const message =

                await response.text();

            console.error(

                "User API Error:",

                message

            );

            throw new Error(

                message ||

                "Failed to load users"

            );

        }

        // ------------------------------------------

        // SUCCESS

        // ------------------------------------------

        users =

            await response.json();

        console.log(

            "Users loaded:",

            users

        );

        updateSummaryCards();

        displayUsers(users);

    }

    catch (error) {

        console.error(

            "Load users error:",

            error

        );

        alert(

            "Unable to load users."

        );

    }

}

// ==================================================

// UPDATE SUMMARY CARDS

// ==================================================

function updateSummaryCards() {

    const total =

        users.length;

    const active =

        users.filter(function (user) {

            return (

                user.status &&

                user.status.toUpperCase() ===

                "ACTIVE"

            );

        }).length;

    const inactive =

        users.filter(function (user) {

            return (

                user.status &&

                user.status.toUpperCase() ===

                "INACTIVE"

            );

        }).length;

    const totalUsers =

        document.getElementById(

            "totalUsers"

        );

    const activeUsers =

        document.getElementById(

            "activeUsers"

        );

    const inactiveUsers =

        document.getElementById(

            "inactiveUsers"

        );

    if (totalUsers) {

        totalUsers.textContent = total;

    }

    if (activeUsers) {

        activeUsers.textContent = active;

    }

    if (inactiveUsers) {

        inactiveUsers.textContent = inactive;

    }

}

// ==================================================

// DISPLAY USERS

// ==================================================

function displayUsers(userList) {

    const tableBody =

        document.getElementById(

            "userTableBody"

        );

    const emptyMessage =

        document.getElementById(

            "emptyMessage"

        );

    if (!tableBody) {

        return;

    }

    tableBody.innerHTML = "";

    // ------------------------------------------

    // NO USERS

    // ------------------------------------------

    if (

        !userList ||

        userList.length === 0

    ) {

        if (emptyMessage) {

            emptyMessage.style.display = "block";

        }

        return;

    }

    if (emptyMessage) {

        emptyMessage.style.display = "none";

    }

    const loggedInUsername =

        sessionStorage.getItem("username");

    userList.forEach(function (user) {

        const row =

            document.createElement("tr");

        const userId =

            user.id;

        // ------------------------------------------

        // OWN ACCOUNT CHECK

        // ------------------------------------------

        const isOwnAccount =

            user.username &&

            loggedInUsername &&

            user.username.toLowerCase() ===

            loggedInUsername.toLowerCase();

        // ------------------------------------------

        // STATUS

        // ------------------------------------------

        const status =

            user.status

                ? user.status.toUpperCase()

                : "ACTIVE";

        const statusClass =

            status === "ACTIVE"

                ? "active"

                : "inactive";

        // ------------------------------------------

        // ACTIONS

        // ------------------------------------------

        let actions = "";

        // Own account = VIEW ONLY

        if (isOwnAccount) {

            actions = `

                <button

                    class="action-btn view-btn"

                    onclick="viewUser(${userId})"

                    title="View">

                    <i class="fa-solid fa-eye"></i>

                </button>

            `;

        }

        // Other users

        else {

            actions = `

                <button

                    class="action-btn view-btn"

                    onclick="viewUser(${userId})"

                    title="View">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button

                    class="action-btn edit-btn"

                    onclick="editUser(${userId})"

                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button

                    class="action-btn status-btn"

                    onclick="openStatusConfirm(

                        ${userId},

                        '${escapeString(user.username)}',

                        '${status}'

                    )"

                    title="Change Status">

                    <i class="fa-solid fa-user-gear"></i>

                </button>

                <button

                    class="action-btn delete-btn"

                    onclick="deleteUser(

                        ${userId},

                        '${escapeString(user.username)}'

                    )"

                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            `;

        }

        // ------------------------------------------

        // TABLE ROW

        // ------------------------------------------

        row.innerHTML = `

            <td>

                ${escapeHtml(user.username)}

            </td>

            <td>

                ${escapeHtml(user.fullName)}

            </td>

            <td>

                ${escapeHtml(user.phone)}

            </td>

            <td>

                ${escapeHtml(user.email)}

            </td>

            <td>

                <span class="role-badge">

                    ${escapeHtml(user.role)}

                </span>

            </td>

            <td>

                <span

                    class="status-badge ${statusClass}">

                    ${status}

                </span>

            </td>

            <td>

                <div class="action-buttons">

                    ${actions}

                </div>

            </td>

        `;

        tableBody.appendChild(row);

    });

}

// ==================================================

// SEARCH + FILTER

// ==================================================

function filterUsers() {

    const searchInput =

        document.getElementById(

            "searchInput"

        );

    const statusFilterElement =

        document.getElementById(

            "statusFilter"

        );

    const roleFilterElement =

        document.getElementById(

            "roleFilter"

        );

    const searchText =

        searchInput

            ? searchInput.value

                .toLowerCase()

                .trim()

            : "";

    const statusFilter =

        statusFilterElement

            ? statusFilterElement.value

            : "ALL";

    const roleFilter =

        roleFilterElement

            ? roleFilterElement.value

            : "ALL";

    const filteredUsers =

        users.filter(function (user) {

            // ----------------------------------

            // SEARCH

            // ----------------------------------

            const matchesSearch =

                (user.username || "")

                    .toLowerCase()

                    .includes(searchText)

                ||

                (user.fullName || "")

                    .toLowerCase()

                    .includes(searchText)

                ||

                (user.phone || "")

                    .toLowerCase()

                    .includes(searchText)

                ||

                (user.email || "")

                    .toLowerCase()

                    .includes(searchText);

            // ----------------------------------

            // STATUS

            // ----------------------------------

            const matchesStatus =

                statusFilter === "ALL"

                ||

                (user.status || "")

                    .toUpperCase() ===

                statusFilter;

            // ----------------------------------

            // ROLE

            // ----------------------------------

            const matchesRole =

                roleFilter === "ALL"

                ||

                (user.role || "")

                    .toUpperCase() ===

                roleFilter;

            return (

                matchesSearch &&

                matchesStatus &&

                matchesRole

            );

        });

    displayUsers(filteredUsers);

}

// ==================================================

// OPEN CREATE MODAL

// ==================================================

function openCreateModal() {

    editingUserId = null;

    document.getElementById(

        "modalTitle"

    ).textContent =

        "Create New User";

    document.getElementById(

        "modalSubtitle"

    ).textContent =

        "Add a new user account";

    document.getElementById(

        "saveButtonText"

    ).textContent =

        "Create User";

    document.getElementById(

        "userForm"

    ).reset();

    document.getElementById(

        "userId"

    ).value = "";

    // Password required for new user

    document.getElementById(

        "password"

    ).required = true;

    document.getElementById(

        "confirmPassword"

    ).required = true;

    document.getElementById(

        "passwordSection"

    ).style.display =

        "block";

    document.getElementById(

        "userModal"

    ).classList.add("show");

}

// ==================================================

// CLOSE USER MODAL

// ==================================================

function closeUserModal() {

    document.getElementById(

        "userModal"

    ).classList.remove("show");

    document.getElementById(

        "userForm"

    ).reset();

    editingUserId = null;

}

// ==================================================

// SAVE USER

// CREATE / UPDATE

// ==================================================

async function saveUser(event) {

    event.preventDefault();

    // ==================================================

    // GET FORM VALUES

    // ==================================================

    const username =

        document.getElementById(

            "username"

        ).value.trim();

    const fullName =

        document.getElementById(

            "fullName"

        ).value.trim();

    const phone =

        document.getElementById(

            "phone"

        ).value.trim();

    const email =

        document.getElementById(

            "email"

        ).value.trim();

    const role =

        document.getElementById(

            "role"

        ).value;

    const password =

        document.getElementById(

            "password"

        ).value;

    const confirmPassword =

        document.getElementById(

            "confirmPassword"

        ).value;

    // ==================================================

    // PHONE VALIDATION

    // ==================================================

    if (!/^\d{10}$/.test(phone)) {

        alert(

            "Phone number must contain exactly 10 digits."

        );

        return;

    }

    // ==================================================

    // EMAIL VALIDATION

    // ==================================================

    const emailPattern =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert(

            "Please enter a valid email address."

        );

        return;

    }

    // ==================================================

    // DUPLICATE PHONE CHECK

    // ==================================================

    const duplicatePhone =

        users.some(function (user) {

            // While editing, ignore current user

            if (

                editingUserId &&

                user.id === editingUserId

            ) {

                return false;

            }

            return (

                user.phone &&

                user.phone.trim() === phone

            );

        });

    if (duplicatePhone) {

        alert(

            "This phone number is already registered."

        );

        return;

    }

    // ==================================================

    // DUPLICATE EMAIL CHECK

    // ==================================================

    const duplicateEmail =

        users.some(function (user) {

            // While editing, ignore current user

            if (

                editingUserId &&

                user.id === editingUserId

            ) {

                return false;

            }

            return (

                user.email &&

                user.email.trim().toLowerCase() ===

                email.toLowerCase()

            );

        });

    if (duplicateEmail) {

        alert(

            "This email address is already registered."

        );

        return;

    }

    // ==================================================

    // CREATE USER PASSWORD VALIDATION

    // ==================================================

    if (!editingUserId) {

        if (!password) {

            alert(

                "Please enter password."

            );

            return;

        }

        if (password !== confirmPassword) {

            alert(

                "Passwords do not match."

            );

            return;

        }

    }

    // ==================================================

    // EDIT USER PASSWORD VALIDATION

    // ==================================================

    if (

        editingUserId &&

        password &&

        password !== confirmPassword

    ) {

        alert(

            "Passwords do not match."

        );

        return;

    }

    // ==================================================

    // USER DATA

    // ==================================================

    const userData = {

        username: username,

        fullName: fullName,

        phone: phone,

        email: email,

        role: role

    };

    // ==================================================

    // PASSWORD

    // ==================================================

    if (password) {

        userData.password =

            password;

    }

    // ==================================================

    // SAVE USER

    // ==================================================

    try {

        let response;

        // --------------------------------------

        // CREATE USER

        // --------------------------------------

        if (!editingUserId) {

            response =

                await fetch(

                    USER_API_URL,

                    {

                        method: "POST",

                        headers:

                            getAuthHeaders(),

                        body:

                            JSON.stringify(

                                userData

                            )

                    }

                );

        }

        // --------------------------------------

        // UPDATE USER

        // --------------------------------------

        else {

            response =

                await fetch(

                    USER_API_URL +

                    "/" +

                    editingUserId,

                    {

                        method: "PUT",

                        headers:

                            getAuthHeaders(),

                        body:

                            JSON.stringify(

                                userData

                            )

                    }

                );

        }

        // ==================================================

        // HANDLE ERROR

        // ==================================================

        if (!response.ok) {

            const errorMessage =

                await response.text();

            console.error(

                "Save user status:",

                response.status

            );

            console.error(

                "Save user response:",

                errorMessage

            );

            // --------------------------------------

            // 401

            // --------------------------------------

            if (response.status === 401) {

                alert(

                    "Session expired. Please login again."

                );

                logout();

                return;

            }

            // --------------------------------------

            // 403

            // --------------------------------------

            if (response.status === 403) {

                alert(

                    errorMessage ||

                    "You are not allowed to perform this action."

                );

                return;

            }

            // --------------------------------------

            // OTHER ERROR

            // --------------------------------------

            alert(

                errorMessage ||

                "Unable to save user."

            );

            return;

        }

        // ==================================================

        // SUCCESS

        // ==================================================

        if (!editingUserId) {

            alert(

                "User created successfully."

            );

        }

        else {

            alert(

                "User updated successfully."

            );

        }

        closeUserModal();

        await loadUsers();

    }

    catch (error) {

        console.error(

            "Save user error:",

            error

        );

        alert(

            "Unable to connect to server."

        );

    }

}

// ==================================================

// EDIT USER

// ==================================================

async function editUser(id) {

    try {

        const response =

            await fetch(

                USER_API_URL +

                "/" +

                id,

                {

                    method: "GET",

                    headers:

                        getAuthHeaders()

                }

            );

        // --------------------------------------

        // ERROR

        // --------------------------------------

        if (!response.ok) {

            const message =

                await response.text();

            if (response.status === 401) {

                alert(

                    "Session expired. Please login again."

                );

                logout();

                return;

            }

            if (response.status === 403) {

                alert(

                    message ||

                    "You are not allowed to edit users."

                );

                return;

            }

            alert(

                message ||

                "Unable to load user."

            );

            return;

        }

        const user =

            await response.json();

        const loggedInUsername =

            sessionStorage.getItem(

                "username"

            );

        // ------------------------------------------

        // OWN ACCOUNT CHECK

        // ------------------------------------------

        if (

            user.username &&

            loggedInUsername &&

            user.username.toLowerCase() ===

            loggedInUsername.toLowerCase()

        ) {

            alert(

                "You cannot edit your own account."

            );

            return;

        }

        editingUserId = id;

        document.getElementById(

            "modalTitle"

        ).textContent =

            "Edit User";

        document.getElementById(

            "modalSubtitle"

        ).textContent =

            "Update user account information";

        document.getElementById(

            "saveButtonText"

        ).textContent =

            "Update User";

        document.getElementById(

            "userId"

        ).value = id;

        document.getElementById(

            "username"

        ).value =

            user.username || "";

        document.getElementById(

            "fullName"

        ).value =

            user.fullName || "";

        document.getElementById(

            "phone"

        ).value =

            user.phone || "";

        document.getElementById(

            "email"

        ).value =

            user.email || "";

        document.getElementById(

            "role"

        ).value =

            user.role || "";

        // Password optional

        document.getElementById(

            "password"

        ).value = "";

        document.getElementById(

            "confirmPassword"

        ).value = "";

        document.getElementById(

            "password"

        ).required = false;

        document.getElementById(

            "confirmPassword"

        ).required = false;

        document.getElementById(

            "passwordSection"

        ).style.display =

            "block";

        document.getElementById(

            "userModal"

        ).classList.add("show");

    }

    catch (error) {

        console.error(

            "Edit user error:",

            error

        );

        alert(

            "Unable to connect to server."

        );

    }

}

// ==================================================

// VIEW USER

// ==================================================

async function viewUser(id) {

    try {

        const response =

            await fetch(

                USER_API_URL +

                "/" +

                id,

                {

                    method: "GET",

                    headers:

                        getAuthHeaders()

                }

            );

        if (!response.ok) {

            const message =

                await response.text();

            if (response.status === 401) {

                alert(

                    "Session expired. Please login again."

                );

                logout();

                return;

            }

            if (response.status === 403) {

                alert(

                    message ||

                    "You are not allowed to view this user."

                );

                return;

            }

            alert(

                message ||

                "Unable to load user details."

            );

            return;

        }

        const user =

            await response.json();

        document.getElementById(

            "viewUsername"

        ).textContent =

            user.username || "-";

        document.getElementById(

            "viewName"

        ).textContent =

            user.fullName || "-";

        document.getElementById(

            "viewPhone"

        ).textContent =

            user.phone || "-";

        document.getElementById(

            "viewEmail"

        ).textContent =

            user.email || "-";

        document.getElementById(

            "viewRole"

        ).textContent =

            user.role || "-";

        document.getElementById(

            "viewStatus"

        ).textContent =

            user.status || "ACTIVE";

        document.getElementById(

            "viewModal"

        ).classList.add("show");

    }

    catch (error) {

        console.error(

            "View user error:",

            error

        );

        alert(

            "Unable to connect to server."

        );

    }

}

// ==================================================

// CLOSE VIEW MODAL

// ==================================================

function closeViewModal() {

    document.getElementById(

        "viewModal"

    ).classList.remove("show");

}

// ==================================================

// OPEN STATUS CONFIRMATION

// ==================================================

function openStatusConfirm(

    id,

    username,

    currentStatus

) {

    const loggedInUsername =

        sessionStorage.getItem(

            "username"

        );

    // ------------------------------------------

    // OWN ACCOUNT

    // ------------------------------------------

    if (

        username &&

        loggedInUsername &&

        username.toLowerCase() ===

        loggedInUsername.toLowerCase()

    ) {

        alert(

            "You cannot change your own account status."

        );

        return;

    }

    statusUserId = id;

    const current =

        currentStatus.toUpperCase();

    // ------------------------------------------

    // TOGGLE STATUS

    // ------------------------------------------

    statusNewValue =

        current === "ACTIVE"

            ? "INACTIVE"

            : "ACTIVE";

    // ------------------------------------------

    // MODAL DATA

    // ------------------------------------------

    const confirmUsername =

        document.getElementById(

            "confirmUsername"

        );

    const confirmCurrentStatus =

        document.getElementById(

            "confirmCurrentStatus"

        );

    const confirmNewStatus =

        document.getElementById(

            "confirmNewStatus"

        );

    const statusConfirmTitle =

        document.getElementById(

            "statusConfirmTitle"

        );

    const statusConfirmModal =

        document.getElementById(

            "statusConfirmModal"

        );

    if (confirmUsername) {

        confirmUsername.textContent =

            username;

    }

    if (confirmCurrentStatus) {

        confirmCurrentStatus.textContent =

            current;

    }

    if (confirmNewStatus) {

        confirmNewStatus.textContent =

            statusNewValue;

    }

    if (statusConfirmTitle) {

        statusConfirmTitle.textContent =

            "Confirm Status Change";

    }

    if (statusConfirmModal) {

        statusConfirmModal.classList.add("show");

    }

}

// ==================================================

// CONFIRM STATUS CHANGE

// ==================================================

async function confirmStatusChange() {

    if (

        !statusUserId ||

        !statusNewValue

    ) {

        return;

    }

    try {

        // ==================================================

        // SEND STATUS UPDATE REQUEST

        // ==================================================

        const response =

            await fetch(

                USER_API_URL +

                "/" +

                statusUserId +

                "/status?status=" +

                encodeURIComponent(

                    statusNewValue

                ),

                {

                    method: "PUT",

                    headers:

                        getAuthHeaders()

                }

            );

        // ==================================================

        // READ BACKEND MESSAGE

        // ==================================================

        const message =

            await response.text();

        console.log(

            "Status update response:",

            response.status,

            message

        );

        // ==================================================

        // 401 - SESSION EXPIRED

        // ==================================================

        if (response.status === 401) {

            alert(

                "Session expired. Please login again."

            );

            logout();

            return;

        }

        // ==================================================

        // 403 - FORBIDDEN

        // ==================================================

        if (response.status === 403) {

            alert(

                message ||

                "You are not allowed to change user status."

            );

            return;

        }

        // ==================================================

        // 400 - BUSINESS LOGIC ERROR

        // ==================================================

        if (response.status === 400) {

            alert(

                message ||

                "Unable to update user status."

            );

            return;

        }

        // ==================================================

        // OTHER ERROR

        // ==================================================

        if (!response.ok) {

            alert(

                message ||

                "Unable to update user status."

            );

            return;

        }

        // ==================================================

        // SUCCESS

        // ==================================================

        alert(

            "User status updated successfully."

        );

        // ==================================================

        // CLOSE MODAL

        // ==================================================

        closeStatusConfirm();

        // ==================================================

        // RELOAD USERS

        // ==================================================

        await loadUsers();

    }

    catch (error) {

        console.error(

            "Status update error:",

            error

        );

        alert(

            "Unable to connect to server."

        );

    }

}

// ==================================================

// CLOSE STATUS CONFIRMATION

// ==================================================

function closeStatusConfirm() {

    const modal =

        document.getElementById(

            "statusConfirmModal"

        );

    if (modal) {

        modal.classList.remove("show");

    }

    statusUserId = null;

    statusNewValue = null;

}

// ==================================================

// DELETE USER

// ==================================================

async function deleteUser(

    id,

    username

) {

    const loggedInUsername =

        sessionStorage.getItem(

            "username"

        );

    // ------------------------------------------

    // OWN ACCOUNT

    // ------------------------------------------

    if (

        username &&

        loggedInUsername &&

        username.toLowerCase() ===

        loggedInUsername.toLowerCase()

    ) {

        alert(

            "You cannot delete your own account."

        );

        return;

    }

    // ------------------------------------------

    // CONFIRM

    // ------------------------------------------

    const confirmed =

        confirm(

            "Are you sure you want to delete user '" +

            username +

            "'?"

        );

    if (!confirmed) {

        return;

    }

    try {

        const response =

            await fetch(

                USER_API_URL +

                "/" +

                id,

                {

                    method: "DELETE",

                    headers:

                        getAuthHeaders()

                }

            );

        // --------------------------------------

        // ERROR

        // --------------------------------------

        if (!response.ok) {

            const message =

                await response.text();

            if (response.status === 401) {

                alert(

                    "Session expired. Please login again."

                );

                logout();

                return;

            }

            if (response.status === 403) {

                alert(

                    message ||

                    "You are not allowed to delete users."

                );

                return;

            }

            alert(

                message ||

                "Unable to delete user."

            );

            return;

        }

        // --------------------------------------

        // SUCCESS

        // --------------------------------------

        alert(

            "User deleted successfully."

        );

        await loadUsers();

    }

    catch (error) {

        console.error(

            "Delete user error:",

            error

        );

        alert(

            "Unable to connect to server."

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

        .replace(/&/g, "&amp;")

        .replace(/\</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

// ==================================================

// ESCAPE STRING FOR ONCLICK

// ==================================================

function escapeString(value) {

    if (

        value === null ||

        value === undefined

    ) {

        return "";

    }

    return String(value)

        .replace(/\\\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"');

}