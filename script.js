const API_URL = "https://script.google.com/macros/s/AKfycbw9Cr8u-9SVzJ9NpU-0mUPmZv9VLocVyU1VYlnkgnu9JBnF9eGW9FOFP2amNYdLoEs/exec";

let allItems = [];
let filteredItems = [];

// ============================
// UČITAVANJE PODATAKA
// ============================
async function loadData() {
    const container = document.getElementById('catalog');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        allItems = await response.json();

        // Filtriraj: samo oni koji mogu u prodaju i lokacija DC73
        allItems = allItems.filter(item => {
            const canSell = item['Može u prodaju ?'] || item['Može u prodaju'] || '';
            const location = item['Trenutna lokacija'] || item['trenutnaLokacija'] || '';
            return canSell.toLowerCase() === 'da' && location === 'DC73';
        });

        document.getElementById('brojUredjaja').textContent = allItems.length;

        populateFilters();
        applyFiltersAndSort();
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

// ============================
// FILTERI
// ============================
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

function applyFiltersAndSort() {
    const search = document.getElementById('search').value.toLowerCase().trim();
    const brand = document.getElementById('brandFilter').value;
    const outlet = document.getElementById('outletFilter').value;
    const sort = document.getElementById('sortFilter').value;

    // Prvo filtriraj
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

    // Zatim sortiraj
    sortItems(sort);
    renderCatalog(filteredItems);
}

// ============================
// SORTIRANJE
// ============================
function sortItems(sortType) {
    switch (sortType) {
        case 'price-asc':
            filteredItems.sort((a, b) => {
                const priceA = parseFloat(a['Nabavna cena'] || a['nabavnaCena'] || 0);
                const priceB = parseFloat(b['Nabavna cena'] || b['nabavnaCena'] || 0);
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            filteredItems.sort((a, b) => {
                const priceA = parseFloat(a['Nabavna cena'] || a['nabavnaCena'] || 0);
                const priceB = parseFloat(b['Nabavna cena'] || b['nabavnaCena'] || 0);
                return priceB - priceA;
            });
            break;
        case 'name-asc':
            filteredItems.sort((a, b) => {
                const nameA = (a['Naziv artikla'] || a['nazivArtikla'] || '').toLowerCase();
                const nameB = (b['Naziv artikla'] || b['nazivArtikla'] || '').toLowerCase();
                return nameA.localeCompare(nameB, 'sr');
            });
            break;
        case 'date-desc':
            filteredItems.sort((a, b) => {
                const dateA = a['Datum obrade'] || a['datumObrade'] || '';
                const dateB = b['Datum obrade'] || b['datumObrade'] || '';
                return dateB.localeCompare(dateA);
            });
            break;
        default:
            break;
    }
}

// ============================
// EVENTI
// ============================
document.getElementById('search').addEventListener('input', applyFiltersAndSort);
document.getElementById('brandFilter').addEventListener('change', applyFiltersAndSort);
document.getElementById('outletFilter').addEventListener('change', applyFiltersAndSort);
document.getElementById('sortFilter').addEventListener('change', applyFiltersAndSort);

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('search').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('outletFilter').value = '';
    document.getElementById('sortFilter').value = 'price-asc';
    applyFiltersAndSort();
});

// ============================
// RENDER KATALOG
// ============================
function renderCatalog(items) {
    const container = document.getElementById('catalog');

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="no-results">😕 Nema uređaja koji odgovaraju filterima.</div>`;
        return;
    }

    container.innerHTML = items.map((item, index) => {
        const brand = item['Brend'] || item['brend'] || 'Nepoznat brend';
        const model = item['Naziv artikla'] || item['nazivArtikla'] || '';
        const description = item['Robna grupa'] || item['robnaGrupa'] || '';
        const price = parseFloat(item['Nabavna cena'] || item['nabavnaCena'] || 0);
        const location = item['Trenutna lokacija'] || item['trenutnaLokacija'] || '';
        const outlet = item['Outlet kategorija'] || item['outletKategorija'] || '';
        const materijal = item['Materijal'] || item['materijal'] || '';

        // Oštećenja po stranama
        const damageSides = {
            'Levo': item['Levo'] || item['levo'] || '',
            'Front': item['Front'] || item['front'] || '',
            'Desno': item['Desno'] || item['desno'] || '',
            'Nazad': item['Nazad'] || item['nazad'] || '',
            'Gore': item['Gore'] || item['gore'] || '',
            'Dole': item['Dole'] || item['dole'] || ''
        };

        const damageList = Object.entries(damageSides)
            .filter(([strana, opis]) => opis && opis.trim() !== '')
            .map(([strana, opis]) => `<span class="damage-item"><strong>${strana}:</strong> ${opis}</span>`);

        const damageHtml = damageList.length > 0
            ? `<div class="damage-list">${damageList.join('')}</div>`
            : `<div class="damage-list"><span class="damage-item no-damage">✅ Nema vidljivih oštećenja</span></div>`;

        const imageHtml = '📦';
        const outletBadge = outlet 
            ? `<span class="badge badge-${outlet}">Outlet ${outlet}</span>` 
            : '';

        return `
            <div class="card" data-index="${index}" onclick="openModal(${index})">
                <div class="card-image">${imageHtml}</div>
                <div class="card-body">
                    <div class="brand">${brand}</div>
                    <div class="model">${model}</div>
                    ${description ? `<div class="description">${description}</div>` : ''}
                    ${damageHtml}
                    <div class="price">${price.toLocaleString('sr-RS')} <small>RSD</small></div>
                    <div class="meta">
                        ${outletBadge}
                        ${location ? `<span>📍 ${location}</span>` : ''}
                        ${materijal ? `<span>🔢 ${materijal}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    window._currentItems = items;
}

// ============================
// MODAL ZA DETALJE
// ============================
function openModal(index) {
    const items = window._currentItems || [];
    if (!items[index]) return;

    const item = items[index];
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');

    const fields = [
        { label: 'Broj zapisnika', key: 'Broj zapisnika' },
        { label: 'Datum obrade', key: 'Datum obrade' },
        { label: 'Tiket', key: 'Tiket' },
        { label: 'Materijal', key: 'Materijal' },
        { label: 'Naziv artikla', key: 'Naziv artikla' },
        { label: 'Robna grupa', key: 'Robna grupa' },
        { label: 'Brend', key: 'Brend' },
        { label: 'Serijski broj', key: 'Serijski broj' },
        { label: 'Dokument veze', key: 'Dokument veze' },
        { label: 'Broj pošiljke', key: 'Broj pošiljke' },
        { label: 'Nabavna cena (RSD)', key: 'Nabavna cena' },
        { label: 'Trenutna lokacija', key: 'Trenutna lokacija' },
        { label: 'Pozicija', key: 'Pozicija' },
        { label: 'Detekcija oštećenja', key: 'Detekcija oštećenja' },
        { label: 'Korišćenje uređaja', key: 'Korišćenje uređaja' },
        { label: 'Funkcionalna ispravnost', key: 'Funkcionalna ispravnost' },
        { label: 'Servisni status', key: 'Servisni status' },
        { label: 'Tip fizičkog oštećenja', key: 'Tip fizičkog oštećenja' },
        { label: 'Vidljivost oštećenja', key: 'Vidljivost oštećenja' },
        { label: 'Tip ambalaže', key: 'Tip ambalaže' },
        { label: 'Stanje ambalaže', key: 'Stanje ambalaže detaljno' },
        { label: 'Poreklo uređaja', key: 'Poreklo uređaja' },
        { label: 'Razlog povrata', key: 'Razlog povrata' },
        { label: 'Outlet kategorija', key: 'Outlet kategorija' },
        { label: 'Može u prodaju ?', key: 'Može u prodaju ?' },
        { label: 'Fizički pregledan', key: 'Fizički pregledan' },
        { label: 'Datum pregleda', key: 'Datum fizičkog pregleda' },
        { label: 'Pregledao', key: 'Pregledao' },
        { label: 'Opis za kupca', key: 'Opis za kupca' },
        { label: 'Fotografije postoje', key: 'Fotografije postoje' },
    ];

    let detailHtml = fields.map(f => {
        const value = item[f.key] || '';
        if (value.toString().trim() === '') return '';
        return `
            <div class="detail-item">
                <span class="label">${f.label}</span>
                <span class="value">${value}</span>
            </div>
        `;
    }).filter(html => html !== '').join('');

    // Oštećenja po stranama (u modalu)
    const damageSides = {
        'Levo': item['Levo'] || '',
        'Front': item['Front'] || '',
        'Desno': item['Desno'] || '',
        'Nazad': item['Nazad'] || '',
        'Gore': item['Gore'] || '',
        'Dole': item['Dole'] || ''
    };

    let sideDamageHtml = Object.entries(damageSides)
        .filter(([strana, opis]) => opis && opis.trim() !== '')
        .map(([strana, opis]) => `<div class="damage-detail"><strong>${strana}:</strong> ${opis}</div>`)
        .join('');

    if (sideDamageHtml) {
        detailHtml += `
            <div class="detail-item full-width">
                <span class="label">Oštećenja po stranama</span>
                <div style="margin-top:4px;">${sideDamageHtml}</div>
            </div>
        `;
    } else {
        detailHtml += `
            <div class="detail-item full-width">
                <span class="label">Oštećenja po stranama</span>
                <div style="margin-top:4px; color:#2e7d32;">✅ Nema vidljivih oštećenja</div>
            </div>
        `;
    }

    body.innerHTML = `
        <h2>${item['Naziv artikla'] || 'Detalji uređaja'}</h2>
        <div class="detail-grid">${detailHtml}</div>
    `;

    modal.style.display = 'block';
}

// Zatvaranje modala
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ============================
// POKRENI
// ============================
loadData();