/* ============================================
   DotaT B2B — Form & Quote Table Engine
   Supabase + FormSubmit Integration
   ============================================ */

let productOptions = [];
let supabaseClient = null;
let ciudadesPorDepartamento = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

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
                        tipo_embalaje: p.tipo_embalaje || '',
                        cantidad_embalaje: p.cantidad_embalaje || '',
                        label: `${p.codigo} — ${p.nombre}`
                    });
                });
            });
        });
    } catch (e) {
        console.error('Error loading products:', e);
    }

    // Load cities per department
    try {
        const resCiudades = await fetch('data/ciudades.json');
        ciudadesPorDepartamento = await resCiudades.json();
    } catch (e) {
        console.error('Error loading cities:', e);
    }

    // Dependent dropdown: Departamento → Ciudad
    const deptoSelect = document.querySelector('select[name="departamento"]');
    const ciudadSelect = document.querySelector('select[name="ciudad"]');
    if (deptoSelect && ciudadSelect) {
        deptoSelect.addEventListener('change', () => {
            const depto = deptoSelect.value;
            ciudadSelect.innerHTML = '<option value="">Seleccionar ciudad...</option>';

            if (depto && ciudadesPorDepartamento[depto]) {
                ciudadesPorDepartamento[depto].forEach(ciudad => {
                    const opt = document.createElement('option');
                    opt.textContent = ciudad;
                    opt.value = ciudad;
                    ciudadSelect.appendChild(opt);
                });
                // Add "Otra" option at the end
                const otraOpt = document.createElement('option');
                otraOpt.textContent = 'Otra';
                otraOpt.value = 'Otra';
                ciudadSelect.appendChild(otraOpt);
                ciudadSelect.disabled = false;
            } else {
                ciudadSelect.disabled = true;
            }
        });
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
      <span class="embalaje-hint" id="hint-${rowCount}"></span>
    </td>
    <td>
      <input type="number" class="form-input" name="cantidad_${rowCount}" min="1" value="1" required style="width:100%;">
    </td>
    <td style="text-align:center;">
      <button type="button" class="btn-remove" onclick="removeRow('row-${rowCount}')" title="Eliminar">✕</button>
    </td>
  `;

    tbody.appendChild(tr);

    // Show embalaje hint on product selection
    const select = tr.querySelector('select');
    const hint = tr.querySelector(`#hint-${rowCount}`);

    const updateHint = () => {
        const prod = productOptions.find(p => p.codigo === select.value);
        if (prod && prod.tipo_embalaje) {
            const qty = prod.cantidad_embalaje > 1 ? ` × ${prod.cantidad_embalaje}` : '';
            hint.innerHTML = `📦 Se vende por <strong>${prod.tipo_embalaje}${qty}</strong>`;
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }
    };
    select.addEventListener('change', updateHint);
    // Show hint immediately if pre-selected
    if (preselectedCode) updateHint();
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

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
        if (input.type === 'checkbox') {
            // Checkboxes handled separately below
            return;
        }
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

    // Privacy consent validation
    const privacyCheckbox = document.getElementById('privacy-consent-checkbox');
    const privacyWrapper = document.getElementById('privacy-consent-wrapper');
    const privacyError = document.getElementById('privacy-error-msg');
    if (privacyCheckbox && !privacyCheckbox.checked) {
        privacyWrapper.classList.add('has-error');
        privacyError.style.display = 'block';
        privacyWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (privacyWrapper) privacyWrapper.classList.remove('has-error');
    if (privacyError) privacyError.style.display = 'none';

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
                cantidad: qty.value,
                tipo_embalaje: prod ? prod.tipo_embalaje : '',
                cantidad_embalaje: prod ? prod.cantidad_embalaje : ''
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
        ciudad: form.ciudad.value + ' — ' + form.direccion.value,
        volumen: form.volumen.value,
        productos: products,
        categorias: [...form.querySelectorAll('input[name="categorias"]:checked')].map(cb => cb.value),
        notas: form.notas.value
    };

    // UI: disable button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Enviando...';
    submitBtn.disabled = true;

    try {
        let solicitudId = null;
        let fechaSolicitud = null;

        // --- STEP 1: Save to Supabase and get the solicitation number ---
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .rpc('insertar_cotizacion', {
                    p_nombre: formData.nombre,
                    p_empresa: formData.empresa,
                    p_nit: formData.nit,
                    p_correo: formData.correo,
                    p_telefono: formData.telefono,
                    p_departamento: formData.departamento,
                    p_ciudad: formData.ciudad,
                    p_volumen: formData.volumen,
                    p_productos: formData.productos,
                    p_categorias: formData.categorias,
                    p_notas: formData.notas
                });

            if (error) throw new Error('Supabase: ' + error.message);

            solicitudId = 'DOT-' + String(data.numero_solicitud).padStart(5, '0');
            fechaSolicitud = new Date(data.created_at).toLocaleDateString('es-CO', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            console.log('✅ Cotización guardada en Supabase:', solicitudId);
        }

        // --- STEP 2: Send professional email via Edge Function (Resend) ---
        const edgeFunctionUrl = SUPABASE_URL + '/functions/v1/enviar-cotizacion';
        const emailRes = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                ...formData,
                solicitudId: solicitudId,
                fechaSolicitud: fechaSolicitud
            })
        });

        const emailData = await emailRes.json();
        if (!emailData.success) {
            throw new Error('Email: ' + (emailData.error || 'Error desconocido'));
        }
        console.log('✅ Email profesional enviado a ventas@dotat.com.co');

        // Show success with solicitation ID
        form.style.display = 'none';
        const successMsg = document.getElementById('success-message');
        if (solicitudId && successMsg) {
            successMsg.innerHTML = 'Tu solicitud <strong>' + solicitudId + '</strong> ha sido registrada el ' + fechaSolicitud + '. Nuestro equipo comercial te contactará en menos de 24 horas con una propuesta personalizada.';
        }
        document.getElementById('form-success').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error al enviar cotización:', error);
        alert('Hubo un problema enviando tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp.');
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}

/* ============================================
   Privacy Modal Controls
   ============================================ */

function openPrivacyModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
    // Close on backdrop click
    modal.addEventListener('click', handleBackdropClick);
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscapeKey);
    modal.removeEventListener('click', handleBackdropClick);
}

function acceptPrivacyAndClose() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    if (checkbox) {
        checkbox.checked = true;
        // Clear the error state once accepted
        const wrapper = document.getElementById('privacy-consent-wrapper');
        const errorMsg = document.getElementById('privacy-error-msg');
        if (wrapper) wrapper.classList.remove('has-error');
        if (errorMsg) errorMsg.style.display = 'none';
    }
    closePrivacyModal();
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') closePrivacyModal();
}

function handleBackdropClick(e) {
    // Close only if clicking the dark overlay itself, not the dialog
    if (e.target === document.getElementById('privacy-modal')) {
        closePrivacyModal();
    }
}
