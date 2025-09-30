'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { REAL_CLASSES_DATA } from '@/data/classes';
import { Edit3, Users, FileText, Trash2, Plus } from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

interface Class {
  id: string;
  day: string;
  level: number;
  class_name: string;
  teacher_name: string;
  room: string;
  student_count: number;
}

interface ClassFormData {
  day: string;
  level: string;
  class_name: string;
  teacher_name: string;
  room: string;
}

// Composant Modal pour ajouter/modifier une classe
function ClassModal({ 
  isOpen, 
  onClose, 
  onSave, 
  classToEdit,
  title = "Ajouter une nouvelle classe"
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ClassFormData) => void;
  classToEdit?: Class | null;
  title?: string;
}) {
  const [formData, setFormData] = useState<ClassFormData>({
    day: classToEdit?.day || 'SAMEDI',
    level: classToEdit?.level?.toString() || '',
    class_name: classToEdit?.class_name || '',
    teacher_name: classToEdit?.teacher_name || '',
    room: classToEdit?.room || ''
  });

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        day: classToEdit.day,
        level: classToEdit.level.toString(),
        class_name: classToEdit.class_name,
        teacher_name: classToEdit.teacher_name,
        room: classToEdit.room
      });
    }
  }, [classToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-mobile-container">
      <div className="modal-mobile-content medium">
        <div className="modal-mobile-padding">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          
          <form onSubmit={handleSubmit} className="modal-mobile-form">
            <div className="modal-mobile-grid">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jour
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                  className="input-modern w-full text-base"
                  required
                >
                  <option value="SAMEDI">SAMEDI</option>
                  <option value="DIMANCHE">DIMANCHE</option>
                  <option value="LUNDI">LUNDI</option>
                  <option value="MARDI">MARDI</option>
                  <option value="MERCREDI">MERCREDI</option>
                  <option value="JEUDI">JEUDI</option>
                  <option value="VENDREDI">VENDREDI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Niveau
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  placeholder="1, 2, 3, 4..."
                  className="input-modern w-full text-base"
                  required
                  min="1"
                  max="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la classe
                </label>
                <input
                  type="text"
                  value={formData.class_name}
                  onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  placeholder="A, B, C, D..."
                  className="input-modern w-full text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enseignant
                </label>
                <input
                  type="text"
                  value={formData.teacher_name}
                  onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
                  placeholder="Mme. Nom..."
                  className="input-modern w-full text-base"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salle
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="Algeco 3, Grande Salle..."
                className="input-modern w-full text-base"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
              >
                {classToEdit ? 'Modifier' : 'Ajouter'}
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

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Charger les classes depuis Supabase
    const loadClasses = async () => {
      try {
        // Charger les classes depuis Supabase
        const { data: classesData, error } = await supabase
          .from('classes')
          .select('*')
          .order('class_name');

        if (error) {
          console.error('Erreur chargement classes:', error);
          // Fallback sur les données statiques en cas d'erreur
          const classesWithCount = REAL_CLASSES_DATA.map(classData => ({
            id: classData.id,
            day: classData.day,
            level: classData.level,
            class_name: classData.class_name,
            teacher_name: classData.teacher_name,
            room: classData.room,
            student_count: classData.students.length
          }));
          setClasses(classesWithCount);
        } else {
          // Charger le nombre d'étudiants pour chaque classe
          const classesWithCount = await Promise.all(classesData?.map(async (classData) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', classData.id);
            
            return {
              id: classData.id,
              day: classData.day,
              level: classData.level,
              class_name: classData.class_name,
              teacher_name: classData.teacher_name,
              room: classData.room,
              student_count: count || 0
            };
          }) || []);
          
          setClasses(classesWithCount);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        // Fallback sur les données statiques
        const classesWithCount = REAL_CLASSES_DATA.map(classData => ({
          id: classData.id,
          day: classData.day,
          level: classData.level,
          class_name: classData.class_name,
          teacher_name: classData.teacher_name,
          room: classData.room,
          student_count: classData.students.length
        }));
        setClasses(classesWithCount);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const handleSaveClass = async (formData: ClassFormData) => {
    if (classToEdit) {
      // Modification d'une classe existante
      try {
        const { error } = await supabase
          .from('classes')
          .update({
            day: formData.day,
            level: parseInt(formData.level),
            class_name: formData.class_name,
            teacher_name: formData.teacher_name,
            room: formData.room
          })
          .eq('id', classToEdit.id);

        if (error) {
          console.error('Erreur modification classe Supabase:', error);
          alert('Erreur lors de la modification de la classe');
          return;
        }

        // Mettre à jour l'état local seulement si Supabase réussit
        setClasses(classes.map(c => 
          c.id === classToEdit.id 
            ? {
                ...c,
                day: formData.day,
                level: parseInt(formData.level),
                class_name: formData.class_name,
                teacher_name: formData.teacher_name,
                room: formData.room
              }
            : c
        ));
        setClassToEdit(null);
        alert('Classe modifiée avec succès !');
      } catch (error) {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification de la classe');
      }
    } else {
      // Ajout d'une nouvelle classe
      try {
        const { data, error } = await supabase
          .from('classes')
          .insert({
            day: formData.day,
            level: parseInt(formData.level),
            class_name: formData.class_name,
            teacher_name: formData.teacher_name,
            room: formData.room
          })
          .select()
          .single();

        if (error) {
          console.error('Erreur ajout classe Supabase:', error);
          alert('Erreur lors de l\'ajout de la classe');
          return;
        }

        // Mettre à jour l'état local avec l'ID généré par Supabase
        const newClass: Class = {
          id: data.id,
          day: data.day,
          level: data.level,
          class_name: data.class_name,
          teacher_name: data.teacher_name,
          room: data.room,
          student_count: 0 // Nouvelle classe = 0 élève
        };
        setClasses([...classes, newClass]);
        alert('Classe ajoutée avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la classe');
      }
    }
  };

  const handleEditClass = (classItem: Class) => {
    setClassToEdit(classItem);
    setShowModal(true);
  };

  const handleAddClass = () => {
    setClassToEdit(null);
    setShowModal(true);
  };

  const handleDeleteClass = async (id: string) => {
    const classToDelete = classes.find(c => c.id === id);
    if (classToDelete && classToDelete.student_count > 0) {
      alert(`Impossible de supprimer la classe ${classToDelete.class_name} : elle contient ${classToDelete.student_count} élèves.`);
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erreur suppression classe Supabase:', error);
          alert('Erreur lors de la suppression de la classe');
          return;
        }

        // Mettre à jour l'état local seulement si Supabase réussit
        setClasses(classes.filter(c => c.id !== id));
        alert('Classe supprimée avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la classe');
      }
    }
  };

  // Grouper les classes par jour
  const classesByDay = classes.reduce((acc, classItem) => {
    if (!acc[classItem.day]) {
      acc[classItem.day] = [];
    }
    acc[classItem.day].push(classItem);
    return acc;
  }, {} as Record<string, Class[]>);

  if (loading) {
    return (
      <div className="page-layout">
        <div className="main-content flex items-center justify-center">
          <div className="text-center">
            <div className="loading-modern mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement des classes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Header
        title="Gestion des Classes"
        subtitle={`${classes.length} classes • ${classes.reduce((total, c) => total + c.student_count, 0)} élèves`}
        showBackButton={true}
        type="dashboard"
        actions={
          <button
            onClick={handleAddClass}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter une classe</span>
          </button>
        }
      />

      <main className="main-content">
        <div className="container-modern">
          {/* Statistiques Compactes */}
          <div className="grid-responsive cols-4 gap-6 mb-8">
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {classes.length}
              </div>
              <div className="text-sm text-gray-600">Total classes</div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {classes.reduce((total, c) => total + c.student_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total élèves</div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {Math.round(classes.reduce((total, c) => total + c.student_count, 0) / classes.length) || 0}
              </div>
              <div className="text-sm text-gray-600">Moyenne par classe</div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {Object.keys(classesByDay).length}
              </div>
              <div className="text-sm text-gray-600">Jours d&apos;ouverture</div>
            </div>
          </div>

          {/* Liste des Classes par Jour */}
          <div className="space-y-8">
            {Object.entries(classesByDay).map(([day, dayClasses]) => (
              <div key={day}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {day} ({dayClasses.length} classes)
                </h2>
                <div className="space-y-4">
                  {dayClasses.map((classItem) => (
                    <div key={classItem.id} className="card-premium">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                Classe {classItem.class_name} - Niveau {classItem.level}
                              </h3>
                              <span 
                                className="badge-level px-3 py-1 rounded-full text-sm font-semibold"
                                style={{
                                  background: `var(--green-${Math.min(classItem.level * 100 + 100, 400)})`,
                                  color: `var(--green-${Math.min(classItem.level * 100 + 700, 900)})`
                                }}
                              >
                                {classItem.student_count} élèves
                              </span>
                            </div>
                            <p className="text-gray-600 text-base">
                              {classItem.teacher_name} • {classItem.room}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => router.push(`/class/${classItem.id}`)}
                              className="btn-modern btn-secondary flex items-center gap-2 text-sm h-12"
                            >
                              <FileText className="w-4 h-4" />
                              Faire l&apos;appel
                            </button>
                            <button
                              onClick={() => router.push(`/admin/students`)}
                              className="btn-modern btn-secondary flex items-center gap-2 text-sm h-12"
                            >
                              <Users className="w-4 h-4" />
                              Voir élèves
                            </button>
                            <button
                              onClick={() => handleEditClass(classItem)}
                              className="btn-modern bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm h-12"
                            >
                              <Edit3 className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classItem.id)}
                              className="btn-modern bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm h-12"
                              disabled={classItem.student_count > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal pour ajouter/modifier une classe */}
      <ClassModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setClassToEdit(null);
        }}
        onSave={handleSaveClass}
        classToEdit={classToEdit}
        title={classToEdit ? "Modifier la classe" : "Ajouter une nouvelle classe"}
      />
    </div>
  );
} 