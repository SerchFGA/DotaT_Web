/* ============================================
   DotaT B2B — Form & Quote Table Engine
   ============================================ */

let productOptions = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Load product list for the selector
    try {
        const res = await fetch('data/catalogo.json');
        const data = await res.json();
        productOptions = [];
        data.marcas.forEach(marca => {
            marca.categorias.forEach(cat => {
                cat.productos.forEach(p => {
                    productOptions.push({
                        codigo: p.codigo,
                        nombre: p.nombre,
                        categoria: cat.nombre,
                        label: `${p.codigo} — ${p.nombre}`
                    });
                });
            });
        });
    } catch (e) {
        console.error('Error loading products:', e);
    }

    // Check URL params for pre-selected product
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get('producto');
    if (preselect) {
        addProductRow(preselect);
    } else {
        addProductRow(); // Add one empty row by default
    }

    // Form submission
    const form = document.getElementById('quote-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

let rowCount = 0;

function addProductRow(preselectedCode) {
    rowCount++;
    const tbody = document.getElementById('product-rows');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `row-${rowCount}`;

    const options = productOptions.map(p =>
        `<option value="${p.codigo}" ${p.codigo === preselectedCode ? 'selected' : ''}>${p.label}</option>`
    ).join('');

    tr.innerHTML = `
    <td>
      <select class="form-select" name="producto_${rowCount}" required>
        <option value="">Seleccionar producto...</option>
        ${options}
      </select>
    </td>
    <td>
      <input type="number" class="form-input" name="cantidad_${rowCount}" min="1" value="1" required style="width:100%;">
    </td>
    <td style="text-align:center;">
      <button type="button" class="btn-remove" onclick="removeRow('row-${rowCount}')" title="Eliminar">✕</button>
    </td>
  `;

    tbody.appendChild(tr);
}

function removeRow(id) {
    const row = document.getElementById(id);
    if (row) {
        row.remove();
        // Ensure at least one row
        const tbody = document.getElementById('product-rows');
        if (tbody && tbody.children.length === 0) {
            addProductRow();
        }
    }
}

function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            valid = false;
        } else {
            input.style.borderColor = '';
        }
    });

    if (!valid) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    // Collect product rows
    const products = [];
    const rows = document.getElementById('product-rows').children;
    for (let row of rows) {
        const select = row.querySelector('select');
        const qty = row.querySelector('input[type="number"]');
        if (select && select.value && qty && qty.value) {
            const prod = productOptions.find(p => p.codigo === select.value);
            products.push({
                codigo: select.value,
                nombre: prod ? prod.nombre : select.value,
                cantidad: qty.value
            });
        }
    }

    // Collect form data
    const formData = {
        nombre: form.nombre.value,
        empresa: form.empresa.value,
        nit: form.nit.value,
        correo: form.correo.value,
        telefono: form.telefono.value,
        departamento: form.departamento.value,
        ciudad: form.ciudad.value,
        volumen: form.volumen.value,
        productos: products,
        categorias: [...form.querySelectorAll('input[name="categorias"]:checked')].map(cb => cb.value),
        notas: form.notas.value
    };

    console.log('📋 Cotización enviada:', formData);

    // Show success
    form.style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
