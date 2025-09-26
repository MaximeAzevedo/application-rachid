export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#059669',
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          🎉 CSCBM Application
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          L&apos;application fonctionne maintenant ! <br/>
          Build réussi et déploiement OK sur Vercel.
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
            ✅ Erreurs TypeScript corrigées<br/>
            ✅ Build Next.js réussi<br/>
            ✅ Déploiement Vercel actif
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
            fontWeight: '600'
          }}
        >
          Accéder à l&apos;application →
        </a>

        <p style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          marginTop: '1rem'
        }}>
          Si vous voyez cette page, le problème 404 est résolu !
        </p>
      </div>
    </div>
  );
} 