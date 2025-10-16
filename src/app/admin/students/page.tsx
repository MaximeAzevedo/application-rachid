'use client';

import { useState, useEffect, useMemo } from 'react';

import { REAL_CLASSES_DATA } from '@/data/classes';
import { 
  Edit3, 
  Users, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  BarChart3,
  User,
  BookOpen,
  X
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { getStudentStats, generateSampleData } from '@/lib/attendance';
import { 
  getStudentPedagogicalNotes, 
  savePedagogicalNote, 
  deletePedagogicalNote,
  generateSamplePedagogicalNotes,
  getNoteTypeLabel,
  getNoteTypeColor,
  type PedagogicalNote,
  type CreateNoteData
} from '@/lib/pedagogical-notes';
import { createClient } from '@/lib/supabase-client';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  class_id: string;
  parent_phone?: string;
}

// Interface AttendanceRecord déplacée dans lib/attendance.ts

// Interface StudentStats déplacée dans lib/attendance.ts

interface StudentFormData {
  first_name: string;
  last_name: string;
  class_id: string;
  parent_phone?: string;
}

// Composant Modal unifiée pour un élève (Informations, Statistiques, Suivi Pédagogique)
function StudentModal({ 
  isOpen, 
  onClose, 
  student,
  onSave,
  onDelete,
  availableClasses
}: {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSave: (studentData: StudentFormData) => void;
  onDelete: (studentId: string) => void;
  availableClasses: Array<{id: string; class_name: string; level: number; day: string}>;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'follow'>('info');
  const [studentFormData, setStudentFormData] = useState<StudentFormData>({
    first_name: student.first_name,
    last_name: student.last_name,
    class_id: student.class_id,
    parent_phone: student.parent_phone || ''
  });

  // États pour les données asynchrones
  const [stats, setStats] = useState({
    total_sessions: 0,
    present: 0,
    absent_justified: 0,
    absent_unjustified: 0,
    attendance_rate: 0,
    history: []
  });
  const [pedagogicalNotes, setPedagogicalNotes] = useState<PedagogicalNote[]>([]);
  
  // Charger les données pédagogiques et statistiques
  useEffect(() => {
    const loadData = async () => {
      try {
        const [notes, studentStats] = await Promise.all([
          getStudentPedagogicalNotes(student.id),
          getStudentStats(student.id)
        ]);
        setPedagogicalNotes(notes);
        setStats(studentStats);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };
    loadData();
  }, [student.id]);

  // État pour les notes pédagogiques
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState<CreateNoteData>({
    student_id: student.id,
    note_type: 'general',
    content: ''
  });

  const handleSaveStudent = () => {
    onSave(studentFormData);
    onClose();
  };

  const handleAddNote = async () => {
    try {
      await savePedagogicalNote(newNote);
      setNewNote({
        student_id: student.id,
        note_type: 'general',
        content: ''
      });
      setShowNoteForm(false);
      
      // Recharger les notes après ajout
      const updatedNotes = await getStudentPedagogicalNotes(student.id);
      setPedagogicalNotes(updatedNotes);
    } catch (error) {
      console.error('Erreur ajout note:', error);
      alert('Erreur lors de l\'ajout de la note');
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent_justified': return 'text-orange-600 bg-orange-50';
      case 'absent_unjustified': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent_justified': return 'Absent justifié';
      case 'absent_unjustified': return 'Absent injustifié';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="modal-mobile-container">
      <div className="modal-mobile-content large flex flex-col overflow-hidden">
          {/* Header */}
          <div className="modal-mobile-header flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {student.first_name} {student.last_name}
                  </h2>
                  <p className="text-gray-600">Classe {student.class_name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Onglets */}
            <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'info' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                Informations
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'stats' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Statistiques
              </button>
              <button
                onClick={() => setActiveTab('follow')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'follow' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Suivi Pédagogique
              </button>
            </div>
          </div>
          
          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Modifier les informations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={studentFormData.first_name}
                      onChange={(e) => setStudentFormData({...studentFormData, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={studentFormData.last_name}
                      onChange={(e) => setStudentFormData({...studentFormData, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Classe
                  </label>
                  <select
                    value={studentFormData.class_id}
                    onChange={(e) => setStudentFormData({...studentFormData, class_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  >
                    {availableClasses.map(classData => (
                      <option key={classData.id} value={classData.id}>
                        Classe {classData.class_name} - Niveau {classData.level} ({classData.day})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Numéro de téléphone du parent (SMS d&apos;absence)
                  </label>
                  <input
                    type="tel"
                    value={studentFormData.parent_phone || ''}
                    onChange={(e) => {
                      // Nettoyer le numéro : enlever les espaces
                      const cleanedPhone = e.target.value.replace(/\s+/g, '');
                      setStudentFormData({...studentFormData, parent_phone: cleanedPhone});
                    }}
                    placeholder="+33612345678"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format international obligatoire : +33612345678 (avec +, sans espaces)
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Statistiques de présence</h3>
                
                {/* Statistiques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="card-premium bg-green-50 border border-green-200">
              <div className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.present}
                </div>
                <div className="text-sm font-medium text-green-700">
                  Présences
                </div>
              </div>
            </div>
            
            <div className="card-premium bg-orange-50 border border-orange-200">
              <div className="p-4 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.absent_justified}
                </div>
                <div className="text-sm font-medium text-orange-700">
                  Absences justifiées
                </div>
              </div>
            </div>
            
            <div className="card-premium bg-red-50 border border-red-200">
              <div className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {stats.absent_unjustified}
                </div>
                <div className="text-sm font-medium text-red-700">
                  Absences injustifiées
                </div>
              </div>
            </div>
            
            <div className="card-premium bg-blue-50 border border-blue-200">
              <div className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.attendance_rate}%
                </div>
                <div className="text-sm font-medium text-blue-700">
                  Taux de présence
                </div>
              </div>
            </div>
          </div>

          {/* Graphique simple */}
          <div className="card-premium bg-gray-50 border border-gray-200 mb-8">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des présences</h3>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${(stats.present / stats.total_sessions) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500 h-full" 
                      style={{ width: `${(stats.absent_justified / stats.total_sessions) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${(stats.absent_unjustified / stats.total_sessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Présent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Justifié</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Injustifié</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique complet */}
          <div className="card-premium bg-white border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Historique complet des séances</h3>
                             <div className="space-y-3">
                 {stats.history.length > 0 ? (
                   stats.history.map((record, index) => (
                     <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className="text-sm font-medium text-gray-900">
                           {new Date(record.date).toLocaleDateString('fr-FR', {
                             day: 'numeric',
                             month: 'long',
                             year: 'numeric'
                           })}
                         </div>
                         {record.note && (
                           <div className="text-xs text-gray-500 italic">
                             • {record.note}
                           </div>
                         )}
                       </div>
                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                         {getStatusLabel(record.status)}
                       </span>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-8 text-gray-500">
                     <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                     <p className="text-sm">Aucun historique d&apos;appel disponible</p>
                     <p className="text-xs mt-1">Les données apparaîtront après le premier appel.</p>
                                                        </div>
                 )}
               </div>
             </div>
          </div>
              </div>
            )}

            {activeTab === 'follow' && (
               <div>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-gray-900">Suivi Pédagogique</h3>
                   <button
                     onClick={() => setShowNoteForm(!showNoteForm)}
                     className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-2"
                   >
                     <Plus className="w-4 h-4" />
                     Ajouter une note
                   </button>
                 </div>

                 {/* Formulaire d'ajout de note */}
                 {showNoteForm && (
                   <div className="card-premium bg-green-50 border border-green-200 p-4 mb-6">
                     <div className="space-y-4">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Type de note
                         </label>
                         <select
                           value={newNote.note_type}
                           onChange={(e) => setNewNote({...newNote, note_type: e.target.value as any})}
                           className="w-full px-3 py-2 border border-green-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                         >
                           <option value="general">Général</option>
                           <option value="behavior">Comportement</option>
                           <option value="progress">Progrès</option>
                           <option value="difficulty">Difficulté</option>
                           <option value="observation">Observation</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Contenu de la note
                         </label>
                         <textarea
                           value={newNote.content}
                           onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                           placeholder="Décrivez les observations, progrès ou difficultés de l'élève..."
                           className="w-full px-3 py-2 border border-green-300 rounded-lg h-24 resize-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                         />
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={handleAddNote}
                           disabled={!newNote.content.trim()}
                           className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                         >
                           Enregistrer
                         </button>
                         <button
                           onClick={() => setShowNoteForm(false)}
                           className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
                         >
                           Annuler
                         </button>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Liste des notes */}
                 <div className="space-y-4">
                   {pedagogicalNotes.length > 0 ? (
                     pedagogicalNotes.map((note) => (
                       <div key={note.id} className="card-premium border-l-4 border-l-green-500">
                         <div className="p-4">
                           <div className="flex items-start justify-between mb-3">
                             <div className="flex items-center gap-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getNoteTypeColor(note.note_type)}`}>
                                 {getNoteTypeLabel(note.note_type)}
                               </span>
                               <span className="text-sm text-gray-500">
                                 {new Date(note.date).toLocaleDateString('fr-FR', {
                                   day: 'numeric',
                                   month: 'long',
                                   year: 'numeric'
                                 })}
                               </span>
                               {note.is_shared && (
                                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                   Partagée
                                 </span>
                               )}
                             </div>
                                                         <button
                              onClick={async () => {
                                try {
                                  await deletePedagogicalNote(note.id);
                                  const updatedNotes = await getStudentPedagogicalNotes(student.id);
                                  setPedagogicalNotes(updatedNotes);
                                } catch (error) {
                                  console.error('Erreur suppression note:', error);
                                  alert('Erreur lors de la suppression');
                                }
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                           </div>
                           <p className="text-gray-900 leading-relaxed">{note.content}</p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                       <p className="text-sm">Aucune note pédagogique</p>
                       <p className="text-xs mt-1">Commencez par ajouter une observation sur cet élève.</p>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between">
              <button
                onClick={() => onDelete(student.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer l&apos;élève
              </button>
              
              <div className="modal-mobile-buttons">
                <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-5 rounded-xl transition-all text-sm"
                >
                  Fermer
                </button>
                {activeTab === 'info' && (
                  <button
                    onClick={handleSaveStudent}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Sauvegarder
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

function AddStudentModal({ 
  isOpen, 
  onClose, 
  onSave,
  availableClasses
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: StudentFormData) => void;
  availableClasses: Array<{id: string; class_name: string; level: number; day: string}>;
}) {
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: '',
    last_name: '',
    class_id: availableClasses[0]?.id || '',
    parent_phone: ''
  });

  // Mettre à jour le class_id par défaut quand les classes changent
  useEffect(() => {
    if (availableClasses.length > 0 && !formData.class_id) {
      setFormData(prev => ({
        ...prev,
        class_id: availableClasses[0].id
      }));
    }
  }, [availableClasses, formData.class_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      first_name: '',
      last_name: '',
      class_id: availableClasses[0]?.id || '',
      parent_phone: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-mobile-container">
      <div className="modal-mobile-content medium">
        <div className="modal-mobile-padding">
          <div className="modal-mobile-header">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ajouter un nouvel élève
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="modal-mobile-form">
            <div className="modal-mobile-grid">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Prénom de l'élève"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Nom de famille"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Classe
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                required
              >
                {availableClasses.map(classData => (
                  <option key={classData.id} value={classData.id}>
                    Classe {classData.class_name} - Niveau {classData.level} ({classData.day})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Numéro de téléphone du parent (optionnel)
              </label>
              <input
                type="tel"
                value={formData.parent_phone || ''}
                onChange={(e) => {
                  // Nettoyer le numéro : enlever les espaces
                  const cleanedPhone = e.target.value.replace(/\s+/g, '');
                  setFormData({...formData, parent_phone: cleanedPhone});
                }}
                placeholder="+33612345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format international : +33612345678 (pour recevoir les SMS d&apos;absence)
              </p>
            </div>

            <div className="modal-mobile-buttons">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all min-w-[120px]"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [availableClasses, setAvailableClasses] = useState<Array<{id: string; class_name: string; level: number; day: string}>>([]);

  useEffect(() => {
    // Générer des données d'exemple si nécessaire (pour la démo)
    const initData = async () => {
      generateSampleData();
      await generateSamplePedagogicalNotes();
    };
    initData();
    
    // Charger les étudiants depuis Supabase
    const loadStudents = async () => {
      try {
        const { data: studentsData, error } = await supabase
          .from('students')
          .select(`
            *,
            classes(class_name)
          `)
          .order('last_name');

        if (error) {
          console.error('Erreur chargement étudiants:', error);
          // Fallback sur les données statiques
          const allStudents: Student[] = [];
          REAL_CLASSES_DATA.forEach(classData => {
            classData.students.forEach(student => {
              allStudents.push({
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                class_name: classData.class_name,
                class_id: classData.id
              });
            });
          });
          setStudents(allStudents);
        } else {
          // Transformer les données Supabase
          const transformedStudents = studentsData?.map(student => ({
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            class_name: student.classes?.class_name || 'Sans classe',
            class_id: student.class_id || '',
            parent_phone: student.parent_phone || ''
          })) || [];
          
          setStudents(transformedStudents);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
        // Fallback sur les données statiques
        const allStudents: Student[] = [];
        REAL_CLASSES_DATA.forEach(classData => {
          classData.students.forEach(student => {
            allStudents.push({
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              class_name: classData.class_name,
              class_id: classData.id
            });
          });
        });
        setStudents(allStudents);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Charger les classes disponibles pour le modal d'ajout
  useEffect(() => {
    const loadAvailableClasses = async () => {
      try {
        const { data: classesData, error } = await supabase
          .from('classes')
          .select('id, class_name, level, day')
          .order('class_name');

        if (error) {
          console.error('Erreur chargement classes pour modal:', error);
          // Fallback sur les données statiques
          const staticClasses = REAL_CLASSES_DATA.map(classData => ({
            id: classData.id,
            class_name: classData.class_name,
            level: classData.level,
            day: classData.day
          }));
          setAvailableClasses(staticClasses);
        } else {
          setAvailableClasses(classesData || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        // Fallback sur les données statiques
        const staticClasses = REAL_CLASSES_DATA.map(classData => ({
          id: classData.id,
          class_name: classData.class_name,
          level: classData.level,
          day: classData.day
        }));
        setAvailableClasses(staticClasses);
      }
    };

    loadAvailableClasses();
  }, []);

  const handleSaveStudent = async (formData: StudentFormData) => {
    const selectedClassData = availableClasses.find(c => c.id === formData.class_id);
    
    console.log('🔄 Sauvegarde élève:', formData);
    
    try {
      if (selectedStudent) {
        // Modification d'un élève existant dans Supabase
        console.log('📝 Mise à jour élève ID:', selectedStudent.id);
        console.log('📱 Numéro parent:', formData.parent_phone);
        
        const { data, error } = await supabase
          .from('students')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            class_id: formData.class_id,
            parent_phone: formData.parent_phone || null
          })
          .eq('id', selectedStudent.id)
          .select();

        if (error) {
          console.error('❌ Erreur modification élève:', error);
          alert('Erreur lors de la modification de l\'élève: ' + error.message);
          return;
        }
        
        console.log('✅ Élève mis à jour avec succès:', data);

        // Mettre à jour l'état local après succès Supabase
        setStudents(students.map(s => 
          s.id === selectedStudent.id 
            ? {
                ...s,
                first_name: formData.first_name,
                last_name: formData.last_name,
                class_id: formData.class_id,
                class_name: selectedClassData?.class_name || 'Unknown',
                parent_phone: formData.parent_phone
              }
            : s
        ));
      } else {
        // Ajout d'un nouvel élève dans Supabase
        const newId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { data: newStudentData, error } = await supabase
          .from('students')
          .insert({
            id: newId,
            first_name: formData.first_name,
            last_name: formData.last_name,
            class_id: formData.class_id,
            parent_phone: formData.parent_phone || null
          })
          .select()
          .single();

        if (error) {
          console.error('Erreur ajout élève:', error);
          alert('Erreur lors de l\'ajout de l\'élève');
          return;
        }

        // Ajouter à l'état local après succès Supabase
        const newStudent: Student = {
          id: newStudentData.id,
          first_name: newStudentData.first_name,
          last_name: newStudentData.last_name,
          class_id: newStudentData.class_id,
          class_name: selectedClassData?.class_name || 'Unknown',
          parent_phone: newStudentData.parent_phone
        };
        setStudents([...students, newStudent]);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleAddStudent = () => {
    setShowAddModal(true);
  };

  const handleDeleteStudent = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${student?.first_name} ${student?.last_name} ?`)) {
      return;
    }

    try {
      // Supprimer de Supabase
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression élève:', error);
        alert('Erreur lors de la suppression de l\'élève');
        return;
      }

      // Mettre à jour l'état local après succès Supabase
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrage et recherche des élèves
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === 'all' || student.class_name === selectedClass;
      
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  // Grouper les élèves par classe
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const className = student.class_name;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  if (loading) {
    return (
      <div className="page-layout">
        <div className="main-content flex items-center justify-center">
          <div className="text-center">
            <div className="loading-modern mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement des élèves...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Header
        title="Gestion des Élèves"
        subtitle={`${students.length} élèves • ${availableClasses.length} classes`}
        showBackButton={true}
        type="dashboard"
      />

      <main className="main-content">
        <div className="container-modern">
          {/* Statistique Simple - Style Premium */}
          <div className="mb-8">
            <div className="card-premium bg-gradient-to-br from-green-50 to-green-100 border border-green-200 max-w-xs hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700">Statistiques</span>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {students.length}
                </div>
                <div className="text-sm font-medium text-gray-700">Total élèves</div>
              </div>
            </div>
          </div>

          {/* Actions Premium - Ajouter, Recherche et Filtres */}
          <div className="card-premium bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Bouton Ajouter - Style Premium */}
              <div className="w-full lg:w-auto">
                <button
                  onClick={handleAddStudent}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-3 text-base w-full lg:w-auto justify-center group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  Ajouter un élève
                </button>
              </div>

              {/* Séparateur Premium */}
              <div className="hidden lg:block w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

              {/* Recherche et Filtres - Style Premium */}
              <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher un élève par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl text-base bg-white hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none min-w-[200px] font-medium"
                  >
                    <option value="all">Toutes les classes</option>
                    {availableClasses.map(classData => (
                      <option key={classData.id} value={classData.class_name}>
                        Classe {classData.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des Élèves par Classe */}
          <div className="space-y-8">
            {Object.entries(groupedStudents).sort((a, b) => a[0].localeCompare(b[0])).map(([className, classStudents]) => (
              <div key={className}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Classe {className}
                    </h2>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {classStudents.length} élèves
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {classStudents.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => handleStudentClick(student)}
                      className="card-premium bg-white hover:shadow-lg transition-all duration-200 group cursor-pointer"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                              {student.first_name} {student.last_name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <p className="text-sm font-medium text-gray-600">
                                Classe {student.class_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-gray-400 group-hover:text-green-500 transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <BarChart3 className="w-3 h-3" />
                          <span>Statistiques</span>
                          <span>•</span>
                          <BookOpen className="w-3 h-3" />
                          <span>Suivi pédagogique</span>
                          <span>•</span>
                          <Edit3 className="w-3 h-3" />
                          <span>Modifier</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* État vide - Style Premium */}
          {filteredStudents.length === 0 && (
            <div className="card-premium bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun élève trouvé</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || selectedClass !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche pour trouver l\'élève souhaité'
                  : 'Commencez par ajouter des élèves à vos classes pour gérer leurs informations'
                }
              </p>
              {(!searchTerm && selectedClass === 'all') && (
                <button
                  onClick={handleAddStudent}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Ajouter le premier élève
                </button>
              )}
            </div>
          )}
        </div>
      </main>

                  {/* Modal unifiée pour un élève */}
            {showModal && selectedStudent && (
              <StudentModal
                isOpen={showModal}
                onClose={() => {
                  setShowModal(false);
                  setSelectedStudent(null);
                }}
                onSave={handleSaveStudent}
                onDelete={handleDeleteStudent}
                student={selectedStudent}
                availableClasses={availableClasses}
              />
            )}

            {/* Modal pour ajouter un élève (simple) */}
            {showAddModal && (
              <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveStudent}
                availableClasses={availableClasses}
              />
            )}
          </div>
        );
      } 