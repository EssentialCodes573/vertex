document.addEventListener("DOMContentLoaded", function () {
    // Error handling wrapper
    function safeExecute(fn, context = 'Operation') {
        try {
            return fn();
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            showToast(`Error: ${error.message}`, true);
            return null;
        }
    }

    document.getElementById('submit-deposit').addEventListener('click', async function () {
    const accountName = document.getElementById('account-name-deposit').value;
    const bankName = document.getElementById('bank-name-deposit').value;
    // You can add more fields as needed

    try {
        const res = await fetch('/api/deposit-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountName, bankName })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Deposit request submitted successfully!');
        } else {
            showToast(data.message || 'Deposit request failed', true);
        }
    } catch (err) {
        showToast('Network error', true);
    }
});

    function renderTransactions(purchases) {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    list.innerHTML = '';

    if (!purchases || purchases.length === 0) {
        list.innerHTML = '<p class="text-text-secondary">No transactions yet.</p>';
        return;
    }

    purchases.forEach(purchase => {
        const product = purchase.product || {};
        const date = new Date(purchase.purchasedAt).toLocaleDateString();
        const amount = product.price ? product.price * purchase.quantity : 0;
        list.innerHTML += `
            <div class="card p-4 flex justify-between items-center">
                <div>
                    <div class="font-semibold">${product.name || 'Product'}</div>
                    <div class="text-sm text-text-secondary">${date}</div>
                </div>
                <div class="font-bold text-green-500">
                    -₦${amount.toLocaleString()}
                </div>
            </div>
        `;
    });
}


    const transactionsNav = getElement('transactions-nav', false);
const transactionsSection = getElement('transactions-section', false);
if (transactionsNav && transactionsSection) {
    transactionsNav.addEventListener('click', () => {
        // Hide all main sections
        Object.values(sections).forEach(section => {
            if (section) section.classList.add("hidden");
        });
        // Show transactions section
        transactionsSection.classList.remove("hidden");
        // Render transactions
        renderTransactions(state.transactions);
    });
}



    // Safe element getter
    function getElement(id, required = true) {
        const element = document.getElementById(id);
        if (!element && required) {
            console.error(`Element not found: ${id}`);
            if (required) showToast(`Missing element: ${id}`, true);
        }
        return element;
    }

    const toast = getElement("toast");
    const toastMessage = getElement("toast-message");

    // Check user authentication
    if (!window.currentUser) {
        console.error("User not authenticated");
        showToast("Please log in to access dashboard", true);
        setTimeout(() => window.location.href = '/login', 2000);
        return;
    }

    // Initialize state with validation
    const state = safeExecute(() => ({
        balance: parseFloat(window.currentUser.balance) || 0,
        products: {
            stable: Array.isArray(window.currentUser.products?.stable) ? window.currentUser.products.stable : [],
            welfare: Array.isArray(window.currentUser.products?.welfare) ? window.currentUser.products.welfare : [],
            wages: Array.isArray(window.currentUser.products?.wages) ? window.currentUser.products.wages : []
        },
        transactions: Array.isArray(window.currentUser.transactions) ? window.currentUser.transactions : [],
        banks: Array.isArray(window.currentUser.banks) ? window.currentUser.banks : [],
        referralCode: window.currentUser.referralCode || ""
    }), 'State initialization');

    if (!state) return;

    // Get DOM elements
    const sections = {
        dashboard: getElement("dashboard-section"),
        deposit: getElement("deposit-section"),
        withdraw: getElement("withdraw-section"),
        bank: getElement("bank-section"),
        products: getElement("products-section"),
        myProducts: getElement("my-products-section"),
        invites: getElement("invites-section")
    };

    const buttons = {
        deposit: getElement("deposit-button"),
        withdraw: getElement("withdraw-button"),
        bank: getElement("bank-button"),
        products: getElement("products-button"),
        myProducts: getElement("my-products-button"),
        invite: getElement("invite-button")
    };


    // User menu setup
    const userMenuButton = getElement("user-menu-button", false);
    const userMenu = getElement("user-menu", false);
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener("click", (e) => {
            e.stopPropagation();
            userMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", () => userMenu.classList.add("hidden"));
        userMenu.addEventListener("click", (e) => e.stopPropagation());
    }

    // Initialize dashboard
    safeExecute(() => {
        updateUI();
        generateProductCards();
        setupEventListeners();
    }, 'Dashboard initialization');

    function updateUI() {
        safeExecute(() => {
            // Update balance displays
            const balanceElements = ["balance-amount", "withdraw-balance"];
            balanceElements.forEach(id => {
                const element = getElement(id, false);
                if (element) {
                    element.textContent = `₦${state.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
                }
            });

            // Update product counts
            const productCounts = {
                "total-products": state.products.stable.length + state.products.welfare.length + state.products.wages.length,
                "stable-products": state.products.stable.length,
                "welfare-products": state.products.welfare.length,
                "wages-products": state.products.wages.length
            };

            Object.entries(productCounts).forEach(([id, count]) => {
                const element = getElement(id, false);
                if (element) element.textContent = count;
            });

            // Update referral link
            const referralLink = getElement("referral-link", false);
            if (referralLink) {
                referralLink.textContent = `https://wealth-wave-investment.int.ng/ref/${state.referralCode}`;
            }
        }, 'UI update');
    }

    function generateProductCards() {
        safeExecute(() => {
            const productData = {
                premium: [
                    { id: 1, name: "Premium Plans 1", duration: "40 days", price: 5000, totalReturn: 25000, dailyReturn: 250, color: "bg-red-600" },
                    { id: 2, name: "Premium Plans 2", duration: "40 days", price: 10000, totalReturn: 50000, dailyReturn: 500, color: "bg-blue-600" },
                    { id: 3, name: "Premium Plans 3", duration: "40 days", price: 15000, totalReturn: 75000, dailyReturn: 800.83, color: "bg-purple-600" },
                    { id: 4, name: "Premium Plans 4", duration: "40 days", price: 20000, totalReturn: 85000, dailyReturn: 1200, color: "bg-green-600" },
                    { id: 5, name: "Premium Plans 5", duration: "40 days", price: 25000, totalReturn: 100000, dailyReturn: 1500, color: "bg-yellow-600" },
                    { id: 6, name: "Premium Plans 6", duration: "40 days", price: 30000, totalReturn: 125000, dailyReturn: 2000, color: "bg-pink-600" },
                    { id: 7, name: "Premium Plans 7", duration: "40 days", price: 40000, totalReturn: 150000, dailyReturn: 2500, color: "bg-orange-600" },
                    { id: 8, name: "Premium Plans 8", duration: "40 days", price: 50000, totalReturn: 170000, dailyReturn: 5000, color: "bg-teal-600" }
                ],
                alpha: [
                    { id: 9, name: "Alpha Plan 1", duration: "20 days", price: 50000, totalReturn: 100000, dailyReturn: 5000, color: "bg-orange-600" },
                    { id: 10, name: "Alpha Plan 2", duration: "20 days", price: 60000, totalReturn: 120000, dailyReturn: 8000, color: "bg-teal-600" },
                    { id: 11, name: "Alpha Plan 3", duration: "20 days", price: 70000, totalReturn: 140000, dailyReturn: 10000, color: "bg-yellow-600" },
                    { id: 12, name: "Alpha Plan 4", duration: "20 days", price: 80000, totalReturn: 160000, dailyReturn: 12000, color: "bg-pink-600" },
                    { id: 13, name: "Alpha Plan 5", duration: "20 days", price: 100000, totalReturn: 200000, dailyReturn: 20000, color: "bg-purple-600" },
                    { id: 14, name: "Alpha Plan 6", duration: "20 days", price: 120000, totalReturn: 225000, dailyReturn: 23000, color: "bg-blue-600" },
                    { id: 15, name: "Alpha Plan 7", duration: "20 days", price: 150000, totalReturn: 250000, dailyReturn: 25000, color: "bg-red-600" },
                    { id: 16, name: "Alpha Plan 8", duration: "20 days", price: 200000, totalReturn: 300000, dailyReturn: 30000, color: "bg-indigo-600" }
                ]
            };

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
                                <h3 class="text-lg font-semibold text-gray-200">${product.name}</h3>
                                <p class="text-sm text-gray-400">Duration <span class="text-green-400">${product.duration}</span></p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <p class="text-sm text-gray-400">Total Return</p>
                                <p class="text-lg font-bold text-gray-100">₦${product.totalReturn.toLocaleString()}</p>
                                <p class="text-xs text-green-400">${totalReturnPercentage}%</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-400">Daily Return</p>
                                <p class="text-lg font-bold text-gray-100">₦${product.dailyReturn.toLocaleString()}</p>
                                <p class="text-xs text-green-400">${dailyReturnPercentage}%</p>
                            </div>
                        </div>
                        <div class="flex">
                            <button class="flex-1 bg-[#3b3b3b] text-white py-2 px-4 rounded-md mr-2">Details</button>
                            <button class="flex-1 bg-green-500 text-white py-2 px-4 rounded-md buy-product" data-id="${product.id}">Buy ₦${product.price.toLocaleString()}</button>
                        </div>
                    </div>
                `;
            }

            // Render product cards
            const stableContent = getElement("stable-products-content", false);
            const welfareContent = getElement("welfare-products-content", false);

            if (stableContent) {
                const grid = stableContent.querySelector(".grid");
                if (grid) {
                    grid.innerHTML = productData.premium.map(createProductCard).join('');
                }
            }

            if (welfareContent) {
                const grid = welfareContent.querySelector(".grid");
                if (grid) {
                    grid.innerHTML = productData.alpha.map(createProductCard).join('');
                }
            }

            

            // Activate default tab
            const stableTab = getElement("stable-products-tab", false);
            if (stableTab && stableContent) {
                activateTab(stableTab, stableContent);
            }

            // Add buy button event listeners
            document.querySelectorAll(".buy-product").forEach(button => {
                button.addEventListener("click", function () {
                    safeExecute(() => {
                        const productId = parseInt(this.dataset.id);
                        const allProducts = [...productData.premium, ...productData.alpha];
                        const product = allProducts.find(p => p.id === productId);

                        if (!product) {
                            showToast("Product not found", true);
                            return;
                        }

                        if (state.balance < product.price) {
                            showToast("Insufficient balance", true);
                            return;
                        }

                        // Add to appropriate category
                        if (productId <= 8) {
                            state.products.stable.push(product);
                        } else {
                            state.products.welfare.push(product);
                        }

                        state.balance -= product.price;
                        updateUI();
                        showToast("Product purchased successfully!");
                    }, 'Product purchase');
                });
            });
        }, 'Product card generation');
    }

    function setupEventListeners() {
        safeExecute(() => {
            // Navigation buttons
            Object.entries(buttons).forEach(([key, button]) => {
                if (button && sections[key]) {
                    button.addEventListener("click", () => showSection(sections[key]));
                }
            });

            // Back buttons
            const backButtons = [
                "back-to-dashboard-from-deposit",
                "back-to-dashboard-from-withdraw", 
                "back-to-dashboard-from-bank",
                "back-to-dashboard-from-products",
                "back-to-dashboard-from-my-products",
                "back-to-dashboard-from-invites"
            ];

            backButtons.forEach(id => {
                const button = getElement(id, false);
                if (button) {
                    button.addEventListener("click", () => showSection(sections.dashboard));
                }
            });

            // Product tabs
            ["stable", "welfare", "wages"].forEach(tab => {
                const tabButton = getElement(`${tab}-products-tab`, false);
                if (tabButton) {
                    tabButton.addEventListener("click", () => activateProductTab(tab));
                }
            });

            // Deposit functionality
            const depositAmount = getElement("deposit-amount", false);
            const submitDeposit = getElement("submit-deposit", false);

            if (submitDeposit) {
                submitDeposit.addEventListener("click", () => {
                    safeExecute(() => {
                        const amount = parseFloat(depositAmount?.value || 0);
                        if (amount <= 0) {
                            showToast("Enter valid amount", true);
                            return;
                        }
                        state.balance += amount;
                        updateUI();
                        showToast(`Deposit of ₦${amount.toLocaleString()} submitted!`);
                        setTimeout(() => showSection(sections.dashboard), 1500);
                    }, 'Deposit submission');
                });
            }

            // Withdraw functionality
            const submitWithdraw = getElement("submit-withdraw", false);
            if (submitWithdraw) {
                submitWithdraw.addEventListener("click", () => {
                    safeExecute(() => {
                        const amount = parseFloat(getElement("withdraw-amount", false)?.value || 0);
                        if (amount <= 0) {
                            showToast("Enter valid amount", true);
                            return;
                        }
                        if (amount > state.balance) {
                            showToast("Insufficient funds", true);
                            return;
                        }
                        state.balance -= amount;
                        updateUI();
                        showToast(`Withdrawal of ₦${amount.toLocaleString()} processed!`);
                        setTimeout(() => showSection(sections.dashboard), 1500);
                    }, 'Withdrawal submission');
                });
            }

            // Copy functionality
            const copyButtons = [
                { id: "copy-account-number", targetId: "account-number", message: "Account number copied!" },
                { id: "copy-referral-link", targetId: "referral-link", message: "Referral link copied!" }
            ];

            copyButtons.forEach(({ id, targetId, message }) => {
                const button = getElement(id, false);
                const target = getElement(targetId, false);
                if (button && target) {
                    button.addEventListener("click", () => {
                        safeExecute(() => {
                            navigator.clipboard.writeText(target.textContent);
                            showToast(message);
                        }, 'Copy to clipboard');
                    });
                }
            });

            // Quick amount buttons
            document.querySelectorAll(".amount-button").forEach(button => {
                button.addEventListener("click", function () {
                    if (depositAmount) {
                        depositAmount.value = this.dataset.amount;
                    }
                });
            });

            // File upload handling
            const fileInput = getElement("proof-of-debit", false);
            const fileName = getElement("file-name", false);
            if (fileInput && fileName) {
                fileInput.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    fileName.textContent = file ? file.name : "No file selected";
                    fileName.classList.remove("hidden");
                });
            }

        }, 'Event listener setup');
    }

    function showSection(sectionToShow) {
        if (!sectionToShow) return;
        
        Object.values(sections).forEach(section => {
            if (section) section.classList.add("hidden");
        });
        
        sectionToShow.classList.remove("hidden");
    }

    function activateProductTab(tabName) {
        safeExecute(() => {
            ["stable", "welfare", "wages"].forEach(tab => {
                const tabElement = getElement(`${tab}-products-tab`, false);
                const contentElement = getElement(`${tab}-products-content`, false);
                
                if (tabElement) {
                    tabElement.classList.remove("tab-active");
                    tabElement.classList.add("text-text-secondary");
                }
                if (contentElement) {
                    contentElement.classList.add("hidden");
                }
            });

            const activeTab = getElement(`${tabName}-products-tab`, false);
            const activeContent = getElement(`${tabName}-products-content`, false);
            
            if (activeTab) {
                activeTab.classList.add("tab-active");
                activeTab.classList.remove("text-text-secondary");
            }
            if (activeContent) {
                activeContent.classList.remove("hidden");
            }
        }, 'Tab activation');
    }

    function activateTab(tabElement, contentElement) {
        if (tabElement) tabElement.classList.add("active");
        if (contentElement) contentElement.classList.remove("hidden");
    }

    function showToast(message, isError = false) {
        if (!toast || !toastMessage) {
            console.warn('Toast not available, using alert');
            alert(message);
            return;
        }

        toastMessage.textContent = message;
        toast.style.backgroundColor = isError ? '#ef4444' : '#10b981';
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
            toast.style.backgroundColor = '';
        }, 3000);
    }
});