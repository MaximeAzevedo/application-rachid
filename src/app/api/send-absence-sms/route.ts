// API Route: Envoi de SMS pour les absences
// POST /api/send-absence-sms
// ⚠️ ROUTE PROTÉGÉE - Authentification Supabase requise

import { NextRequest, NextResponse } from 'next/server';
import { sendAbsenceSMS, sendBulkAbsenceSMS, type SMSNotification } from '@/lib/sms';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 🔒 VÉRIFICATION AUTHENTIFICATION
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé - Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Vérifier que le token est valide
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé - Token invalide' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin ou teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Non autorisé - Privilèges insuffisants' },
        { status: 403 }
      );
    }

    // ✅ Utilisateur authentifié et autorisé
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