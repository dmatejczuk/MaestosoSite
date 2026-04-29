document.addEventListener("DOMContentLoaded", async () => {
    const filtersContainer = document.querySelector("#catalog-filters");
    const productsGrid = document.querySelector("#products-grid");
    const paginationContainer = document.querySelector("#catalog-pagination");
    const resultsCount = document.querySelector("#results-count");
    const favoritesCount = document.querySelector("#favorites-count");
    const favoritesGrid = document.querySelector("#favorites-grid");
    const favoritesPagination = document.querySelector("#favorites-pagination");

    const modal = document.querySelector("#product-modal");
    const modalBody = document.querySelector("#product-modal-body");
    const modalClose = document.querySelector("#product-modal-close");

    const itemsPerPage = 9;
    const favoritesItemsPerPage = 3;

    let instruments = [];
    let currentPage = 1;
    let favoritesPage = 1;
    let favorites = JSON.parse(localStorage.getItem("maestosoFavorites")) ?? [];

    const getInstruments = async () => {
        const response = await fetch("./assets/data/products.json");

        if (!response.ok) {
            throw new Error(`Nie udało się wczytać katalogu. Status: ${response.status}`);
        }

        return response.json();
    };

    const saveFavorites = () => {
        localStorage.setItem("maestosoFavorites", JSON.stringify(favorites));
    };

    const formatPrice = (price) => `${price.toLocaleString("pl-PL")} zł`;

    const getUniqueValues = (key) => {
        return [...new Set(instruments.map((instrument) => instrument[key]))].sort();
    };

    const getTypeLabel = (type) => {
        const labels = {
            all: "Wszystkie",
            fortepian: "Fortepiany",
            pianino: "Pianina"
        };

        return labels[type] ?? type;
    };

    const getDimensionLabel = (type) => {
        if (type === "fortepian") return "Długość";
        if (type === "pianino") return "Wysokość";

        return "Wymiar znaczący";
    };

    const getSelectedType = () => {
        return document.querySelector("input[name='instrument-type']:checked")?.value ?? "all";
    };

    const getSelectedBrands = () => {
        return [...document.querySelectorAll("input[name='brand']:checked")]
            .map((checkbox) => checkbox.value);
    };

    const getFilters = () => {
        return {
            searchValue: document.querySelector("#search-input").value.toLowerCase().trim(),
            selectedType: getSelectedType(),
            selectedBrands: getSelectedBrands(),
            selectedColor: document.querySelector("#color-select").value,
            selectedSize: Number(document.querySelector("#size-range").value),
            selectedSort: document.querySelector("#sort-select").value
        };
    };

    const getSizeRangeData = (type = "all") => {
        const filteredByType = type === "all"
            ? instruments
            : instruments.filter((instrument) => instrument.type === type);

        const sizes = filteredByType.map((instrument) => instrument.size);

        return {
            min: Math.min(...sizes),
            max: Math.max(...sizes)
        };
    };

    const renderFilters = () => {
        const types = ["all", ...getUniqueValues("type")];
        const brands = getUniqueValues("brand");
        const colors = getUniqueValues("color");
        const { min, max } = getSizeRangeData();

        filtersContainer.innerHTML = `
            <div class="filter-group">
                <label for="search-input">Wyszukaj instrument</label>
                <input type="search" id="search-input" placeholder="Np. Yamaha, Kawai...">
            </div>

            <div class="filter-group">
                <h3>Typ instrumentu</h3>
                ${types.map((type) => `
                    <label>
                        <input type="radio" name="instrument-type" value="${type}" ${type === "all" ? "checked" : ""}>
                        ${getTypeLabel(type)}
                    </label>
                `).join("")}
            </div>

            <div class="filter-group">
                <h3>Marka</h3>
                ${brands.map((brand) => `
                    <label>
                        <input type="checkbox" name="brand" value="${brand}">
                        ${brand}
                    </label>
                `).join("")}
            </div>

            <div class="filter-group">
                <label for="color-select">Kolor</label>
                <select id="color-select">
                    <option value="all">Wszystkie kolory</option>
                    ${colors.map((color) => `
                        <option value="${color}">${color}</option>
                    `).join("")}
                </select>
            </div>

            <div class="filter-group">
                <label for="sort-select">Sortowanie</label>
                <select id="sort-select">
                    <option value="default">Domyślne</option>
                    <option value="price-asc">Cena rosnąco</option>
                    <option value="price-desc">Cena malejąco</option>
                    <option value="size-asc">Wymiar znaczący rosnąco</option>
                    <option value="size-desc">Wymiar znaczący malejąco</option>
                    <option value="name-asc">Nazwa A-Z</option>
                    <option value="name-desc">Nazwa Z-A</option>
                </select>
            </div>

            <div class="filter-group">
                <label for="size-range" id="size-label">Maksymalny wymiar znaczący: ${max} cm</label>
                <input type="range" id="size-range" min="${min}" max="${max}" value="${max}">
            </div>

            <button type="button" class="button button-cta catalog-reset" id="reset-filters">
                Wyczyść filtry
            </button>
        `;
    };

    const updateSizeFilter = () => {
        const type = getSelectedType();
        const sizeRange = document.querySelector("#size-range");
        const sizeLabel = document.querySelector("#size-label");
        const { min, max } = getSizeRangeData(type);

        const previousType = sizeRange.dataset.previousType;

        sizeRange.min = min;
        sizeRange.max = max;

        if (previousType !== type) {
            sizeRange.value = max;
            sizeRange.dataset.previousType = type;
        }

        if (Number(sizeRange.value) < min || Number(sizeRange.value) > max) {
            sizeRange.value = max;
        }

        const label = type === "all"
            ? "Maksymalny wymiar znaczący"
            : `Maksymalna ${getDimensionLabel(type).toLowerCase()}`;

        sizeLabel.textContent = `${label}: ${sizeRange.value} cm`;
    };

    const isFavorite = (id) => favorites.includes(id);

    const updateFavoritesCount = () => {
        favoritesCount.textContent = favorites.length;
    };

    const createProductCard = ({ id, name, type, brand, color, size, price, image }) => {
        const favoriteClass = isFavorite(id) ? "is-favorite" : "";
        const dimensionLabel = getDimensionLabel(type);

        return `
            <article class="product-card">
                <figure>
                    <img src="${image}" width="600" height="400" loading="lazy" decoding="async" alt="${name}" onerror="this.onerror=null;this.src='./assets/images/blank.webp';">
                </figure>

                <div class="product-card__body">
                    <p class="product-card__type">${type}</p>
                    <h3>${name}</h3>

                    <ul>
                        <li><strong>Marka:</strong> ${brand}</li>
                        <li><strong>Kolor:</strong> ${color}</li>
                        <li><strong>${dimensionLabel}:</strong> ${size} cm</li>
                    </ul>

                    <p class="product-card__price">${formatPrice(price)}</p>

                    <div class="product-card__actions">
                        <button type="button" class="button button-cta" data-details-id="${id}">
                            Szczegóły
                        </button>

                        <button type="button" class="favorite-btn ${favoriteClass}" data-favorite-id="${id}" aria-label="Dodaj do ulubionych"></button>
                    </div>
                </div>
            </article>
        `;
    };

    const sortProducts = (products, sortType) => {
        const sortedProducts = [...products];

        const sortMethods = {
            "price-asc": () => sortedProducts.sort((a, b) => a.price - b.price),
            "price-desc": () => sortedProducts.sort((a, b) => b.price - a.price),
            "size-asc": () => sortedProducts.sort((a, b) => a.size - b.size),
            "size-desc": () => sortedProducts.sort((a, b) => b.size - a.size),
            "name-asc": () => sortedProducts.sort((a, b) => a.name.localeCompare(b.name, "pl")),
            "name-desc": () => sortedProducts.sort((a, b) => b.name.localeCompare(a.name, "pl")),
            default: () => sortedProducts
        };

        return (sortMethods[sortType] ?? sortMethods.default)();
    };

    const getFilteredProducts = () => {
        const {
            searchValue,
            selectedType,
            selectedBrands,
            selectedColor,
            selectedSize,
            selectedSort
        } = getFilters();

        const filteredProducts = instruments.filter(({ name, type, brand, color, size }) => {
            const matchesSearch =
                name.toLowerCase().includes(searchValue) ||
                brand.toLowerCase().includes(searchValue) ||
                type.toLowerCase().includes(searchValue) ||
                color.toLowerCase().includes(searchValue);

            const matchesType = selectedType === "all" || type === selectedType;
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
            const matchesColor = selectedColor === "all" || color === selectedColor;
            const matchesSize = size <= selectedSize;

            return matchesSearch && matchesType && matchesBrand && matchesColor && matchesSize;
        });

        return sortProducts(filteredProducts, selectedSort);
    };

    const getPaginatedProducts = (products, page = currentPage, perPage = itemsPerPage) => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;

        return products.slice(startIndex, endIndex);
    };

    const createPaginationHTML = (totalItems, activePage, type, perPage = itemsPerPage) => {
        const totalPages = Math.ceil(totalItems / perPage);

        if (totalPages <= 1) {
            return "";
        }

        return `
            <button type="button" class="pagination-btn" data-pagination="${type}" data-page="${activePage - 1}" ${activePage === 1 ? "disabled" : ""}>
                Poprzednia
            </button>

            ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return `
                    <button type="button" class="pagination-btn ${page === activePage ? "active" : ""}" data-pagination="${type}" data-page="${page}">
                        ${page}
                    </button>
                `;
        }).join("")}

            <button type="button" class="pagination-btn" data-pagination="${type}" data-page="${activePage + 1}" ${activePage === totalPages ? "disabled" : ""}>
                Następna
            </button>
        `;
    };

    const renderPagination = (totalItems) => {
        paginationContainer.innerHTML = createPaginationHTML(totalItems, currentPage, "catalog");
    };

    const renderFavoritesPagination = (totalItems) => {
        if (!favoritesPagination) return;

        favoritesPagination.innerHTML = createPaginationHTML(
            totalItems,
            favoritesPage,
            "favorites",
            favoritesItemsPerPage
        );
    };

    const renderFavorites = () => {
        if (!favoritesGrid) return;

        const favoriteProducts = instruments.filter((instrument) =>
            favorites.includes(instrument.id)
        );

        const totalPages = Math.ceil(favoriteProducts.length / favoritesItemsPerPage);

        if (favoritesPage > totalPages) {
            favoritesPage = totalPages || 1;
        }

        const paginatedFavorites = getPaginatedProducts(favoriteProducts, favoritesPage, favoritesItemsPerPage);
        
        favoritesGrid.innerHTML = paginatedFavorites.length
            ? paginatedFavorites.map(createProductCard).join("")
            : `<p class="empty-state">Nie masz jeszcze żadnych ulubionych instrumentów.</p>`;

        renderFavoritesPagination(favoriteProducts.length);
    };

    const renderProducts = () => {
        updateSizeFilter();

        const filteredProducts = getFilteredProducts();
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }

        const paginatedProducts = getPaginatedProducts(filteredProducts);

        productsGrid.innerHTML = paginatedProducts.length
            ? paginatedProducts.map(createProductCard).join("")
            : `<p class="empty-state">Brak instrumentów spełniających wybrane kryteria.</p>`;

        resultsCount.textContent = `Liczba wyników: ${filteredProducts.length}`;
        updateFavoritesCount();
        renderPagination(filteredProducts.length);
        renderFavorites();
    };

    const resetPageAndRender = () => {
        currentPage = 1;
        renderProducts();
    };

    const toggleFavorite = (id) => {
        favorites = isFavorite(id)
            ? favorites.filter((favoriteId) => favoriteId !== id)
            : [...favorites, id];

        favoritesPage = 1;

        saveFavorites();
        updateFavoritesCount();
        renderProducts();
        renderFavorites();
    };

    const openModal = (id) => {
        const product = instruments.find((instrument) => instrument.id === id);

        if (!product) return;

        const dimensionLabel = getDimensionLabel(product.type);

        modalBody.innerHTML = `
            <div class="product-modal__grid">
                <img src="${product.image}" width="900" height="600" alt="${product.name}" onerror="this.onerror=null;this.src='./assets/images/blank.webp';">

                <div>
                    <p class="product-card__type">${product.type}</p>
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>

                    <ul>
                        <li><strong>Marka:</strong> ${product.brand}</li>
                        <li><strong>Kolor:</strong> ${product.color}</li>
                        <li><strong>${dimensionLabel}:</strong> ${product.size} cm</li>
                        <li><strong>Cena:</strong> ${formatPrice(product.price)}</li>
                    </ul>
                </div>
            </div>
        `;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    const resetFilters = () => {
        currentPage = 1;
        renderFilters();
        bindFilterEvents();
        renderProducts();
    };

    const handleCatalogClick = ({ target }) => {
        const detailsBtn = target.closest("[data-details-id]");
        const favoriteBtn = target.closest("[data-favorite-id]");

        if (detailsBtn) {
            openModal(Number(detailsBtn.dataset.detailsId));
        }

        if (favoriteBtn) {
            toggleFavorite(Number(favoriteBtn.dataset.favoriteId));
        }
    };

    const handlePaginationClick = ({ target }) => {
        const paginationBtn = target.closest("[data-page]");

        if (!paginationBtn) return;

        const paginationType = paginationBtn.dataset.pagination;
        const page = Number(paginationBtn.dataset.page);

        if (paginationType === "favorites") {
            favoritesPage = page;
            renderFavorites();

            document.querySelector("#ulubione").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;
        }

        currentPage = page;
        renderProducts();

        document.querySelector("#instrumenty").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const bindFilterEvents = () => {
        const filterElements = filtersContainer.querySelectorAll("input, select");

        filterElements.forEach((element) => {
            element.addEventListener("input", resetPageAndRender);
            element.addEventListener("change", resetPageAndRender);
        });

        filtersContainer
            .querySelector("#reset-filters")
            .addEventListener("click", resetFilters);
    };

    const initCatalog = async () => {
        try {
            productsGrid.innerHTML = `<p class="empty-state">Ładowanie katalogu...</p>`;

            instruments = await getInstruments();

            renderFilters();
            bindFilterEvents();
            renderProducts();
        } catch (error) {
            console.error(error);
            productsGrid.innerHTML = `<p class="empty-state">Nie udało się załadować katalogu.</p>`;
            filtersContainer.innerHTML = "";
            paginationContainer.innerHTML = "";
            favoritesPagination.innerHTML = "";
            resultsCount.textContent = "Liczba wyników: 0";
            updateFavoritesCount();
        }
    };

    productsGrid.addEventListener("click", handleCatalogClick);
    paginationContainer.addEventListener("click", handlePaginationClick);
    favoritesPagination?.addEventListener("click", handlePaginationClick);
    modalClose.addEventListener("click", closeModal);
    favoritesGrid?.addEventListener("click", handleCatalogClick);

    modal.addEventListener("click", ({ target }) => {
        if (target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", ({ key }) => {
        if (key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    await initCatalog();
});