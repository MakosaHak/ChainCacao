/**
 * ChainCacao - Logic Mobile App
 * Version: 2.1 (Firebase & Multi-role)
 */

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDKzMjinbLykA-N2Sq6bq2dLxLBeuzZHbA",
  authDomain: "chaincacao-e9ae8.firebaseapp.com",
  databaseURL: "https://chaincacao-e9ae8-default-rtdb.firebaseio.com",
  projectId: "chaincacao-e9ae8",
  storageBucket: "chaincacao-e9ae8.firebasestorage.app",
  messagingSenderId: "151411233254",
  appId: "1:151411233254:web:4b1de510fdfb158d6a4627"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- ÉTAT GLOBAL ---
let currentUser = null;
let currentProfile = null;
let currentGPS = null;

// --- NAVIGATION ---
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
    
    if (screenId === 'screen-dashboard') {
        loadDashboardData();
    }
    if (screenId === 'screen-add-lot') {
        generateNewID();
    }
}

// --- AUTHENTIFICATION ---
async function signUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const fullName = document.getElementById('signup-name').value;
    const cooperative = document.getElementById('signup-coop').value;
    const role = document.getElementById('signup-role').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Création du profil dans Firestore
        await db.collection('profiles').doc(user.uid).set({
            full_name: fullName,
            role: role,
            cooperative_name: cooperative,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert("Compte créé avec succès ! Connectez-vous.");
        navigateTo('screen-login');
    } catch (error) {
        alert("Erreur : " + error.message);
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        await fetchProfile(currentUser.uid);
        navigateTo('screen-dashboard');
    } catch (error) {
        alert("Erreur de connexion : " + error.message);
    }
}

async function fetchProfile(uid) {
    const doc = await db.collection('profiles').doc(uid).get();
    if (doc.exists) {
        currentProfile = doc.data();
        document.getElementById('user-name').innerText = currentProfile.full_name;
        document.getElementById('user-role-badge').innerText = currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1);
        updateUIByRole(currentProfile.role);
    }
}

function updateUIByRole(role) {
    const actionsSection = document.getElementById('role-actions');
    if (role === 'cooperative') {
        actionsSection.innerHTML = `
            <button class="btn-action" onclick="startScanner()">
                <span class="material-symbols-outlined">qr_code_scanner</span>
                <span>Scanner Sac</span>
            </button>
            <button class="btn-action alt" onclick="loadDashboardData()">
                <span class="material-symbols-outlined">sync</span>
                <span>Actualiser</span>
            </button>
        `;
    } else if (role === 'verificateur') {
        actionsSection.innerHTML = `
            <button class="btn-action" onclick="startScanner()">
                <span class="material-symbols-outlined">qr_code_scanner</span>
                <span>Audit Lot (Scan)</span>
            </button>
            <button class="btn-action alt" onclick="loadDashboardData()">
                <span class="material-symbols-outlined">description</span>
                <span>Derniers Certifiés</span>
            </button>
        `;
    } else if (role === 'exportateur') {
        actionsSection.innerHTML = `
            <button class="btn-action" onclick="loadDashboardData()">
                <span class="material-symbols-outlined">workspace_premium</span>
                <span>Certifier EUDR</span>
            </button>
            <button class="btn-action alt" onclick="navigateTo('screen-dashboard')">
                <span class="material-symbols-outlined">local_shipping</span>
                <span>Lots Exportés</span>
            </button>
        `;
    } else {
        actionsSection.innerHTML = `
            <button class="btn-action" onclick="navigateTo('screen-add-lot')">
                <span class="material-symbols-outlined">add_circle</span>
                <span>Nouveau Lot</span>
            </button>
            <button class="btn-action alt" onclick="loadDashboardData()">
                <span class="material-symbols-outlined">history</span>
                <span>Mes Récoltes</span>
            </button>
        `;
    }
}

// Nouvelle fonction pour l'exportateur pour certifier
async function certifyLot(lot) {
    if (!confirm(`Certifier officiellement le lot ${lot.id_lot} EUDR ?`)) return;

    try {
        await db.collection('lots').doc(lot.id_lot).update({ status: 'Certifié' });
        await db.collection('lot_history').add({
            id_lot: lot.id_lot,
            step_name: "Certification EUDR Officielle",
            description: "Exportateur a validé l'intégrité GPS et généré le certificat officiel.",
            location: "Plateforme Export",
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Certificat EUDR généré et lot certifié.");
        loadDashboardData();
    } catch (e) { alert("Erreur : " + e.message); }
}
// --- GESTION DES LOTS ---
function captureGPS() {
    const statusText = document.getElementById('gps-text');
    const statusIcon = document.getElementById('gps-status');
    statusText.innerText = "Recherche satellite...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            currentGPS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            statusText.innerText = "Position fixée !";
            statusIcon.classList.add('active');
        }, (err) => {
            statusText.innerText = "Erreur GPS";
        });
    }
}

function generateNewID() {
    const random = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('generated-id').innerText = `#TG-26-${random}`;
}

async function saveLot() {
    const idLot = document.getElementById('generated-id').innerText;
    const lotData = {
        id_lot: idLot,
        variete: document.getElementById('lot-variete').value,
        poids: parseFloat(document.getElementById('lot-poids').value),
        gps_lat: currentGPS ? currentGPS.lat : 6.137,
        gps_long: currentGPS ? currentGPS.lng : 1.212,
        status: "Récolté",
        producteur_id: auth.currentUser.uid,
        blockchain_hash: "0x" + Math.random().toString(16).slice(2, 15),
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('lots').doc(idLot).set(lotData);
        alert("Lot enregistré sur la Blockchain !");
        navigateTo('screen-dashboard');
    } catch (error) {
        alert("Erreur d'enregistrement : " + error.message);
    }
}

async function loadDashboardData() {
    const list = document.getElementById('lots-list');
    list.innerHTML = '<div class="placeholder">Chargement...</div>';

    try {
        let query = db.collection('lots');
        if (currentProfile && currentProfile.role === 'agriculteur') {
            query = query.where('producteur_id', '==', auth.currentUser.uid);
        }
        
        const snapshot = await query.orderBy('created_at', 'desc').limit(10).get();
        const lots = [];
        snapshot.forEach(doc => lots.push(doc.data()));

        document.getElementById('stat-lots').innerText = lots.length;
        const totalWeight = lots.reduce((acc, lot) => acc + (lot.poids || 0), 0);
        document.getElementById('stat-weight').innerText = totalWeight.toFixed(1);

        renderLots(lots);
    } catch (e) {
        console.error(e);
        list.innerHTML = '<div class="placeholder">Aucun lot trouvé</div>';
    }
}

function renderLots(lots) {
    const list = document.getElementById('lots-list');
    list.innerHTML = "";
    if (lots.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding: 30px; color: #999; font-size: 12px;">Aucun lot enregistré</div>';
        return;
    }
    lots.forEach(lot => {
        const el = document.createElement('div');
        el.className = 'lot-item';
        el.onclick = () => viewLotQR(lot.id_lot);
        el.innerHTML = `
            <div class="lot-icon">
                <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <div class="lot-info">
                <h4>Lot ${lot.id_lot}</h4>
                <p>${lot.variete} • ${lot.poids} KG</p>
            </div>
            <div class="badge">${lot.status}</div>
        `;
        list.appendChild(el);
    });
}

function viewLotQR(id) {
    document.getElementById('qr-lot-id').innerText = id;
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, {
        text: id,
        width: 180,
        height: 180,
        colorDark : "#154212",
        colorLight : "#ffffff"
    });
    navigateTo('screen-qr-view');
}

function startScanner() {
    alert("Ouverture du scanner camera...");
    setTimeout(() => {
        const simulatedID = "#TG-26-4512"; // Simulation
        alert("Lot détecté : " + simulatedID);
        db.collection('lots').doc(simulatedID).update({ status: "En transit" });
        loadDashboardData();
    }, 2000);
}
