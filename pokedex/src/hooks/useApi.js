import { useState, useEffect, useCallback } from 'react';

export function useApi(peticion, deps = []) {
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);
  const [intento, setIntento]   = useState(0);

  const reintentar = useCallback(() => setIntento(n => n + 1), []);

  useEffect(() => {
    const controlador = new AbortController();

    setCargando(true);
    setError(null);

    peticion(controlador.signal)
      .then(resultado => setDatos(resultado))
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intento]);

  return { datos, cargando, error, reintentar };
}