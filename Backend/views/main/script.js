document.addEventListener("DOMContentLoaded", function () {
    // Only run if user is logged in
    if (!window.currentUser) {
        alert("You are not logged in.");
        return;
    }

    // State management using window.currentUser
    const state = {
        balance: window.currentUser.balance || 0,
        products: {
            stable: [],
            welfare: [],
            wages: [],
        },
        transactions: [],
        banks: window.currentUser.banks || [],
        referralCode: window.currentUser.referralCode || "",
    };

    // DOM Elements
    const dashboardSection = document.getElementById("dashboard-section");
    const depositSection = document.getElementById("deposit-section");
    const withdrawSection = document.getElementById("withdraw-section");
    const bankSection = document.getElementById("bank-section");
    const productsSection = document.getElementById("products-section");
    const myProductsSection = document.getElementById("my-products-section");
    const invitesSection = document.getElementById("invites-section");

    const depositButton = document.getElementById("deposit-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const bankButton = document.getElementById("bank-button");
    const productsButton = document.getElementById("products-button");
    const myProductsButton = document.getElementById("my-products-button");
    const inviteButton = document.getElementById("invite-button");

    // Toast notification
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    // User menu logic
    const userMenuButton = document.getElementById("user-menu-button");
    const userMenu = document.getElementById("user-menu");
    userMenuButton.addEventListener("click", function (e) {
        e.stopPropagation();
        userMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", function () {
        userMenu.classList.add("hidden");
    });
    userMenu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    // Initialize the dashboard
    updateUI();
    generateProductCards();
    setupEventListeners();

    function updateUI() {
        // Update balance
        document.getElementById("balance-amount").textContent = `₦${state.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        document.getElementById("withdraw-balance").textContent = `₦${state.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

        // Update product counts
        document.getElementById("total-products").textContent =
            state.products.stable.length +
            state.products.welfare.length +
            state.products.wages.length;

        document.getElementById("stable-products").textContent = state.products.stable.length;
        document.getElementById("welfare-products").textContent = state.products.welfare.length;
        document.getElementById("wages-products").textContent = state.products.wages.length;

        // Update referral link
        document.getElementById("referral-link").textContent = `https://wealth-wave-investment.int.ng/ref/${state.referralCode}`;
    }

    function generateProductCards() {
        // Get references to elements
        const stableProductsTab = document.getElementById("stable-products-tab");
        const welfareProductsTab = document.getElementById("welfare-products-tab");
        const wagesProductsTab = document.getElementById("wages-products-tab");

        const stableProductsContent = document.getElementById("stable-products-content").querySelector(".grid");
        const welfareProductsContent = document.getElementById("welfare-products-content").querySelector(".grid");
        const wagesProductsContent = document.getElementById("wages-products-content").querySelector(".grid");

        // Helper function to create product card HTML
        function createProductCard(product) {
            const totalReturnPercentage = ((product.totalReturn / product.price) * 100).toFixed(2);
            const dailyReturnPercentage = ((product.dailyReturn / product.price) * 100).toFixed(2);

            return `
    <div class="bg-[#1e1e1e] rounded-lg p-4 shadow-md text-white">
      <div class="flex items-center mb-4">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mr-4 ${product.color}">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-200">${product.name.replace("Stable ", "Stable VIP ")}</h3>
          <p class="text-sm text-gray-400">Duration <span class="text-green-400">${product.duration}</span></p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p class="text-sm text-gray-400">Total Return</p>
          <p class="text-lg font-bold text-gray-100">₦${product.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p class="text-xs text-green-400">${totalReturnPercentage}%</p>
        </div>
        <div>
          <p class="text-sm text-gray-400">Daily Return</p>
          <p class="text-lg font-bold text-gray-100">₦${product.dailyReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p class="text-xs text-green-400">${dailyReturnPercentage}%</p>
        </div>
      </div>
      <div class="flex">
        <button class="flex-1 bg-[#3b3b3b] text-white py-2 px-4 rounded-md mr-2">Details</button>
        <button class="flex-1 bg-green-500 text-white py-2 px-4 rounded-md buy-product" data-id="${product.id}">Buy ₦${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</button>
      </div>
    </div>
  `;
        }

        // Data for products
        const premiumPlans = [
            { id: 1, name: "Premium Plans 1", duration: "40 days", price: 5000, totalReturn: 25000.0, dailyReturn: 250.0, color: "bg-red-600" },
            { id: 2, name: "Premium Plans 2", duration: "40 days", price: 10000, totalReturn: 50000.0, dailyReturn: 500.0, color: "bg-blue-600" },
            { id: 3, name: "premium Plans 3", duration: "40 days", price: 15000, totalReturn: 75000.0, dailyReturn: 800.83, color: "bg-purple-600" },
            { id: 4, name: "Premium Plans 4", duration: "40 days", price: 20000, totalReturn: 85000.0, dailyReturn: 1200.0, color: "bg-green-600" },
            { id: 5, name: "Premium Plans 5", duration: "40 days", price: 25000, totalReturn: 100000.0, dailyReturn: 1500.0, color: "bg-yellow-600" },
            { id: 6, name: "Premium Plans 6", duration: "40 days", price: 30000, totalReturn: 125000.0, dailyReturn: 2000.0, color: "bg-pink-600" },
            { id: 7, name: "Premium Plans 7", duration: "40 days", price: 40000, totalReturn: 150000.0, dailyReturn: 2500.0, color: "bg-orange-600" },
            { id: 8, name: "Premium Plans 8", duration: "40 days", price: 50000, totalReturn: 170000.0, dailyReturn: 5000.0, color: "bg-teal-600" },
        ];

        const alphaPlans = [
            { id: 9, name: "Alpha Plan 1", duration: "20 days", price: 50000, totalReturn: 100000.0, dailyReturn: 5000.0, color: "bg-orange-600" },
            { id: 10, name: "Alpha Plan 2", duration: "20 days", price: 60000, totalReturn: 120000.0, dailyReturn: 8000.0, color: "bg-teal-600" },
            { id: 11, name: "Alpha Plan 3", duration: "20 days", price: 70000, totalReturn: 140000.0, dailyReturn: 10000.0, color: "bg-yellow-600" },
            { id: 12, name: "Alpha Plan 4", duration: "20 days", price: 80000, totalReturn: 160000.0, dailyReturn: 12000.0, color: "bg-pink-600" },
            { id: 13, name: "Alpha Plan 5", duration: "20 days", price: 100000, totalReturn: 200000.0, dailyReturn: 20000.0, color: "bg-purple-600" },
            { id: 14, name: "Alpha Plan 6", duration: "20 days", price: 120000, totalReturn: 225000.0, dailyReturn: 23000.0, color: "bg-blue-600" },
            { id: 15, name: "Alpha Plan 7", duration: "20 days", price: 150000, totalReturn: 250000.0, dailyReturn: 25000.0, color: "bg-red-600" },
            { id: 16, name: "Alpha Plan 8", duration: "20 days", price: 200000, totalReturn: 300000.0, dailyReturn: 30000.0, color: "bg-indigo-600" },
        ];

        // Initial render for Premium Plans
        premiumPlans.forEach((product) => {
            stableProductsContent.innerHTML += createProductCard(product);
        });

        alphaPlans.forEach((product) => {
            welfareProductsContent.innerHTML += createProductCard(product);
        });

        // Activate the "Premium Plans" tab on initial load
        activateTab(stableProductsTab, document.getElementById("stable-products-content"));

        // Add event listeners to buy buttons
        document.querySelectorAll(".buy-product").forEach((button) => {
            button.addEventListener("click", function () {
                const productId = parseInt(this.dataset.id);
                showToast("Product added to your portfolio!");

                // Add to state
                const allProducts = [...premiumPlans, ...alphaPlans];
                const product = allProducts.find((p) => p.id === productId);

                if (product) {
                    if (productId >= 1 && productId <= 8)
                        state.products.stable.push(product);
                    else if (productId >= 9 && productId <= 16)
                        state.products.welfare.push(product);
                    else state.products.wages.push(product);

                    // Update UI
                    updateUI();

                    // Update balance
                    state.balance -= product.price;
                    document.getElementById("balance-amount").textContent = `₦${state.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
                }
            });
        });
    }

    function setupEventListeners() {
        // Navigation
        depositButton.addEventListener("click", () => showSection(depositSection));
        withdrawButton.addEventListener("click", () => showSection(withdrawSection));
        bankButton.addEventListener("click", () => showSection(bankSection));
        productsButton.addEventListener("click", () => showSection(productsSection));
        myProductsButton.addEventListener("click", () => showSection(myProductsSection));
        inviteButton.addEventListener("click", () => showSection(invitesSection));

        // Back buttons
        document.getElementById("back-to-dashboard-from-deposit").addEventListener("click", () => showSection(dashboardSection));
        document.getElementById("back-to-dashboard-from-withdraw").addEventListener("click", () => showSection(dashboardSection));
        document.getElementById("back-to-dashboard-from-bank").addEventListener("click", () => showSection(dashboardSection));
        document.getElementById("back-to-dashboard-from-products").addEventListener("click", () => showSection(dashboardSection));
        document.getElementById("back-to-dashboard-from-my-products").addEventListener("click", () => showSection(dashboardSection));
        document.getElementById("back-to-dashboard-from-invites").addEventListener("click", () => showSection(dashboardSection));

        // Product tabs
        document.getElementById("stable-products-tab").addEventListener("click", () => activateProductTab("stable"));
        document.getElementById("welfare-products-tab").addEventListener("click", () => activateProductTab("welfare"));
        document.getElementById("wages-products-tab").addEventListener("click", () => activateProductTab("wages"));

        // Deposit functionality
        const depositAmountInput = document.getElementById("deposit-amount");
        document.querySelectorAll(".amount-button").forEach((button) => {
            button.addEventListener("click", function () {
                depositAmountInput.value = this.dataset.amount;
            });
        });

        document.getElementById("copy-account-number").addEventListener("click", function () {
            const accountNumber = document.getElementById("account-number").textContent;
            navigator.clipboard.writeText(accountNumber);
            showToast("Account number copied to clipboard!");
        });

        document.getElementById("proof-of-debit").addEventListener("change", function (e) {
            const fileName = e.target.files[0]?.name || "No file selected";
            document.getElementById("file-name").textContent = fileName;
            document.getElementById("file-name").classList.remove("hidden");
        });

        document.getElementById("submit-deposit").addEventListener("click", function () {
            const amount = parseFloat(depositAmountInput.value);
            if (amount && amount > 0) {
                state.balance += amount;
                updateUI();
                showToast(`Deposit of ₦${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} submitted successfully!`);
                setTimeout(() => showSection(dashboardSection), 1500);
            } else {
                showToast("Please enter a valid deposit amount");
            }
        });

        const exploreProductsButton = document.getElementById("explore-products");
        if (exploreProductsButton) {
            exploreProductsButton.addEventListener("click", function () {
                window.location.href = "products.html";
            });
        }

        // Withdraw functionality
        document.getElementById("submit-withdraw").addEventListener("click", function () {
            const amount = parseFloat(document.getElementById("withdraw-amount").value);
            if (amount && amount > 0) {
                if (amount <= state.balance) {
                    state.balance -= amount;
                    updateUI();
                    showToast(`Withdrawal of ₦${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} processed!`);
                    setTimeout(() => showSection(dashboardSection), 1500);
                } else {
                    showToast("Insufficient funds for this withdrawal");
                }
            } else {
                showToast("Please enter a valid withdrawal amount");
            }
        });

        // Add bank functionality
        document.getElementById("add-bank-button").addEventListener("click", function () {
            const bankName = document.getElementById("select-bank-bank").value;
            const accountNumber = document.getElementById("account-number-bank").value;
            const accountName = document.getElementById("account-name-bank").value;

            if (bankName && accountNumber && accountName) {
                state.banks.push({
                    name: bankName,
                    number: accountNumber,
                    accountName: accountName,
                });

                // Clear form
                document.getElementById("account-number-bank").value = "";
                document.getElementById("account-name-bank").value = "";

                showToast("Bank account added successfully!");
            } else {
                showToast("Please fill all bank details");
            }
        });

        // Explore products from My Products
        document.getElementById("explore-products").addEventListener("click", () => {
            showSection(productsSection);
        });

        // Copy referral link
        document.getElementById("copy-referral-link").addEventListener("click", function () {
            const referralLink = document.getElementById("referral-link").textContent;
            navigator.clipboard.writeText(referralLink);
            showToast("Referral link copied to clipboard!");
        });
    }

    function showSection(sectionToShow) {
        // Hide all sections
        const sections = [
            dashboardSection,
            depositSection,
            withdrawSection,
            bankSection,
            productsSection,
            myProductsSection,
            invitesSection,
        ];

        sections.forEach((section) => section.classList.add("hidden"));

        // Show requested section
        sectionToShow.classList.remove("hidden");
    }

    function activateProductTab(tabName) {
        // Update tab styles
        document.getElementById("stable-products-tab").classList.remove("tab-active");
        document.getElementById("welfare-products-tab").classList.remove("tab-active");
        document.getElementById("wages-products-tab").classList.remove("tab-active");
        document.getElementById("stable-products-tab").classList.add("text-text-secondary");
        document.getElementById("welfare-products-tab").classList.add("text-text-secondary");
        document.getElementById("wages-products-tab").classList.add("text-text-secondary");

        document.getElementById(`${tabName}-products-tab`).classList.add("tab-active");
        document.getElementById(`${tabName}-products-tab`).classList.remove("text-text-secondary");

        // Show content
        document.getElementById("stable-products-content").classList.add("hidden");
        document.getElementById("welfare-products-content").classList.add("hidden");
        document.getElementById("wages-products-content").classList.add("hidden");
        document.getElementById(`${tabName}-products-content`).classList.remove("hidden");
    }

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
});