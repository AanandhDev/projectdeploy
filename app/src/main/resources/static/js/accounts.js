const ACCOUNTS_API_URL = "/api/accounts"; 
 
const token = sessionStorage.getItem("token"); 
 
let transactions = []; 
 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    loadTransactions(); 
 
    setupEvents(); 
 
    loadProfile(); 
 
    setTodayDate(); 
 
}); 
 
 
/* ================================================== 
   EVENTS 
================================================== */ 
 
function setupEvents() { 
 
    document 
        .getElementById("openExpenseBtn") 
        .addEventListener( 
            "click", 
            openExpenseModal 
        ); 
 
 
    document 
        .getElementById("closeExpenseBtn") 
        .addEventListener( 
            "click", 
            closeExpenseModal 
        ); 
 
 
    document 
        .getElementById("cancelExpenseBtn") 
        .addEventListener( 
            "click", 
            closeExpenseModal 
        ); 
 
 
    document 
        .getElementById("expenseForm") 
        .addEventListener( 
            "submit", 
            saveExpense 
        ); 
 
 
    document 
        .getElementById("expenseType") 
        .addEventListener( 
            "change", 
            handleExpenseType 
        ); 
 
 
    document 
        .getElementById("searchInput") 
        .addEventListener( 
            "input", 
            displayTransactions 
        ); 
 
 
    document 
        .getElementById("statusFilter") 
        .addEventListener( 
            "change", 
            displayTransactions 
        ); 
} 
 
 
/* ================================================== 
   LOAD TRANSACTIONS 
================================================== */ 
 
async function loadTransactions() { 
 
    try { 
 
        const response = await fetch( 
            ACCOUNTS_API_URL, 
            { 
                headers: { 
                    "Authorization": 
                        "Bearer " + token 
                } 
            } 
        ); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                "Failed to load transactions." 
            ); 
        } 
 
 
        transactions = 
            await response.json(); 
 
 
        displayTransactions(); 
 
        updateSummary(); 
 
 
    } catch (error) { 
 
        console.error(error); 
 
        document.getElementById( 
            "transactionTableBody" 
        ).innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="empty-message"> 
                    Failed to load transactions 
                </td> 
            </tr> 
        `; 
    } 
} 
 
 
/* ================================================== 
   DISPLAY TRANSACTIONS 
================================================== */ 
 
function displayTransactions() { 
 
    const tableBody = 
        document.getElementById( 
            "transactionTableBody" 
        ); 
 
 
    const search = 
        document.getElementById( 
            "searchInput" 
        ).value 
        .toLowerCase() 
        .trim(); 
 
 
    const filter = 
        document.getElementById( 
            "statusFilter" 
        ).value; 
 
 
    const filtered = 
        transactions.filter( 
            function (transaction) { 
 
                const matchesSearch = 
                    transaction.transactionId 
                        .toLowerCase() 
                        .includes(search) 
                    || 
                    transaction.description 
                        .toLowerCase() 
                        .includes(search); 
 
 
                const matchesStatus = 
                    filter === "ALL" 
                    || 
                    transaction.status === filter; 
 
 
                return matchesSearch 
                    && matchesStatus; 
            } 
        ); 
 
 
    if (filtered.length === 0) { 
 
        tableBody.innerHTML = ` 
            <tr> 
                <td colspan="5" 
                    class="empty-message"> 
                    No transactions available 
                </td> 
            </tr> 
        `; 
 
        return; 
    } 
 
 
    tableBody.innerHTML = 
        filtered.map( 
            function (transaction) { 
 
                return ` 
                    <tr> 
 
                        <td> 
                            ${transaction.transactionId} 
                        </td> 
 
                        <td> 
                            ${transaction.description} 
                        </td> 
 
                        <td> 
                            ₹${transaction.amount.toFixed(2)} 
                        </td> 
 
                        <td> 
                            ${transaction.transactionDate} 
                        </td> 
 
                        <td> 
                            ${getStatusBadge( 
                                transaction.status 
                            )} 
                        </td> 
 
                    </tr> 
                `; 
 
            } 
        ).join(""); 
} 
 
 
/* ================================================== 
   STATUS BADGE 
================================================== */ 
 
function getStatusBadge(status) { 
 
    if (status === "INCOME") { 
 
        return ` 
            <span class="status income"> 
                Income 
            </span> 
        `; 
    } 
 
 
    return ` 
        <span class="status expense"> 
            Expense 
        </span> 
    `; 
} 
 
 
/* ================================================== 
   UPDATE SUMMARY 
================================================== */ 
 
function updateSummary() { 
 
    let totalIncome = 0; 
 
    let totalExpense = 0; 
 
 
    transactions.forEach( 
        function (transaction) { 
 
            if (transaction.status === "INCOME") { 
 
                totalIncome += 
                    transaction.amount; 
            } 
 
 
            if (transaction.status === "EXPENSE") { 
 
                totalExpense += 
                    transaction.amount; 
            } 
        } 
    ); 
 
 
    const netProfit = 
        totalIncome - totalExpense; 
 
 
    document.getElementById( 
        "totalIncome" 
    ).textContent = 
        "₹" + totalIncome.toFixed(2); 
 
 
    document.getElementById( 
        "totalExpense" 
    ).textContent = 
        "₹" + totalExpense.toFixed(2); 
 
 
    document.getElementById( 
        "netProfit" 
    ).textContent = 
        "₹" + netProfit.toFixed(2); 
} 
 
 
/* ================================================== 
   OPEN EXPENSE MODAL 
================================================== */ 
 
function openExpenseModal() { 
 
    document.getElementById( 
        "expenseModal" 
    ).classList.add("show"); 
 
 
    setTodayDate(); 
} 
 
 
/* ================================================== 
   CLOSE EXPENSE MODAL 
================================================== */ 
 
function closeExpenseModal() { 
 
    document.getElementById( 
        "expenseModal" 
    ).classList.remove("show"); 
 
 
    document.getElementById( 
        "expenseForm" 
    ).reset(); 
 
 
    document.getElementById( 
        "otherExpenseGroup" 
    ).style.display = "none"; 
} 
 
 
/* ================================================== 
   OTHER EXPENSE 
================================================== */ 
 
function handleExpenseType() { 
 
    const expenseType = 
        document.getElementById( 
            "expenseType" 
        ).value; 
 
 
    const otherGroup = 
        document.getElementById( 
            "otherExpenseGroup" 
        ); 
 
 
    const otherInput = 
        document.getElementById( 
            "otherExpense" 
        ); 
 
 
    if (expenseType === "Other") { 
 
        otherGroup.style.display = 
            "block"; 
 
        otherInput.required = true; 
 
    } else { 
 
        otherGroup.style.display = 
            "none"; 
 
        otherInput.required = false; 
 
        otherInput.value = ""; 
    } 
} 
 
 
/* ================================================== 
   SAVE EXPENSE 
================================================== */ 
 
async function saveExpense(event) { 
 
    event.preventDefault(); 
 
    const expenseType = 
        document.getElementById( 
            "expenseType" 
        ).value; 
 
 
    const otherExpense = 
        document.getElementById( 
            "otherExpense" 
        ).value.trim(); 
 
 
    const amount = 
        Number( 
            document.getElementById( 
                "expenseAmount" 
            ).value 
        ); 
 
 
    const date = 
        document.getElementById( 
            "expenseDate" 
        ).value; 
 
 
    let description = 
        expenseType; 
 
 
    if (expenseType === "Other") { 
 
        description = otherExpense; 
    } 
 
 
    const expenseData = { 
 
        description: description, 
 
        amount: amount, 
 
        transactionDate: date 
    }; 
 
 
    try { 
 
        const response = await fetch( 
            ACCOUNTS_API_URL + 
            "/expense", 
            { 
                method: "POST", 
 
                headers: { 
                    "Content-Type": 
                        "application/json", 
 
                    "Authorization": 
                        "Bearer " + token 
                }, 
 
                body: JSON.stringify( 
                    expenseData 
                ) 
            } 
        ); 
 
 
        const result = 
            await response.json(); 
 
 
        if (!response.ok) { 
 
            throw new Error( 
                result.message || 
                "Failed to add expense." 
            ); 
        } 
 
 
        alert( 
            "Expense added successfully." 
        ); 
 
 
        closeExpenseModal(); 
 
        loadTransactions(); 
 
 
    } catch (error) { 
 
        console.error(error); 
 
        alert(error.message); 
    } 
} 
 
 
/* ================================================== 
   TODAY DATE 
================================================== */ 
 
function setTodayDate() { 
 
    const dateInput = 
        document.getElementById( 
            "expenseDate" 
        ); 
 
 
    const today = 
        new Date() 
            .toISOString() 
            .split("T")[0]; 
 
 
    dateInput.value = today; 
 
} 
 
 
/* ================================================== 
   PROFILE 
================================================== */ 
 
function loadProfile() { 
 
    const username = 
        sessionStorage.getItem("username"); 
 
    const role = 
        sessionStorage.getItem("role"); 
 
 
    document.getElementById( 
        "profileUsername" 
    ).textContent = 
        username || "User"; 
 
 
    document.getElementById( 
        "profileRole" 
    ).textContent = 
        role || "ADMIN"; 
 
} 
 
document.getElementById("logoutBtn").addEventListener("click",function(){ 
 
    sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("username"); 
    sessionStorage.removeItem("role"); 
 
    window.location.href = "/html/login.html"; 
})