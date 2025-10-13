'use server';

// Server Actions pour la gestion des présences et envoi de SMS
// Ces fonctions s'exécutent côté serveur et ont accès aux variables d'environnement

import { sendBulkAbsenceSMS, type SMSNotification } from '@/lib/sms';
import { supabase } from '@/lib/supabase';

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
    
    // Récupérer les numéros de téléphone des parents depuis Supabase
    const studentIds = absentStudents.map(s => s.student_id);
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

