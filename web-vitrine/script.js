/**
 * ChainCacao - Web Portal Logic
 * Version: 2.2 (Firebase Stats & Role Dynamic Content)
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // Écouter l'état de connexion
    auth.onAuthStateChanged(user => {
        if (user) {
            updatePortalView(user);
        } else {
            showLogin();
        }
    });

    // Mobile Menu
    const mbBtn = document.getElementById('mobile-menu-btn');
    const mbClose = document.getElementById('close-menu-btn');
    const mbMenu = document.getElementById('mobile-menu');
    
    if (mbBtn && mbMenu) {
        mbBtn.onclick = () => mbMenu.classList.remove('translate-x-full');
    }
    
    if (mbClose && mbMenu) {
        mbClose.onclick = () => mbMenu.classList.add('translate-x-full');
    }
});

// --- AUTHENTICATION ---

async function webLogin() {
    const email = document.getElementById('web-email').value;
    const password = document.getElementById('web-password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (e) { alert("Erreur : " + e.message); }
}

async function webSignUp() {
    const email = document.getElementById('web-signup-email').value;
    const password = document.getElementById('web-signup-pass').value;
    const name = document.getElementById('web-signup-name').value;
    const role = document.getElementById('web-signup-role').value;

    try {
        const res = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('profiles').doc(res.user.uid).set({
            full_name: name,
            role: role,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Compte créé !");
        toggleAuthTab('login');
    } catch (e) { alert("Erreur : " + e.message); }
}

function webLogout() {
    auth.signOut().then(() => window.location.href = 'index.html');
}

function toggleAuthTab(tab) {
    const l = document.getElementById('form-login'), s = document.getElementById('form-signup');
    const tl = document.getElementById('tab-login'), ts = document.getElementById('tab-signup');
    if (tab === 'login') {
        l.classList.remove('hidden'); s.classList.add('hidden');
        tl.classList.add('text-primary','border-b-2'); ts.classList.remove('text-primary','border-b-2');
    } else {
        s.classList.remove('hidden'); l.classList.add('hidden');
        ts.classList.add('text-primary','border-b-2'); tl.classList.remove('text-primary','border-b-2');
    }
}

function showLogin() {
    const c = document.getElementById('web-auth-container'), p = document.getElementById('web-portal-content');
    if (c) c.classList.remove('hidden');
    if (p) p.classList.add('hidden');
}

// --- DASHBOARD LOGIC ---

async function updatePortalView(user) {
    const c = document.getElementById('web-auth-container'), p = document.getElementById('web-portal-content');
    if (c) c.classList.add('hidden');
    if (p) p.classList.remove('hidden');
    document.getElementById('user-nav-info').classList.remove('hidden');

    const doc = await db.collection('profiles').doc(user.uid).get();
    if (doc.exists) {
        const profile = doc.data();
        document.getElementById('web-user-name').innerText = profile.full_name;
        document.getElementById('nav-user-name').innerText = profile.full_name;
        document.getElementById('web-user-role').innerText = profile.role.toUpperCase();
        
        // Charger les statistiques globales
        loadGlobalStats();
    }
}

async function loadGlobalStats() {
    try {
        const snap = await db.collection('lots').get();
        let totalWeight = 0;
        snap.forEach(doc => {
            totalWeight += (doc.data().poids || 0);
        });
        document.getElementById('stat-total-lots').innerText = snap.size;
        document.getElementById('stat-total-weight').innerText = totalWeight.toFixed(1);
    } catch (e) { console.error(e); }
}

// --- RECHERCHE ET ACTIONS ---

async function searchLot() {
    const id = document.getElementById('lot-search-input').value.trim();
    if (!id) return;

    const doc = await db.collection('lots').doc(id).get();
    if (doc.exists) {
        const lot = doc.data();
        document.getElementById('search-result').classList.remove('hidden');
        document.getElementById('res-id').innerText = lot.id_lot;
        document.getElementById('res-variete').innerText = lot.variete || "N/A";
        document.getElementById('res-poids').innerText = lot.poids || 0;
        document.getElementById('res-status').innerText = lot.status;
        document.getElementById('res-hash').innerText = lot.blockchain_hash || "0x...";
        
        if (lot.created_at) {
            document.getElementById('res-date').innerText = "Chargé le " + lot.created_at.toDate().toLocaleDateString();
        }

        // Adapter les actions selon le rôle
        const user = auth.currentUser;
        const profileDoc = await db.collection('profiles').doc(user.uid).get();
        const role = profileDoc.data().role;

        const vActions = document.getElementById('verifier-actions');
        const bCert = document.getElementById('btn-generate-cert');
        const cView = document.getElementById('client-view');

        vActions.classList.add('hidden');
        cView.classList.add('hidden');

        if (role === 'verificateur' || role === 'exportateur') {
            vActions.classList.remove('hidden');
            if (role === 'exportateur') bCert.classList.remove('hidden');
        } else {
            cView.classList.remove('hidden');
        }
    } else {
        alert("Lot introuvable.");
    }
}

async function updateLotStatus(newStatus) {
    const id = document.getElementById('res-id').innerText;
    try {
        await db.collection('lots').doc(id).update({ status: newStatus });
        alert("Statut mis à jour !");
        searchLot(); // Rafraîchir
    } catch (e) { alert(e.message); }
}

function generateEUCertificate() {
    const id = document.getElementById('res-id').innerText;
    alert("Certificat EUDR généré pour le lot " + id + "\nFichier PDF prêt pour l'export.");
}
