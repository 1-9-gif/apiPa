export default function EstadoPeticion({
    cargando, error, vacio, onReintentar, children,
  }) {
    if (cargando) {
      return <p className="estado" style={{ color: '#666' }}>⏳ Cargando…</p>;
    }
  
    if (error) {
      return (
        <div className="estado estado--error" style={{ color: '#d32f2f', padding: '1rem', border: '1px solid currentColor', borderRadius: '4px' }}>
          <p>⚠️ {error}</p>
          <button onClick={onReintentar} style={{ marginTop: '0.5rem' }}>Reintentar</button>
        </div>
      );
    }
  
    if (vacio) {
      return <p className="estado">🔍 Sin resultados</p>;
    }
  
    return children;
  }