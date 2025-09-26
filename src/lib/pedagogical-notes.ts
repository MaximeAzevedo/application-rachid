// Système de gestion des notes pédagogiques avec Supabase
import { supabase } from './supabase';

export interface PedagogicalNote {
  id: string;
  student_id: string;
  teacher_id: string;
  note_type: 'behavior' | 'progress' | 'difficulty' | 'observation' | 'general';
  content: string;
  date: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  student_id: string;
  note_type: PedagogicalNote['note_type'];
  content: string;
  date?: string;
  is_shared?: boolean;
}

// Pour fallback localStorage si Supabase échoue
const STORAGE_KEY = 'cscbm_pedagogical_notes';

// Sauvegarder une note pédagogique
export async function savePedagogicalNote(noteData: CreateNoteData): Promise<PedagogicalNote> {
  try {
    // Essayer d'abord avec Supabase
    const { data, error } = await supabase
      .from('pedagogical_notes')
      .insert({
        student_id: noteData.student_id,
        teacher_id: null, // TODO: Remplacer par l'ID de l'enseignant connecté
        note_type: noteData.note_type,
        content: noteData.content,
        date: noteData.date || new Date().toISOString().split('T')[0],
        is_shared: noteData.is_shared || false,
      })
      .select()
      .single();

    if (error) {
      console.warn('Échec Supabase, utilisation localStorage:', error);
      return savePedagogicalNoteLocal(noteData);
    }

    return data;
  } catch (error) {
    console.warn('Erreur Supabase, fallback localStorage:', error);
    return savePedagogicalNoteLocal(noteData);
  }
}

// Fonction locale de fallback
function savePedagogicalNoteLocal(noteData: CreateNoteData): PedagogicalNote {
  if (typeof window === 'undefined') {
    throw new Error('localStorage not available on server');
  }
  
  const existingNotes = getPedagogicalNotesLocal();
  
  const newNote: PedagogicalNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    student_id: noteData.student_id,
    teacher_id: 'current_teacher_id',
    note_type: noteData.note_type,
    content: noteData.content,
    date: noteData.date || new Date().toISOString().split('T')[0],
    is_shared: noteData.is_shared || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const updatedNotes = [...existingNotes, newNote];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  
  return newNote;
}

// Récupérer toutes les notes (localStorage)
function getPedagogicalNotesLocal(): PedagogicalNote[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture:', error);
    return [];
  }
}

// Récupérer les notes d'un élève spécifique
export async function getStudentPedagogicalNotes(studentId: string): Promise<PedagogicalNote[]> {
  try {
    // Essayer d'abord avec Supabase
    const { data, error } = await supabase
      .from('pedagogical_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Échec Supabase pour les notes, utilisation localStorage:', error);
      return getStudentPedagogicalNotesLocal(studentId);
    }

    return data || [];
  } catch (error) {
    console.warn('Erreur Supabase pour les notes, fallback localStorage:', error);
    return getStudentPedagogicalNotesLocal(studentId);
  }
}

// Fonction locale de fallback pour récupérer les notes
function getStudentPedagogicalNotesLocal(studentId: string): PedagogicalNote[] {
  const allNotes = getPedagogicalNotesLocal();
  return allNotes
    .filter(note => note.student_id === studentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Supprimer une note
export async function deletePedagogicalNote(noteId: string): Promise<void> {
  try {
    // Essayer d'abord avec Supabase
    const { error } = await supabase
      .from('pedagogical_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.warn('Échec suppression Supabase, utilisation localStorage:', error);
      deletePedagogicalNoteLocal(noteId);
      return;
    }
  } catch (error) {
    console.warn('Erreur suppression Supabase, fallback localStorage:', error);
    deletePedagogicalNoteLocal(noteId);
  }
}

// Fonction locale de fallback pour supprimer
function deletePedagogicalNoteLocal(noteId: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingNotes = getPedagogicalNotesLocal();
    const filteredNotes = existingNotes.filter(note => note.id !== noteId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
  } catch (error) {
    console.error('Erreur lors de la suppression locale:', error);
    throw error;
  }
}

// Mettre à jour une note (avec Supabase)
export async function updatePedagogicalNote(noteId: string, updates: Partial<CreateNoteData>): Promise<PedagogicalNote> {
  try {
    // Essayer d'abord avec Supabase
    const { data, error } = await supabase
      .from('pedagogical_notes')
      .update({
        note_type: updates.note_type,
        content: updates.content,
        date: updates.date,
        is_shared: updates.is_shared,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.warn('Échec mise à jour Supabase, utilisation localStorage:', error);
      updatePedagogicalNoteLocal(noteId, updates);
      // Retourner une note mise à jour pour la cohérence
      const existingNotes = getPedagogicalNotesLocal();
      const updatedNote = existingNotes.find(note => note.id === noteId);
      if (!updatedNote) throw new Error('Note non trouvée');
      return updatedNote;
    }

    return data;
  } catch (error) {
    console.warn('Erreur mise à jour Supabase, fallback localStorage:', error);
    updatePedagogicalNoteLocal(noteId, updates);
    // Retourner une note mise à jour pour la cohérence
    const existingNotes = getPedagogicalNotesLocal();
    const updatedNote = existingNotes.find(note => note.id === noteId);
    if (!updatedNote) throw new Error('Note non trouvée');
    return updatedNote;
  }
}

// Fonction locale de fallback pour mettre à jour
function updatePedagogicalNoteLocal(noteId: string, updates: Partial<CreateNoteData>): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingNotes = getPedagogicalNotesLocal();
    const updatedNotes = existingNotes.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            ...updates, 
            updated_at: new Date().toISOString() 
          }
        : note
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Erreur lors de la mise à jour locale:', error);
    throw error;
  }
}

// Générer des données d'exemple
export async function generateSamplePedagogicalNotes(): Promise<void> {
  try {
    // Vérifier s'il y a déjà des notes dans Supabase
    const { data, error } = await supabase
      .from('pedagogical_notes')
      .select('id')
      .limit(1);

    if (!error && data && data.length > 0) {
      return; // Il y a déjà des données
    }
  } catch (error) {
    console.warn('Erreur vérification Supabase, utilisation localStorage');
  }

  // Nettoyer les anciennes données localStorage avec les anciens IDs
  if (typeof window !== 'undefined') {
    const existingNotes = getPedagogicalNotesLocal();
    const hasOldData = existingNotes.some(note => note.student_id.startsWith('d'));
    
    if (hasOldData) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Fallback localStorage
  if (typeof window === 'undefined') return;
  if (getPedagogicalNotesLocal().length > 0) return;
  
  const sampleNotes: PedagogicalNote[] = [
    {
      id: 'note_sample_1',
      student_id: 'BELKHAOUEL_Mohamed',
      teacher_id: 'teacher_1',
      note_type: 'progress',
      content: 'Excellents progrès en lecture. Mohamed montre une amélioration notable dans la compréhension des textes.',
      date: '2025-01-15',
      is_shared: true,
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:00Z'
    },
    {
      id: 'note_sample_2',
      student_id: 'BELKHAOUEL_Mohamed',
      teacher_id: 'teacher_1',
      note_type: 'behavior',
      content: 'Très participatif en classe. Aide volontiers ses camarades en difficulté.',
      date: '2025-01-10',
      is_shared: false,
      created_at: '2025-01-10T14:20:00Z',
      updated_at: '2025-01-10T14:20:00Z'
    },
    {
      id: 'note_sample_3',
      student_id: 'BENCAN_Huseyin',
      teacher_id: 'teacher_1',
      note_type: 'difficulty',
      content: 'Rencontre des difficultés avec les exercices de mathématiques. Prévoir un soutien supplémentaire.',
      date: '2025-01-12',
      is_shared: true,
      created_at: '2025-01-12T16:45:00Z',
      updated_at: '2025-01-12T16:45:00Z'
    }
  ];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleNotes));
  }
}

// Helper : Obtenir le label d'un type de note
export function getNoteTypeLabel(type: PedagogicalNote['note_type']): string {
  switch (type) {
    case 'behavior': return 'Comportement';
    case 'progress': return 'Progrès';
    case 'difficulty': return 'Difficulté';
    case 'observation': return 'Observation';
    case 'general': return 'Général';
    default: return 'Autre';
  }
}

// Helper : Obtenir la couleur d'un type de note
export function getNoteTypeColor(type: PedagogicalNote['note_type']): string {
  switch (type) {
    case 'behavior': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'progress': return 'bg-green-50 text-green-700 border-green-200';
    case 'difficulty': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'observation': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'general': return 'bg-gray-50 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
} 