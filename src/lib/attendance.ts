// Système de gestion des données d'appel avec Supabase
import { supabase } from './supabase';
export interface AttendanceRecord {
  date: string;
  class_id: string;
  student_id: string;
  status: 'present' | 'absent_justified' | 'absent_unjustified';
  note?: string;
}

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

const STORAGE_KEY = 'cscbm_attendance_data';

// Sauvegarder une session d'appel complète (avec Supabase)
export async function saveAttendanceSession(session: AttendanceSession): Promise<void> {
  try {
    // Essayer d'abord avec Supabase
    const attendanceRecords = session.students.map(student => ({
      class_id: session.class_id,
      student_id: student.student_id,
      date: session.date,
      present: student.status === 'present',
      status: student.status,  // ← CORRECTION : Sauvegarde le vrai statut !
      notes: student.note || null
    }));

    // Supprimer les anciens enregistrements pour cette classe et cette date
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('class_id', session.class_id)
      .eq('date', session.date);

    if (deleteError) {
      console.warn('Erreur suppression anciens records:', deleteError);
    }

    // Insérer les nouveaux enregistrements
    const { error: insertError } = await supabase
      .from('attendance')
      .insert(attendanceRecords);

    if (insertError) {
      console.warn('Échec Supabase, utilisation localStorage:', insertError);
      return saveAttendanceSessionLocal(session);
    }

    console.log('Session d\'appel sauvegardée avec succès dans Supabase');
  } catch (error) {
    console.warn('Erreur Supabase, fallback localStorage:', error);
    return saveAttendanceSessionLocal(session);
  }
}

// Fonction locale de fallback
function saveAttendanceSessionLocal(session: AttendanceSession): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingData = getAttendanceDataLocal();
    const updatedData = existingData.filter(s => s.id !== session.id);
    updatedData.push(session);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale:', error);
  }
}

// Récupérer toutes les données d'appel (avec Supabase)
export async function getAttendanceData(): Promise<AttendanceSession[]> {
  try {
    // Essayer d'abord avec Supabase
    const { data: attendanceData, error } = await supabase
      .from('attendance')
      .select(`
        *,
        classes!inner(class_name, teacher_name),
        students!inner(first_name, last_name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Échec Supabase pour récupération, utilisation localStorage:', error);
      return getAttendanceDataLocal();
    }

    // Convertir les données Supabase en format AttendanceSession
    const sessionsMap = new Map<string, AttendanceSession>();

    attendanceData?.forEach((record: any) => {
      const sessionId = `session-${record.date}-${record.class_id}`;
      
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, {
          id: sessionId,
          date: record.date,
          class_id: record.class_id,
          class_name: record.classes.class_name,
          teacher_name: record.classes.teacher_name,
          students: []
        });
      }

      const session = sessionsMap.get(sessionId)!;
      session.students.push({
        student_id: record.student_id,
        student_name: `${record.students.first_name} ${record.students.last_name}`,
        status: record.present ? 'present' : 'absent_unjustified', // Simplification pour l'instant
        note: record.notes
      });
    });

    return Array.from(sessionsMap.values());
  } catch (error) {
    console.warn('Erreur Supabase, fallback localStorage:', error);
    return getAttendanceDataLocal();
  }
}

// Fonction locale de fallback
function getAttendanceDataLocal(): AttendanceSession[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture locale:', error);
    return [];
  }
}

// Récupérer les statistiques pour un élève (avec Supabase)
export async function getStudentStats(studentId: string): Promise<{
  total_sessions: number;
  present: number;
  absent_justified: number;
  absent_unjustified: number;
  attendance_rate: number;
  history: AttendanceRecord[];
}> {
  try {
    // Essayer d'abord avec Supabase
    const { data: attendanceData, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Échec Supabase pour stats élève, utilisation localStorage:', error);
      return getStudentStatsLocal(studentId);
    }

    const studentRecords: AttendanceRecord[] = attendanceData?.map(record => ({
      date: record.date,
      class_id: record.class_id || '',
      student_id: record.student_id || '',
      status: record.status || (record.present ? 'present' : 'absent_unjustified'), // ✅ Utilise le vrai status !
      note: record.notes
    })) || [];

    const present = studentRecords.filter(r => r.status === 'present').length;
    const absent_justified = studentRecords.filter(r => r.status === 'absent_justified').length;
    const absent_unjustified = studentRecords.filter(r => r.status === 'absent_unjustified').length;
    const total_sessions = studentRecords.length;

    return {
      total_sessions,
      present,
      absent_justified,
      absent_unjustified,
      attendance_rate: total_sessions > 0 ? Math.round((present / total_sessions) * 100) : 0,
      history: studentRecords
    };
  } catch (error) {
    console.warn('Erreur Supabase pour stats, fallback localStorage:', error);
    return getStudentStatsLocal(studentId);
  }
}

// Fonction locale de fallback pour les stats
function getStudentStatsLocal(studentId: string): {
  total_sessions: number;
  present: number;
  absent_justified: number;
  absent_unjustified: number;
  attendance_rate: number;
  history: AttendanceRecord[];
} {
  const allSessions = getAttendanceDataLocal();
  const studentRecords: AttendanceRecord[] = [];

  allSessions.forEach(session => {
    const studentData = session.students.find(s => s.student_id === studentId);
    if (studentData) {
      studentRecords.push({
        date: session.date,
        class_id: session.class_id,
        student_id: studentId,
        status: studentData.status,
        note: studentData.note
      });
    }
  });

  // Trier par date décroissante (plus récent en premier)
  studentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const present = studentRecords.filter(r => r.status === 'present').length;
  const absent_justified = studentRecords.filter(r => r.status === 'absent_justified').length;
  const absent_unjustified = studentRecords.filter(r => r.status === 'absent_unjustified').length;
  const total_sessions = studentRecords.length;

  return {
    total_sessions,
    present,
    absent_justified,
    absent_unjustified,
    attendance_rate: total_sessions > 0 ? Math.round((present / total_sessions) * 100) : 0,
    history: studentRecords
  };
}

// Générer des données d'exemple avec les nouveaux IDs de Supabase
export function generateSampleData(): void {
  if (typeof window === 'undefined') return;
  
  // Nettoyer les anciennes données localStorage avec les anciens IDs
  const existingData = getAttendanceDataLocal();
  const hasOldData = existingData.some(session => 
    session.students.some(student => student.student_id.startsWith('d'))
  );
  
  if (hasOldData) {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  if (getAttendanceDataLocal().length > 0) return; // Ne pas écraser les nouvelles données
  
  const sampleSessions: AttendanceSession[] = [
    {
      id: 'session-2025-01-18-be8a4b64-0955-43cf-a10b-7e92f489f6f2',
      date: '2025-01-18',
      class_id: 'be8a4b64-0955-43cf-a10b-7e92f489f6f2',
      class_name: 'D',
      teacher_name: 'Mme. Imane SARHAN',
      students: [
        { student_id: 'BELKHAOUEL_Mohamed', student_name: 'Mohamed BELKHAOUEL', status: 'present' },
        { student_id: 'BENABBOU_Manel', student_name: 'Manel BENABBOU', status: 'present' },
        { student_id: 'BENCAN_Huseyin', student_name: 'Huseyin BENCAN', status: 'absent_justified', note: 'Rendez-vous médical' },
        { student_id: 'BENCAN_Murat', student_name: 'Murat BENCAN', status: 'present' },
        { student_id: 'DIA_Samassa', student_name: 'Samassa DIA', status: 'present' },
        { student_id: 'HADJIMI_Sarah', student_name: 'Sarah HADJIMI', status: 'absent_unjustified' },
        { student_id: 'HADJIMI_Wassim', student_name: 'Wassim HADJIMI', status: 'present' },
        { student_id: 'HAKKOU_Ilyes', student_name: 'Ilyes HAKKOU', status: 'present' },
        { student_id: 'KELEBEK_Yasin', student_name: 'Yasin KELEBEK', status: 'present' },
        { student_id: 'NAZILI_Hafssa', student_name: 'Hafssa NAZILI', status: 'present' },
        { student_id: 'OLGUN_Emre', student_name: 'Emre OLGUN', status: 'present' },
        { student_id: 'OZDEMIR_Aysenur', student_name: 'Aysenur OZDEMIR', status: 'absent_justified', note: 'Maladie' },
        { student_id: 'SAGNA_Ibrahim', student_name: 'Ibrahim SAGNA', status: 'present' },
        { student_id: 'ZOUNGRANA_Fatimata', student_name: 'Fatimata ZOUNGRANA', status: 'present' },
      ]
    },
    {
      id: 'session-2025-01-11-be8a4b64-0955-43cf-a10b-7e92f489f6f2',
      date: '2025-01-11',
      class_id: 'be8a4b64-0955-43cf-a10b-7e92f489f6f2',
      class_name: 'D',
      teacher_name: 'Mme. Imane SARHAN',
      students: [
        { student_id: 'BELKHAOUEL_Mohamed', student_name: 'Mohamed BELKHAOUEL', status: 'present' },
        { student_id: 'BENABBOU_Manel', student_name: 'Manel BENABBOU', status: 'absent_unjustified' },
        { student_id: 'BENCAN_Huseyin', student_name: 'Huseyin BENCAN', status: 'present' },
        { student_id: 'BENCAN_Murat', student_name: 'Murat BENCAN', status: 'present' },
        { student_id: 'DIA_Samassa', student_name: 'Samassa DIA', status: 'present' },
        { student_id: 'HADJIMI_Sarah', student_name: 'Sarah HADJIMI', status: 'present' },
        { student_id: 'HADJIMI_Wassim', student_name: 'Wassim HADJIMI', status: 'present' },
        { student_id: 'HAKKOU_Ilyes', student_name: 'Ilyes HAKKOU', status: 'present' },
        { student_id: 'KELEBEK_Yasin', student_name: 'Yasin KELEBEK', status: 'absent_justified', note: 'Voyage familial' },
        { student_id: 'NAZILI_Hafssa', student_name: 'Hafssa NAZILI', status: 'present' },
        { student_id: 'OLGUN_Emre', student_name: 'Emre OLGUN', status: 'present' },
        { student_id: 'OZDEMIR_Aysenur', student_name: 'Aysenur OZDEMIR', status: 'present' },
        { student_id: 'SAGNA_Ibrahim', student_name: 'Ibrahim SAGNA', status: 'present' },
        { student_id: 'ZOUNGRANA_Fatimata', student_name: 'Fatimata ZOUNGRANA', status: 'present' },
      ]
    },
    {
      id: 'session-2025-01-04-class-d-samedi-1',
      date: '2025-01-04',
      class_id: 'class-d-samedi-1',
      class_name: 'D',
      teacher_name: 'Mme. Imane SARHAN',
      students: [
        { student_id: 'd1', student_name: 'Mohamed BELKHAOUEL', status: 'present' },
        { student_id: 'd2', student_name: 'Manel BENABBOU', status: 'present' },
        { student_id: 'd3', student_name: 'Huseyin BENCAN', status: 'present' },
        { student_id: 'd4', student_name: 'Murat BENCAN', status: 'absent_justified', note: 'Fête religieuse' },
        { student_id: 'd5', student_name: 'Samassa DIA', status: 'present' },
        { student_id: 'd6', student_name: 'Sarah HADJIMI', status: 'present' },
        { student_id: 'd7', student_name: 'Wassim HADJIMI', status: 'present' },
        { student_id: 'd8', student_name: 'Ilyes HAKKOU', status: 'present' },
        { student_id: 'd9', student_name: 'Yasin KELEBEK', status: 'present' },
        { student_id: 'd10', student_name: 'Hafssa NAZILI', status: 'present' },
        { student_id: 'd11', student_name: 'Emre OLGUN', status: 'present' },
        { student_id: 'd12', student_name: 'Aysenur OZDEMIR', status: 'present' },
        { student_id: 'd13', student_name: 'Ibrahim SAGNA', status: 'present' },
        { student_id: 'd14', student_name: 'Fatimata ZOUNGRANA', status: 'absent_unjustified' },
      ]
    },
    {
      id: 'session-2024-12-28-class-d-samedi-1',
      date: '2024-12-28',
      class_id: 'class-d-samedi-1',
      class_name: 'D',
      teacher_name: 'Mme. Imane SARHAN',
      students: [
        { student_id: 'd1', student_name: 'Mohamed BELKHAOUEL', status: 'present' },
        { student_id: 'd2', student_name: 'Manel BENABBOU', status: 'present' },
        { student_id: 'd3', student_name: 'Huseyin BENCAN', status: 'present' },
        { student_id: 'd4', student_name: 'Murat BENCAN', status: 'present' },
        { student_id: 'd5', student_name: 'Samassa DIA', status: 'present' },
        { student_id: 'd6', student_name: 'Sarah HADJIMI', status: 'present' },
        { student_id: 'd7', student_name: 'Wassim HADJIMI', status: 'present' },
        { student_id: 'd8', student_name: 'Ilyes HAKKOU', status: 'present' },
        { student_id: 'd9', student_name: 'Yasin KELEBEK', status: 'present' },
        { student_id: 'd10', student_name: 'Hafssa NAZILI', status: 'present' },
        { student_id: 'd11', student_name: 'Emre OLGUN', status: 'present' },
        { student_id: 'd12', student_name: 'Aysenur OZDEMIR', status: 'present' },
        { student_id: 'd13', student_name: 'Ibrahim SAGNA', status: 'present' },
        { student_id: 'd14', student_name: 'Fatimata ZOUNGRANA', status: 'present' },
      ]
    },
    // Session d'exemple pour classe F avec vrais IDs
    {
      id: 'session-2025-01-18-5742a892-00ea-4c3f-ac5b-a5b13d5c20ed',
      date: '2025-01-18',
      class_id: '5742a892-00ea-4c3f-ac5b-a5b13d5c20ed',
      class_name: 'F',
      teacher_name: 'Mme. Mina SABIRI',
      students: [
        { student_id: 'ANNE_Adam', student_name: 'Adam ANNE', status: 'present' },
        { student_id: 'SABIR_Marwa', student_name: 'Marwa SABIR', status: 'present' },
        { student_id: 'KHALLOUK_Lamia', student_name: 'Lamia KHALLOUK', status: 'absent_justified', note: 'Certificat médical' },
        { student_id: 'SABIR_Aya', student_name: 'Aya SABIR', status: 'present' },
        { student_id: 'KERNER_Maryam', student_name: 'Maryam KERNER', status: 'present' },
      ]
    }
  ];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSessions));
  }
} 