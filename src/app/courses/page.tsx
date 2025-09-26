'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { REAL_CLASSES_DATA } from '@/data/classes';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState(REAL_CLASSES_DATA);
  const [classesLoading, setClassesLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Charger les classes depuis Supabase
    const loadClasses = async () => {
      try {
        const { data: classesData, error } = await supabase
          .from('classes')
          .select('*')
          .order('class_name');

        if (error) {
          console.error('Erreur chargement classes:', error);
          // Fallback sur les données statiques
          setClasses(REAL_CLASSES_DATA);
        } else {
          // Transformer les données Supabase et charger le nombre d'étudiants
          const classesWithStudents = await Promise.all(classesData?.map(async (classData) => {
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
              students: Array(count || 0).fill({}) // Tableau avec le bon nombre pour .length
            };
          }) || []);
          
          setClasses(classesWithStudents);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        setClasses(REAL_CLASSES_DATA);
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Header
        title="Faire mon cours"
        subtitle="Sélectionnez votre classe pour commencer l'appel"
        showBackButton={true}
        backUrl="/dashboard"
        type="dashboard"
      />

      <main className="main-content">
        <div className="container-modern">
          {/* Statistiques rapides */}
          <div className="grid-responsive cols-3 gap-6 mb-8">
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {classes.length}
              </div>
              <div className="text-sm text-gray-600">Classes disponibles</div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {classes.reduce((total, c) => total + c.students.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Élèves au total</div>
            </div>
            <div className="card-stat">
              <div className="text-3xl font-bold text-gradient-green mb-2">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="text-sm text-gray-600">Aujourd&apos;hui</div>
            </div>
          </div>

          {/* Liste des classes */}
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-bold">Choisir votre classe</h2>
              <span className="text-sm text-gray-500 ml-auto">
                Cliquez sur une classe pour commencer l&apos;appel
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => router.push(`/class/${classItem.id}`)}
                  className="group bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 border border-gray-200 hover:border-blue-300 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">
                          Classe {classItem.class_name}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold group-hover:bg-green-200">
                          Niveau {classItem.level}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">👨‍🏫</span>
                          <span className="text-sm font-medium text-gray-700">
                            {classItem.teacher_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">📅</span>
                          <span className="text-sm text-gray-600">{classItem.day}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">🏫</span>
                          <span className="text-sm text-gray-600">{classItem.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {classItem.students.length} élèves
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Commencer l&apos;appel</span>
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message d'aide */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-bold text-blue-800 mb-2">Comment procéder ?</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>Sélectionnez votre classe</strong> dans la liste ci-dessus</p>
                  <p>• <strong>Marquez les présences</strong> de chaque élève</p>
                  <p>• <strong>Ajoutez des notes pédagogiques</strong> si nécessaire</p>
                  <p>• <strong>Enregistrez l&apos;appel</strong> pour finaliser</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 