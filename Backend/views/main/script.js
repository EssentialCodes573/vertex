document.addEventListener("DOMContentLoaded", function () {
  if (!window.currentUser) return;

  function safeExecute(fn, context = "Operation") {
    try {
      return fn();
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      showToast(`Error: ${error.message}`, true);
      return null;
    }
  }

  document
    .getElementById("submit-deposit")
    .addEventListener("click", async function () {
      const accountName = document.getElementById("account-name-deposit").value;
      const bankName = document.getElementById("bank-name-deposit").value;
      try {
        const res = await fetch("/api/deposit-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountName, bankName }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast("Deposit request submitted successfully!");
        } else {
          showToast(data.message || "Deposit request failed", true);
        }
      } catch (err) {
        showToast("Network error", true);
      }
    });

  function renderTransactions(purchases) {
    const list = document.getElementById("transactions-list");
    if (!list) return;
    list.innerHTML = "";

    if (!purchases || purchases.length === 0) {
      list.innerHTML =
        '<p class="text-text-secondary">No transactions yet.</p>';
      return;
    }

    purchases.forEach((purchase) => {
      const product = purchase.product || {};
      const date = new Date(purchase.purchasedAt).toLocaleDateString();
      const amount = product.price ? product.price * purchase.quantity : 0;
      list.innerHTML += `
            <div class="card p-4 flex justify-between items-center">
                <div>
                    <div class="font-semibold">${
                      product.name || "Product"
                    }</div>
                    <div class="text-sm text-text-secondary">${date}</div>
                </div>
                <div class="font-bold text-green-500">
                    -₦${amount.toLocaleString()}
                </div>
            </div>
        `;
    });
  }

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

  if (!window.currentUser) {
    console.error("User not authenticated");
    showToast("Please log in to access dashboard", true);
    setTimeout(() => (window.location.href = "/login"), 2000);
    return;
  }

  const state = safeExecute(
    () => ({
      balance: parseFloat(window.currentUser.balance) || 0,
      products: {
        stable: Array.isArray(window.currentUser.products?.stable)
          ? window.currentUser.products.stable
          : [],
        welfare: Array.isArray(window.currentUser.products?.welfare)
          ? window.currentUser.products.welfare
          : [],
        wages: Array.isArray(window.currentUser.products?.wages)
          ? window.currentUser.products.wages
          : [],
      },
      transactions: Array.isArray(window.currentUser.transactions)
        ? window.currentUser.transactions
        : [],
      banks: Array.isArray(window.currentUser.banks)
        ? window.currentUser.banks
        : [],
      referralCode: window.currentUser.referralCode || "",
    }),
    "State initialization"
  );

  if (!state) return;

  // Add bank account
  const addBankBtn = document.getElementById("add-bank-button");
  if (addBankBtn) {
    addBankBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      const bankName = document.getElementById("select-bank-bank").value;
      const accountNumber = document.getElementById(
        "account-number-bank"
      ).value;
      const accountName = document.getElementById("account-name-bank").value;
      if (!bankName || !accountNumber || !accountName) {
        showToast("Please fill all fields", true);
        return;
      }
      try {
        const res = await fetch("/api/bank/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bankName, accountNumber, accountName }),
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          showToast("Bank account added!");
          location.reload();
        } else {
          showToast(data.message || "Failed to add bank account", true);
        }
      } catch (err) {
        showToast("Network error", true);
      }
    });
  }

  document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("remove-bank-btn")) {
      const accountNumber = e.target.dataset.accountNumber;
      if (!confirm("Remove this bank account?")) return;
      try {
        const res = await fetch("/api/bank/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast("Bank account removed!");
          location.reload();
        } else {
          showToast(data.message || "Failed to remove bank account", true);
        }
      } catch (err) {
        showToast("Network error", true);
      }
    }
  });

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "/logout";
    });
  }

  const bell = document.getElementById("notification-bell");
  const dropdown = document.getElementById("notification-dropdown");
  bell.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });
  document.addEventListener("click", () => dropdown.classList.add("hidden"));
  dropdown.addEventListener("click", (e) => e.stopPropagation());

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const data = await res.json();
      const list = document.getElementById("notification-list");
      const count = document.getElementById("notification-count");
      if (data.notifications && data.notifications.length > 0) {
        list.innerHTML = data.notifications
          .map(
            (n) =>
              `<div class="px-4 py-2 border-b text-sm">
            <span class="font-semibold">${
              n.type === "payment" ? "Payment" : "New User"
            }:</span>
            ${n.message}
            <span class="block text-xs text-gray-400">${new Date(
              n.date
            ).toLocaleString()}</span>
          </div>`
          )
          .join("");
        count.textContent = data.notifications.length;
        count.classList.remove("hidden");
      } else {
        list.innerHTML =
          '<div class="px-4 py-2 text-text-secondary text-sm">No notifications yet.</div>';
        count.classList.add("hidden");
      }
    } catch (err) {
      document.getElementById("notification-list").innerHTML =
        '<div class="px-4 py-2 text-red-500 text-sm">Could not load notifications.</div>';
    }
  }

  bell.addEventListener("click", fetchNotifications);

  const sections = {
    dashboard: getElement("dashboard-section"),
    deposit: getElement("deposit-section"),
    withdraw: getElement("withdraw-section"),
    bank: getElement("bank-section"),
    products: getElement("products-section"),
    myProducts: getElement("my-products-section"),
    invites: getElement("invites-section"),
  };

  const buttons = {
    deposit: getElement("deposit-button"),
    withdraw: getElement("withdraw-button"),
    bank: getElement("bank-button"),
    products: getElement("products-button"),
    myProducts: getElement("my-products-button"),
    invite: getElement("invite-button"),
  };

  document
    .getElementById("show-products-list")
    .addEventListener("click", function () {
      Object.values(sections).forEach((section) => {
        if (section) section.classList.add("hidden");
      });
      const productsSection = document.getElementById("products-section");
      if (productsSection) productsSection.classList.remove("hidden");
      activateProductTab("stable");
    });

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

  safeExecute(() => {
    updateUI();
    generateProductCards();
    setupEventListeners();
  }, "Dashboard initialization");

  function updateUI() {
    safeExecute(() => {
      const balanceElements = ["balance-amount", "withdraw-balance"];
      balanceElements.forEach((id) => {
        const element = getElement(id, false);
        if (element) {
          element.textContent = `₦${state.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`;
        }
      });

      const productCounts = {
        "total-products":
          state.products.stable.length +
          state.products.welfare.length +
          state.products.wages.length,
        "stable-products": state.products.stable.length,
        "welfare-products": state.products.welfare.length,
        "wages-products": state.products.wages.length,
      };

      Object.entries(productCounts).forEach(([id, count]) => {
        const element = getElement(id, false);
        if (element) element.textContent = count;
      });

      const referralLink = getElement("referral-link", false);
      if (referralLink) {
        referralLink.textContent = `https://wealth-wave-investment.int.ng/ref/${state.referralCode}`;
      }
    }, "UI update");
  }

  function createProductCard(product) {
    const price = typeof product.price === "number" ? product.price : 0;
    const totalReturn =
      typeof product.totalReturn === "number" ? product.totalReturn : 0;
    const dailyReturn =
      typeof product.dailyReturn === "number" ? product.dailyReturn : 0;
    const totalReturnPercentage = price
      ? ((totalReturn / price) * 100).toFixed(2)
      : "0.00";
    const dailyReturnPercentage = price
      ? ((dailyReturn / price) * 100).toFixed(2)
      : "0.00";

    return `
      <div class="bg-[#1e1e1e] rounded-lg p-4 shadow-md text-white">
        <div class="flex items-center mb-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mr-4 bg-accent">
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-200">${
              product.name || "No Name"
            }</h3>
            <p class="text-sm text-gray-400">Duration <span class="text-green-400">${
              product.duration || ""
            }</span></p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p class="text-sm text-gray-400">Total Return</p>
            <p class="text-lg font-bold text-gray-100">₦${totalReturn.toLocaleString()}</p>
            <p class="text-xs text-green-400">${totalReturnPercentage}%</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Daily Return</p>
            <p class="text-lg font-bold text-gray-100">₦${dailyReturn.toLocaleString()}</p>
            <p class="text-xs text-green-400">${dailyReturnPercentage}%</p>
          </div>
        </div>
        <div class="flex">
          <button class="details-btn flex-1 bg-[#3b3b3b] text-white py-2 px-4 rounded-md mr-2" data-product-id="${
            product._id
          }">Details</button>
          <button class="flex-1 bg-green-500 text-white py-2 px-4 rounded-md buy-product" data-id="${
            product._id
          }">
            Buy ₦${price.toLocaleString()}
          </button>
        </div>
      </div>
    `;
  }

  function generateProductCards() {
    // Filter products by category
    const premiumProducts = window.products.filter(
      (p) => p.category === "premium" || p.category === "stable"
    );
    const alphaProducts = window.products.filter(
      (p) => p.category === "alpha" || p.category === "welfare"
    );
    const wagesProducts = window.products.filter((p) => p.category === "wages");

    const stableContent = document.getElementById("stable-products-content");
    const welfareContent = document.getElementById("welfare-products-content");
    const wagesContent = document.getElementById("wages-products-content");

    if (stableContent) {
      const grid = stableContent.querySelector(".grid");
      if (grid)
        grid.innerHTML = premiumProducts.map(createProductCard).join("");
    }
    if (welfareContent) {
      const grid = welfareContent.querySelector(".grid");
      if (grid) grid.innerHTML = alphaProducts.map(createProductCard).join("");
    }
    if (wagesContent) {
      const grid = wagesContent.querySelector(".grid");
      if (grid) grid.innerHTML = wagesProducts.map(createProductCard).join("");
    }

    // Add buy button event listeners
    document.querySelectorAll(".buy-product").forEach((button) => {
      button.addEventListener("click", async function () {
        safeExecute(async () => {
          const productId = this.dataset.id;
          const product = window.products.find((p) => p._id === productId);
          if (!product) {
            showToast("Product not found", true);
            return;
          }
          const res = await fetch("/api/purchases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId: product._id, quantity: 1 }),
          });
          const data = await res.json();
          if (res.ok) {
            state.balance = data.balance;
            state.transactions.push(data.purchase);
            updateUI();
            showToast("Product purchased successfully!");
          } else {
            showToast(data.message || "Purchase failed", true);
          }
        }, "Product purchase");
      });
    });
  }

  function setupEventListeners() {
    safeExecute(() => {
      Object.entries(buttons).forEach(([key, button]) => {
        if (button && sections[key]) {
          button.addEventListener("click", () => showSection(sections[key]));
        }
      });

      const backButtons = [
        "back-to-dashboard-from-deposit",
        "back-to-dashboard-from-withdraw",
        "back-to-dashboard-from-bank",
        "back-to-dashboard-from-products",
        "back-to-dashboard-from-my-products",
        "back-to-dashboard-from-invites",
      ];

      backButtons.forEach((id) => {
        const button = getElement(id, false);
        if (button) {
          button.addEventListener("click", () =>
            showSection(sections.dashboard)
          );
        }
      });

      ["stable", "welfare", "wages"].forEach((tab) => {
        const tabButton = getElement(`${tab}-products-tab`, false);
        if (tabButton) {
          tabButton.addEventListener("click", () => activateProductTab(tab));
        }
      });

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
          }, "Deposit submission");
        });
      }

      const submitWithdraw = getElement("submit-withdraw", false);
      if (submitWithdraw) {
        submitWithdraw.addEventListener("click", () => {
          safeExecute(() => {
            const amount = parseFloat(
              getElement("withdraw-amount", false)?.value || 0
            );
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
          }, "Withdrawal submission");
        });
      }

      const copyButtons = [
        {
          id: "copy-account-number",
          targetId: "account-number",
          message: "Account number copied!",
        },
        {
          id: "copy-referral-link",
          targetId: "referral-link",
          message: "Referral link copied!",
        },
      ];

      copyButtons.forEach(({ id, targetId, message }) => {
        const button = getElement(id, false);
        const target = getElement(targetId, false);
        if (button && target) {
          button.addEventListener("click", () => {
            safeExecute(() => {
              navigator.clipboard.writeText(target.textContent);
              showToast(message);
            }, "Copy to clipboard");
          });
        }
      });

      document.querySelectorAll(".amount-button").forEach((button) => {
        button.addEventListener("click", function () {
          if (depositAmount) {
            depositAmount.value = this.dataset.amount;
          }
        });
      });

      const fileInput = getElement("proof-of-debit", false);
      const fileName = getElement("file-name", false);
      if (fileInput && fileName) {
        fileInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          fileName.textContent = file ? file.name : "No file selected";
          fileName.classList.remove("hidden");
        });
      }
    }, "Event listener setup");
  }

  function showSection(sectionToShow) {
    if (!sectionToShow) return;
    Object.values(sections).forEach((section) => {
      if (section) section.classList.add("hidden");
    });
    sectionToShow.classList.remove("hidden");
  }

  function activateProductTab(tabName) {
    safeExecute(() => {
      ["stable", "welfare", "wages"].forEach((tab) => {
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
    }, "Tab activation");
  }

  function activateTab(tabElement, contentElement) {
    if (tabElement) tabElement.classList.add("active");
    if (contentElement) contentElement.classList.remove("hidden");
  }

  function showToast(message, isError = false) {
    if (!toast || !toastMessage) {
      console.warn("Toast not available, using alert");
      alert(message);
      return;
    }

    toastMessage.textContent = message;
    toast.style.backgroundColor = isError ? "#ef4444" : "#10b981";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      toast.style.backgroundColor = "";
    }, 3000);
  }
});
