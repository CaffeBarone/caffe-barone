document.addEventListener("DOMContentLoaded", () => {
  // 0. GESTIONE TEMA SCURO / CHIARO
  initTheme();

  // 1. GESTIONE MODAL BENVENUTO, MENU LATERALE E ORARI
  initNavigation();

  // INIZIALIZZA BADGE APERTO/CHIUSO
  updateBusinessStatus();

  // 2. IDENTIFICAZIONE PAGINA CORRENTE
  const mainCatalog = document.getElementById("main-catalog");
  const bottlesCatalog = document.getElementById("bottles-catalog");
  const detailContainer = document.getElementById("detail-card-container");

  if (mainCatalog) {
    loadMainCatalog();
  } else if (bottlesCatalog) {
    loadBottlesCatalog();
  } else if (detailContainer) {
    loadDetailProduct();
  }

  // 3. INIZIALIZZA MAPPE NATIVE
  initMapsNavigation();

  // 4. INIZIALIZZA PULSANTE FLUTTUANTE WHATSAPP
  initSocialIntegration();

  // 5. INIZIALIZZA POPUP RECENSIONE GOOGLE (20 SECONDI)
  initReviewPopup();
});

/* ==========================================
   0. GESTIONE TEMA SCURO (DARK MODE)
   ========================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add("dark-theme");
    if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-theme");
    if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const isDark = document.body.classList.contains("dark-theme");

      themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
}

/* ==========================================
   1. POPUP BENVENUTO, MENU LATERALE & ORARI
   ========================================== */
function initNavigation() {
  const welcomeModal = document.getElementById("welcome-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");

  if (welcomeModal && closeModalBtn) {
    if (!sessionStorage.getItem("welcomeSeen")) {
      welcomeModal.classList.add("active");
    }

    closeModalBtn.addEventListener("click", () => {
      welcomeModal.classList.remove("active");
      sessionStorage.setItem("welcomeSeen", "true");
    });
  }

  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const sideDrawer = document.getElementById("side-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");

  function openDrawer() {
    if (sideDrawer) sideDrawer.classList.add("active");
    if (menuToggleBtn) menuToggleBtn.classList.add("open");
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove("active");
    if (menuToggleBtn) menuToggleBtn.classList.remove("open");
  }

  if (menuToggleBtn && sideDrawer && closeDrawerBtn) {
    menuToggleBtn.addEventListener("click", () => {
      if (sideDrawer.classList.contains("active")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    closeDrawerBtn.addEventListener("click", closeDrawer);

    sideDrawer.addEventListener("click", (e) => {
      if (e.target === sideDrawer) {
        closeDrawer();
      }
    });
  }

  const openHoursBtn = document.getElementById("open-hours-btn");
  const hoursModal = document.getElementById("hours-modal");
  const closeHoursBtn = document.getElementById("close-hours-btn");

  if (openHoursBtn && hoursModal && closeHoursBtn) {
    openHoursBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeDrawer();
      hoursModal.classList.add("active");
    });

    closeHoursBtn.addEventListener("click", () => {
      hoursModal.classList.remove("active");
    });

    hoursModal.addEventListener("click", (e) => {
      if (e.target === hoursModal) {
        hoursModal.classList.remove("active");
      }
    });
  }
}

/* ==========================================
   STATO APERTO / CHIUSO
   ========================================== */
function updateBusinessStatus() {
  const badge = document.getElementById("status-badge");
  const statusText = document.getElementById("status-text");
  if (!badge || !statusText) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Dom, 1 = Lun, 2 = Mar, ...
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const openTime = 7 * 60; // 07:00
  const closeTime = 23 * 60 + 30; // 23:30

  let isOpen = false;

  // Martedì (2) -> Chiuso tutto il giorno
  if (day !== 2) {
    if (currentTime >= openTime && currentTime < closeTime) {
      isOpen = true;
    }
  }

  if (isOpen) {
    badge.className = "status-badge open";
    statusText.textContent = "Aperto ora";
  } else {
    badge.className = "status-badge closed";
    statusText.textContent = "Chiuso ora";
  }
}

/* ==========================================
   2. CARICAMENTO CATALOGO PRINCIPALE (index.html)
   ========================================== */
async function loadMainCatalog() {
  const container = document.getElementById("main-catalog");

  const categories = [
    { title: "🍦 Gelateria", file: "data/gelateria.json" },
    { title: "🍦 Yogurteria", file: "data/yogurteria.json" },
    { title: "☕ Caffetteria", file: "data/caffetteria.json" },
    { title: "🥐 Pasticceria", file: "data/pasticceria.json" },
    { title: "🥪 Salato", file: "data/salato.json" },
    { title: "🍧 Granite", file: "data/granite.json" },
    { title: "🥤 Bibite & Bevande", file: "data/bibite.json" },
    { title: "🥃 Shot", file: "data/shot.json" },
    { title: "🍹 Drink Alcolici", file: "data/drink-alcolici.json" },
    { title: "🥤 Drink Analcolici", file: "data/drink-analcolici.json" }
  ];

  for (const cat of categories) {
    try {
      const response = await fetch(cat.file);
      if (!response.ok) continue;
      const products = await response.json();

      if (products && products.length > 0) {
        renderCategorySection(container, cat.title, products);
      }
    } catch (error) {
      console.error(`Errore nel caricamento di ${cat.file}:`, error);
    }
  }

  initSearchAndFilters();
}

/* ==========================================
   3. CARICAMENTO BOTTIGLIE (alcolici.html)
   ========================================== */
async function loadBottlesCatalog() {
  const container = document.getElementById("bottles-catalog");

  try {
    const response = await fetch("data/bottiglie.json");
    if (!response.ok) return;
    const bottleCategories = await response.json();

    bottleCategories.forEach(cat => {
      renderCategorySection(container, `🍾 ${cat.tipologia}`, cat.prodotti);
    });

    initSearchAndFilters();
  } catch (error) {
    console.error("Errore nel caricamento delle bottiglie:", error);
  }
}

/* ==========================================
   4. RENDER SEZIONE CATEGORIA E GRIGLIA
   ========================================== */
function renderCategorySection(container, title, products) {
  const section = document.createElement("section");
  section.className = "category-section";

  const titleEl = document.createElement("h2");
  titleEl.className = "category-title";
  titleEl.textContent = title;
  section.appendChild(titleEl);

  const grid = document.createElement("div");
  grid.className = "product-grid";

  products.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.name = prod.nome.toLowerCase();

    // Gestione tag alimentari
    if (prod.glutenFree) card.dataset.glutenFree = "true";
    if (prod.lactoseFree) card.dataset.lactoseFree = "true";
    if (prod.vegan) card.dataset.vegan = "true";

    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${prod.immagine}" alt="${prod.nome}" onerror="this.src='https://via.placeholder.com/300x200?text=Caffè+Barone'">
      </div>
      <div class="product-info-basic">
        <div class="product-name">${prod.nome}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      toggleExpansion(grid, card, prod);
    });

    grid.appendChild(card);
  });

  section.appendChild(grid);
  container.appendChild(section);
}

/* ==========================================
   5. ESPANSIONE SCHEDA (RIGA INTERA SCALATA)
   ========================================== */
function toggleExpansion(grid, selectedCard, product) {
  const existingPanel = grid.querySelector(".expansion-panel");
  const isAlreadyOpen = selectedCard.classList.contains("expanded");

  grid.querySelectorAll(".product-card").forEach(c => c.classList.remove("expanded"));
  if (existingPanel) {
    existingPanel.remove();
  }

  if (!isAlreadyOpen) {
    selectedCard.classList.add("expanded");

    const panel = document.createElement("div");
    panel.className = "expansion-panel";

    sessionStorage.setItem(`prod_${product.id}`, JSON.stringify(product));

    // Generazione dinamica dei badge alimentari
    let badgesHTML = "";
    if (product.glutenFree) {
      badgesHTML += `<span class="badge badge-gluten-free">🌾 Senza Glutine</span> `;
    }
    if (product.lactoseFree) {
      badgesHTML += `<span class="badge badge-lactose-free">🥛 Senza Lattosio</span> `;
    }
    if (product.vegan) {
      badgesHTML += `<span class="badge badge-vegan">🌱 Vegano</span> `;
    }

    panel.innerHTML = `
      <div class="expansion-header">
        <strong>${product.nome}</strong>
        <span class="expansion-price">${product.prezzo}</span>
      </div>
      
      ${badgesHTML ? `<div class="product-badges-wrapper">${badgesHTML}</div>` : ''}

      <p class="expansion-desc">${product.miniDescrizione}</p>
      <a href="dettaglio.html?id=${product.id}" class="btn-more">Mostra di più</a>
    `;

    const cards = Array.from(grid.querySelectorAll(".product-card"));
    const selectedIndex = cards.indexOf(selectedCard);
    
    let insertAfterIndex = selectedIndex;
    if (selectedIndex % 2 === 0 && selectedIndex + 1 < cards.length) {
      insertAfterIndex = selectedIndex + 1;
    }

    cards[insertAfterIndex].after(panel);
  }
}

/* ==========================================
   6. PAGINA DI DETTAGLIO (dettaglio.html)
   ========================================== */
function loadDetailProduct() {
  const container = document.getElementById("detail-card-container");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    container.innerHTML = "<p class='loading-text'>Prodotto non trovato.</p>";
    return;
  }

  const productData = sessionStorage.getItem(`prod_${productId}`);

  if (productData) {
    const product = JSON.parse(productData);

    container.innerHTML = `
      <img src="${product.immagine}" alt="${product.nome}" class="detail-img" onerror="this.src='https://via.placeholder.com/600x400?text=Caffè+Barone'">
      <div class="detail-body">
        <h1 class="detail-title">${product.nome}</h1>
        <div class="detail-price">${product.prezzo}</div>
        <p class="detail-description">${product.descrizioneCompleta}</p>
      </div>
    `;
  } else {
    container.innerHTML = "<p class='loading-text'>Scheda non disponibile. Torna al menù per selezionare un prodotto.</p>";
  }
}

/* ==========================================
   7. FILTRO DI RICERCA E REGOLE ALIMENTARI
   ========================================== */
function initSearchAndFilters() {
  const searchInput = document.getElementById("search-input");
  const dietButtons = document.querySelectorAll(".diet-btn");

  let activeFilter = null;

  function filterProducts() {
    const term = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const sections = document.querySelectorAll(".category-section");

    sections.forEach(section => {
      const cards = section.querySelectorAll(".product-card");
      let visibleCount = 0;

      cards.forEach(card => {
        const name = card.dataset.name || "";
        const matchesSearch = name.includes(term);
        
        let matchesDiet = true;
        if (activeFilter === "gluten-free") {
          matchesDiet = card.dataset.glutenFree === "true";
        } else if (activeFilter === "lactose-free") {
          matchesDiet = card.dataset.lactoseFree === "true";
        } else if (activeFilter === "vegan") {
          matchesDiet = card.dataset.vegan === "true";
        }

        if (matchesSearch && matchesDiet) {
          card.style.display = "flex";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (visibleCount === 0 && (term !== "" || activeFilter !== null)) {
        section.style.display = "none";
      } else {
        section.style.display = "block";
      }
    });

    const panel = document.querySelector(".expansion-panel");
    if (panel) panel.remove();
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  dietButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        activeFilter = null;
      } else {
        dietButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = filter;
      }

      filterProducts();
    });
  });
}

/* ==========================================
   8. GESTIONE APERTURA MAPPE NATIVE
   ========================================== */
function initMapsNavigation() {
  const openMapsBtn = document.getElementById("open-maps-btn");
  if (!openMapsBtn) return;

  const address = "Via Vittorio Emanuele II, 2, 50134 Firenze FI";
  const encodedAddress = encodeURIComponent(address);
  const isApple = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

  openMapsBtn.addEventListener("click", () => {
    if (isApple) {
      window.location.href = `maps://maps.apple.com/?daddr=${encodedAddress}`;
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank");
    }
  });
}

/* ==========================================
   9. INTEGRAZIONE WHATSAPP FLUTTUANTE
   ========================================== */
function initSocialIntegration() {
  if (document.getElementById("whatsapp-float-btn")) return;

  const whatsappNumber = "393913221200"; 
  const defaultText = encodeURIComponent("Ciao! Vorrei chiedere un'informazione a Caffè Barone.");

  const floatBtn = document.createElement("a");
  floatBtn.id = "whatsapp-float-btn";
  floatBtn.className = "whatsapp-float";
  floatBtn.href = `https://wa.me/${whatsappNumber}?text=${defaultText}`;
  floatBtn.target = "_blank";
  floatBtn.rel = "noopener noreferrer";
  floatBtn.setAttribute("aria-label", "Contattaci su WhatsApp");

  floatBtn.innerHTML = `
    <svg viewBox="0 0 32 32" class="whatsapp-icon">
      <path fill="#ffffff" d="M16 2a13.9 13.9 0 0 0-12 20.9L2 30l7.3-1.9A13.9 13.9 0 1 0 16 2zm0 25.4a11.5 11.5 0 0 1-5.9-1.6l-.4-.2-4.4 1.1 1.2-4.3-.3-.4A11.5 11.5 0 1 1 16 27.4zm6.3-8.6c-.3-.2-2-.1-2.3 0s-.6.4-.8.7-.5.6-.8.6-.6-.1-1.2-.4a10.8 10.8 0 0 1-3.1-2.7c-.5-.7-.8-1.4-.8-1.6s.1-.5.3-.7c.2-.2.3-.4.5-.6.2-.2.2-.4.3-.6 0-.2 0-.5-.1-.7-.2-.2-.8-2-.9-2.3-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5c.2.3 2.4 3.7 5.8 5.2.8.4 1.4.6 1.9.8.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.6-.3z"/>
    </svg>
  `;

  document.body.appendChild(floatBtn);
}

/* ==========================================
   10. GESTIONE POPUP RECENSIONE GOOGLE (20 SECONDI)
   ========================================== */
function initReviewPopup() {
  const reviewModal = document.getElementById("review-modal");
  const reviewYesBtn = document.getElementById("review-yes-btn");
  const reviewLaterBtn = document.getElementById("review-later-btn");

  if (!reviewModal) return;

  const lastPrompt = localStorage.getItem("caffe_barone_review_prompt");
  const now = new Date().getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 ore

  if (!lastPrompt || (now - parseInt(lastPrompt, 10)) > ONE_DAY) {
    setTimeout(() => {
      reviewModal.classList.add("active");
      reviewModal.setAttribute("aria-hidden", "false");
    }, 20000); // 20 secondi
  }

  const closeReviewModal = () => {
    reviewModal.classList.remove("active");
    reviewModal.setAttribute("aria-hidden", "true");
    localStorage.setItem("caffe_barone_review_prompt", new Date().getTime().toString());
  };

  if (reviewYesBtn) {
    reviewYesBtn.addEventListener("click", closeReviewModal);
  }

  if (reviewLaterBtn) {
    reviewLaterBtn.addEventListener("click", closeReviewModal);
  }

  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) {
      closeReviewModal();
    }
  });
}
