'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { REAL_CLASSES_DATA } from '@/data/classes';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [classes, setClasses] = useState(REAL_CLASSES_DATA);
  const [totalStudents, setTotalStudents] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Charger les classes et étudiants depuis Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Charger les classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .order('class_name');

        if (classesError) {
          console.error('Erreur chargement classes:', classesError);
          setClasses(REAL_CLASSES_DATA);
          setTotalStudents(REAL_CLASSES_DATA.reduce((total, c) => total + c.students.length, 0));
        } else {
          const transformedClasses = classesData?.map(classData => ({
            id: classData.id,
            day: classData.day,
            level: classData.level,
            class_name: classData.class_name,
            teacher_name: classData.teacher_name,
            room: classData.room,
            students: [] // Pour la compatibilité, on chargera le compte séparément
          })) || [];
          
          setClasses(transformedClasses);

          // Charger le nombre total d'étudiants
          const { count: studentsCount, error: studentsError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });

          if (studentsError) {
            console.error('Erreur chargement étudiants:', studentsError);
            setTotalStudents(REAL_CLASSES_DATA.reduce((total, c) => total + c.students.length, 0));
          } else {
            setTotalStudents(studentsCount || 0);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données dashboard:', error);
        setClasses(REAL_CLASSES_DATA);
        setTotalStudents(REAL_CLASSES_DATA.reduce((total, c) => total + c.students.length, 0));
      }
    };

    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

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
        title="CSCBM"
        subtitle="Centre Socio-Culturel du Bassin Méditerranéen"
        type="dashboard"
        user={{
          name: profile?.full_name || 'Administrateur',
          email: profile?.email || user?.email
        }}
        onSignOut={handleSignOut}
      />

      <main className="main-content">
        <div className="container-modern">
          {/* Stats avec vrai vert */}
          <div className="grid-responsive cols-3 mb-8">
            <div className="card-stat">
              <div className="text-2xl font-bold text-gradient-green mb-2">{classes.length}</div>
              <div className="text-sm text-muted-foreground">Classes</div>
            </div>
            <div className="card-stat">
              <div className="text-2xl font-bold text-gradient-green mb-2">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Élèves</div>
            </div>
            <div className="card-stat">
              <div className="text-2xl font-bold text-gradient-green mb-2">{Math.round(totalStudents / classes.length)}</div>
              <div className="text-sm text-muted-foreground">Moyenne</div>
            </div>
          </div>

          {/* Section principale - Boutons d'action */}
          <div className="grid-responsive cols-3 gap-6">
            {/* Bouton Faire mon cours */}
            <div 
              className="card-premium interactive cursor-pointer group hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/courses')}
            >
              <div className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">📚</span>
                </div>
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full mb-4">
                  {classes.length} classes
                </span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  Faire mon cours
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sélectionner une classe pour gérer votre cours
                </p>
              </div>
            </div>

            {/* Gérer Élèves */}
            <div 
              className="card-premium interactive cursor-pointer group hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/admin/students')}
            >
              <div className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">👥</span>
                </div>
                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-4">
                  {totalStudents} élèves
                </span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                  Gérer les Élèves
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Ajouter et modifier les élèves
                </p>
                <p className="text-xs text-gray-500">
                  Consulter l&apos;historique des présences et les notes pédagogiques
                </p>
              </div>
            </div>

            {/* Gérer Classes */}
            <div 
              className="card-premium interactive cursor-pointer group hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/admin/classes')}
            >
              <div className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">🏫</span>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full mb-4">
                  {classes.length} classes
                </span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                  Gérer les Classes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Créer et organiser vos classes
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 