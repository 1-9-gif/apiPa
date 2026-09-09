const BASE = 'https://pokeapi.co/api/v2';

const SPRITES =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/** Traduce la respuesta cruda de la API a la forma que usa nuestra app. */
function adaptarPokemon(d) {
  return {
    id: d.id,
    nombre: d.name,
    imagen:
      d.sprites.other['official-artwork'].front_default ??
      d.sprites.front_default,
    tipos: d.types.map(t => t.type.name),
    alturaM: d.height / 10,       // la API responde en decímetros
    pesoKg: d.weight / 10,        // y en hectogramos
    stats: d.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat })),
  };
}

/** Lista paginada → { total, resultados: [{ id, nombre, imagen }] } */
export async function obtenerLista({ limite = 20, offset = 0, signal } = {}) {
  const res = await fetch(`${BASE}/pokemon?limit=${limite}&offset=${offset}`, { signal });

  if (!res.ok) {
    throw new Error(`No se pudo cargar la lista (error ${res.status})`);
  }

  const data = await res.json();

  return {
    total: data.count,
    resultados: data.results.map(p => {
      // la URL termina en /pokemon/25/ → sacamos el id del final
      const id = Number(p.url.split('/').filter(Boolean).pop());
      return { id, nombre: p.name, imagen: `${SPRITES}/${id}.png` };
    }),
  };
}

/** Detalle de un Pokémon por nombre o id. */
export async function obtenerPokemon(nombreOId, { signal } = {}) {
  const clave = String(nombreOId).trim().toLowerCase();
  const res = await fetch(`${BASE}/pokemon/${clave}`, { signal });

  if (res.status === 404) {
    throw new Error(`No encontramos ningún Pokémon llamado "${clave}"`);
  }
  if (!res.ok) {
    throw new Error(`Algo salió mal (error ${res.status})`);
  }

  return adaptarPokemon(await res.json());
}