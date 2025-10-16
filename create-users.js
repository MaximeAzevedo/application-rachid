// Script pour créer les utilisateurs Supabase Auth
const { createClient } = require('@supabase/supabase-js');

// Vous devez fournir la Service Role Key
// Récupérez-la depuis: https://supabase.com/dashboard/project/hzaiqudxyhrpxcqsxbrj/settings/api
const supabaseUrl = 'https://hzaiqudxyhrpxcqsxbrj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2];

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trouvée dans .env.local');
  console.log('\n📝 Vous devez ajouter cette variable dans .env.local');
  console.log('Récupérez-la depuis: https://supabase.com/dashboard/project/hzaiqudxyhrpxcqsxbrj/settings/api');
  process.exit(1);
}

// Client admin avec service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  console.log('🚀 Création des utilisateurs Supabase Auth...\n');

  const users = [
    {
      email: 'admin@cscbm.org',
      password: 'CSCBM2025!Admin',
      full_name: 'Administrateur CSCBM',
      role: 'admin'
    },
    {
      email: 'teacher@cscbm.org',
      password: 'CSCBM2025!Teacher',
      full_name: 'Enseignant CSCBM',
      role: 'teacher'
    }
  ];

  for (const userData of users) {
    console.log(`📧 Création de ${userData.email}...`);
    
    try {
      // Créer l'utilisateur dans Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirmer l'email
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  ${userData.email} existe déjà`);
          
          // Récupérer l'utilisateur existant
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === userData.email);
          
          if (existingUser) {
            // Mettre à jour le profil
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role
              });

            if (updateError) {
              console.log(`   ❌ Erreur mise à jour profil: ${updateError.message}`);
            } else {
              console.log(`   ✅ Profil mis à jour`);
            }
          }
        } else {
          console.log(`   ❌ Erreur: ${error.message}`);
        }
      } else if (data.user) {
        console.log(`   ✅ Utilisateur créé: ${data.user.id}`);
        
        // Créer/mettre à jour le profil dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role
          });

        if (profileError) {
          console.log(`   ⚠️  Erreur création profil: ${profileError.message}`);
        } else {
          console.log(`   ✅ Profil créé`);
        }
        
        console.log(`   🔑 Mot de passe: ${userData.password}`);
      }
    } catch (err) {
      console.log(`   ❌ Erreur inattendue: ${err.message}`);
    }
    
    console.log('');
  }

  console.log('✨ Script terminé !\n');
  console.log('📝 Identifiants de connexion:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:');
  console.log('   Email: admin@cscbm.org');
  console.log('   Pass:  CSCBM2025!Admin');
  console.log('');
  console.log('👨‍🏫 Enseignant:');
  console.log('   Email: teacher@cscbm.org');
  console.log('   Pass:  CSCBM2025!Teacher');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

createUsers().catch(console.error);

