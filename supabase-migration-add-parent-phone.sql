-- Migration: Ajouter le numéro de téléphone des parents
-- Date: 2 octobre 2025
-- Description: Ajoute le champ parent_phone à la table students pour l'envoi de SMS via Twilio

-- Ajouter la colonne parent_phone
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);

-- Ajouter un commentaire descriptif
COMMENT ON COLUMN students.parent_phone IS 'Numéro de téléphone du parent au format international (ex: +33612345678)';

-- Créer un index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone); 