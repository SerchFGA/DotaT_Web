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
}

function getChecked(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

function clearFilters() {
    document.querySelectorAll('#filters input[type="checkbox"]').forEach(cb => {
        if (cb.value !== 'tork') cb.checked = false;
    });
    renderProducts(allProducts);
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

        return `
      <div class="card product-card" data-animate>
        <div class="product-card__img-wrap">
          <img class="product-card__img" src="https://placehold.co/200x160/F8FAFC/2D2B3F?text=${encodeURIComponent(p.codigo)}" alt="${p.nombre}">
        </div>
        <div class="product-card__body">
          <span class="product-card__brand">Tork</span>
          ${p.calidad ? `<span class="product-card__quality ${qualityClass}">${p.calidad}</span>` : ''}
          <h4 class="product-card__name">${p.nombre}</h4>
          <p class="product-card__code">Cód. ${p.codigo} · ${p.presentacion || ''}</p>
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
