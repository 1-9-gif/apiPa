import { useState } from 'react';
import { obtenerLista, obtenerPokemon } from './api/pokeapi.js';
import { useApi } from './hooks/useApi.js';
import { useDebounce } from './hooks/useDebounce.js';
import EstadoPeticion from './components/EstadoPeticion.jsx';

const POR_PAGINA = 20;

export default function App() {
  const [texto, setTexto]         = useState('');
  const [pagina, setPagina]       = useState(0);
  const [seleccion, setSeleccion] = useState(null);

  const busqueda = useDebounce(texto.trim().toLowerCase(), 400);
  const enBusqueda = busqueda.length > 0;

  // Petición 1: la lista paginada (solo si NO hay búsqueda activa)
  const lista = useApi(
    signal => enBusqueda
      ? Promise.resolve(null)
      : obtenerLista({ limite: POR_PAGINA, offset: pagina * POR_PAGINA, signal }),
    [pagina, enBusqueda]
  );

  // Petición 2: el resultado de la búsqueda
  const resultado = useApi(
    signal => enBusqueda
      ? obtenerPokemon(busqueda, { signal })
      : Promise.resolve(null),
    [busqueda]
  );

  // Petición 3: DEPENDIENTE — solo se dispara si hay algo seleccionado
  const detalle = useApi(
    signal => seleccion
      ? obtenerPokemon(seleccion, { signal })
      : Promise.resolve(null),
    [seleccion]
  );

  const totalPaginas = lista.datos ? Math.ceil(lista.datos.total / POR_PAGINA) : 0;

  return (
    <div className="contenedor" style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
      
      {/* Columna Principal */}
      <div style={{ flex: 1 }}>
        <h1>⚡ Pokédex</h1>

        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Busca por nombre: pikachu, charizard…"
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', fontSize: '1rem' }}
        />

        {enBusqueda ? (
          <EstadoPeticion
            cargando={resultado.cargando}
            error={resultado.error}
            onReintentar={resultado.reintentar}
          >
            {resultado.datos && (
              <article style={{ textAlign: 'center', padding: '2rem', border: '2px solid #eee', borderRadius: '8px' }}>
                <img src={resultado.datos.imagen} alt={resultado.datos.nombre} width="200" />
                <h2 style={{ textTransform: 'capitalize' }}>#{resultado.datos.id} {resultado.datos.nombre}</h2>
                <p>{resultado.datos.tipos.join(' · ')}</p>
                <p>{resultado.datos.alturaM} m · {resultado.datos.pesoKg} kg</p>
              </article>
            )}
          </EstadoPeticion>
        ) : (
          <>
            <EstadoPeticion
              cargando={lista.cargando}
              error={lista.error}
              vacio={lista.datos?.resultados.length === 0}
              onReintentar={lista.reintentar}
            >
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {lista.datos?.resultados.map(p => (
                  <li key={p.id}>
                    <button 
                      onClick={() => setSeleccion(p.nombre)}
                      style={{ width: '100%', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
                    >
                      <img src={p.imagen} alt={p.nombre} loading="lazy" width="96" />
                      <span style={{ display: 'block', textTransform: 'capitalize', marginTop: '0.5rem' }}>#{p.id} {p.nombre}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </EstadoPeticion>

            <nav style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'center' }}>
              <button disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>
                ← Anterior
              </button>
              <span>Página {pagina + 1} de {totalPaginas || '…'}</span>
              <button disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>
                Siguiente →
              </button>
            </nav>
          </>
        )}
      </div>

      {/* Panel Lateral (Detalle) */}
      {seleccion && (
        <aside style={{ width: '300px', padding: '1.5rem', borderLeft: '2px solid #eee', position: 'relative' }}>
          <button 
            onClick={() => setSeleccion(null)} 
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
          
          <EstadoPeticion cargando={detalle.cargando} error={detalle.error}>
            {detalle.datos && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <img src={detalle.datos.imagen} alt={detalle.datos.nombre} width="180" />
                <h2 style={{ textTransform: 'capitalize' }}>#{detalle.datos.id} {detalle.datos.nombre}</h2>
                
                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginTop: '1.5rem' }}>
                  {detalle.datos.stats.map(s => (
                    <li key={s.nombre} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ textTransform: 'uppercase' }}>{s.nombre}</span>
                        <strong>{s.valor}</strong>
                      </div>
                      <progress value={s.valor} max="200" style={{ width: '100%', height: '8px' }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </EstadoPeticion>
        </aside>
      )}

    </div>
  );
}