const FOOD_API_URL = "/api/food"; 


// ================================================== 
// GET TOKEN 
// ================================================== 

function getToken() { 

    return sessionStorage.getItem("token"); 
} 


// ================================================== 
// PAGE LOAD 
// ================================================== 

document.addEventListener("DOMContentLoaded", function () { 

    loadTodayFood(); 

    const dateInput = 
        document.getElementById("foodDate"); 

    if (dateInput) { 

        dateInput.value = 
            new Date().toISOString().split("T")[0]; 

        dateInput.addEventListener( 
            "change", 
            loadTodayFood 
        ); 
    } 


    const searchInput = 
        document.getElementById("searchInput"); 

    if (searchInput) { 

        searchInput.addEventListener( 
            "input", 
            filterFoodTable 
        ); 
    } 


    const closeHistoryModal = 
        document.getElementById( 
            "closeHistoryModal" 
        ); 

    const closeHistoryBtn = 
        document.getElementById( 
            "closeHistoryBtn" 
        ); 

    if (closeHistoryModal) { 

        closeHistoryModal.addEventListener( 
            "click", 
            closeHistory 
        ); 
    } 

    if (closeHistoryBtn) { 

        closeHistoryBtn.addEventListener( 
            "click", 
            closeHistory 
        ); 
    } 
}); 


// ================================================== 
// LOAD TODAY'S FOOD 
// ================================================== 

async function loadTodayFood() { 

    try { 

        const token = getToken(); 

        const response = await fetch( 
            FOOD_API_URL + "/today", 
            { 
                headers: { 
                    "Authorization": 
                        "Bearer " + token 
                } 
            } 
        ); 


        if (!response.ok) { 

            throw new Error( 
                "Unable to load food records." 
            ); 
        } 


        const foodList = 
            await response.json(); 


        displayFood(foodList); 


        updateSummary(foodList); 


    } catch (error) { 

        console.error( 
            "Food loading error:", 
            error 
        ); 

        document.getElementById( 
            "foodTableBody" 
        ).innerHTML = ` 
            <tr> 
                <td colspan="7" 
                    class="empty-message"> 
                    Unable to load food records 
                </td> 
            </tr> 
        `; 
    } 
} 


// ================================================== 
// DISPLAY FOOD TABLE 
// ================================================== 

function displayFood(foodList) { 

    const tbody = 
        document.getElementById( 
            "foodTableBody" 
        ); 


    if (!foodList || 
        foodList.length === 0) { 

        tbody.innerHTML = ` 
            <tr> 
                <td colspan="7" 
                    class="empty-message"> 
                    No food records available 
                </td> 
            </tr> 
        `; 

        return; 
    } 


    tbody.innerHTML = ""; 


    foodList.forEach(function (food) { 

        const tenant = 
            food.tenant; 


        const tenantName = 
            tenant?.user?.fullName || "Unknown"; 


        const roomNo = 
            tenant?.room?.roomNo || "-"; 


        const breakfast = 
            food.breakfast 
                ? `<span class="meal-taken">✓</span>` 
                : `<span class="meal-not-taken">✕</span>`; 


        const lunch = 
            food.lunch 
                ? `<span class="meal-taken">✓</span>` 
                : `<span class="meal-not-taken">✕</span>`; 


        const dinner = 
            food.dinner 
                ? `<span class="meal-taken">✓</span>` 
                : `<span class="meal-not-taken">✕</span>`; 


        const statusClass = 
            food.status 
                ? food.status.toLowerCase() 
                : "pending"; 


        const row = document.createElement("tr"); 


        row.innerHTML = ` 

            <td>${tenantName}</td> 

            <td>${roomNo}</td> 

            <td class="meal-cell"> 
                ${breakfast} 
            </td> 

            <td class="meal-cell"> 
                ${lunch} 
            </td> 

            <td class="meal-cell"> 
                ${dinner} 
            </td> 

            <td> 
                <span class="status-badge ${statusClass}"> 
                    ${food.status} 
                </span> 
            </td> 

            <td> 
                <button 
                    class="history-btn" 
                    title="View History" 
                    onclick="openHistory(${tenant.tenantId}, '${tenantName}')"> 

                    <i class="fa-solid fa-eye"></i> 

                </button> 
            </td> 

        `; 


        tbody.appendChild(row); 
    }); 
} 


// ================================================== 
// SUMMARY CARDS 
// ================================================== 

// ================================================== 
// SUMMARY CARDS 
// ================================================== 

function updateSummary(foodList) { 

    let breakfast = 0; 
    let lunch = 0; 
    let dinner = 0; 


    foodList.forEach(function (food) { 

        if (food.breakfast) { 
            breakfast++; 
        } 

        if (food.lunch) { 
            lunch++; 
        } 

        if (food.dinner) { 
            dinner++; 
        } 
    }); 


    // Actual consumed meals 
    const totalMeals = foodList.length*3; 
         
 

    // Total meal slots 
    // 1 WITH_FOOD tenant = 3 meals 
    const totalConsumedMeals = 
        breakfast + lunch + dinner; 


    document.getElementById( 
        "breakfastCount" 
    ).textContent = breakfast; 


    document.getElementById( 
        "lunchCount" 
    ).textContent = lunch; 


    document.getElementById( 
        "dinnerCount" 
    ).textContent = dinner; 


    document.getElementById( 
        "totalMeals" 
    ).textContent = totalMeals; 


    document.getElementById( 
        "totalConsumedMeals" 
    ).textContent = totalConsumedMeals; 
} 

// ================================================== 
// SEARCH 
// ================================================== 

function filterFoodTable() { 

    const search = 
        document.getElementById( 
            "searchInput" 
        ).value.toLowerCase(); 


    const rows = 
        document.querySelectorAll( 
            "#foodTableBody tr" 
        ); 


    rows.forEach(function (row) { 

        const text = 
            row.textContent.toLowerCase(); 


        row.style.display = 
            text.includes(search) 
                ? "" 
                : "none"; 
    }); 
} 


// ================================================== 
// OPEN HISTORY 
// ================================================== 

async function openHistory( 
    tenantId, 
    tenantName 
) { 

    try { 

        const token = getToken(); 


        const response = await fetch( 
            FOOD_API_URL + 
            "/tenant/" + 
            tenantId + 
            "/history", 
            { 
                headers: { 
                    "Authorization": 
                        "Bearer " + token 
                } 
            } 
        ); 


        if (!response.ok) { 

            throw new Error( 
                "Unable to load history." 
            ); 
        } 


        const history = 
            await response.json(); 


        document.getElementById( 
            "historyTenantName" 
        ).textContent = 
            tenantName + " - Food History"; 


        displayHistory(history); 


        document.getElementById( 
            "foodHistoryModal" 
        ).classList.add("show"); 


    } catch (error) { 

        console.error( 
            "History error:", 
            error 
        ); 

        alert( 
            "Unable to load food history." 
        ); 
    } 
} 


// ================================================== 
// DISPLAY HISTORY 
// ================================================== 

function displayHistory(history) { 

    const tbody = 
        document.getElementById( 
            "foodHistoryTableBody" 
        ); 


    if (!history || 
        history.length === 0) { 

        tbody.innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="empty-message"> 
                    No food history available 
                </td> 
            </tr> 
        `; 

        return; 
    } 


    let breakfastCount = 0; 
    let lunchCount = 0; 
    let dinnerCount = 0; 


    tbody.innerHTML = ""; 


    history.forEach(function (food) { 

        if (food.breakfast) { 
            breakfastCount++; 
        } 


        if (food.lunch) { 
            lunchCount++; 
        } 


        if (food.dinner) { 
            dinnerCount++; 
        } 


        const row = 
            document.createElement("tr"); 


        row.innerHTML = ` 

            <td> 
                ${formatDate(food.foodDate)} 
            </td> 

            <td> 
                ${food.breakfast ? "✓" : "✕"} 
            </td> 

            <td> 
                ${food.lunch ? "✓" : "✕"} 
            </td> 

            <td> 
                ${food.dinner ? "✓" : "✕"} 
            </td> 

            <td> 
                <span class="status-badge ${food.status.toLowerCase()}"> 
                    ${food.status} 
                </span> 
            </td> 

        `; 


        tbody.appendChild(row); 
    }); 


    document.getElementById( 
        "historyTotalDays" 
    ).textContent = history.length; 


    document.getElementById( 
        "historyBreakfastCount" 
    ).textContent = 
        breakfastCount; 


    document.getElementById( 
        "historyLunchCount" 
    ).textContent = 
        lunchCount; 


    document.getElementById( 
        "historyDinnerCount" 
    ).textContent = 
        dinnerCount; 
} 


// ================================================== 
// CLOSE HISTORY 
// ================================================== 

function closeHistory() { 

    document.getElementById( 
        "foodHistoryModal" 
    ).classList.remove("show"); 
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


    return ( 
        parts[2] + 
        " " + 
        getMonthName(parts[1]) + 
        " " + 
        parts[0] 
    ); 
} 


function getMonthName(month) { 

    const months = [ 
        "Jan", 
        "Feb", 
        "Mar", 
        "Apr", 
        "May", 
        "Jun", 
        "Jul", 
        "Aug", 
        "Sep", 
        "Oct", 
        "Nov", 
        "Dec" 
    ]; 


    return months[ 
        parseInt(month) - 1 
    ]; 
} 

document.getElementById("logoutBtn").addEventListener("click",function(){ 

      sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 

    window.location.href = "/html/login.html"; 
})