const API_URL = "https://script.google.com/macros/s/AKfycbw9Cr8u-9SVzJ9NpU-0mUPmZv9VLocVyU1VYlnkgnu9JBnF9eGW9FOFP2amNYdLoEs/exec";

let allItems = [];
let filteredItems = [];

async function loadData() {
    const container = document.getElementById('catalog');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        allItems = await response.json();
        
        // Filtriraj samo one koji mogu u prodaju
        allItems = allItems.filter(item => {
            const canSell = item['Može u prodaju ?'] || item['Može u prodaju'] || '';
            return canSell.toLowerCase() === 'da';
        });
        
        document.getElementById('brojUredjaja').textContent = allItems.length;
        
        populateFilters();
        filteredItems = allItems;
        renderCatalog(filteredItems);
    } catch (error) {
        console.error('Greška:', error);
        container.innerHTML = `
            <div class="no-results">
                ❌ Greška pri učitavanju podataka.<br />
                <small style="color:#999;">Proveri API URL i da li je tabela javno dostupna.</small>
            </div>
        `;
    }
}

function populateFilters() {
    const brands = [...new Set(allItems.map(i => i['Brend'] || i['brend']).filter(Boolean))];
    const outletTypes = [...new Set(allItems.map(i => i['Outlet kategorija'] || i['outletKategorija']).filter(Boolean))];

    const brandSel = document.getElementById('brandFilter');
    brands.sort().forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        brandSel.appendChild(opt);
    });

    const outSel = document.getElementById('outletFilter');
    outletTypes.sort().forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = 'Outlet ' + o;
        outSel.appendChild(opt);
    });
}

function applyFilters() {
    const search = document.getElementById('search').value.toLowerCase().trim();
    const brand = document.getElementById('brandFilter').value;
    const outlet = document.getElementById('outletFilter').value;

    filteredItems = allItems.filter(item => {
        const brandVal = item['Brend'] || item['brend'] || '';
        const modelVal = item['Naziv artikla'] || item['nazivArtikla'] || '';
        const descVal = item['Opis nedostatka'] || item['opisNedostatka'] || '';
        const outletVal = item['Outlet kategorija'] || item['outletKategorija'] || '';

        const matchSearch = !search ||
            brandVal.toLowerCase().includes(search) ||
            modelVal.toLowerCase().includes(search) ||
            descVal.toLowerCase().includes(search);

        const matchBrand = !brand || brandVal === brand;
        const matchOutlet = !outlet || outletVal === outlet;

        return matchSearch && matchBrand && matchOutlet;
    });

    renderCatalog(filteredItems);
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('brandFilter').addEventListener('change', applyFilters);
document.getElementById('outletFilter').addEventListener('change', applyFilters);
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('search').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('outletFilter').value = '';
    applyFilters();
});

function renderCatalog(items) {
    const container = document.getElementById('catalog');

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="no-results">😕 Nema uređaja koji odgovaraju filterima.</div>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const brand = item['Brend'] || item['brend'] || 'Nepoznat brend';
        const model = item['Naziv artikla'] || item['nazivArtikla'] || '';
        const description = item['Robna grupa'] || item['robnaGrupa'] || '';
        const damage = item['Opis nedostatka'] || item['opisNedostatka'] || '';
        const price = parseFloat(item['Nabavna cena'] || item['nabavnaCena'] || 0);
        const location = item['Trenutna lokacija'] || item['trenutnaLokacija'] || '';
        const outlet = item['Outlet kategorija'] || item['outletKategorija'] || '';
        const id = item['Broj zapisnika'] || item['brojZapisnika'] || '';

        const imageHtml = '📦';

        const outletBadge = outlet 
            ? `<span class="badge badge-${outlet}">Outlet ${outlet}</span>` 
            : '';

        let damageText = damage || '';
        if (damageText.length > 120) {
            damageText = damageText.substring(0, 120) + '...';
        }

        return `
            <div class="card">
                <div class="card-image">${imageHtml}</div>
                <div class="card-body">
                    <div class="brand">${brand}</div>
                    <div class="model">${model}</div>
                    ${description ? `<div class="description">${description}</div>` : ''}
                    ${damageText ? `<div class="damage">🔨 ${damageText}</div>` : ''}
                    <div class="price">${price.toLocaleString('sr-RS')} <small>RSD</small></div>
                    <div class="meta">
                        ${outletBadge}
                        ${location ? `<span>📍 ${location}</span>` : ''}
                        ${id ? `<span>🆔 ${id}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

loadData();