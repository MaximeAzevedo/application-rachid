// Script pour mettre à jour les 6 derniers numéros
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables depuis .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || 'https://hzaiqudxyhrpxcqsxbrj.supabase.co';
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Nettoyer un numéro
function cleanPhoneNumber(phone) {
  if (!phone || phone === '0' || phone.trim() === '') return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (/^[67]\d{8}$/.test(cleaned)) cleaned = '0' + cleaned;
  if (cleaned.startsWith('0')) cleaned = '+33' + cleaned.substring(1);
  if (!cleaned.startsWith('+')) cleaned = '+33' + cleaned;
  if (!/^\+33[67]\d{8}$/.test(cleaned)) return null;
  return cleaned;
}

// 6 mises à jour restantes
const updates = [
  { id: 'AL_Adib', phone: '0783709367', name: 'Adib AL (= Adib Al Kaisi)' },
  { id: 'HADJIMI_Amine', phone: '0619774735', name: 'Amine HADJIMI (= Mohamed Amine)' },
  // Famille Gorduk - même numéro pour plusieurs enfants
  { id: 'GORDUK_Malik', phone: '0749762278', name: 'Malik GORDUK' },
  { id: 'GORDUK_Nevfel', phone: '0749762278', name: 'Nevfel GORDUK' },
  { id: 'GORDUK_Hasna', phone: '0749762278', name: 'Hasna GORDUK' }, // Utilise le même numéro
  { id: 'GORDUK_Seyyid', phone: '0651931398', name: 'Seyyid GORDUK' }
];

async function updateFinalPhones() {
  console.log('🔄 Mise à jour des 6 derniers numéros...\n');
  
  let updated = 0;
  let notFound = 0;
  
  for (const item of updates) {
    const cleanedPhone = cleanPhoneNumber(item.phone);
    
    if (!cleanedPhone) {
      console.log(`⚠️  ${item.name}: Numéro invalide (${item.phone})`);
      continue;
    }
    
    const { error } = await supabase
      .from('students')
      .update({ parent_phone: cleanedPhone })
      .eq('id', item.id);
    
    if (error) {
      console.log(`❌ ${item.name}: Non trouvé ou erreur`);
      notFound++;
    } else {
      console.log(`✅ ${item.name}: ${cleanedPhone}`);
      updated++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${updated} numéros ajoutés`);
  console.log(`❌ ${notFound} non trouvés`);
  console.log('='.repeat(60));
  
  // Afficher le total final
  const { data: studentsWithPhone } = await supabase
    .from('students')
    .select('id')
    .not('parent_phone', 'is', null);
  
  console.log(`\n📱 TOTAL FINAL: ${studentsWithPhone?.length || 0} élèves avec numéro de téléphone`);
}

updateFinalPhones().catch(console.error);

