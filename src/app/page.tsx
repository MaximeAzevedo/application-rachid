// Page de test ultra-simple pour diagnostiquer le problème Vercel
export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{
          color: '#059669',
          fontSize: '2rem',
          margin: '0 0 1rem 0'
        }}>
          🎉 CSCBM App - Test de Diagnostic
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          Si vous voyez cette page, cela signifie que le problème est résolu !<br/>
          L'application Next.js fonctionne correctement sur Vercel.
        </p>

        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{
            color: '#059669',
            margin: 0,
            fontWeight: '500'
          }}>
            ✅ Build réussi<br/>
            ✅ Déploiement réussi<br/>
            ✅ Application accessible
          </p>
        </div>

        <a 
          href="/login" 
          style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Aller vers la page de connexion →
        </a>

        <p style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          marginTop: '1rem',
          margin: '1rem 0 0 0'
        }}>
          Une fois que ce test fonctionne, nous pourrons restaurer les fonctionnalités complètes.
        </p>
      </div>
    </div>
  );
} 