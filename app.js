import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ===================== AUDIT DATA 2026 =====================
const FOOD_SAFETY_ITEMS = [
  {
    id: "fs_ph1", category: "Personal Hygiene",
    text: "Penampilan personil sesuai dengan standar grooming yang ditetapkan.",
    notes: "Standard grooming processing tidak boleh digunakan di toilet (batas depan pintu toilet dan tidak keluar pintu karyawan)."
  },
  {
    id: "fs_ph2", category: "Personal Hygiene",
    text: "Peralatan kebersihan diri (wastafel dan pendukungnya) tersedia, berfungsi dan dibersihkan. Sarana pendukung (sabun, tisu, pengering tangan, dll.) tersedia lengkap.",
    notes: "Amati apakah personil mematuhi teknik mencuci tangan yang baik."
  },
  {
    id: "fs_ph3", category: "Personal Hygiene",
    text: "Personil yang melakukan processing tidak diperbolehkan menggunakan perhiasan apapun.",
    notes: ""
  },
  {
    id: "fs_ph4", category: "Personal Hygiene",
    text: "Wajib disediakan pengering tangan/tissue di area processing.",
    notes: ""
  },
  {
    id: "fs_ph5", category: "Personal Hygiene",
    text: "Terdapat petunjuk cara cuci tangan yang baik dan benar di area processing.",
    notes: ""
  },
  {
    id: "fs_tt1", category: "Time & Temperature",
    text: "Periksa ketepatan waktu dari pengisian kartu suhu.",
    notes: "Pemeriksaan suhu tidak diperbolehkan dilakukan saat proses defrosting."
  },
  {
    id: "fs_tt2", category: "Time & Temperature",
    text: "Periksa kesesuaian suhu aktual produk di gudang dan area terhadap standar.",
    notes: "Suhu standar minimal: Chiller 0–4°C, Frozen -18°C. Jika suhu tidak sesuai, wajib disertai alasan serta action plan yang akan dilakukan."
  },
  {
    id: "fs_cd1", category: "Cleaning & Desinfection",
    text: "Periksa secara visual apakah infrastruktur terkait (lantai, dinding, kaca, langit-langit, pintu, curtain, dll.) dalam kondisi baik dan bersih.",
    notes: "Semua curtain wajib overlapping (tidak ada celah terbuka)."
  },
  {
    id: "fs_cd2", category: "Cleaning & Desinfection",
    text: "Periksa apakah lemari pendingin dalam kondisi baik dan bersih.",
    notes: ""
  },
  {
    id: "fs_cd3", category: "Cleaning & Desinfection",
    text: "Periksa apakah peralatan (pisau, meja, talenan, kontainer) yang tidak digunakan dalam kondisi bersih, siap pakai dan disimpan dalam tempatnya.",
    notes: ""
  },
  {
    id: "fs_cd4", category: "Cleaning & Desinfection",
    text: "Periksa apakah mesin dan peralatan dibersihkan secara teratur sesudah pemakaian, dan apakah sabun yang digunakan sesuai dengan ketentuan.",
    notes: "Wajib menggunakan tempat sampah tertutup di area processing."
  },
  {
    id: "fs_cd5", category: "Cleaning & Desinfection",
    text: "Periksa apakah alat dan bahan kebersihan tersedia, lengkap dan disimpan pada tempatnya.",
    notes: "Terdapat addressing chemical di area processing."
  },
  {
    id: "fs_cc1", category: "Cross Contamination",
    text: "Apakah tempat sampah tersedia di tempat yang sesuai dan dalam kondisi bersih, tertutup, serta tidak berbau. Periksa apakah lantai di area dalam kondisi bersih dan kering.",
    notes: ""
  },
  {
    id: "fs_cc2", category: "Cross Contamination",
    text: "Periksa apakah peralatan yang sesuai digunakan saat bersentuhan dengan item yang bisa langsung dikonsumsi (sarung tangan, penjepit, dll.), serta bahwa peralatan tersebut dalam kondisi bersih.",
    notes: ""
  },
  {
    id: "fs_cc3", category: "Cross Contamination",
    text: "Periksa apakah ada barang yang tidak diperbolehkan berada di area penyimpanan, proses dan pajang.",
    notes: "Penyimpanan untuk produk seafood di gudang wajib pada posisi paling bawah dan dalam kondisi tertutup."
  },
  {
    id: "fs_pq1", category: "Product Quality",
    text: "Periksa apakah setiap barang memiliki tanggal kadaluarsa, tanggal buka kemasan, dan atau tanggal maksimum pemakaian.",
    notes: ""
  },
  {
    id: "fs_pq2", category: "Product Quality",
    text: "Periksa apakah bahan mentah dan matang disimpan dalam tempat yang terpisah.",
    notes: ""
  },
  {
    id: "fs_pq3", category: "Product Quality",
    text: "Periksa apakah setiap bahan/barang dalam kondisi terlindungi (plastik wrap, tempat tertutup lainnya). Periksa apakah bahan/barang diletakkan bersentuhan langsung dengan lantai.",
    notes: ""
  },
  {
    id: "fs_pq4", category: "Product Quality",
    text: "Periksa apakah ada barang dengan kualitas tidak layak jual.",
    notes: "Barang tidak layak jual harus diletakkan di luar area barang diskon karena kualitas."
  }
];

const AUDIT_CATEGORIES = [
  {
    id: "customer_pov",
    name: "Customer Point of View",
    items: [
      {
        id: "cpv1", label: "Expired Items", points: 8,
        text: "Tidak boleh ada barang yang sudah melewati/memasuki tanggal kadaluarsa/Best before/used date, masih berada di rak pajangan.",
        notes: "Jika terdapat item dengan tanggal expired di hari yang sama dengan tanggal kunjungan (hari-H), maka masih mendapatkan poin full. Selain itu, poin akan nol."
      },
      {
        id: "cpv2", label: "Konsistensi Kontrol Preventif Expired", points: 5,
        text: "Pastikan konsistensi penerapan kontrol preventif item expired.",
        notes: "Sample: 10 kali kontrol terakhir (harian/mingguan/bulanan). Pastikan dengan Store Manager bagaimana kontrol di toko dan cara memastikan kontrol tersebut berjalan. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "cpv3", label: "Selisih Harga POS vs Tagging (>) >Rp500", points: 5,
        text: "Tidak boleh ada selisih harga POS vs tagging lebih dari Rp500 (harga di POS lebih mahal dari tagging).",
        notes: "Sample: 400 item (Hypermart). Waktu start pemeriksaan di atas jam 14:00 waktu lokal. Take out pemeriksaan item konsinyasi. Promo katalog menjadi temuan di hari ke-3 promo."
      },
      {
        id: "cpv4", label: "Selisih Harga POS vs Tagging (>) <Rp500", points: 3,
        text: "Tidak boleh ada selisih harga POS vs tagging kurang dari Rp500 (harga di POS lebih mahal dari tagging).",
        notes: "Sample: 400 item (Hypermart). Waktu start pemeriksaan di atas jam 14:00 waktu lokal."
      },
      {
        id: "cpv5", label: "Selisih Harga POS vs Tagging (<)", points: 2,
        text: "Tidak boleh ada selisih harga POS vs tagging (harga di POS lebih murah dari tagging).",
        notes: "Sample: 400 item (Hypermart). Waktu start pemeriksaan di atas jam 14:00 waktu lokal."
      },
      {
        id: "cpv6", label: "Kelengkapan Label Harga - Sembako", points: 3,
        text: "Semua produk sembako di pajangan sudah terpasang price card/POP/label.",
        notes: "Sembako: Beras ≤5kg harga <100.000 | Minyak goreng sawit | Mie instan non premium | Gula pasir non premium | Susu UHT max 1L | Telur ayam non omega (curah). Poin 3: 0–5 label shelving hilang. Poin 2: 6–10 label shelving hilang. Poin 1: 11–15 label shelving hilang. Poin 0: >15 label shelving hilang."
      },
      {
        id: "cpv7", label: "Kelengkapan Label Harga - Non Sembako", points: 3,
        text: "Semua produk non-sembako di pajangan sudah terpasang price card/POP/label.",
        notes: "Waktu start pemeriksaan di atas jam 14:00 waktu lokal. Poin 2: 0–10 label shelving hilang. Poin 1: 11–20 label shelving hilang. Poin 0.5: 21–30 label shelving hilang. Poin 0: >30 label shelving hilang."
      },
      {
        id: "cpv8", label: "Konsistensi Kontrol Preventif Price Accuracy", points: 3,
        text: "Pastikan konsistensi penerapan kontrol preventif price accuracy (selisih harga).",
        notes: "Sample: 10 kali kontrol terakhir. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "cpv9", label: "Food Safety Checklist", points: 10,
        text: "Semua poin Food Safety checklist terpenuhi sesuai standar 2026.",
        notes: "Refer to Food Safety tab. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC.",
        isFoodSafetyLink: true
      }
    ]
  },
  {
    id: "cash_mgmt",
    name: "Cash Management",
    items: [
      {
        id: "cm1", label: "Sidak Kas, Voucher, PKLL & Petty Cash", points: 9,
        text: "Periksa kesesuaian dan akurasi uang brankas, voucher, PKLL & petty cash terhadap data FAD di SSO.",
        notes: "Sub-proses: Brankas sidak+proses (40%) | Voucher (5%) | Proses voucher (10%) | Petty cash (15%) | Proses petty cash (15%) | PKLL sidak+proses (15%). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "cm2", label: "Buka-Tutup Register & Form-18", points: 2,
        text: "Periksa kelengkapan buka-tutup register (fisik dokumen, waktu buka & tutup, akurasi nilai, TTD, nama, tanggal) dan penyimpanan file soft-copy form-18.",
        notes: "Sample: 7 hari berturut-turut (max 3 bulan sebelum periode audit). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "cm3", label: "Proses Penghitungan Uang & Pick Up", points: 5,
        text: "Periksa kesesuaian proses penghitungan uang penjualan dan proses pick up (proses & kelengkapan dokumentasi).",
        notes: "Sample: 7x proses pick up (random, max 3 bulan sebelum periode audit). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "cm4", label: "Unusual Transaction", points: 3,
        text: "Periksa kelengkapan dokumentasi unusual transaction (TTD, nama, tanggal, struk refund RAS, jam cetak dokumen, alamat POS wajib tercetak).",
        notes: "Sample: 7 hari berturut-turut (max 3 bulan sebelum periode audit). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "akurasi_persediaan",
    name: "Akurasi Persediaan",
    items: [
      {
        id: "ap1", label: "Cek Fisik vs SOH", points: 7,
        text: "Tidak ada quantity item yang selisih antara fisik dan WSOH dan tidak ada SOH minus.",
        notes: "Sample: 50 item random. Tambahan 2026: Store Manager wajib TTD di BA hasil perhitungan. Hasil perhitungan selesai di hari penghitungan. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "penerimaan_barang",
    name: "Penerimaan Barang",
    items: [
      {
        id: "pb1", label: "Proses Penerimaan Barang", points: 4,
        text: "Lakukan pengamatan atas proses penerimaan dan pastikan sesuai dengan SOP.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      },
      {
        id: "pb2", label: "Kelengkapan Dokumentasi Penerimaan", points: 3,
        text: "Kelengkapan dokumentasi penerimaan barang (PO, RAR, RGN, Form Keberterimaan Barang Fresh, dll.) disertai TTD pihak terkait sesuai SOP. Cek pemasangan poster form keberterimaan di area XPDC.",
        notes: "Sample: 7 hari berturut-turut (max 3 bulan sebelum periode audit). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "penjualan_b2b",
    name: "Penjualan B2B",
    items: [
      {
        id: "b2b1", label: "Administrasi B2B", points: 2,
        text: "Kelengkapan TTD, nama & tanggal. TTD Store Manager di struk pembelian. Bukti konfirmasi transfer (e-mail). Kesalahan penulisan logbook. Kelengkapan lampiran (Foto STNK & KTP pengambil).",
        notes: "Sample: Opsi-1: Min. 20 ID transaksi (random) | Opsi-2: Total transaksi Net Sales Rp250 juta (all). Jika tidak tercapai, poin pindah ke receiving (masing-masing 3 poin). Sample max 3 bulan sebelum audit. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "b2b2", label: "Non-Administrasi B2B", points: 4,
        text: "Pastikan: tidak ada pengeluaran barang sebelum transaksi, barang tercatat, didampingi PIC, tidak ada kesalahan pengeluaran barang, penyimpanan B2B tidak tercampur, tidak ditransfer karyawan.",
        notes: "Penyimpanan B2B max 1 minggu setelah transaksi (Optional). Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "barang_rusak",
    name: "Barang Rusak & PH0",
    items: [
      {
        id: "br1", label: "Dokumen & Proses Pemusnahan Barang", points: 2,
        text: "Kesesuaian daftar barang rusak terhadap fisik. Kelengkapan dokumen terkait dan ditandatangani pihak terkait sesuai SOP. Untuk pemusnahan item >Rp1 juta, pastikan ketersediaan dokumentasi yang disyaratkan.",
        notes: "Sample: 7 hari random. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "barang_retur",
    name: "Barang Retur",
    items: [
      {
        id: "bret1", label: "Kesesuaian Fisik Retur", points: 1,
        text: "Berdasarkan sampel acak min. 7 dokumen retur, pastikan kesesuaian dan kelengkapan fisik barang terhadap daftar retur.",
        notes: "Sample: 7 dokumen random. Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      }
    ]
  },
  {
    id: "k3",
    name: "K3 (Kesehatan & Keselamatan Kerja)",
    items: [
      {
        id: "k3_1", label: "APD & Grease Trap", points: 2,
        text: "Pastikan tersedia, kondisi baik dan digunakan sesuai peruntukannya: (a) Cold jacket, (b) Boot, (c) Grease trap. Cek availability stock di gudang toko.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      },
      {
        id: "k3_2", label: "Pintu Darurat & Jalur Evakuasi", points: 2,
        text: "Pintu darurat tersedia, dapat digunakan dan aman dari penghalang. Kunci pintu darurat tersedia dan diamankan dekat pintu. Penanda jalur evakuasi tersedia di tempat strategis.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      },
      {
        id: "k3_3", label: "APAR & Hydrant", points: 2,
        text: "APAR dan hydrant tersedia sesuai layout. APAR tidak terhalang, mudah dijangkau, di atas alas. APAR tidak kadaluarsa, tidak kosong, tekanan sesuai. Nozzle pipa hydrant terpasang lengkap. Checklist APAR & hydrant wajib diisi lengkap.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      },
      {
        id: "k3_4", label: "Ketertiban Gudang & Kelistrikan", points: 2,
        text: "Gudang disusun rapi sesuai kategori. Barang tidak melebihi kapasitas, tidak miring, tidak berbahaya, tidak langsung di lantai. Sambungan listrik aman, tidak melebihi kapasitas. Sisi atas cooler/coldroom tidak ada barang. Ruang gas tidak berbau/bocor.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      },
      {
        id: "k3_5", label: "Ruang Kompresor, Genset & Panel", points: 2,
        text: "Tidak ada barang diletakkan dalam ruang kompresor, genset, panel.",
        notes: "Untuk yang tidak ada ruangan teknisi, penyimpanan menggunakan lemari/kabinet. Penilaian: Ya/Tidak (Y/N)."
      }
    ]
  },
  {
    id: "security",
    name: "Security",
    items: [
      {
        id: "sec1", label: "Keamanan Restricted Area", points: 2,
        text: "Pastikan seluruh akses ke toko, kantor dan gudang diawasi, diamankan dan dibatasi hanya untuk orang yang berkepentingan.",
        notes: "Restricted area: 1. EDP. 2. Brankas. 3. XPDC (Batas supplier & Office). 4. CCTV. Skor: 4 area aman = AC | 3 area = NI | 2 area = SIN | 0–1 area = WC."
      },
      {
        id: "sec2", label: "CCTV & DVR", points: 1,
        text: "Pastikan CCTV dan DVR berfungsi normal, merekam dan diarahkan ke area yang sudah ditentukan. Setiap CCTV/DVR rusak sudah dilakukan follow up ke Risk Management HO (Ariyanto) dan diajukan via sistem.",
        notes: "Skor: >75% = AC | 65.1–75% = NI | 50.1–65% = SIN | ≤50% = WC."
      },
      {
        id: "sec3", label: "CCTV Area E-Commerce", points: 1,
        text: "Ketersediaan dan kondisi CCTV di area e-commerce berfungsi dengan baik.",
        notes: "Penilaian: Ya/Tidak (Y/N)."
      }
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    items: [
      {
        id: "eco1", label: "Akurasi Picking & Packing", points: 2,
        text: "Akurasi proses picking dan packing untuk transaksi ecommerce sesuai standar.",
        notes: "Sample: 2 transaksi. Penilaian: Ya/Tidak (Y/N)."
      }
    ]
  }
];

// ===================== STATE =====================
let currentUser = null;
let checklistData = {};
let foodSafetyData = {};
let activeView = 'checklist'; // checklist | foodsafety | dashboard | log
let activeCatFilter = 'all';
let isOnline = navigator.onLine;
let todayDocId = getTodayId();

function getTodayId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(d) {
  return new Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(d);
}
function formatTime(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(d);
}

window.addEventListener('online', () => { isOnline = true; updateOnlineStatus(); syncOfflineData(); });
window.addEventListener('offline', () => { isOnline = false; updateOnlineStatus(); });

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
  await logActivity(name, 'login', 'Masuk ke sistem');
  await loadTodayData();
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  showScreen('checklist');
  updateOnlineStatus();
};

window.doLogout = function() {
  currentUser = null; checklistData = {}; foodSafetyData = {};
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('input-name').value = '';
  document.getElementById('input-pin').value = '';
};

document.getElementById('input-pin').addEventListener('keydown', e => { if (e.key === 'Enter') window.doLogin(); });

// ===================== LOAD DATA =====================
async function loadTodayData() {
  const localSA = localStorage.getItem(`audit_sa_${todayDocId}`);
  const localFS = localStorage.getItem(`audit_fs_${todayDocId}`);
  if (localSA) checklistData = JSON.parse(localSA);
  if (localFS) foodSafetyData = JSON.parse(localFS);
  if (isOnline) {
    try {
      const snap = await getDoc(doc(db, 'audits', todayDocId));
      if (snap.exists()) {
        const data = snap.data();
        checklistData = data.items || {};
        foodSafetyData = data.foodSafety || {};
        localStorage.setItem(`audit_sa_${todayDocId}`, JSON.stringify(checklistData));
        localStorage.setItem(`audit_fs_${todayDocId}`, JSON.stringify(foodSafetyData));
      }
    } catch(e) { console.warn('Load error:', e); }
  }
  renderChecklist();
  renderFoodSafety();
  updateProgress();
}

function startRealtimeSync() {
  if (!isOnline) return;
  onSnapshot(doc(db, 'audits', todayDocId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      checklistData = data.items || {};
      foodSafetyData = data.foodSafety || {};
      localStorage.setItem(`audit_sa_${todayDocId}`, JSON.stringify(checklistData));
      localStorage.setItem(`audit_fs_${todayDocId}`, JSON.stringify(foodSafetyData));
      renderChecklist();
      renderFoodSafety();
      updateProgress();
    }
  });
}

// ===================== RENDER CHECKLIST (Point SA) =====================
function renderChecklist() {
  const body = document.getElementById('checklist-body');
  const tabs = document.getElementById('category-tabs');
  if (!body || !tabs) return;

  tabs.innerHTML = `<button class="cat-tab ${activeCatFilter==='all'?'active':''}" onclick="filterCategory('all')">Semua</button>`;
  AUDIT_CATEGORIES.forEach(cat => {
    tabs.innerHTML += `<button class="cat-tab ${activeCatFilter===cat.id?'active':''}" onclick="filterCategory('${cat.id}')">${cat.name}</button>`;
  });

  body.innerHTML = '';
  const cats = activeCatFilter === 'all' ? AUDIT_CATEGORIES : AUDIT_CATEGORIES.filter(c => c.id === activeCatFilter);

  cats.forEach(cat => {
    const totalPts = cat.items.reduce((s,i) => s + i.points, 0);
    body.innerHTML += `<div class="section-label">${cat.name} <span class="section-pts">${totalPts} poin</span></div>`;
    cat.items.forEach(item => {
      const state = checklistData[item.id] || {};
      const isOk = state.status === 'ok';
      const isNo = state.status === 'not_ok';
      const note = state.note || '';
      const isFSLink = item.isFoodSafetyLink;
      body.innerHTML += `
        <div class="audit-item ${isOk?'ok':isNo?'not-ok':''}" id="item-${item.id}">
          <div class="audit-item-top">
            <div class="audit-text">
              <div class="item-header">
                <span class="item-label">${item.label}</span>
                <span class="item-points">${item.points} poin</span>
              </div>
              <div class="item-desc">${item.text}</div>
              ${item.notes ? `<div class="item-notes"><span class="notes-icon">📋</span> ${item.notes}</div>` : ''}
              ${state.updatedBy ? `<div class="item-updater">✓ ${state.updatedBy}</div>` : ''}
              ${isFSLink ? `<button class="btn-fs-link" onclick="showScreen('foodsafety')">→ Buka Food Safety Checklist</button>` : ''}
            </div>
            <div class="toggle-group">
              <button class="toggle-btn ok-btn ${isOk?'selected':''}" onclick="setStatus('${item.id}','ok','sa')">✓</button>
              <button class="toggle-btn no-btn ${isNo?'selected':''}" onclick="setStatus('${item.id}','not_ok','sa')">✗</button>
            </div>
          </div>
          ${isNo ? `<textarea class="note-input" placeholder="Catatan temuan..." rows="2" onchange="setNote('${item.id}', this.value, 'sa')">${note}</textarea>` : ''}
        </div>`;
    });
  });
}

// ===================== RENDER FOOD SAFETY =====================
function renderFoodSafety() {
  const body = document.getElementById('fs-body');
  if (!body) return;

  const categories = [...new Set(FOOD_SAFETY_ITEMS.map(i => i.category))];
  body.innerHTML = '';

  categories.forEach(cat => {
    const items = FOOD_SAFETY_ITEMS.filter(i => i.category === cat);
    body.innerHTML += `<div class="section-label">${cat}</div>`;
    items.forEach(item => {
      const state = foodSafetyData[item.id] || {};
      const isOk = state.status === 'ok';
      const isNo = state.status === 'not_ok';
      const note = state.note || '';
      body.innerHTML += `
        <div class="audit-item ${isOk?'ok':isNo?'not-ok':''}" id="item-${item.id}">
          <div class="audit-item-top">
            <div class="audit-text">
              <div class="item-header">
                <span class="item-label">${cat}</span>
              </div>
              <div class="item-desc">${item.text}</div>
              ${item.notes ? `<div class="item-notes"><span class="notes-icon">📋</span> ${item.notes}</div>` : ''}
              ${state.updatedBy ? `<div class="item-updater">✓ ${state.updatedBy}</div>` : ''}
            </div>
            <div class="toggle-group">
              <button class="toggle-btn ok-btn ${isOk?'selected':''}" onclick="setStatus('${item.id}','ok','fs')">✓</button>
              <button class="toggle-btn no-btn ${isNo?'selected':''}" onclick="setStatus('${item.id}','not_ok','fs')">✗</button>
            </div>
          </div>
          ${isNo ? `<textarea class="note-input" placeholder="Catatan temuan..." rows="2" onchange="setNote('${item.id}', this.value, 'fs')">${note}</textarea>` : ''}
        </div>`;
    });
  });
}

window.filterCategory = function(catId) {
  activeCatFilter = catId;
  renderChecklist();
};

// ===================== SET STATUS =====================
window.setStatus = function(itemId, status, type) {
  const data = type === 'fs' ? foodSafetyData : checklistData;
  if (!data[itemId]) data[itemId] = {};
  data[itemId].status = data[itemId].status === status ? null : status;
  data[itemId].updatedBy = currentUser;
  data[itemId].updatedAt = new Date().toISOString();
  if (status === 'ok') data[itemId].note = '';
  if (type === 'fs') {
    foodSafetyData = data;
    localStorage.setItem(`audit_fs_${todayDocId}`, JSON.stringify(foodSafetyData));
    renderFoodSafety();
  } else {
    checklistData = data;
    localStorage.setItem(`audit_sa_${todayDocId}`, JSON.stringify(checklistData));
    renderChecklist();
  }
  updateProgress();
  autoSaveDraft();
};

window.setNote = function(itemId, note, type) {
  const data = type === 'fs' ? foodSafetyData : checklistData;
  if (!data[itemId]) data[itemId] = {};
  data[itemId].note = note;
  if (type === 'fs') {
    foodSafetyData = data;
    localStorage.setItem(`audit_fs_${todayDocId}`, JSON.stringify(foodSafetyData));
  } else {
    checklistData = data;
    localStorage.setItem(`audit_sa_${todayDocId}`, JSON.stringify(checklistData));
  }
  autoSaveDraft();
};

let autoSaveTimer = null;
async function autoSaveDraft() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    if (!isOnline) return;
    try {
      await setDoc(doc(db, 'audits', todayDocId), {
        date: todayDocId, items: checklistData, foodSafety: foodSafetyData,
        lastUpdatedBy: currentUser, lastUpdated: serverTimestamp(), status: 'draft'
      }, { merge: true });
    } catch(e) { console.warn('Auto-save error:', e); }
  }, 1500);
}

// ===================== PROGRESS =====================
function updateProgress() {
  const allSA = AUDIT_CATEGORIES.flatMap(c => c.items);
  const filledSA = allSA.filter(i => checklistData[i.id]?.status).length;
  const filledFS = FOOD_SAFETY_ITEMS.filter(i => foodSafetyData[i.id]?.status).length;
  const total = allSA.length + FOOD_SAFETY_ITEMS.length;
  const filled = filledSA + filledFS;
  const pct = total > 0 ? Math.round((filled/total)*100) : 0;

  const ringPct = document.getElementById('ring-pct');
  const ringFill = document.getElementById('ring-fill');
  if (ringPct) ringPct.textContent = pct + '%';
  if (ringFill) ringFill.style.strokeDashoffset = 138.2 - (pct/100)*138.2;

  const submitCount = document.getElementById('submit-count');
  if (submitCount) submitCount.textContent = `${filled} dari ${total} item diisi`;

  const fsPct = document.getElementById('fs-ring-pct');
  const fsFill = document.getElementById('fs-ring-fill');
  if (fsPct) fsPct.textContent = Math.round((filledFS/FOOD_SAFETY_ITEMS.length)*100) + '%';
  if (fsFill) fsFill.style.strokeDashoffset = 138.2 - (filledFS/FOOD_SAFETY_ITEMS.length)*138.2;
}

// ===================== SUBMIT =====================
window.submitChecklist = async function() {
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> MENGIRIM...`;
  try {
    if (!isOnline) throw new Error('Tidak ada koneksi. Hubungkan ke internet lalu coba lagi.');
    await setDoc(doc(db, 'audits', todayDocId), {
      date: todayDocId, items: checklistData, foodSafety: foodSafetyData,
      submittedBy: currentUser, submittedAt: serverTimestamp(), status: 'submitted'
    }, { merge: true });
    await logActivity(currentUser, 'submit', `Laporan audit ${todayDocId} berhasil dikirim`);
    const allSA = AUDIT_CATEGORIES.flatMap(c => c.items);
    const filled = allSA.filter(i => checklistData[i.id]?.status).length + FOOD_SAFETY_ITEMS.filter(i => foodSafetyData[i.id]?.status).length;
    const issues = allSA.filter(i => checklistData[i.id]?.status === 'not_ok').length + FOOD_SAFETY_ITEMS.filter(i => foodSafetyData[i.id]?.status === 'not_ok').length;
    document.getElementById('modal-desc').innerHTML =
      `Dikirim oleh: <strong>${currentUser}</strong><br>${formatDate(new Date())}<br><br>✓ ${filled} item diverifikasi &nbsp;|&nbsp; ✗ ${issues} temuan`;
    document.getElementById('modal-success').classList.remove('hidden');
  } catch(e) { showToast('⚠ ' + e.message, 'error'); }
  btn.disabled = false;
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> KIRIM LAPORAN`;
};

window.closeModal = function() { document.getElementById('modal-success').classList.add('hidden'); };

// ===================== OFFLINE SYNC =====================
async function syncOfflineData() {
  const localSA = localStorage.getItem(`audit_sa_${todayDocId}`);
  const localFS = localStorage.getItem(`audit_fs_${todayDocId}`);
  if (!localSA && !localFS) return;
  try {
    await setDoc(doc(db, 'audits', todayDocId), {
      date: todayDocId,
      items: localSA ? JSON.parse(localSA) : {},
      foodSafety: localFS ? JSON.parse(localFS) : {},
      lastUpdatedBy: currentUser || 'system',
      lastUpdated: serverTimestamp(), status: 'draft'
    }, { merge: true });
    showToast('✓ Data offline berhasil disinkron', 'success');
  } catch(e) {}
}

// ===================== LOG =====================
async function logActivity(name, type, action) {
  try {
    await addDoc(collection(db, 'activity_logs'), { name, type, action, timestamp: serverTimestamp(), date: todayDocId });
  } catch(e) {}
}

// ===================== DASHBOARD =====================
async function loadDashboard() {
  const body = document.getElementById('dashboard-body');
  body.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Memuat data...</span></div>`;
  try {
    const snap = await getDoc(doc(db, 'audits', todayDocId));
    const todayData = snap.exists() ? snap.data() : {};
    const items = todayData.items || {};
    const fsItems = todayData.foodSafety || {};
    const allSA = AUDIT_CATEGORIES.flatMap(c => c.items);
    const totalSA = allSA.length, filledSA = allSA.filter(i => items[i.id]?.status).length;
    const totalFS = FOOD_SAFETY_ITEMS.length, filledFS = FOOD_SAFETY_ITEMS.filter(i => fsItems[i.id]?.status).length;
    const total = totalSA + totalFS, filled = filledSA + filledFS;
    const okCount = allSA.filter(i => items[i.id]?.status === 'ok').length + FOOD_SAFETY_ITEMS.filter(i => fsItems[i.id]?.status === 'ok').length;
    const notOkCount = allSA.filter(i => items[i.id]?.status === 'not_ok').length + FOOD_SAFETY_ITEMS.filter(i => fsItems[i.id]?.status === 'not_ok').length;
    const pct = total > 0 ? Math.round((filled/total)*100) : 0;

    const contributors = {};
    [...Object.values(items), ...Object.values(fsItems)].forEach(v => {
      if (v.updatedBy) {
        if (!contributors[v.updatedBy]) contributors[v.updatedBy] = { count: 0, lastTime: v.updatedAt };
        contributors[v.updatedBy].count++;
        if (v.updatedAt > contributors[v.updatedBy].lastTime) contributors[v.updatedBy].lastTime = v.updatedAt;
      }
    });

    let html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-label">PROGRESS HARI INI</div><div class="stat-value accent">${pct}%</div></div>
        <div class="stat-card"><div class="stat-label">TOTAL ITEM</div><div class="stat-value">${total}</div></div>
        <div class="stat-card"><div class="stat-label">SUDAH OK ✓</div><div class="stat-value green">${okCount}</div></div>
        <div class="stat-card"><div class="stat-label">TEMUAN ✗</div><div class="stat-value red">${notOkCount}</div></div>
      </div>
      <div class="section-title">PROGRESS PER KATEGORI</div>`;

    // Food Safety progress
    const fsPct = Math.round((filledFS/totalFS)*100);
    html += `<div class="cat-progress-item">
      <div class="cat-progress-top"><div class="cat-name">🍽 Food Safety</div><div class="cat-pct">${fsPct}%</div></div>
      <div class="progress-bar-bg"><div class="progress-bar-fill ${fsPct<40?'low':fsPct<70?'mid':''}" style="width:${fsPct}%"></div></div>
    </div>`;

    AUDIT_CATEGORIES.forEach(cat => {
      const catFilled = cat.items.filter(i => items[i.id]?.status).length;
      const catPct = Math.round((catFilled/cat.items.length)*100);
      const totalPts = cat.items.reduce((s,i) => s+i.points, 0);
      html += `<div class="cat-progress-item">
        <div class="cat-progress-top">
          <div class="cat-name">${cat.name}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:10px;color:var(--text3)">${totalPts}pts</span>
            <div class="cat-pct">${catPct}%</div>
          </div>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar-fill ${catPct<40?'low':catPct<70?'mid':''}" style="width:${catPct}%"></div></div>
      </div>`;
    });

    // Issues
    const saIssues = allSA.filter(i => items[i.id]?.status === 'not_ok');
    const fsIssues = FOOD_SAFETY_ITEMS.filter(i => fsItems[i.id]?.status === 'not_ok');
    if (saIssues.length + fsIssues.length > 0) {
      html += `<div class="section-title">TEMUAN (${saIssues.length + fsIssues.length})</div>`;
      saIssues.forEach(item => {
        const catName = AUDIT_CATEGORIES.find(c => c.items.find(i => i.id === item.id))?.name || '';
        const note = items[item.id]?.note || '';
        html += `<div class="issue-item"><div class="issue-cat">${catName} · ${item.label} · ${item.points}pts</div><div class="issue-text">${item.text}</div>${note?`<div class="issue-note">📝 ${note}</div>`:''}</div>`;
      });
      fsIssues.forEach(item => {
        const note = fsItems[item.id]?.note || '';
        html += `<div class="issue-item"><div class="issue-cat">Food Safety · ${item.category}</div><div class="issue-text">${item.text}</div>${note?`<div class="issue-note">📝 ${note}</div>`:''}</div>`;
      });
    }

    const contribList = Object.entries(contributors);
    if (contribList.length > 0) {
      html += `<div class="section-title">KONTRIBUTOR HARI INI</div>`;
      contribList.sort((a,b) => b[1].count - a[1].count).forEach(([name, info]) => {
        html += `<div class="contributor-item">
          <div class="contributor-avatar">${name[0].toUpperCase()}</div>
          <div class="contributor-info"><div class="contributor-name">${name}</div><div class="contributor-time">${info.lastTime ? new Date(info.lastTime).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-'}</div></div>
          <div class="contributor-count">${info.count} item</div>
        </div>`;
      });
    }

    body.innerHTML = html;
  } catch(e) {
    body.innerHTML = `<div class="empty-state">Gagal memuat data. Periksa koneksi internet.</div>`;
  }
}

// ===================== LOG SCREEN =====================
async function loadLog() {
  const body = document.getElementById('log-body');
  body.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Memuat log...</span></div>`;
  try {
    const snap = await getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50)));
    if (snap.empty) { body.innerHTML = `<div class="empty-state">Belum ada aktivitas.</div>`; return; }
    let html = '';
    snap.docs.forEach((d, i) => {
      const data = d.data();
      const dotClass = data.type === 'submit' ? 'submit' : data.type === 'draft' ? 'draft' : 'login';
      html += `<div class="log-item">
        <div class="log-line"><div class="log-dot ${dotClass}"></div>${i < snap.docs.length-1 ? '<div class="log-stem"></div>' : ''}</div>
        <div class="log-info"><div class="log-name">${data.name||'-'}</div><div class="log-action">${data.action||'-'}</div><div class="log-time">${formatTime(data.timestamp)}</div></div>
      </div>`;
    });
    body.innerHTML = html;
  } catch(e) { body.innerHTML = `<div class="empty-state">Gagal memuat log.</div>`; }
}

// ===================== NAVIGATION =====================
window.showScreen = function(screen) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`view-${screen}`).classList.add('active');
  document.getElementById(`nav-${screen}`)?.classList.add('active');
  activeView = screen;
  const today = formatDate(new Date());
  if (screen === 'checklist') {
    document.getElementById('checklist-date').textContent = today;
  } else if (screen === 'foodsafety') {
    document.getElementById('fs-date').textContent = today;
    renderFoodSafety();
    updateProgress();
  } else if (screen === 'dashboard') {
    document.getElementById('dashboard-date').textContent = today;
    loadDashboard();
  } else if (screen === 'log') {
    loadLog();
  }
};

function updateOnlineStatus() {
  const badge = document.getElementById('offline-badge');
  if (!badge) return;
  badge.classList.toggle('online', isOnline);
  badge.querySelector('span').textContent = isOnline ? 'Online' : 'Offline';
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('hidden'), 3500);
}

document.getElementById('checklist-date').textContent = formatDate(new Date());
updateOnlineStatus();
startRealtimeSync();
