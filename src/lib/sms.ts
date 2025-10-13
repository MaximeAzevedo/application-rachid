// Service d'envoi de SMS via Twilio
// Configuration et gestion des notifications d'absence

import twilio from 'twilio';

// Types
export interface SMSNotification {
  to: string; // Numéro de téléphone du destinataire
  studentName: string;
  className: string;
  teacherName: string; // Nom du professeur
  date: string;
  status: 'absent_justified' | 'absent_unjustified';
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Initialiser le client Twilio
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Variables Twilio manquantes. Vérifiez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN');
  }
  
  return twilio(accountSid, authToken);
}

// Formater le message SMS (message complet = 2 segments)
function formatSMSMessage(notification: SMSNotification): string {
  const date = new Date(notification.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Message complet avec toutes les informations (~240 caractères = 2 segments)
  return `Assalam wa3leykoum,

Nous vous informons que ${notification.studentName} a été marqué(e) en absence non justifiée le ${date} au cours de ${notification.teacherName}

Merci de contacter le 06 70 16 46 42 pour justifier son absence.

CSCBM`;
}

// Envoyer un SMS via Twilio
export async function sendAbsenceSMS(notification: SMSNotification): Promise<SMSResult> {
  try {
    console.log('📤 Tentative envoi SMS:', {
      to: notification.to,
      student: notification.studentName,
      teacher: notification.teacherName,
      status: notification.status,
      date: notification.date
    });
    
    // Vérifier que le numéro existe et est valide
    if (!notification.to || notification.to.trim() === '') {
      return {
        success: false,
        error: 'Numéro de téléphone manquant'
      };
    }
    
    // Vérifier que le numéro est au format international
    if (!notification.to.startsWith('+')) {
      return {
        success: false,
        error: 'Le numéro doit être au format international (+33...)'
      };
    }
    
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER non configuré');
    }
    
    const message = formatSMSMessage(notification);
    
    // Envoyer le SMS
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: notification.to
    });
    
    console.log(`✅ SMS envoyé avec succès à ${notification.to} (ID: ${result.sid})`);
    
    return {
      success: true,
      messageId: result.sid
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Envoyer plusieurs SMS (pour les absences multiples)
export async function sendBulkAbsenceSMS(
  notifications: SMSNotification[]
): Promise<{ sent: number; failed: number; results: SMSResult[] }> {
  const results: SMSResult[] = [];
  let sent = 0;
  let failed = 0;
  
  // Envoyer les SMS un par un (Twilio gère le rate limiting)
  for (const notification of notifications) {
    const result = await sendAbsenceSMS(notification);
    results.push(result);
    
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    
    // Petite pause entre chaque envoi pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`📊 Résumé d'envoi: ${sent} réussis, ${failed} échoués`);
  
  return { sent, failed, results };
} 