🍫 ChainCacao - Système de Traçabilité (Phase 2 - Demi-Finale)
📋 Contexte du Projet
ChainCacao est une solution de confiance pour la filière cacao au Togo, conçue par l'équipe TG 26. Le but est de garantir la non-déforestation (Conformité EUDR) et la juste rémunération des producteurs via la technologie Blockchain.

📂 Structure des Dossiers
/mobile-app : Interface HTML/JS (Maquettes transformées en code) destinée aux agriculteurs pour la saisie terrain.

/web-vitrine : Site web institutionnel incluant le portail de vérification publique.

🛠️ Mission : Rendre le système dynamique avec Supabase
L'objectif est d'utiliser Supabase comme "pont" pour que les données saisies sur le mobile apparaissent instantanément sur le site web.

1. Configuration de la Base de Données (Supabase)
Créer une table nommée lots avec les colonnes suivantes :

id_lot (Text, Primary Key) : Ex: #TG-26-001.

variete (Text) : Criollo, Forastero ou Trinitario.

poids (Float) : Quantité récoltée en KG.

gps_lat & gps_long (Float) : Coordonnées récupérées via l'API Geolocation.

status (Text) : "Récolté", "En transit" ou "Certifié".

created_at (Timestamp).

2. Développement de l'App Mobile (/mobile-app)
Enregistrement : Connecter le formulaire pour qu'un clic sur "Enregistrer" envoie les données vers la table lots de Supabase.

Géolocalisation : Utiliser navigator.geolocation pour remplir les champs de coordonnées lors de la saisie.

Transfert : Ajouter une fonction pour mettre à jour le champ status lors du passage de l'agriculteur à la coopérative.

3. Développement du Portail Web (/web-vitrine)
Barre de Recherche : Intégrer un champ de saisie d'ID dans l'onglet "Vérification" (ou via le menu "La Maquette" actuel).

Affichage des Preuves : Faire une requête SELECT sur Supabase pour afficher les détails du lot (Poids, Origine, Date).

Cartographie : Utiliser une bibliothèque comme Leaflet.js pour placer un marqueur sur une carte avec les coordonnées GPS du lot.

💡 Note Stratégique pour la Demi-Finale
Blockchain : Pour cette phase, les données sont stockées sur Supabase. La preuve blockchain est représentée par un champ blockchain_hash généré pour simuler l'ancrage futur sur Polygon.