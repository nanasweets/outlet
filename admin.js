const API_URL = "https://script.google.com/macros/s/AKfycbw9Cr8u-9SVzJ9NpU-0mUPmZv9VLocVyU1VYlnkgnu9JBnF9eGW9FOFP2amNYdLoEs/exec";

const form = document.getElementById('addForm');
const statusDiv = document.getElementById('status');

// Automatski popuni datum
document.getElementById('datumObrade').value = new Date().toISOString().split('T')[0];

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Slanje...';
    
    const data = {
        password: document.getElementById('password').value,
        brojZapisnika: document.getElementById('brojZapisnika').value.trim(),
        datumObrade: document.getElementById('datumObrade').value,
        tiket: document.getElementById('tiket').value.trim(),
        ean: document.getElementById('ean').value.trim(),
        materijal: document.getElementById('materijal').value.trim(),
        nazivArtikla: document.getElementById('nazivArtikla').value.trim(),
        robnaGrupa3: document.getElementById('robnaGrupa3').value.trim(),
        robnaGrupa: document.getElementById('robnaGrupa').value.trim(),
        brend: document.getElementById('brend').value.trim(),
        kolicina: parseInt(document.getElementById('kolicina').value) || 1,
        serijskiBroj: document.getElementById('serijskiBroj').value.trim(),
        dokumentVeze: document.getElementById('dokumentVeze').value.trim(),
        brojPosiljke: document.getElementById('brojPosiljke').value.trim(),
        opisNedostatka: document.getElementById('opisNedostatka').value.trim(),
        nabavnaCena: parseFloat(document.getElementById('nabavnaCena').value) || 0,
        trenutnaLokacija: document.getElementById('trenutnaLokacija').value.trim(),
        pozicija: document.getElementById('pozicija').value.trim(),
        detekcijaOstećenja: document.getElementById('detekcijaOstećenja').value.trim(),
        koriscenjeUredjaja: document.getElementById('koriscenjeUredjaja').value,
        levo: document.getElementById('levo').value.trim(),
        front: document.getElementById('front').value.trim(),
        desno: document.getElementById('desno').value.trim(),
        nazad: document.getElementById('nazad').value.trim(),
        gore: document.getElementById('gore').value.trim(),
        dole: document.getElementById('dole').value.trim(),
        funkcionalnaIspravnost: document.getElementById('funkcionalnaIspravnost').value,
        servisniStatus: document.getElementById('servisniStatus').value,
        tipFizickogOstećenja: document.getElementById('tipFizickogOstećenja').value.trim(),
        vidljivostOstećenja: document.getElementById('vidljivostOstećenja').value.trim(),
        tipAmbalaze: document.getElementById('tipAmbalaze').value,
        stanjeAmbalazeDetaljno: document.getElementById('stanjeAmbalazeDetaljno').value.trim(),
        porekloUredjaja: document.getElementById('porekloUredjaja').value.trim(),
        razlogPovrata: document.getElementById('razlogPovrata').value.trim(),
        outletKategorija: document.getElementById('outletKategorija').value,
        mozeUProdaju: document.getElementById('mozeUProdaju').checked ? 'da' : 'ne',
        razlogAkoNeMoze: document.getElementById('razlogAkoNeMoze').value.trim(),
        fizickiPregledan: document.getElementById('fizickiPregledan').checked ? 'da' : '',
        datumFizickogPregleda: document.getElementById('datumFizickogPregleda').value,
        pregledao: document.getElementById('pregledao').value.trim(),
        opisZaKupca: document.getElementById('opisZaKupca').value.trim(),
        fotografijePostoje: document.getElementById('fotografijePostoje').checked ? 'da' : 'ne',
        novaLokacija: document.getElementById('novaLokacija').value.trim(),
        kolona1: document.getElementById('kolona1').value.trim()
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('✅ ' + result.message, 'success');
            form.reset();
            document.getElementById('datumObrade').value = new Date().toISOString().split('T')[0];
            document.getElementById('kolicina').value = '1';
            document.getElementById('trenutnaLokacija').value = 'DC73';
            document.getElementById('mozeUProdaju').checked = true;
            document.getElementById('kolona1').value = 'da';
        } else {
            showStatus('❌ ' + result.message, 'error');
        }
    } catch (error) {
        showStatus('❌ Greška pri povezivanju: ' + error.message, 'error');
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = '➕ Dodaj uređaj';
});

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    setTimeout(() => {
        statusDiv.className = 'status';
    }, 6000);
}