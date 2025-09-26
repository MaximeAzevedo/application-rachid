'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { REAL_CLASSES_DATA } from '@/data/classes';
import { saveAttendanceSession, type AttendanceSession } from '@/lib/attendance';
import { savePedagogicalNote, getStudentPedagogicalNotes, updatePedagogicalNote, deletePedagogicalNote, type CreateNoteData, type PedagogicalNote } from '@/lib/pedagogical-notes';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  status: 'present' | 'absent_justified' | 'absent_unjustified';
  note?: string;
}

interface Class {
  id: string;
  day: string;
  level: number;
  class_name: string;
  teacher_name: string;
  room: string;
}

// Composant Modal pour les justifications
function JustificationModal({ 
  student, 
  onClose, 
  onSave 
}: { 
  student: Student; 
  onClose: () => void; 
  onSave: (note: string) => void;
}) {
  const [note, setNote] = useState(student.note || '');

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="card-premium bg-white max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📝</span>
          <div>
            <h3 className="font-semibold">Justification d&apos;absence</h3>
            <p className="text-sm text-muted-foreground">
              {student.first_name} {student.last_name}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Motif (optionnel)
          </label>
          <textarea
            className="input-modern min-h-[80px] resize-none"
            placeholder="Rendez-vous médical, certificat médical, raisons familiales..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ctrl+Entrée pour valider rapidement
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Valider
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour les notes pédagogiques
function PedagogicalNoteModal({ 
  student, 
  existingNotes,
  onClose, 
  onSave,
  onUpdate,
  onDelete
}: { 
  student: Student; 
  existingNotes: PedagogicalNote[];
  onClose: () => void; 
  onSave: (noteData: CreateNoteData) => void;
  onUpdate: (noteId: string, updates: Partial<CreateNoteData>) => void;
  onDelete: (noteId: string) => void;
}) {
  const [noteType, setNoteType] = useState<CreateNoteData['note_type']>('general');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<PedagogicalNote | null>(null);

  const handleSave = () => {
    if (!content.trim()) return;
    
    if (selectedNote) {
      // Modification d'une note existante
      onUpdate(selectedNote.id, {
        note_type: noteType,
        content: content.trim()
      });
    } else {
      // Création d'une nouvelle note
      onSave({
        student_id: student.id,
        note_type: noteType,
        content: content.trim()
      });
    }
    
    setContent('');
    setSelectedNote(null);
  };

  const handleEditNote = (note: PedagogicalNote) => {
    setSelectedNote(note);
    setNoteType(note.note_type);
    setContent(note.content);
  };

  const handleCancelEdit = () => {
    setSelectedNote(null);
    setNoteType('general');
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="card-premium bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h3 className="font-semibold">Notes pédagogiques</h3>
              <p className="text-sm text-muted-foreground">
                {student.first_name} {student.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Notes existantes */}
        {existingNotes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Notes existantes</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {existingNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                                      <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            note.note_type === 'general' ? 'bg-blue-100 text-blue-800' :
                            note.note_type === 'behavior' ? 'bg-amber-100 text-amber-800' :
                            note.note_type === 'progress' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {note.note_type === 'general' ? 'Général' :
                             note.note_type === 'behavior' ? 'Comportement' :
                             note.note_type === 'progress' ? 'Progrès' : 'Difficulté'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
                              onDelete(note.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">
            {selectedNote ? 'Modifier la note' : 'Ajouter une nouvelle note'}
          </h4>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Type de note
          </label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as CreateNoteData['note_type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
          >
            <option value="general">Général</option>
            <option value="behavior">Comportement</option>
            <option value="progress">Progrès</option>
            <option value="difficulty">Difficulté</option>
            <option value="observation">Observation</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Observation
          </label>
          <textarea
            className="input-modern min-h-[100px] resize-none"
            placeholder="Décrivez vos observations sur cet élève pendant la séance..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ctrl+Entrée pour valider rapidement
          </p>
        </div>

                <div className="flex gap-2">
          {selectedNote && (
            <Button variant="ghost" onClick={handleCancelEdit} className="flex-1">
              Annuler modification
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className={selectedNote ? "flex-1" : "flex-1"}>
            Fermer
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex-1"
          >
            {selectedNote ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassAttendancePage() {
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<Student | null>(null);
  const [showPedagogicalModal, setShowPedagogicalModal] = useState<Student | null>(null);
  const [studentPedagogicalNotes, setStudentPedagogicalNotes] = useState<{[key: string]: PedagogicalNote[]}>({});
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  useEffect(() => {
    const loadClassData = async () => {
      try {
        // Charger les données de la classe depuis Supabase
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();

        if (classError || !classData) {
          console.error('Erreur chargement classe:', classError);
          // Fallback sur les données statiques
          const fallbackClass = REAL_CLASSES_DATA.find(c => c.id === classId);
          if (fallbackClass) {
            setClassInfo({
              id: fallbackClass.id,
              day: fallbackClass.day,
              level: fallbackClass.level,
              class_name: fallbackClass.class_name,
              teacher_name: fallbackClass.teacher_name,
              room: fallbackClass.room
            });

            const studentsWithStatus = fallbackClass.students.map(student => ({
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              status: 'present' as const
            }));
            setStudents(studentsWithStatus);
          }
        } else {
          // Utiliser les données Supabase
          setClassInfo({
            id: classData.id,
            day: classData.day,
            level: classData.level,
            class_name: classData.class_name,
            teacher_name: classData.teacher_name,
            room: classData.room
          });

          // Charger les étudiants de cette classe
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', classId)
            .order('last_name');

          if (studentsError) {
            console.error('Erreur chargement étudiants:', studentsError);
            // Fallback sur les données statiques pour les étudiants
            const fallbackClass = REAL_CLASSES_DATA.find(c => c.id === classId);
            if (fallbackClass) {
              const studentsWithStatus = fallbackClass.students.map(student => ({
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                status: 'present' as const
              }));
              setStudents(studentsWithStatus);
            }
          } else {
            const studentsWithStatus = studentsData?.map(student => ({
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              status: 'present' as const
            })) || [];
            setStudents(studentsWithStatus);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        // Fallback complet sur les données statiques
        const fallbackClass = REAL_CLASSES_DATA.find(c => c.id === classId);
        if (fallbackClass) {
          setClassInfo({
            id: fallbackClass.id,
            day: fallbackClass.day,
            level: fallbackClass.level,
            class_name: fallbackClass.class_name,
            teacher_name: fallbackClass.teacher_name,
            room: fallbackClass.room
          });

          const studentsWithStatus = fallbackClass.students.map(student => ({
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            status: 'present' as const
          }));
          setStudents(studentsWithStatus);
        }
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [classId]);

  // Charger les notes pédagogiques pour tous les étudiants
  useEffect(() => {
    const loadPedagogicalNotes = async () => {
      if (students.length === 0) return;
      
      const notesData: {[key: string]: PedagogicalNote[]} = {};
      
      for (const student of students) {
        try {
          const notes = await getStudentPedagogicalNotes(student.id);
          notesData[student.id] = notes;
        } catch (error) {
          console.error(`Erreur chargement notes pour ${student.id}:`, error);
          notesData[student.id] = [];
        }
      }
      
      setStudentPedagogicalNotes(notesData);
    };

    loadPedagogicalNotes();
  }, [students]);

  const updateStudentStatus = (studentId: string, status: Student['status'], note?: string) => {
    const student = students.find(s => s.id === studentId);
    
    setStudents(students.map(s => 
      s.id === studentId 
        ? { ...s, status, note: note || s.note }
        : s
    ));

    // Ouvrir automatiquement le modal pour les absences justifiées
    if (status === 'absent_justified' && student) {
      setShowModal({ ...student, status, note });
    }
  };

  const handleJustificationSave = (note: string) => {
    if (showModal) {
      setStudents(students.map(s => 
        s.id === showModal.id 
          ? { ...s, note }
          : s
      ));
    }
  };

  const handlePedagogicalNoteSave = async (noteData: CreateNoteData) => {
    try {
      // Sauvegarder la note pédagogique
      await savePedagogicalNote(noteData);
      
      // Recharger les notes pour cet étudiant
      const updatedNotes = await getStudentPedagogicalNotes(noteData.student_id);
      setStudentPedagogicalNotes(prev => ({
        ...prev,
        [noteData.student_id]: updatedNotes
      }));
      
      // Feedback visuel
      alert('Note pédagogique enregistrée !');
    } catch (error) {
      console.error('Erreur sauvegarde note:', error);
      alert('Erreur lors de la sauvegarde de la note');
    }
  };

  const handlePedagogicalNoteUpdate = async (noteId: string, updates: Partial<CreateNoteData>) => {
    try {
      // Mettre à jour la note pédagogique
      await updatePedagogicalNote(noteId, updates);
      
      // Trouver l'étudiant concerné par cette note
      const studentId = Object.keys(studentPedagogicalNotes).find(id => 
        studentPedagogicalNotes[id].some(note => note.id === noteId)
      );
      
      if (studentId) {
        // Recharger les notes pour cet étudiant
        const updatedNotes = await getStudentPedagogicalNotes(studentId);
        setStudentPedagogicalNotes(prev => ({
          ...prev,
          [studentId]: updatedNotes
        }));
      }
      
      // Feedback visuel
      alert('Note pédagogique modifiée !');
    } catch (error) {
      console.error('Erreur modification note:', error);
      alert('Erreur lors de la modification de la note');
    }
  };

  const handlePedagogicalNoteDelete = async (noteId: string) => {
    try {
      // Supprimer la note pédagogique
      await deletePedagogicalNote(noteId);
      
      // Trouver l'étudiant concerné par cette note
      const studentId = Object.keys(studentPedagogicalNotes).find(id => 
        studentPedagogicalNotes[id].some(note => note.id === noteId)
      );
      
      if (studentId) {
        // Recharger les notes pour cet étudiant
        const updatedNotes = await getStudentPedagogicalNotes(studentId);
        setStudentPedagogicalNotes(prev => ({
          ...prev,
          [studentId]: updatedNotes
        }));
      }
      
      // Feedback visuel
      alert('Note pédagogique supprimée !');
    } catch (error) {
      console.error('Erreur suppression note:', error);
      alert('Erreur lors de la suppression de la note');
    }
  };

  const handleSaveAttendance = async () => {
    if (!classInfo) return;
    
    // Créer une session d'appel avec la date actuelle
    const session: AttendanceSession = {
      id: `session-${new Date().toISOString().split('T')[0]}-${classInfo.id}`,
      date: new Date().toISOString().split('T')[0],
      class_id: classInfo.id,
      class_name: classInfo.class_name,
      teacher_name: classInfo.teacher_name,
      students: students.map(student => ({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        status: student.status,
        note: student.note
      }))
    };
    
    try {
      // Sauvegarder la session de manière asynchrone
      await saveAttendanceSession(session);
      
      // Retourner au dashboard avec un message de confirmation
      alert(`Appel enregistré avec succès !\n\nPrésents: ${presentCount}\nAbsents justifiés: ${justifiedCount}\nAbsents injustifiés: ${unjustifiedCount}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'appel. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Classe non trouvée</p>
          <Button onClick={() => router.push('/dashboard')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const presentCount = students.filter(s => s.status === 'present').length;
  const justifiedCount = students.filter(s => s.status === 'absent_justified').length;
  const unjustifiedCount = students.filter(s => s.status === 'absent_unjustified').length;

  return (
    <div className="page-layout">
      <Header
        title={`Classe ${classInfo.class_name} - Niveau ${classInfo.level}`}
        subtitle={`${classInfo.day} • ${classInfo.teacher_name} • ${classInfo.room}`}
        showBackButton={true}
        type="dashboard"
        actions={
          <div className="text-sm font-medium">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'short', 
              day: 'numeric',
              month: 'short'
            })}
          </div>
        }
      />

      <main className="main-content">
        <div className="container-modern">
          {/* Liste Tactile Optimisée */}
          <div className="card-premium">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-semibold">Appel - {students.length} élèves</h2>
            </div>

            <div className="space-y-2">
              {students.map((student) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  style={{ minHeight: '70px' }}
                >
                  {/* Nom + Statut */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="font-semibold text-base text-gray-900 truncate">
                      {student.first_name} {student.last_name}
                    </span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-3 h-3 rounded-full ${
                          student.status === 'present' ? 'bg-green-500' :
                          student.status === 'absent_justified' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-sm font-medium text-gray-700">
                        {student.status === 'present' ? 'Présent' :
                         student.status === 'absent_justified' ? 'Justifié' : 'Absent'}
                      </span>
                      {student.note && (
                        <span 
                          className="text-sm px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-medium ml-2"
                          title={student.note}
                        >
                          📝 Note
                        </span>
                      )}
                      {studentPedagogicalNotes[student.id]?.length > 0 && (
                        <span 
                          className="text-sm px-2 py-1 rounded-md bg-blue-100 text-blue-800 font-medium ml-2"
                          title={`${studentPedagogicalNotes[student.id].length} note(s) pédagogique(s)`}
                        >
                          📚 {studentPedagogicalNotes[student.id].length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Boutons Tactiles */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStudentStatus(student.id, 'present')}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all flex items-center justify-center text-lg ${
                        student.status === 'present'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 hover:shadow-md'
                      }`}
                      title="Présent"
                    >
                      ✓
                    </button>
                    
                    <button
                      onClick={() => updateStudentStatus(student.id, 'absent_justified')}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all flex items-center justify-center text-lg ${
                        student.status === 'absent_justified'
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 hover:shadow-md'
                      }`}
                      title="Absent justifié"
                    >
                      📝
                    </button>
                    
                    <button
                      onClick={() => updateStudentStatus(student.id, 'absent_unjustified')}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all flex items-center justify-center text-lg ${
                        student.status === 'absent_unjustified'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 hover:shadow-md'
                      }`}
                      title="Absent"
                    >
                      ✗
                    </button>

                    {/* Bouton Note Pédagogique */}
                    <button
                      onClick={() => setShowPedagogicalModal(student)}
                      className="w-12 h-12 rounded-lg font-semibold transition-all flex items-center justify-center text-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 hover:shadow-md"
                      title={studentPedagogicalNotes[student.id]?.length > 0 
                        ? `Voir/modifier les notes pédagogiques (${studentPedagogicalNotes[student.id].length})`
                        : "Ajouter une note pédagogique"}
                    >
                      📚
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé Final */}
          <div className="grid-responsive cols-3 gap-4 mt-8 mb-6">
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {presentCount}
              </div>
              <div className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Présents
              </div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold mb-2" style={{ color: '#f59e0b' }}>
                {justifiedCount}
              </div>
              <div className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                Absents justifiés
              </div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold mb-2" style={{ color: '#ef4444' }}>
                {unjustifiedCount}
              </div>
              <div className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Absents
              </div>
            </div>
          </div>

          {/* Actions Améliorées */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveAttendance}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center text-lg"
            >
              Enregistrer l&apos;appel
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center min-w-[120px]"
            >
              Annuler
            </button>
          </div>
        </div>
      </main>

      {/* Modal pour justifications */}
      {showModal && (
        <JustificationModal
          student={showModal}
          onClose={() => setShowModal(null)}
          onSave={handleJustificationSave}
        />
      )}

      {/* Modal pour notes pédagogiques */}
                  {showPedagogicalModal && (
              <PedagogicalNoteModal
                student={showPedagogicalModal}
                existingNotes={studentPedagogicalNotes[showPedagogicalModal.id] || []}
                onClose={() => setShowPedagogicalModal(null)}
                onSave={handlePedagogicalNoteSave}
                onUpdate={handlePedagogicalNoteUpdate}
                onDelete={handlePedagogicalNoteDelete}
              />
            )}
    </div>
  );
} 
