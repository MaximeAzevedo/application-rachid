// API Route: Envoi de SMS pour les absences
// POST /api/send-absence-sms

import { NextRequest, NextResponse } from 'next/server';
import { sendAbsenceSMS, sendBulkAbsenceSMS, type SMSNotification } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifier si c'est un envoi unique ou multiple
    if (Array.isArray(body)) {
      // Envoi multiple
      const notifications: SMSNotification[] = body;
      
      if (notifications.length === 0) {
        return NextResponse.json(
          { error: 'Aucune notification à envoyer' },
          { status: 400 }
        );
      }
      
      const results = await sendBulkAbsenceSMS(notifications);
      
      return NextResponse.json({
        success: true,
        sent: results.sent,
        failed: results.failed,
        results: results.results
      });
      
    } else {
      // Envoi unique
      const notification: SMSNotification = body;
      
      // Validation des données
      if (!notification.to || !notification.studentName || !notification.className) {
        return NextResponse.json(
          { error: 'Données manquantes (to, studentName, className requis)' },
          { status: 400 }
        );
      }
      
      const result = await sendAbsenceSMS(notification);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          messageId: result.messageId
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error('Erreur dans l\'API send-absence-sms:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de l\'envoi du SMS',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 