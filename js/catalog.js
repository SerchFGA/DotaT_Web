/* ============================================
   DotaT B2B — Catalog Engine
   ============================================ */

let catalogData = null;
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('data/catalogo.json');
        catalogData = await res.json();
        allProducts = flattenProducts(catalogData);
        buildFilterUI();
        renderProducts(allProducts);
        handleHashNav();
    } catch (err) {
        console.error('Error loading catalog:', err);
        document.getElementById('product-grid').innerHTML = '<p>Error al cargar el catálogo.</p>';
    }
});

// Flatten all products with category/brand metadata
function flattenProducts(data) {
    const products = [];
    data.marcas.forEach(marca => {
        marca.categorias.forEach(cat => {
            cat.productos.forEach(prod => {
                products.push({
                    ...prod,
                    marca: marca.nombre,
                    marcaId: marca.id,
                    categoria: cat.nombre,
                    categoriaId: cat.id
                });
            });
        });
    });
    return products;
}

// Build filter checkboxes dynamically
function buildFilterUI() {
    // Categories
    const catContainer = document.getElementById('filter-categorias');
    if (catContainer) {
        const categories = [...new Set(allProducts.map(p => p.categoria))];
        catContainer.innerHTML = categories.map(cat =>
            `<label><input type="checkbox" name="categoria" value="${cat}"> ${cat}</label>`
        ).join('');
    }

    // Systems
    const sysContainer = document.getElementById('filter-sistemas');
    if (sysContainer) {
        const systems = [...new Set(allProducts.filter(p => p.sistema).map(p => p.sistema))].sort();
        sysContainer.innerHTML = systems.map(sys =>
            `<label><input type="checkbox" name="sistema" value="${sys}"> ${sys}</label>`
        ).join('');
    }

    // Attach event listeners
    document.querySelectorAll('#filters input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
        cb.addEventListener('change', updateFilterBadge);
    });
}

// Apply filters
function applyFilters() {
    const selectedCalidad = getChecked('calidad');
    const selectedCategoria = getChecked('categoria');
    const selectedSistema = getChecked('sistema');

    let filtered = allProducts;

    if (selectedCalidad.length > 0) {
        filtered = filtered.filter(p => p.calidad && selectedCalidad.includes(p.calidad));
    }
    if (selectedCategoria.length > 0) {
        filtered = filtered.filter(p => selectedCategoria.includes(p.categoria));
    }
    if (selectedSistema.length > 0) {
        filtered = filtered.filter(p => p.sistema && selectedSistema.includes(p.sistema));
    }

    renderProducts(filtered);
    updateFilterBadge();
}

function getChecked(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

function clearFilters() {
    document.querySelectorAll('#filters input[type="checkbox"]').forEach(cb => {
        if (cb.value !== 'tork') cb.checked = false;
    });
    renderProducts(allProducts);
    updateFilterBadge();
}

// Render product cards
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    const count = document.getElementById('results-count');
    if (count) count.textContent = `${products.length} producto${products.length !== 1 ? 's' : ''}`;

    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;"><p style="font-size:1.125rem;color:var(--color-text-muted);">No se encontraron productos con los filtros seleccionados.</p><button class="btn btn--outline mt-4" onclick="clearFilters()">Limpiar filtros</button></div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const qualityClass = p.calidad ? `product-card__quality--${p.calidad.toLowerCase()}` : '';
        const specs = [];
        if (p.tamano) specs.push(p.tamano);
        if (p.capas) specs.push(`${p.capas} capa${p.capas > 1 ? 's' : ''}`);
        if (p.sistema) specs.push(`Sistema ${p.sistema}`);

        const imgSrc = p.imagen
            ? p.imagen
            : `https://placehold.co/200x160/F8FAFC/2D2B3F?text=${encodeURIComponent(p.codigo)}`;

        return `
      <div class="card product-card" data-animate>
        <div class="product-card__img-wrap" style="cursor:pointer;" onclick="openDrawer('${p.codigo}')">
          <img class="product-card__img" src="${imgSrc}" alt="${p.nombre}" loading="lazy" onerror="this.src='https://placehold.co/200x160/F8FAFC/2D2B3F?text=${encodeURIComponent(p.codigo)}'">
        </div>
        <div class="product-card__body">
          <span class="product-card__brand">Tork</span>
          ${p.calidad ? `<span class="product-card__quality ${qualityClass}">${p.calidad}</span>` : ''}
          <h4 class="product-card__name" style="cursor:pointer;" onclick="openDrawer('${p.codigo}')">${p.nombre}</h4>
          <p class="product-card__code">Cód. ${p.codigo}${p.presentacion ? ' · ' + p.presentacion : ''}${p.tipo_embalaje ? ' · <strong>' + p.tipo_embalaje + (p.cantidad_embalaje > 1 ? ' × ' + p.cantidad_embalaje : '') + '</strong>' : ''}</p>
          ${specs.length > 0 ? `<p style="font-size:0.8rem;color:var(--color-text-muted);margin:0.25rem 0 0;">${specs.join(' · ')}</p>` : ''}

        </div>
        <div class="product-card__footer">
          <a href="contacto.html?producto=${p.codigo}" class="btn btn--primary" style="flex:1;">Cotizar</a>
        </div>
      </div>
    `;
    }).join('');

    // Re-initialize animations
    document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.remove('animate-in');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('animate-in'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.1 });
        observer.observe(el);
    });
}

// Handle hash navigation (e.g., catalogo.html#jabones)
function handleHashNav() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const catCheckbox = document.querySelector(`input[name="categoria"][value="${getCatNameFromId(hash)}"]`);
        if (catCheckbox) {
            catCheckbox.checked = true;
            applyFilters();
        }
    }
}

function getCatNameFromId(id) {
    if (!catalogData) return '';
    for (const marca of catalogData.marcas) {
        for (const cat of marca.categorias) {
            if (cat.id === id) return cat.nombre;
        }
    }
    return '';
}

/* ============================================
   Product Detail Drawer
   ============================================ */

function openDrawer(codigo) {
    const product = allProducts.find(p => String(p.codigo) === String(codigo));
    if (!product) return;

    // Product image
    const drawerImg = document.getElementById('drawer-img');
    const drawerFallback = document.getElementById('drawer-img-fallback');
    if (product.imagen) {
        drawerImg.src = product.imagen;
        drawerImg.alt = product.nombre;
        drawerImg.style.display = 'block';
        drawerFallback.style.display = 'none';
    } else {
        drawerImg.style.display = 'none';
        drawerFallback.style.display = 'flex';
        drawerFallback.textContent = product.codigo;
    }

    // Badges
    const badgesEl = document.getElementById('drawer-badges');
    let badgesHTML = '<span class="product-card__brand">Tork</span>';
    if (product.calidad) {
        badgesHTML += `<span class="product-card__quality product-card__quality--${product.calidad.toLowerCase()}">${product.calidad}</span>`;
    }
    badgesEl.innerHTML = badgesHTML;

    // Name & Code
    document.getElementById('drawer-name').textContent = product.nombre;
    const embalajeStr = product.tipo_embalaje
        ? ` · ${product.tipo_embalaje}${product.cantidad_embalaje > 1 ? ' × ' + product.cantidad_embalaje : ''}`
        : '';
    document.getElementById('drawer-code').innerHTML = `Código: ${product.codigo}${product.presentacion ? ' · ' + product.presentacion : ''}<strong>${embalajeStr}</strong>`;

    // Description (shown only if available)
    const descSection = document.getElementById('drawer-description');
    const descText = document.getElementById('drawer-desc-text');
    if (product.descripcion) {
        descText.textContent = product.descripcion;
        descSection.style.display = 'block';
    } else {
        descSection.style.display = 'none';
    }

    // Specs table
    const specsEl = document.getElementById('drawer-specs');
    const specRows = [];
    if (product.calidad) specRows.push(['Calidad', product.calidad]);
    if (product.tamano) specRows.push(['Tamaño', product.tamano]);
    if (product.capas) specRows.push(['Capas', `${product.capas} capa${product.capas > 1 ? 's' : ''}`]);
    if (product.color) specRows.push(['Color', product.color]);
    if (product.presentacion) specRows.push(['Presentación', product.presentacion]);
    if (product.tipo_embalaje) specRows.push(['Embalaje', `📦 ${product.tipo_embalaje}${product.cantidad_embalaje > 1 ? ' × ' + product.cantidad_embalaje : ''}`]);
    if (product.sistema) specRows.push(['Sistema', product.sistema]);
    if (product.categoria) specRows.push(['Categoría', product.categoria]);
    if (product.fsc) specRows.push(['Certificación', '<span class="fsc-badge">🌿 FSC Certificado</span>']);

    specsEl.innerHTML = specRows.map(([label, val]) =>
        `<tr><th>${label}</th><td>${val}</td></tr>`
    ).join('');

    // Cotizar button
    document.getElementById('drawer-cotizar').href = `contacto.html?producto=${product.codigo}`;

    // Open
    document.getElementById('drawer-overlay').classList.add('active');
    document.getElementById('product-drawer').classList.add('active');
    document.getElementById('product-drawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    document.getElementById('drawer-overlay').classList.remove('active');
    document.getElementById('product-drawer').classList.remove('active');
    document.getElementById('product-drawer').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Event listeners for drawer close
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            closeMobileFilters();
        }
    });
});

/* ============================================
   Mobile Filter Bottom Sheet
   ============================================ */

function openMobileFilters() {
    const sidebar = document.getElementById('filters');
    const overlay = document.getElementById('filter-overlay');
    const fab = document.getElementById('filter-fab');
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    fab.classList.add('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMobileFilters() {
    const sidebar = document.getElementById('filters');
    const overlay = document.getElementById('filter-overlay');
    const fab = document.getElementById('filter-fab');
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    fab.classList.remove('hidden');
    document.body.style.overflow = '';
}

function updateFilterBadge() {
    const count = document.querySelectorAll('#filters input[type="checkbox"]:checked:not([value="tork"])').length;
    const badge = document.getElementById('filter-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // FAB opens filters
    document.getElementById('filter-fab')?.addEventListener('click', openMobileFilters);

    // Close button inside bottom sheet
    document.getElementById('filter-close')?.addEventListener('click', closeMobileFilters);

    // Overlay click closes filters
    document.getElementById('filter-overlay')?.addEventListener('click', closeMobileFilters);

    // "Ver resultados" button closes sheet
    document.getElementById('filter-apply')?.addEventListener('click', closeMobileFilters);

    // Update badge when filters change
    document.querySelectorAll('#filters input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateFilterBadge);
    });
});
