'use server';

// Server Actions pour la gestion des présences et envoi de SMS
// Ces fonctions s'exécutent côté serveur et ont accès aux variables d'environnement

import { sendBulkAbsenceSMS, type SMSNotification } from '@/lib/sms';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AttendanceSession {
  id: string;
  date: string;
  class_id: string;
  class_name: string;
  teacher_name: string;
  students: {
    student_id: string;
    student_name: string;
    status: 'present' | 'absent_justified' | 'absent_unjustified';
    note?: string;
  }[];
}

// Server Action pour envoyer les SMS d'absence
export async function sendAbsenceSMSAction(session: AttendanceSession): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  error?: string;
}> {
  try {
    console.log('🔍 [SERVER ACTION] Analyse des absences:', {
      total_students: session.students.length,
      statuts: session.students.map(s => `${s.student_name}: ${s.status}`)
    });
    
    // Filtrer UNIQUEMENT les élèves avec absence NON justifiée
    const absentStudents = session.students.filter(
      student => student.status === 'absent_unjustified'
    );
    
    console.log(`📊 [SERVER ACTION] ${absentStudents.length} absence(s) NON justifiée(s) trouvée(s)`);
    
    if (absentStudents.length === 0) {
      console.log('✅ [SERVER ACTION] Aucune absence non justifiée, pas de SMS à envoyer');
      return { success: true, sent: 0, failed: 0 };
    }
    
    // 🔒 Créer un client Supabase authentifié côté serveur
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignorer les erreurs de cookies en lecture seule
            }
          },
        },
      }
    );
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [SERVER ACTION] Utilisateur non authentifié:', authError);
      return {
        success: false,
        sent: 0,
        failed: absentStudents.length,
        error: 'Utilisateur non authentifié'
      };
    }
    
    console.log('🔐 [SERVER ACTION] Client Supabase authentifié pour:', user.email);
    
    // Récupérer les numéros de téléphone des parents depuis Supabase
    const studentIds = absentStudents.map(s => s.student_id);
    
    console.log('📋 [SERVER ACTION] Recherche des numéros pour:', studentIds);
    
    const { data: studentsData, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, parent_phone')
      .in('id', studentIds);
    
    if (error) {
      console.error('❌ [SERVER ACTION] Erreur récupération numéros:', error);
      return {
        success: false,
        sent: 0,
        failed: absentStudents.length,
        error: 'Erreur lors de la récupération des numéros de téléphone'
      };
    }
    
    console.log('📞 [SERVER ACTION] Données récupérées:', studentsData?.length || 0, 'élève(s)');
    console.log('📊 [SERVER ACTION] Détails:', studentsData?.map(s => ({
      id: s.id,
      nom: `${s.first_name} ${s.last_name}`,
      tel: s.parent_phone ? '✅' : '❌'
    })));
    
    // Préparer les notifications SMS
    const smsNotifications: SMSNotification[] = [];
    
    for (const student of absentStudents) {
      const studentData = studentsData?.find(s => s.id === student.student_id);
      
      if (studentData?.parent_phone) {
        console.log(`📱 [SERVER ACTION] Préparation SMS pour ${studentData.first_name} ${studentData.last_name}:`, {
          to: studentData.parent_phone,
          teacher: session.teacher_name,
          status: student.status
        });
        
        smsNotifications.push({
          to: studentData.parent_phone,
          studentName: `${studentData.first_name} ${studentData.last_name}`,
          className: session.class_name,
          teacherName: session.teacher_name || 'Professeur',
          date: session.date,
          status: student.status as 'absent_justified' | 'absent_unjustified'
        });
      } else {
        console.warn(`⚠️ [SERVER ACTION] Pas de numéro pour l'élève ${student.student_name}`);
      }
    }
    
    if (smsNotifications.length === 0) {
      console.log('⚠️ [SERVER ACTION] Aucun numéro de téléphone disponible');
      return {
        success: false,
        sent: 0,
        failed: absentStudents.length,
        error: 'Aucun numéro de téléphone disponible pour les absents'
      };
    }
    
    // Envoyer les SMS directement (pas de fetch, on est déjà côté serveur)
    console.log(`📤 [SERVER ACTION] Envoi de ${smsNotifications.length} SMS...`);
    const results = await sendBulkAbsenceSMS(smsNotifications);
    
    console.log(`✅ [SERVER ACTION] SMS envoyés: ${results.sent} réussis, ${results.failed} échoués`);
    
    return {
      success: results.sent > 0,
      sent: results.sent,
      failed: results.failed
    };
    
  } catch (error) {
    console.error('❌ [SERVER ACTION] Erreur lors de l\'envoi des SMS:', error);
    return {
      success: false,
      sent: 0,
      failed: session.students.filter(s => s.status === 'absent_unjustified').length,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

