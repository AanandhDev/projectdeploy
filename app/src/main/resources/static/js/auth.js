const role = sessionStorage.getItem("role"); 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    const currentRole = role ? role.toUpperCase() : ""; 
 
 
    // ================================================== 
    // WARDEN RESTRICTIONS 
    // ================================================== 
 
    if (currentRole === "WARDEN") { 
 
        // ================================================== 
        // SIDEBAR 
        // ================================================== 
 
        const accountsMenu = 
            document.getElementById("accountsMenu"); 
 
        if (accountsMenu) { 
            accountsMenu.style.display = "none"; 
        } 
 
 
        const usersMenu = 
            document.getElementById("usersMenu"); 
 
        if (usersMenu) { 
            usersMenu.style.display = "none"; 
        } 
 
 
        // ================================================== 
        // DASHBOARD 
        // ================================================== 
 
        const monthlyCollectionCard = 
            document.getElementById("monthlyCollectionCard"); 
 
        if (monthlyCollectionCard) { 
            monthlyCollectionCard.style.display = "none"; 
        } 
 
 
        // ================================================== 
        // TENANT MANAGEMENT 
        // ================================================== 
 
        const tenantActionHeader = 
            document.getElementById("tenantActionHeader"); 
 
        if (tenantActionHeader) { 
            tenantActionHeader.style.display = "none"; 
        } 
 
 
        // Hide tenant action buttons 
        function hideTenantActions() { 
 
            const tenantTableBody = 
                document.getElementById("tenantTableBody"); 
 
            if (!tenantTableBody) { 
                return; 
            } 
 
 
            // Hide entire action cell 
            tenantTableBody 
                .querySelectorAll(".tenant-action-cell") 
                .forEach(function (cell) { 
                    cell.style.display = "none"; 
                }); 
 
 
            // Extra safety - hide action buttons 
            tenantTableBody 
                .querySelectorAll(".action-btn") 
                .forEach(function (button) { 
                    button.style.display = "none"; 
                }); 
        } 
 
 
        // ================================================== 
        // ROOM MANAGEMENT 
        // ================================================== 
 
        const addRoomBtn = 
            document.getElementById("openAddRoomBtn"); 
 
        if (addRoomBtn) { 
            addRoomBtn.style.display = "none"; 
        } 
 
 
        const roomActionHeader = 
            document.getElementById("roomActionHeader"); 
 
        if (roomActionHeader) { 
            roomActionHeader.style.display = "none"; 
        } 
 
 
        // Hide room action buttons 
        function hideRoomActions() { 
 
            const roomTableBody = 
                document.getElementById("roomTableBody"); 
 
            if (!roomTableBody) { 
                return; 
            } 
 
 
            // Hide entire action cell 
            roomTableBody 
                .querySelectorAll(".room-action-cell") 
                .forEach(function (cell) { 
                    cell.style.display = "none"; 
                }); 
 
 
            // Extra safety - hide edit button 
            roomTableBody 
                .querySelectorAll(".action-btn") 
                .forEach(function (button) { 
                    button.style.display = "none"; 
                }); 
 
 
            // Extra safety - hide action container 
            roomTableBody 
                .querySelectorAll(".action-buttons") 
                .forEach(function (container) { 
                    container.style.display = "none"; 
                }); 
        } 
 
 
        // ================================================== 
        // RUN IMMEDIATELY 
        // ================================================== 
 
        hideTenantActions(); 
        hideRoomActions(); 
 
 
        // ================================================== 
        // WATCH DYNAMIC TABLE ROWS 
        // ================================================== 
 
        const observer = 
            new MutationObserver(function () { 
 
                hideTenantActions(); 
                hideRoomActions(); 
 
            }); 
 
 
        observer.observe(document.body, { 
 
            childList: true, 
 
            subtree: true 
 
        }); 
 
    } 
 
 
 
    // ================================================== 
// MY FOOD VISIBILITY 
// ================================================== 
 
const myFoodMenu = 
    document.getElementById("myFoodMenu"); 
 
if (myFoodMenu) { 
 
    // ADMIN / WARDEN 
    if (currentRole !== "TENANT") { 
 
        myFoodMenu.remove(); 
 
    } 
 
    // TENANT 
    else { 
 
        fetch("/api/tenants/my", { 
            headers: { 
                "Authorization": 
                    "Bearer " + 
                    sessionStorage.getItem("token") 
            } 
        }) 
        .then(response => { 
 
            if (!response.ok) { 
                throw new Error( 
                    "Unable to load tenant details." 
                ); 
            } 
 
            return response.json(); 
        }) 
        .then(tenant => { 
 
            console.log("TENANT FOOD PLAN =", tenant.foodPlan); 
 
            if ( 
                !tenant.foodPlan || 
                tenant.foodPlan.toUpperCase() !== "WITH_FOOD" 
            ) { 
 
                // WITHOUT_FOOD 
                myFoodMenu.remove(); 
 
            } 
 
        }) 
        .catch(error => { 
 
            console.error( 
                "My Food visibility error:", 
                error 
            ); 
 
            // If tenant details cannot be loaded, 
            // remove My Food for safety 
            myFoodMenu.remove(); 
 
        }); 
    } 
} 
});