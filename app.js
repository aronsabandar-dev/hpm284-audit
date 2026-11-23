import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
  apiKey: "AIzaSyD2jSmyQEMtT75kh4WDvmPoQDgtnXHJvwg",
  authDomain: "hpm-284-audit.firebaseapp.com",
  projectId: "hpm-284-audit",
  storageBucket: "hpm-284-audit.firebasestorage.app",
  messagingSenderId: "978149013917",
  appId: "1:978149013917:web:03b6aacc8dfe8774749774",
  measurementId: "G-81EM9THMGY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== AUDIT DATA =====================
const AUDIT_CATEGORIES = [
  {
    id: "food_safety",
    name: "Food Safety",
    items: [
      { id: "ph1", label: "Personal Hygiene", text: "Penampilan personil sesuai dengan standar grooming yang ditetapkan." },
      { id: "ph2", label: "Personal Hygiene", text: "Peralatan kebersihan diri (wastafel dan pendukungnya) tersedia, berfungsi dan dibersihkan. Sarana pendukung (sabun, tisu, pengering tangan, dll.) tersedia lengkap." },
      { id: "tt1", label: "Time & Temperature", text: "Periksa ketepatan waktu dari pengisian kartu suhu." },
      { id: "tt2", label: "Time & Temperature", text: "Periksa kesesuaian suhu aktual produk di gudang dan area terhadap standar." },
      { id: "cd1", label: "Cleaning & Desinfection", text: "Periksa secara visual apakah infrastruktur terkait (lantai, dinding, kaca, langit-langit, pintu, curtain, dll.) dalam kondisi baik dan bersih." },
      { id: "cd2", label: "Cleaning & Desinfection", text: "Periksa apakah lemari pendingin dalam kondisi baik dan bersih." },
      { id: "cd3", label: "Cleaning & Desinfection", text: "Periksa apakah peralatan (pisau, meja, talenan, kontainer) yang tidak digunakan dalam kondisi bersih, siap pakai dan disimpan dalam tempatnya." },
      { id: "cd4", label: "Cleaning & Desinfection", text: "Periksa apakah mesin dan peralatan dibersihkan secara teratur sesudah pemakaian, dan apakah sabun yang digunakan sesuai dengan ketentuan." },
      { id: "cd5", label: "Cleaning & Desinfection", text: "Periksa apakah alat dan bahan kebersihan tersedia, lengkap dan disimpan pada tempatnya." },
      { id: "cc1", label: "Cross Contamination", text: "Apakah tempat sampah tersedia di tempat yang sesuai dan dalam kondisi bersih, tertutup, serta tidak berbau. Periksa apakah lantai di area dalam kondisi bersih dan kering." },
      { id: "cc2", label: "Cross Contamination", text: "Periksa apakah peralatan yang sesuai digunakan saat bersentuhan dengan item yang bisa langsung dikonsumsi (sarung tangan, penjepit, dll.), serta bahwa peralatan tersebut dalam kondisi bersih." },
      { id: "cc3", label: "Cross Contamination", text: "Periksa apakah ada barang yang tidak diperbolehkan berada di area penyimpanan, proses dan pajang." },
      { id: "pq1", label: "Product Quality", text: "Periksa apakah setiap barang memiliki tanggal kadaluarsa, tanggal buka kemasan, dan atau tanggal maksimum pemakaian." },
      { id: "pq2", label: "Product Quality", text: "Periksa apakah prinsip FIFO (First In, First Out) dipatuhi dalam hal simpan dan pajang." },
      { id: "pq3", label: "Product Quality", text: "Periksa apakah bahan mentah dan matang disimpan dalam tempat yang terpisah." },
      { id: "pq4", label: "Product Quality", text: "Periksa apakah setiap bahan/barang dalam kondisi terlindungi (plastik wrap, tempat tertutup lainnya). Periksa apakah bahan/barang diletakkan bersentuhan langsung dengan lantai." },
      { id: "pq5", label: "Product Quality", text: "Periksa apakah ada barang dengan kualitas tidak layak jual (di luar area barang diskon karena kualitas)." },
    ]
  },
  {
    id: "retail_op",
    name: "Retail Operation",
    items: [
      { id: "ro1", label: "Tanggal Kadaluarsa", text: "Tidak boleh ada barang yang sudah melewati/memasuki tanggal kadaluarsa/Best before/used date, masih berada di rak pajangan." },
      { id: "ro2", label: "Akurasi Harga", text: "Untuk semua price card/POP/label timbangan yang terpasang, sudah di update sesuai POS." },
      { id: "ro3", label: "Akurasi Harga", text: "Semua barang di pajangan sudah terpasang price card/POP." },
      { id: "ro4", label: "Keamanan Pangan", text: "Periksa sesuai dengan Ceklis Food Safety." },
      { id: "ro5", label: "Ketersediaan Barang", text: "Untuk item 'daily basket' sudah terpajang di area regular." },
      { id: "ro6", label: "Ketersediaan Barang", text: "Untuk item 'daily basket' dengan SOH Nol sudah terpasang mika 'maaf barang kosong'." },
    ]
  },
  {
    id: "security",
    name: "Security",
    items: [
      { id: "sc1", label: "Keamanan Toko", text: "Tidak ada orang yang masuk ke area-area yang tidak diperbolehkan. (Contoh: loading, ruang ekspedisi, EDP, backroom dan ruang brankas)." },
      { id: "sc2", label: "Keamanan Toko", text: "CCTV dan DVR berfungsi sebagaimana mestinya, jika ada yang rusak mengajukan penggantian ke pihak terkait di SSO dan disertai bukti email pengajuan dan follow-up." },
    ]
  },
  {
    id: "cash_mgmt",
    name: "Cash Management",
    items: [
      { id: "cm1", label: "Kas & Voucher", text: "Periksa kesesuaian dan akurasi dari uang kas (modal brankas, petty cash) dan Voucher terhadap data dari tim FAD di SSO. Periksa ketepatan waktu dan jumlah pembayaran PKLL terhadap SPK terkait. Pastikan SPK masih berlaku." },
      { id: "cm2", label: "Kas & Voucher", text: "Form-18 diisi dengan lengkap, tepat dan sebagaimana mestinya. Serta jumlah form-18 sesuai dengan sales audit." },
      { id: "cm3", label: "Kas & Voucher", text: "Uang penjualan disetorkan sesuai dengan jadwal yang sudah ada, serta dihitung dan diinput ke system ketika closing sebagaimana aturan yang sudah dibuat." },
      { id: "cm4", label: "Kas & Voucher", text: "Settlement EDC dilakukan dihari yang sama." },
      { id: "cm5", label: "Unusual Transaction", text: "Laporan Unusual activity, Terminal activity serta Manual discount sudah diperiksa oleh pihak terkait, serta di tandatangani sesuai dengan aturan yang sudah dibuat oleh tim Front End SSO." },
    ]
  },
  {
    id: "others",
    name: "Others",
    items: [
      { id: "ot1", label: "Akurasi Persediaan", text: "Tidak ada quantity item yang selisih antara fisik dan WSOH dan tidak ada SOH minus." },
      { id: "ot2", label: "Penerimaan Barang", text: "Dokumen-dokumen penerimaan barang diisi dengan lengkap, serta proses penerimaan barang dilakukan sesuai SOP yang berlaku." },
      { id: "ot3", label: "Penerimaan Barang", text: "PO tidak boleh dibuat sesudah fisik barang diterima di toko." },
      { id: "ot4", label: "Penerimaan Barang", text: "Buku Spesifikasi fresh (96 & 97) tersedia di area loading fresh yang mudah dilihat, serta pastikan sudah di update." },
      { id: "ot5", label: "Penjualan B2B", text: "Penjualan B2B dilakukan sesuai standard (menggunakan ID), serta pengisian logbook lengkap sesuai dengan standard logbook yang sudah ditentukan." },
      { id: "ot6", label: "Barang Rusak & PH0", text: "Dokumen pemusnahan barang sudah diisi dengan lengkap, serta proses pemusnahan barang sudah dilakukan sesuai dengan standard (SOP)." },
      { id: "ot7", label: "Barang Retur", text: "Barang yang sudah diinput RTV, pastikan sudah sesuai antara surat jalan dan fisik barang dalam kardus." },
      { id: "ot8", label: "Barang Retur", text: "Barang yang sudah diinput RTV, pastikan tidak melebihi 90 hari (3 bulan) setelah diinput, namun masih berada di toko (belum diambil supplier)." },
      { id: "ot9", label: "K3", text: "Jacket coldroom dalam kondisi baik dan bersih (tidak robek dan kotor). Sepatu boot fresh dalam kondisi baik dan bersih. Grease trap pastikan rutin dibersihkan." },
      { id: "ot10", label: "K3", text: "Pintu darurat berfungsi dengan baik, serta akses ke pintu darurat tidak terhalang. Kunci pintu darurat diletakan didekat pintu darurat dan penanda evakuasi sudah terpasang ditempat yang ditentukan." },
      { id: "ot11", label: "K3", text: "APAR dan Hydrant dalam kondisi 'ready to use', tidak terhalang, tidak diletakan dilantai tanpa alas, ceklist di isi lengkap, sticker tidak expired dan dipasang ditempat yang sudah ditentukan." },
      { id: "ot12", label: "K3", text: "Penumpukan barang digudang disusun dengan rapi/sesuai aturan dan tidak diletakan dilantai tanpa alas." },
      { id: "ot13", label: "K3", text: "Tidak boleh ada barang diletakan didalam ruang panel, kompresor, AHU dan genset." },
      { id: "ot14", label: "Other Income", text: "Pastikan kelengkapan dan akurasi dari sewa display di area (TG, WOV, COC, dancing-floor, dll.) terhadap daftar dari tim Joint Promotion." },
      { id: "ot15", label: "Sub-tenant", text: "Pastikan semua tenant yang ada memiliki SIM dan pastikan ukurannya sesuai dengan yang tercantum di SIM-nya." },
    ]
  }
];

// ===================== STATE =====================
let currentUser = null;
let checklistData = {}; // { itemId: { status: 'ok'|'not_ok', note: '', updatedBy, updatedAt } }
let activeCategory = "all";
let isOnline = navigator.onLine;
let todayDocId = getTodayId();

function getTodayId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
}

function formatTime(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(d);
}

// ===================== ONLINE/OFFLINE =====================
window.addEventListener('online', () => { isOnline = true; updateOnlineStatus(); syncOfflineData(); });
window.addEventListener('offline', () => { isOnline = false; updateOnlineStatus(); });

function updateOnlineStatus() {
  const badge = document.getElementById('offline-badge');
  if (!badge) return;
  if (isOnline) {
    badge.classList.add('online');
    badge.querySelector('span').textContent = 'Online';
  } else {
    badge.classList.remove('online');
    badge.querySelector('span').textContent = 'Offline';
  }
}

// ===================== LOGIN =====================
window.togglePin = function() {
  const inp = document.getElementById('input-pin');
  inp.type = inp.type === 'password' ? 'text' : 'password';
};

window.doLogin = async function() {
  const name = document.getElementById('input-name').value.trim();
  const pin = document.getElementById('input-pin').value.trim();
  const err = document.getElementById('login-error');

  if (!name) { err.textContent = 'Nama tidak boleh kosong.'; err.classList.remove('hidden'); return; }
  if (pin !== 'hpm284') { err.textContent = 'PIN tidak valid. Coba lagi.'; err.classList.remove('hidden'); return; }

  err.classList.add('hidden');
  currentUser = name;
  document.getElementById('topbar-name').textContent = name;

  // Log aktivitas login
  await logActivity(name, 'login', 'Masuk ke sistem');

  // Load today's checklist data
  await loadTodayData();

  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');

  showScreen('checklist');
  updateOnlineStatus();
};

window.doLogout = function() {
  currentUser = null;
  checklistData = {};
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('input-name').value = '';
  document.getElementById('input-pin').value = '';
};

// Enter key login
document.getElementById('input-pin').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.doLogin();
});

// ===================== LOAD DATA =====================
async function loadTodayData() {
  // Load dari localStorage dulu (offline support)
  const local = localStorage.getItem(`audit_${todayDocId}`);
  if (local) checklistData = JSON.parse(local);

  // Kalau online, sync dari Firestore
  if (isOnline) {
    try {
      const docRef = doc(db, 'audits', todayDocId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        checklistData = data.items || {};
        localStorage.setItem(`audit_${todayDocId}`, JSON.stringify(checklistData));
      }
    } catch(e) { console.warn('Load error:', e); }
  }

  renderChecklist();
  updateProgress();
}

// ===================== REALTIME SYNC =====================
function startRealtimeSync() {
  if (!isOnline) return;
  const docRef = doc(db, 'audits', todayDocId);
  onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      checklistData = data.items || {};
      localStorage.setItem(`audit_${todayDocId}`, JSON.stringify(checklistData));
      renderChecklist();
      updateProgress();
    }
  });
}

// ===================== RENDER CHECKLIST =====================
function renderChecklist() {
  const body = document.getElementById('checklist-body');
  const tabs = document.getElementById('category-tabs');

  // Render tabs
  tabs.innerHTML = `<button class="cat-tab ${activeCategory==='all'?'active':''}" onclick="filterCategory('all')">Semua</button>`;
  AUDIT_CATEGORIES.forEach(cat => {
    tabs.innerHTML += `<button class="cat-tab ${activeCategory===cat.id?'active':''}" onclick="filterCategory('${cat.id}')">${cat.name}</button>`;
  });

  // Render items
  body.innerHTML = '';
  const categoriesToShow = activeCategory === 'all' ? AUDIT_CATEGORIES : AUDIT_CATEGORIES.filter(c => c.id === activeCategory);

  categoriesToShow.forEach(cat => {
    body.innerHTML += `<div class="section-label">${cat.name}</div>`;
    cat.items.forEach(item => {
      const state = checklistData[item.id] || {};
      const isOk = state.status === 'ok';
      const isNo = state.status === 'not_ok';
      const note = state.note || '';
      body.innerHTML += `
        <div class="audit-item ${isOk?'ok':isNo?'not-ok':''}" id="item-${item.id}">
          <div class="audit-item-top">
            <div class="audit-text">
              <strong>${item.label}</strong>
              ${item.text}
              ${state.updatedBy ? `<div style="font-size:10px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace;">✓ ${state.updatedBy}</div>` : ''}
            </div>
            <div class="toggle-group">
              <button class="toggle-btn ok-btn ${isOk?'selected':''}" onclick="setStatus('${item.id}','ok')">✓</button>
              <button class="toggle-btn no-btn ${isNo?'selected':''}" onclick="setStatus('${item.id}','not_ok')">✗</button>
            </div>
          </div>
          ${isNo ? `<textarea class="note-input" placeholder="Catatan temuan..." rows="2" onchange="setNote('${item.id}', this.value)">${note}</textarea>` : ''}
        </div>`;
    });
  });
}

window.filterCategory = function(catId) {
  activeCategory = catId;
  renderChecklist();
};

// ===================== SET STATUS =====================
window.setStatus = function(itemId, status) {
  if (!checklistData[itemId]) checklistData[itemId] = {};
  const prev = checklistData[itemId].status;

  // Toggle off jika klik status yang sama
  if (prev === status) {
    checklistData[itemId].status = null;
  } else {
    checklistData[itemId].status = status;
  }
  checklistData[itemId].updatedBy = currentUser;
  checklistData[itemId].updatedAt = new Date().toISOString();
  if (status === 'ok') checklistData[itemId].note = '';

  // Save local
  localStorage.setItem(`audit_${todayDocId}`, JSON.stringify(checklistData));

  // Auto-save ke Firestore (draft)
  autoSaveDraft();

  renderChecklist();
  updateProgress();
};

window.setNote = function(itemId, note) {
  if (!checklistData[itemId]) checklistData[itemId] = {};
  checklistData[itemId].note = note;
  localStorage.setItem(`audit_${todayDocId}`, JSON.stringify(checklistData));
  autoSaveDraft();
};

let autoSaveTimer = null;
async function autoSaveDraft() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    if (!isOnline) return;
    try {
      const docRef = doc(db, 'audits', todayDocId);
      await setDoc(docRef, {
        date: todayDocId,
        items: checklistData,
        lastUpdatedBy: currentUser,
        lastUpdated: serverTimestamp(),
        status: 'draft'
      }, { merge: true });
    } catch(e) { console.warn('Auto-save error:', e); }
  }, 1500);
}

// ===================== UPDATE PROGRESS =====================
function updateProgress() {
  const allItems = AUDIT_CATEGORIES.flatMap(c => c.items);
  const filled = allItems.filter(i => checklistData[i.id]?.status).length;
  const total = allItems.length;
  const pct = total > 0 ? Math.round((filled/total)*100) : 0;

  document.getElementById('ring-pct').textContent = pct + '%';
  const circumference = 138.2;
  const offset = circumference - (pct/100)*circumference;
  document.getElementById('ring-fill').style.strokeDashoffset = offset;

  document.getElementById('submit-count').textContent = `${filled} dari ${total} item diisi`;
}

// ===================== SUBMIT =====================
window.submitChecklist = async function() {
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> MENGIRIM...`;

  try {
    if (!isOnline) throw new Error('Tidak ada koneksi internet. Hubungkan ke internet lalu coba lagi.');

    const docRef = doc(db, 'audits', todayDocId);
    await setDoc(docRef, {
      date: todayDocId,
      items: checklistData,
      submittedBy: currentUser,
      submittedAt: serverTimestamp(),
      status: 'submitted'
    }, { merge: true });

    // Log submit
    await logActivity(currentUser, 'submit', `Laporan audit ${todayDocId} berhasil dikirim`);

    const allItems = AUDIT_CATEGORIES.flatMap(c => c.items);
    const filled = allItems.filter(i => checklistData[i.id]?.status).length;
    const issues = allItems.filter(i => checklistData[i.id]?.status === 'not_ok').length;

    document.getElementById('modal-desc').innerHTML =
      `Dikirim oleh: <strong>${currentUser}</strong><br>` +
      `${formatDate(new Date())}<br><br>` +
      `✓ ${filled} item diverifikasi &nbsp;|&nbsp; ✗ ${issues} temuan`;

    document.getElementById('modal-success').classList.remove('hidden');

  } catch(e) {
    showToast('⚠ ' + e.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> KIRIM LAPORAN`;
};

window.closeModal = function() {
  document.getElementById('modal-success').classList.add('hidden');
};

// ===================== OFFLINE SYNC =====================
async function syncOfflineData() {
  const local = localStorage.getItem(`audit_${todayDocId}`);
  if (!local) return;
  try {
    const docRef = doc(db, 'audits', todayDocId);
    await setDoc(docRef, {
      date: todayDocId,
      items: JSON.parse(local),
      lastUpdatedBy: currentUser || 'system',
      lastUpdated: serverTimestamp(),
      status: 'draft'
    }, { merge: true });
    showToast('✓ Data offline berhasil disinkron', 'success');
  } catch(e) {}
}

// ===================== LOG ACTIVITY =====================
async function logActivity(name, type, action) {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      name, type, action,
      timestamp: serverTimestamp(),
      date: todayDocId
    });
  } catch(e) { console.warn('Log error:', e); }
}

// ===================== DASHBOARD =====================
async function loadDashboard() {
  const body = document.getElementById('dashboard-body');
  body.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Memuat data...</span></div>`;

  try {
    // Ambil data hari ini
    const docRef = doc(db, 'audits', todayDocId);
    const snap = await getDoc(docRef);
    const todayData = snap.exists() ? snap.data() : {};
    const items = todayData.items || {};

    const allItems = AUDIT_CATEGORIES.flatMap(c => c.items);
    const total = allItems.length;
    const filled = allItems.filter(i => items[i.id]?.status).length;
    const okCount = allItems.filter(i => items[i.id]?.status === 'ok').length;
    const notOkCount = allItems.filter(i => items[i.id]?.status === 'not_ok').length;
    const pct = total > 0 ? Math.round((filled/total)*100) : 0;

    // Kontributor hari ini
    const contributors = {};
    Object.values(items).forEach(v => {
      if (v.updatedBy) {
        if (!contributors[v.updatedBy]) contributors[v.updatedBy] = { count: 0, lastTime: v.updatedAt };
        contributors[v.updatedBy].count++;
        if (v.updatedAt > contributors[v.updatedBy].lastTime) contributors[v.updatedBy].lastTime = v.updatedAt;
      }
    });

    // Issues
    const issues = allItems.filter(i => items[i.id]?.status === 'not_ok');

    let html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-label">PROGRESS</div><div class="stat-value accent">${pct}%</div></div>
        <div class="stat-card"><div class="stat-label">TOTAL ITEM</div><div class="stat-value">${total}</div></div>
        <div class="stat-card"><div class="stat-label">SUDAH OK ✓</div><div class="stat-value green">${okCount}</div></div>
        <div class="stat-card"><div class="stat-label">TEMUAN ✗</div><div class="stat-value red">${notOkCount}</div></div>
      </div>

      <div class="section-title">PROGRESS PER KATEGORI</div>`;

    AUDIT_CATEGORIES.forEach(cat => {
      const catItems = cat.items;
      const catFilled = catItems.filter(i => items[i.id]?.status).length;
      const catPct = Math.round((catFilled/catItems.length)*100);
      const cls = catPct < 40 ? 'low' : catPct < 70 ? 'mid' : '';
      html += `
        <div class="cat-progress-item">
          <div class="cat-progress-top">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-pct">${catPct}%</div>
          </div>
          <div class="progress-bar-bg"><div class="progress-bar-fill ${cls}" style="width:${catPct}%"></div></div>
        </div>`;
    });

    if (issues.length > 0) {
      html += `<div class="section-title">TEMUAN (${issues.length})</div>`;
      issues.forEach(item => {
        const catName = AUDIT_CATEGORIES.find(c => c.items.find(i => i.id === item.id))?.name || '';
        const note = items[item.id]?.note || '';
        html += `
          <div class="issue-item">
            <div class="issue-cat">${catName} · ${item.label}</div>
            <div class="issue-text">${item.text}</div>
            ${note ? `<div class="issue-note">📝 ${note}</div>` : ''}
          </div>`;
      });
    }

    const contribList = Object.entries(contributors);
    if (contribList.length > 0) {
      html += `<div class="section-title">KONTRIBUTOR HARI INI</div>`;
      contribList.sort((a,b) => b[1].count - a[1].count).forEach(([name, info]) => {
        html += `
          <div class="contributor-item">
            <div class="contributor-avatar">${name[0].toUpperCase()}</div>
            <div class="contributor-info">
              <div class="contributor-name">${name}</div>
              <div class="contributor-time">${info.lastTime ? new Date(info.lastTime).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-'}</div>
            </div>
            <div class="contributor-count">${info.count} item</div>
          </div>`;
      });
    }

    body.innerHTML = html;
  } catch(e) {
    body.innerHTML = `<div class="empty-state">Gagal memuat data. Periksa koneksi internet.</div>`;
  }
}

// ===================== LOG =====================
async function loadLog() {
  const body = document.getElementById('log-body');
  body.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Memuat log...</span></div>`;

  try {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);

    if (snap.empty) { body.innerHTML = `<div class="empty-state">Belum ada aktivitas.</div>`; return; }

    let html = '';
    snap.docs.forEach((d, i) => {
      const data = d.data();
      const isLast = i === snap.docs.length - 1;
      const dotClass = data.type === 'submit' ? 'submit' : data.type === 'draft' ? 'draft' : 'login';
      html += `
        <div class="log-item">
          <div class="log-line">
            <div class="log-dot ${dotClass}"></div>
            ${!isLast ? '<div class="log-stem"></div>' : ''}
          </div>
          <div class="log-info">
            <div class="log-name">${data.name || '-'}</div>
            <div class="log-action">${data.action || '-'}</div>
            <div class="log-time">${formatTime(data.timestamp)}</div>
          </div>
        </div>`;
    });
    body.innerHTML = html;
  } catch(e) {
    body.innerHTML = `<div class="empty-state">Gagal memuat log. Periksa koneksi internet.</div>`;
  }
}

// ===================== NAVIGATION =====================
window.showScreen = function(screen) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`view-${screen}`).classList.add('active');
  document.getElementById(`nav-${screen}`)?.classList.add('active');

  const today = formatDate(new Date());
  if (screen === 'checklist') {
    document.getElementById('checklist-date').textContent = today;
  } else if (screen === 'dashboard') {
    document.getElementById('dashboard-date').textContent = today;
    loadDashboard();
  } else if (screen === 'log') {
    loadLog();
  }
};

// ===================== TOAST =====================
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('hidden'), 3500);
}

// ===================== INIT =====================
document.getElementById('checklist-date').textContent = formatDate(new Date());
updateOnlineStatus();
startRealtimeSync();
