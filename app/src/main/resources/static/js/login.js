console.log("LOGIN JS LOADED");


// ==================================================
// LOGIN FORM
// ==================================================

const loginForm =
    document.getElementById("loginForm");


// ==================================================
// LOGIN SUBMIT
// ==================================================

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ==========================================
        // GET LOGIN VALUES
        // ==========================================

        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value
                .trim();


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        // ==========================================
        // VALIDATION
        // ==========================================

        if (username === "") {

            loginMessage.textContent =
                "Please enter username.";

            return;
        }


        if (password === "") {

            loginMessage.textContent =
                "Please enter password.";

            return;
        }


        loginMessage.textContent = "";


        // ==========================================
        // LOGIN DATA
        // ==========================================

        const loginData = {

            username: username,

            password: password

        };


        // ==========================================
        // LOGIN API
        // ==========================================

        fetch(
            "http://localhost:8080/api/users/login",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(loginData)

            }
        )


        // ==========================================
        // LOGIN RESPONSE
        // ==========================================

        .then(function (response) {

            if (!response.ok) {

                return response.text()
                    .then(function (message) {

                        throw new Error(
                            message ||
                            "Invalid username or password"
                        );

                    });

            }


            return response.json();

        })


        // ==========================================
        // LOGIN SUCCESS
        // ==========================================

        .then(function (user) {

            console.log(
                "Login successful:",
                user
            );


            // ======================================
            // CHECK TOKEN
            // ======================================

            if (!user.token) {

                throw new Error(
                    "JWT token not received from server."
                );

            }


            if (!user.username) {

                throw new Error(
                    "Username not received from server."
                );

            }


            if (!user.role) {

                throw new Error(
                    "User role not received from server."
                );

            }


            // ======================================
            // STORE USERNAME
            // ======================================

            sessionStorage.setItem(
                "username",
                user.username
            );


            // ======================================
            // STORE ROLE
            // ======================================

            sessionStorage.setItem(
                "role",
                user.role
            );


            // ======================================
            // STORE JWT TOKEN
            // ======================================

            sessionStorage.setItem(
                "token",
                user.token
            );


            // ======================================
            // CONSOLE CHECK
            // ======================================

            console.log(
                "Username stored:",
                sessionStorage.getItem("username")
            );


            console.log(
                "Role stored:",
                sessionStorage.getItem("role")
            );


            console.log(
                "Token stored:",
                sessionStorage.getItem("token")
                    ? "YES"
                    : "NO"
            );


            // ======================================
            // GET ROLE
            // ======================================

            const role =
                user.role.toUpperCase();


            // ======================================
            // ROLE BASED REDIRECT
            // ======================================

            if (role === "ADMIN") {

                window.location.href =
                    "/html/dashboard.html";

                return;

            }


            if (role === "WARDEN") {

                window.location.href =
                    "/html/dashboard.html";

                return;

            }


            if (role === "TENANT") {

                window.location.href =
                    "/html/tenantDashboard.html";

                return;

            }


            alert("Invalid user role.");

        })


        // ==========================================
        // LOGIN ERROR
        // ==========================================

        .catch(function (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                error.message ||
                "Invalid Username or Password";

        });

    }
);



// ==================================================
// FORGOT PASSWORD
// ==================================================

const forgotPasswordLink =
    document.getElementById(
        "forgotPasswordLink"
    );


const forgotPasswordModal =
    document.getElementById(
        "forgotPasswordModal"
    );


const closeForgotModal =
    document.getElementById(
        "closeForgotModal"
    );


// ==================================================
// OPEN FORGOT PASSWORD MODAL
// ==================================================

forgotPasswordLink.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        forgotPasswordModal.classList.add(
            "show"
        );

    }
);


// ==================================================
// CLOSE FORGOT PASSWORD MODAL
// ==================================================

closeForgotModal.addEventListener(
    "click",
    function () {

        forgotPasswordModal.classList.remove(
            "show"
        );

    }
);


// ==================================================
// CLOSE MODAL OUTSIDE CLICK
// ==================================================

forgotPasswordModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            forgotPasswordModal
        ) {

            forgotPasswordModal.classList.remove(
                "show"
            );

        }

    }
);



// ==================================================
// RESET PASSWORD FORM
// ==================================================

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


resetPasswordForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ==========================================
        // GET VALUES
        // ==========================================

        const username =
            document
                .getElementById(
                    "resetUsername"
                )
                .value
                .trim();


        const newPassword =
            document
                .getElementById(
                    "newPassword"
                )
                .value
                .trim();


        const confirmPassword =
            document
                .getElementById(
                    "confirmPassword"
                )
                .value
                .trim();


        const resetMessage =
            document.getElementById(
                "resetMessage"
            );


        // ==========================================
        // CLEAR OLD MESSAGE
        // ==========================================

        resetMessage.textContent = "";


        // ==========================================
        // VALIDATION
        // ==========================================

        if (username === "") {

            resetMessage.textContent =
                "Please enter username.";

            return;
        }


        if (newPassword === "") {

            resetMessage.textContent =
                "Please enter new password.";

            return;
        }


        if (confirmPassword === "") {

            resetMessage.textContent =
                "Please confirm your password.";

            return;
        }


        // ==========================================
        // CHECK PASSWORD MATCH
        // ==========================================

        if (
            newPassword !==
            confirmPassword
        ) {

            resetMessage.textContent =
                "Passwords do not match.";

            return;
        }


        // ==========================================
        // RESET DATA
        // ==========================================

        const resetData = {

            username: username,

            password: newPassword

        };


        // ==========================================
        // RESET PASSWORD API
        // ==========================================

        fetch(
            "http://localhost:8080/api/users/reset-password",
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(resetData)

            }
        )


        // ==========================================
        // RESET RESPONSE
        // ==========================================

        .then(function (response) {

            return response.text()
                .then(function (message) {

                    if (!response.ok) {

                        throw new Error(
                            message ||
                            "Unable to reset password."
                        );

                    }


                    return message;

                });

        })


        // ==========================================
        // RESET SUCCESS
        // ==========================================

        .then(function (message) {

            console.log(
                "Password reset:",
                message
            );


            resetMessage.textContent =
                "Password reset successfully.";


            // ======================================
            // CLEAR FIELDS
            // ======================================

            document.getElementById(
                "resetUsername"
            ).value = "";


            document.getElementById(
                "newPassword"
            ).value = "";


            document.getElementById(
                "confirmPassword"
            ).value = "";


            // ======================================
            // CLOSE MODAL
            // ======================================

            setTimeout(function () {

                forgotPasswordModal.classList.remove(
                    "show"
                );


                resetMessage.textContent = "";

            }, 1000);

        })


        // ==========================================
        // RESET ERROR
        // ==========================================

        .catch(function (error) {

            console.error(
                "Reset password error:",
                error
            );


            resetMessage.textContent =
                error.message ||
                "Unable to reset password.";

        });

    }
);