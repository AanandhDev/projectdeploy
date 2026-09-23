// ================================================== 
// MY FOOD 
// ================================================== 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadMyFood(); 
 
}); 
 
 
// ================================================== 
// LOAD TODAY'S FOOD 
// ================================================== 
 
async function loadMyFood() { 
 
    const token = sessionStorage.getItem("token"); 
 
    try { 
 
        const response = await fetch("/api/food/my", { 
 
            method: "GET", 
 
            headers: { 
                "Authorization": "Bearer " + token 
            } 
 
        }); 
 
 
        if (!response.ok) { 
 
            throw new Error("Failed to load food details."); 
 
        } 
 
 
        const food = await response.json(); 
 
 
        // Update Food Plan 
 
        const foodIncluded = 
            document.getElementById("foodIncluded"); 
 
        if (foodIncluded) { 
 
            foodIncluded.textContent = "YES"; 
 
        } 
 
 
        // Display today's record 
 
        displayFood(food); 
 
    } 
 
    catch (error) { 
 
        console.error("Error loading food:", error); 
 
        const tableBody = 
            document.getElementById("foodTableBody"); 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="5" class="loading-cell"> 
                    Unable to load food details. 
                </td> 
            </tr> 
        `; 
 
    } 
 
} 
 
 
// ================================================== 
// DISPLAY TODAY'S FOOD 
// ================================================== 
 
function displayFood(food) { 
 
    const tableBody = 
        document.getElementById("foodTableBody"); 
 
 
    // Format date 
 
    const date = 
        new Date(food.foodDate).toLocaleDateString( 
            "en-GB", 
            { 
                day: "2-digit", 
                month: "2-digit", 
                year: "numeric" 
            } 
        ); 
 
 
    // Meal symbols 
 
    const breakfast = 
        food.breakfast ? "✓" : "✕"; 
 
    const lunch = 
        food.lunch ? "✓" : "✕"; 
 
    const dinner = 
        food.dinner ? "✓" : "✕"; 
 
 
    // Status 
 
    let status = food.status || "PENDING"; 
 
    status = status.toUpperCase(); 
 
 
    let statusClass = "pending"; 
 
 
    if (status === "COMPLETED") { 
 
        statusClass = "completed"; 
 
    } 
    else if (status === "PARTIAL") { 
 
        statusClass = "partial"; 
 
    } 
 
 
    tableBody.innerHTML = ` 
 
        <tr> 
 
            <td> 
                ${date} 
            </td> 
 
 
            <td> 
 
                <input 
                    type="checkbox" 
                    class="meal-checkbox" 
                    id="breakfast" 
                    ${food.breakfast ? "checked" : ""} 
                    onchange="updateFood()" 
                > 
 
                <label for="breakfast"> 
                    ${breakfast} 
                </label> 
 
            </td> 
 
 
            <td> 
 
                <input 
                    type="checkbox" 
                    class="meal-checkbox" 
                    id="lunch" 
                    ${food.lunch ? "checked" : ""} 
                    onchange="updateFood()" 
                > 
 
                <label for="lunch"> 
                    ${lunch} 
                </label> 
 
            </td> 
 
 
            <td> 
 
                <input 
                    type="checkbox" 
                    class="meal-checkbox" 
                    id="dinner" 
                    ${food.dinner ? "checked" : ""} 
                    onchange="updateFood()" 
                > 
 
                <label for="dinner"> 
                    ${dinner} 
                </label> 
 
            </td> 
 
 
            <td> 
 
                <span class="status-badge ${statusClass}"> 
                    ${status} 
                </span> 
 
            </td> 
 
        </tr> 
 
    `; 
 
} 
 
 
// ================================================== 
// UPDATE TODAY'S FOOD 
// ================================================== 
 
async function updateFood() { 
 
    const token = sessionStorage.getItem("token"); 
 
 
    const breakfast = 
        document.getElementById("breakfast").checked; 
 
    const lunch = 
        document.getElementById("lunch").checked; 
 
    const dinner = 
        document.getElementById("dinner").checked; 
 
 
    try { 
 
        const response = await fetch("/api/food/my", { 
 
            method: "PUT", 
 
            headers: { 
 
                "Authorization": "Bearer " + token, 
 
                "Content-Type": "application/json" 
 
            }, 
 
            body: JSON.stringify({ 
 
                breakfast: breakfast, 
 
                lunch: lunch, 
 
                dinner: dinner 
 
            }) 
 
        }); 
 
 
        if (!response.ok) { 
 
            throw new Error("Failed to update food."); 
 
        } 
 
 
        const updatedFood = 
            await response.json(); 
 
 
        // Refresh table immediately 
 
        displayFood(updatedFood); 
 
    } 
 
    catch (error) { 
 
        console.error("Error updating food:", error); 
 
        alert("Unable to update food details."); 
 
        // Reload original data 
 
        loadMyFood(); 
 
    } 
 
}