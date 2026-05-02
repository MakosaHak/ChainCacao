-- Extension pour la gestion des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Profils (utilisateurs)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT CHECK (role IN ('agriculteur', 'cooperative', 'exportateur', 'verificateur')),
    cooperative_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Lots (enrichie)
CREATE TABLE lots (
    id_lot TEXT PRIMARY KEY, -- Ex: #TG-26-001
    producteur_id UUID REFERENCES profiles(id),
    variete TEXT NOT NULL CHECK (variete IN ('Criollo', 'Forastero', 'Trinitario')),
    poids FLOAT NOT NULL CHECK (poids > 0),
    gps_lat FLOAT NOT NULL,
    gps_long FLOAT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Récolté' CHECK (status IN ('Récolté', 'En transit', 'Certifié', 'Exporté')),
    blockchain_hash TEXT,
    polygonscan_url TEXT,
    is_deforestation_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Historique (L'Odyssée du Cacao)
CREATE TABLE lot_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_lot TEXT REFERENCES lots(id_lot) ON DELETE CASCADE,
    step_name TEXT NOT NULL, -- Ex: 'Récolte Manuelle', 'Fermentation', etc.
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_history ENABLE ROW LEVEL SECURITY;

-- Politiques simples pour le développement (à affiner en production)
CREATE POLICY "Profils consultables par tous" ON profiles FOR SELECT USING (true);
CREATE POLICY "Chacun modifie son propre profil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lots consultables par tous" ON lots FOR SELECT USING (true);
CREATE POLICY "Agriculteurs peuvent créer des lots" ON lots FOR INSERT WITH CHECK (true);
CREATE POLICY "Mise à jour par coopérative/exportateur" ON lots FOR UPDATE USING (true);
CREATE POLICY "Historique consultable par tous" ON lot_history FOR SELECT USING (true);
CREATE POLICY "Historique modifiable par tous" ON lot_history FOR INSERT WITH CHECK (true);
