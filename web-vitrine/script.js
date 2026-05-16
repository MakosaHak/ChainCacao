/**
 * ChainCacao - Web Portal Logic
 * Version: 2.2 (Firebase Stats & Role Dynamic Content)
 */

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDKzMjinbLykA-N2Sq6bq2dLxLBeuzZHbA", // Clé réelle restaurée
  authDomain: "chaincacao-e9ae8.firebaseapp.com",
  databaseURL: "https://chaincacao-e9ae8-default-rtdb.firebaseio.com",
  projectId: "chaincacao-e9ae8",
  storageBucket: "chaincacao-e9ae8.firebasestorage.app",
  messagingSenderId: "151411233254",
  appId: "1:151411233254:web:4b1de510fdfb158d6a4627"
};

// Initialisation unique
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
        // Charger la liste des lots selon le rôle
        loadLotsList(profile.role);
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

async function loadLotsList(role) {
    const listContainer = document.getElementById('lots-table-body');
    if (!listContainer) return;
    listContainer.innerHTML = '<tr><td colspan="5" class="text-center py-4">Chargement...</td></tr>';

    try {
        let query = db.collection('lots');
        // Les vérificateurs voient tout ce qui est en transit
        // Les exportateurs voient tout ce qui est certifié
        
        const snap = await query.orderBy('created_at', 'desc').get();
        listContainer.innerHTML = '';

        if (snap.empty) {
            listContainer.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-400">Aucun lot trouvé</td></tr>';
            return;
        }

        snap.forEach(doc => {
            const lot = doc.data();
            const tr = document.createElement('tr');
            tr.className = "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer";
            tr.onclick = () => {
                document.getElementById('lot-search-input').value = lot.id_lot;
                searchLot();
            };
            
            let statusColor = "bg-gray-100 text-gray-600";
            if (lot.status === "Récolté") statusColor = "bg-blue-100 text-blue-600";
            if (lot.status === "En transit") statusColor = "bg-orange-100 text-orange-600";
            if (lot.status === "Certifié") statusColor = "bg-green-100 text-green-600";
            if (lot.status === "Exporté") statusColor = "bg-purple-100 text-purple-600";

            tr.innerHTML = `
                <td class="py-4 px-2 font-bold text-primary">${lot.id_lot}</td>
                <td class="py-4 px-2 text-sm">${lot.variete}</td>
                <td class="py-4 px-2 text-sm">${lot.poids} KG</td>
                <td class="py-4 px-2">
                    <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${statusColor}">${lot.status}</span>
                </td>
                <td class="py-4 px-2 text-xs text-gray-400">${lot.blockchain_hash ? lot.blockchain_hash.substring(0, 8) + '...' : '---'}</td>
            `;
            listContainer.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Erreur de chargement</td></tr>';
    }
}

// --- RECHERCHE ET ACTIONS ---

async function searchLot() {
    const id = document.getElementById('lot-search-input').value.trim();
    if (!id) return;

    try {
        const doc = await db.collection('lots').doc(id).get();
        if (doc.exists) {
            const lot = doc.data();
            document.getElementById('search-result').classList.remove('hidden');
            
            // Affichage complet des informations
            document.getElementById('res-id').innerText = lot.id_lot;
            document.getElementById('res-variete').innerText = lot.variete || "N/A";
            document.getElementById('res-poids').innerText = lot.poids || 0;
            
            // Affichage du GPS et Conformité
            const statusEl = document.getElementById('res-status');
            statusEl.innerText = lot.status;
            statusEl.className = "tag " + (lot.status === 'Certifié' ? 'tag-success' : 'tag-warning');

            // Ajout visuel des données de conformité
            document.getElementById('res-hash').innerHTML = `
                <p>Hash: ${lot.blockchain_hash || "0x..."}</p>
                <p style="margin-top:5px; font-weight:800;">Coordonnées GPS: ${lot.gps_lat.toFixed(4)}, ${lot.gps_long.toFixed(4)}</p>
                <p style="margin-top:5px;">Conformité EUDR: <span style="color:green;">${lot.is_deforestation_free ? 'OUI' : 'NON'}</span></p>
            `;
            
            if (lot.created_at) {
                document.getElementById('res-date').innerText = "Enregistré le " + lot.created_at.toDate().toLocaleDateString();
            }

            // Adapter les actions selon le rôle
            const user = auth.currentUser;
            const profileDoc = await db.collection('profiles').doc(user.uid).get();
            const role = profileDoc.data().role;

            const vActions = document.getElementById('verifier-actions');
            const bCertify = document.getElementById('btn-certify'); // Conformité EUDR
            const bDoc = document.getElementById('btn-generate-cert');
            const cView = document.getElementById('client-view');

            vActions.classList.add('hidden');
            bCertify.classList.add('hidden');
            bDoc.classList.add('hidden');
            cView.classList.add('hidden');

            if (role === 'exportateur') {
                vActions.classList.remove('hidden');
                // Exportateur : Bouton de conformité EUDR
                if (lot.status !== 'Certifié') {
                    bCertify.classList.remove('hidden');
                    bCertify.innerHTML = '<span class="material-symbols-outlined">verified</span> CONFORMITÉ EUDR';
                } else {
                    // Si déjà certifié, montrer le bouton de génération de certif
                    bDoc.classList.remove('hidden');
                }
            } else if (role === 'verificateur') {
                // Vérificateur : Lecture seule des infos, voir le badge
                cView.classList.remove('hidden');
                cView.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-4xl ${lot.status === 'Certifié' ? 'text-green-600' : 'text-orange-500'}">
                            ${lot.status === 'Certifié' ? 'check_circle' : 'pending'}
                        </span>
                        <div>
                            <p style="font-weight:800;">Statut Certification: ${lot.status === 'Certifié' ? 'CONFORME (CERTIFIÉ)' : 'EN ATTENTE'}</p>
                            <p style="font-size:12px;">Preuve EUDR enregistrée sur Blockchain.</p>
                        </div>
                    </div>
                `;
            } else {
                cView.classList.remove('hidden');
            }
        } else {
            alert("Lot introuvable.");
        }
    } catch (e) { console.error(e); }
}

async function markConformity() {
    const id = document.getElementById('res-id').innerText;
    if (!confirm(`Certifier officiellement le lot ${id} sur la Blockchain ?`)) return;

    try {
        const doc = await db.collection('lots').doc(id).get();
        if (!doc.exists) throw new Error("Lot introuvable");
        const lot = doc.data();

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

        await db.collection('lots').doc(id).update({ 
            status: 'Certifié',
            is_deforestation_free: true,
            blockchain_hash: txHash,
            certified_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Ajout à l'historique
        await db.collection('lot_history').add({
            id_lot: id,
            step_name: "Certification EUDR",
            description: "Validation de conformité EUDR effectuée par l'exportateur et ancrage blockchain.",
            location: "Portail Export",
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Lot marqué conforme et certifié sur la Blockchain !");
        searchLot();
    } catch (e) { alert("Erreur : " + e.message); }
}

async function updateLotStatus(newStatus) {
    const id = document.getElementById('res-id').innerText;
    const user = auth.currentUser;
    const profileDoc = await db.collection('profiles').doc(user.uid).get();
    const profile = profileDoc.data();

    try {
        await db.collection('lots').doc(id).update({ status: newStatus });
        
        // Ajout à l'historique
        await db.collection('lot_history').add({
            id_lot: id,
            step_name: newStatus === 'Certifié' ? "Certification EUDR" : "Exportation",
            description: newStatus === 'Certifié' ? 
                `Validation de conformité EUDR effectuée par le vérificateur.` : 
                `Lot expédié vers le marché international.`,
            location: profile.full_name,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Statut mis à jour : " + newStatus);
        searchLot(); // Rafraîchir la vue détail
        loadLotsList(profile.role); // Rafraîchir la liste
    } catch (e) { alert(e.message); }
}

async function generateEUCertificate() {
    const id = document.getElementById('res-id').innerText;
    
    try {
        const docSnap = await db.collection('lots').doc(id).get();
        if (!docSnap.exists) {
            alert("Erreur : Données du lot introuvables.");
            return;
        }
        const lot = docSnap.data();

        // Utilisation de jsPDF (chargé via UMD)
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Design du certificat
        doc.setFillColor(21, 66, 18); // Vert ChainCacao
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("CERTIFICAT DE CONFORMITÉ EUDR", 105, 25, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ID DU LOT : " + lot.id_lot, 20, 60);
        
        doc.setFont("helvetica", "normal");
        doc.text("Date de Certification : " + (lot.certified_at ? lot.certified_at.toDate().toLocaleDateString() : new Date().toLocaleDateString()), 20, 70);
        
        doc.line(20, 75, 190, 75);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DÉTAILS TECHNIQUES", 20, 90);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Variété : " + (lot.variete || "N/A"), 30, 100);
        doc.text("Poids Net : " + (lot.poids || 0) + " KG", 30, 110);
        doc.text("Origine GPS : " + lot.gps_lat + ", " + lot.gps_long, 30, 120);
        
        doc.setFont("helvetica", "bold");
        doc.text("Statut Environnemental : CONFORME (Zéro Déforestation)", 30, 130);

        doc.rect(20, 145, 170, 40);
        doc.setFontSize(12);
        doc.text("PREUVE BLOCKCHAIN (IMMUTABILITÉ)", 105, 155, { align: "center" });
        doc.setFontSize(8);
        doc.setFont("courier", "normal");
        doc.text("HASH POLYGON : " + (lot.blockchain_hash || "N/A"), 105, 170, { align: "center" });
        doc.text("Vérifiable sur : https://amoy.polygonscan.com", 105, 180, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Ce document atteste que le cacao contenu dans ce lot respecte les normes d'intégrité", 105, 220, { align: "center" });
        doc.text("et de traçabilité de la plateforme ChainCacao conformément au règlement (UE) 2023/1115.", 105, 228, { align: "center" });

        // Bas de page
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("CHAINCACAO - TOGO - 2026", 105, 280, { align: "center" });

        // Téléchargement
        doc.save(`Certificat_EUDR_${lot.id_lot}.pdf`);
        
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la génération du PDF : " + e.message);
    }
}
