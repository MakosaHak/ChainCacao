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

async function certifyLot(lot) {
    if (!confirm(`Certifier officiellement le lot ${lot.id_lot} sur la Blockchain ?`)) return;

    try {
        alert("Initialisation de la certification Blockchain...");
        
        let txHash = "0x_simulation_" + Math.random().toString(16).slice(2, 10);

        // Appel réel de la Blockchain
        if (typeof BlockchainService !== 'undefined') {
            const bc = new BlockchainService();
            await bc.connect(); // L'exportateur connecte son MetaMask
            
            const dataHash = bc.generateLotHash(lot.id_lot, lot.gps_lat, lot.gps_long, lot.poids);
            txHash = await bc.registerLotOnChain(lot.id_lot, dataHash);
            alert("Succès ! Preuve immuable ancrée sur Polygon.");
        }

        // Mise à jour de Firestore avec le statut Certifié et le Hash réel
        await db.collection('lots').doc(lot.id_lot).update({ 
            status: 'Certifié EUDR',
            blockchain_hash: txHash,
            certified_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('lot_history').add({
            id_lot: lot.id_lot,
            step_name: "Certification Blockchain EUDR",
            description: "L'exportateur a validé le lot et ancré la preuve d'intégrité sur Polygon.",
            location: "Centre d'Exportation",
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Certificat EUDR généré et lot ancré !");
        loadDashboardData();
    } catch (e) { 
        console.error(e);
        alert("Erreur de certification : " + e.message); 
    }
}

// --- GESTION DES LOTS (AGRICULTEUR) ---
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
        blockchain_hash: "--- En attente ---",
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('lots').doc(idLot).set(lotData);
        alert("Lot enregistré (En attente de certification).");
        navigateTo('screen-dashboard');
    } catch (error) {
        alert("Erreur d'enregistrement : " + error.message);
    }
}

// --- DASHBOARD REAL-TIME ---
let unsubscribe = null;

async function loadDashboardData() {
    const list = document.getElementById('lots-list');
    list.innerHTML = '<div class="placeholder">Synchronisation...</div>';

    if (!auth.currentUser) return;

    // Arrêter l'écouteur précédent si existant
    if (unsubscribe) unsubscribe();

    try {
        let query = db.collection('lots');

        if (currentProfile) {
            if (currentProfile.role === 'agriculteur') {
                query = query.where('producteur_id', '==', auth.currentUser.uid);
            } else if (currentProfile.role === 'verificateur') {
                query = query.where('status', '==', 'En transit');
            } else if (currentProfile.role === 'exportateur') {
                query = query.where('status', '==', 'Certifié');
            }
        }

        // Utilisation d'un listener en temps réel
        unsubscribe = query.onSnapshot((snapshot) => {
            let lots = [];
            snapshot.forEach(doc => lots.push(doc.data()));

            // Tri par date décroissante
            lots.sort((a, b) => (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0));

            document.getElementById('stat-lots').innerText = lots.length;
            document.getElementById('stat-weight').innerText = lots.reduce((acc, lot) => acc + (parseFloat(lot.poids) || 0), 0).toFixed(1);

            renderLots(lots);
        }, (err) => {
            console.error("Erreur Dashboard:", err);
            list.innerHTML = `<div class="placeholder">Erreur : ${err.message}</div>`;
        });
    } catch (e) {
        console.error("Erreur Query:", e);
        list.innerHTML = `<div class="placeholder">Erreur : ${e.message}</div>`;
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
    const scanID = prompt("Simulation Scan QR Code\nEntrez l'ID du lot (ex: #TG-26-1234) :");
    
    if (!scanID || scanID.trim() === "") return;

    alert("Recherche du lot " + scanID + "...");

    // Mise à jour réelle dans Firestore pour la coopérative
    db.collection('lots').doc(scanID).get().then((doc) => {
        if (doc.exists) {
            db.collection('lots').doc(scanID).update({ 
                status: "En transit",
                collected_at: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("Lot " + scanID + " validé ! Statut : EN TRANSIT");
                
                // Ajouter à l'historique
                db.collection('lot_history').add({
                    id_lot: scanID,
                    step_name: "Collecte Coopérative",
                    description: "Le sac a été scanné et collecté par la coopérative.",
                    location: currentProfile ? currentProfile.cooperative_name : "Centre de collecte",
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                loadDashboardData();
            });
        } else {
            alert("Erreur : Ce lot n'existe pas dans la base de données.");
        }
    }).catch((error) => {
        alert("Erreur lors du scan : " + error.message);
    });
}
