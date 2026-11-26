'use strict';
/* EVAU · Expediente Vivo de Atención USAER/UDEEI · núcleo: utilidades, catálogos, almacenamiento y dictado */
const VERSION = '1.6.0';
const CLAVE = '0000';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const p2 = n => String(n).padStart(2, '0');
const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
const ahora = () => { const d = new Date(); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fcorta = f => f ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : '';
const fdm = f => f ? Number(f.slice(8, 10)) + ' ' + MESES[Number(f.slice(5, 7)) - 1].slice(0, 3) : '';
const flarga = f => f ? Number(f.slice(8, 10)) + ' de ' + MESES[Number(f.slice(5, 7)) - 1] + ' de ' + f.slice(0, 4) : '';
const lineas = t => String(t || '').split('\n').map(s => s.trim()).filter(Boolean);
function edad(fn) {
  if (!fn) return '';
  const h = new Date(), n = new Date(fn + 'T12:00:00');
  let a = h.getFullYear() - n.getFullYear(), m = h.getMonth() - n.getMonth();
  if (h.getDate() < n.getDate()) m--;
  if (m < 0) { a--; m += 12; }
  return a + ' años ' + m + ' meses';
}

/* ---------- Catálogos ----------
   Plan de intervención: estructura del formato «Plan de Intervención Educativa» que usa la USAER (apartados, áreas y tipos).
   Estadística: estructura del cuestionario 911 USAER-1 con el catálogo de condiciones de la Plantilla interna de la USAER (incluye «Otras condiciones: Dificultad severa…»)
   para alumnos sin diagnóstico. Lo demás son modelos de uso común, no oficiales. */
const CAT = {
  roles: { apoyo: 'Maestra/o de apoyo', psicologia: 'Psicología', comunicacion: 'Comunicación', direccion: 'Dirección (consulta y carpeta general)' },
  turnos: ['Matutino', 'Vespertino', 'Jornada ampliada', 'Tiempo completo'],
  grados: ['1°', '2°', '3°', '4°', '5°', '6°'],
  tiposRegistro: ['Apoyo individual', 'Acompañamiento en aula', 'Asesoría a docente', 'Orientación a familia', 'Entrevista', 'Seguimiento', 'Observación', 'Incidencia', 'Canalización'],
  /* Catálogo de la Plantilla interna de inicio de la USAER (estructura del 911 USAER-1), recibida el 23/11/2026 */
  condiciones: ['En detección (sin condición identificada)', 'Ceguera', 'Baja visión', 'Sordera', 'Hipoacusia', 'Sordoceguera', 'Discapacidad motriz', 'Discapacidad intelectual', 'Discapacidad psicosocial', 'Discapacidad múltiple', 'Trastorno del espectro autista', 'TDAH', 'Aptitudes sobresalientes intelectuales', 'Aptitudes sobresalientes creativas', 'Aptitudes sobresalientes socioafectivas', 'Aptitudes sobresalientes artísticas', 'Aptitudes sobresalientes psicomotrices', 'Aptitudes sobresalientes (tipo por especificar)', 'Dificultad severa de conducta', 'Dificultad severa de comunicación', 'Dificultad severa de aprendizaje', 'Otras condiciones'],
  /* Alumnos sin diagnóstico: no llevan plan de intervención ni evaluación psicopedagógica, solo informe final del ciclo */
  sinDiagnostico: ['En detección (sin condición identificada)', 'Dificultad severa de conducta', 'Dificultad severa de comunicación', 'Dificultad severa de aprendizaje'],
  /* Formato del plan de intervención */
  areas: ['Cognoscitiva', 'Motrices', 'Sociales', 'Afectivas', 'Académicas', 'Comunicativo-lingüística', 'Independencia y autocuidado'],
  bapCats: ['Del contexto físico y sensorial', 'Metodológicas o didácticas', 'Organizativas', 'Actitudinales', 'Sociofamiliares'],
  aula: ['Ambientales', 'Organizativas', 'Espaciales', 'Comunicativas', 'Sensoriales', 'Para la participación'],
  apoyos: ['Apoyo personal', 'Apoyos visuales', 'Material didáctico', 'Materiales sensoriales', 'Vinculación con instituciones externas'],
  curriculo: ['Metodología', 'Evaluación', 'Procesos de desarrollo de aprendizaje'],
  fases: ['Fase 2', 'Fase 3', 'Fase 4', 'Fase 5', 'Fase 6'],
  campos: ['Lenguajes', 'Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades', 'De lo Humano y lo Comunitario'],
  cortes: ['Noviembre', 'Marzo', 'Junio'],
  necesidadesPadres: [
    'Necesitan información clara y precisa sobre la condición de su hija o hijo para comprender mejor sus características (pláticas, conferencias, talleres).',
    'Necesitan asesoría para implementar un sistema alternativo de comunicación que favorezca las habilidades comunicativas y lingüísticas de su hija o hijo.',
    'Necesitan orientación sobre estrategias de conducta para incidir positivamente en el comportamiento de su hija o hijo y evitar situaciones de conflicto.',
    'Necesitan asesoría para diseñar e implementar materiales específicos de apoyo a las necesidades escolares.',
    'Necesitan vincularse con otras instituciones que apoyen el aprendizaje escolar y la participación de su hija o hijo en la vida cotidiana.'
  ],
  /* Registro diario */
  nivelesApoyo: ['Ayuda total', 'Modelado', 'Indicación verbal', 'Recordatorio visual', 'Independiente'],
  marcas: ['Logro', 'Dificultad', 'Apoyo brindado'],
  /* Bitácora de incidencia */
  incClasif: ['Agresión física', 'Agresión verbal', 'Accidente escolar', 'Daño material', 'Abandono de lugar sin autorización', 'Desobediencia a indicaciones'],
  incAntec: ['Llamada de atención verbal', 'Diálogo con el alumno', 'Reincidencia', 'Compromisos no cumplidos'],
  docTipos: ['Consentimiento informado', 'Plan de intervención', 'Informe de evaluación psicopedagógica', 'Informe psicológico', 'Informe de comunicación', 'Informe final', 'Documento médico o diagnóstico', 'Informe de especialista externo', 'Otro'],
  tiposInforme: ['Seguimiento — corte de noviembre', 'Seguimiento — corte de marzo', 'Seguimiento — corte de junio', 'Final del ciclo', 'Para la familia'],
  /* Valoración (modelo F04, no oficial) */
  componentes: ['Competencia curricular — Lenguajes', 'Competencia curricular — Saberes y Pensamiento Científico', 'Competencia curricular — Ética, Naturaleza y Sociedades', 'Competencia curricular — De lo Humano y lo Comunitario', 'Área cognitiva', 'Área afectivo-emocional / socio-adaptativa', 'Área lingüístico-comunicativa', 'Área motriz', 'Estilo de aprendizaje, intereses y motivación'],
  escala: { '': '—', L: 'Logrado', P: 'En proceso', R: 'Requiere apoyo' }
};
const colorMarca = m => ({ Logro: 'v', Dificultad: 'r', 'Apoyo brindado': 'a' }[m] || 'g');

/* ---------- Estado ---------- */
function planVacio() {
  const o = { datosGenerales: '', areas: {}, bap: {}, aula: {}, apoyos: {}, curriculo: {}, curriculares: [], registroEval: {}, necesidades: [], necesidadesOtras: '', compromisos: [], final: { avanzo: '', promocion: '', razones: '', destino: '' }, participantes: [], actualizado: '' };
  CAT.areas.forEach(a => o.areas[a] = { fortalezas: [], oportunidades: [] });
  CAT.bapCats.forEach(c => o.bap[c] = []);
  CAT.aula.forEach(c => o.aula[c] = { adecuacion: '', responsables: '' });
  CAT.apoyos.forEach(c => o.apoyos[c] = { adecuacion: '', responsables: '' });
  CAT.curriculo.forEach(c => o.curriculo[c] = []);
  CAT.cortes.forEach(c => o.registroEval[c] = { logros: '', padres: '' });
  return o;
}
function estadoVacio() {
  return {
    version: 2,
    config: { ciclo: '2026-2027', servicio: 'USAER/UDEEI «Unidad Ejemplo» · CCT 00FUA0000Z (ficticia)' },
    usaer: { unidad: 'UNIDAD DE SERVICIO DE APOYO A LA EDUCACIÓN REGULAR U.S.A.E.R. NÚM. 0000', cct: '00FUA0000Z', turno: 'MATUTINO', domicilio: 'CALLE FICTICIA S/N, COLONIA EJEMPLO, C.P. 00000', directora: 'Dir. USAER Ficticio', encabezado: 'CONDICIÓN DEL ALUMNO:', dependencia: 'SECRETARÍA DE EDUCACIÓN\nSUBSECRETARÍA DE EDUCACIÓN BÁSICA\nDIRECCIÓN GENERAL DE EDUCACIÓN ESPECIAL\nDEPARTAMENTO DE EDUCACIÓN ESPECIAL', zona: '', lugar: '', leyenda: '' },
    usuarios: [
      { id: 'u1', nombre: 'Mtra. Apoyo Ficticio', rol: 'apoyo' },
      { id: 'u2', nombre: 'Psic. Psicología Ficticio', rol: 'psicologia' },
      { id: 'u3', nombre: 'Mtra. Comunicación Ficticio', rol: 'comunicacion' },
      { id: 'u4', nombre: 'Dir. Dirección Ficticio', rol: 'direccion' }
    ],
    escuelas: [], grupos: [], alumnos: [], registros: [], evidencias: [], documentos: [],
    valoraciones: {}, planes: {}, comunicacion: {}, psicologia: {}, informes: [], bitacora: [], borrados: []
  };
}
/* Convierte datos o respaldos de la versión 1.0 al formato del plan real (no se pierde nada) */
function migrar(d) {
  const base = estadoVacio();
  d = Object.assign(base, d);
  d.usaer = Object.assign(estadoVacio().usaer, d.usaer || {});
  (d.documentos || []).forEach(x => { if (x.tipo === 'Evaluación psicopedagógica') x.tipo = 'Informe de evaluación psicopedagógica'; });
  /* 1.4.1: nombres de la Plantilla interna de la USAER */
  const renCond = { 'Problemas severos de comunicación': 'Dificultad severa de comunicación', 'Problemas severos de conducta': 'Dificultad severa de conducta', 'Problemas severos de aprendizaje': 'Dificultad severa de aprendizaje', 'Aptitudes sobresalientes': 'Aptitudes sobresalientes (tipo por especificar)' };
  (d.alumnos || []).forEach(a => { if (renCond[a.condicion]) a.condicion = renCond[a.condicion]; });
  if ((d.version || 1) >= 2 && !Array.isArray(d.planes)) return d;
  const planes = {}, p = id => (planes[id] = planes[id] || planVacio());
  const mapBap = { 'Actitudinal': 'Actitudinales', 'Pedagógica / didáctica': 'Metodológicas o didácticas', 'De organización': 'Organizativas', 'De comunicación': 'Metodológicas o didácticas', 'Física / de accesibilidad': 'Del contexto físico y sensorial', 'Normativa': 'Organizativas', 'Socioeconómica': 'Sociofamiliares' };
  const mapArea = { 'Comunicación': 'Comunicativo-lingüística', 'Cognitiva': 'Cognoscitiva', 'Socioemocional': 'Afectivas', 'Motriz': 'Motrices', 'Autonomía': 'Independencia y autocuidado' };
  (Array.isArray(d.bap) ? d.bap : []).forEach(b => p(b.alumnoId).bap[mapBap[b.categoria] || 'Organizativas'].push(b.descripcion));
  (Array.isArray(d.ajustes) ? d.ajustes : []).forEach(j => p(j.alumnoId).curriculo['Metodología'].push(j.tipo + ': ' + j.descripcion));
  (Array.isArray(d.planes) ? d.planes : []).forEach(x => p(x.alumnoId).areas[mapArea[x.area] || 'Académicas'].oportunidades.push(x.objetivo));
  const viejos = {}; (Array.isArray(d.planes) ? d.planes : []).forEach(x => viejos[x.id] = mapArea[x.area] || 'Académicas');
  d.registros.forEach(r => { if (r.planId && !r.area) r.area = viejos[r.planId] || ''; r.marcas = r.marcas || []; });
  d.planes = planes; delete d.bap; delete d.ajustes; d.version = 2;
  return d;
}
let DB = estadoVacio();
let USUARIO = null;
const puedeEditar = () => USUARIO && USUARIO.rol !== 'direccion';
const ed = html => puedeEditar() ? html : '';
/* Con diagnóstico = lleva plan de intervención e informes por área; sin diagnóstico = solo informe final */
const determinado = a => !CAT.sinDiagnostico.includes(a.condicion);
const condicionVisible = a => a.condicion.startsWith('Dificultad severa') ? 'Sin diagnóstico' : a.condicion;
/* Sin diagnóstico: solo el informe final del ciclo (confirmado por la maestra de apoyo, 23/11/2026) */
const tiposInformeDe = a => determinado(a) ? CAT.tiposInforme : ['Final del ciclo'];
const porId = (lista, id) => DB[lista].find(x => x.id === id);
const nomUsuario = id => (porId('usuarios', id) || {}).nombre || 'Sin nombre';
/* Escuelas que atiende cada profesional (1.3.2). Sin escuelas marcadas = atiende todas (p. ej. la maestra de comunicación, única en la USAER). */
const atiende = (u, escuelaId) => !(u.escuelas || []).length || u.escuelas.includes(escuelaId);
const equipoDe = escuelaId => DB.usuarios.filter(u => u.rol !== 'direccion' && atiende(u, escuelaId));
const escuelasDe = u => (u.escuelas || []).length ? u.escuelas.map(id => (porId('escuelas', id) || {}).nombre).filter(Boolean).join(' · ') || 'Todas' : 'Todas';
const rolUsuario = id => CAT.roles[(porId('usuarios', id) || {}).rol] || '';
const nomGrupo = g => g ? g.grado + ' ' + g.grupo : '';
function ciclo() { const [a, b] = DB.config.ciclo.split('-'); return { ini: a + '-08-01', fin: b + '-07-31', a, b }; }
function planDe(alumnoId) { if (!DB.planes[alumnoId]) DB.planes[alumnoId] = planVacio(); return DB.planes[alumnoId]; }
function planTieneContenido(p) { return !!p && (p.datosGenerales || Object.values(p.areas).some(x => x.fortalezas.length || x.oportunidades.length) || Object.values(p.bap).some(x => x.length)); }

/* ---------- Almacenamiento (IndexedDB en este dispositivo) ---------- */
let idb = null;
function abrirIDB() {
  return new Promise(res => {
    try {
      const r = indexedDB.open('evau', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('archivos'); };
      r.onsuccess = () => { idb = r.result; res(true); };
      r.onerror = () => res(false);
    } catch (e) { res(false); }
  });
}
function idbOp(almacen, modo, fn) {
  return new Promise(res => {
    if (!idb) return res(undefined);
    try {
      const tx = idb.transaction(almacen, modo); const q = fn(tx.objectStore(almacen));
      tx.oncomplete = () => res(q && q.result); tx.onerror = () => res(undefined);
    } catch (e) { res(undefined); }
  });
}
const leerEstado = () => idbOp('kv', 'readonly', s => s.get('estado'));
function guardar(accion) {
  sellar();
  if (accion) {
    DB.bitacora.push({ f: hoy() + ' ' + ahora(), u: USUARIO ? USUARIO.nombre : '—', a: accion });
    if (DB.bitacora.length > 500) DB.bitacora = DB.bitacora.slice(-500);
  }
  return idbOp('kv', 'readwrite', s => s.put(DB, 'estado'));
}
const mem = {};
async function guardarArchivo(id, blob) { mem[id] = blob; await idbOp('archivos', 'readwrite', s => s.put(blob, id)); }
async function leerArchivo(id) { return (await idbOp('archivos', 'readonly', s => s.get(id))) || mem[id] || null; }
async function borrarArchivos() { for (const k in mem) delete mem[k]; await idbOp('archivos', 'readwrite', s => s.clear()); }

/* ---------- Sellos de cambio y combinación de respaldos (1.3) ----------
   Cada alumno, registro, escuela, plan, documento, etc. guarda en «_m» CUÁNDO cambió por última vez (t) y QUIÉN lo cambió (u, n).
   No hace falta tocar cada pantalla: al guardar, EVAU compara cada dato con su «huella» anterior y sella solo lo que cambió.
   Lo que se quita del expediente deja una marca en «borrados», para que al combinar no reaparezca. */
const COLECCIONES = ['usuarios', 'escuelas', 'grupos', 'alumnos', 'registros', 'evidencias', 'documentos', 'informes'];
const MAPAS = ['planes', 'valoraciones', 'comunicacion', 'psicologia'];
/* Un plan o una ficha de comunicación vacíos (se crean solo con abrir la pestaña) no cuentan como dato */
const mapaVacio = (c, x) => (c === 'planes' && planVacioSinFecha(x)) || (c === 'comunicacion' && huella(Object.assign({}, x, { actualizado: '' })) === huella(Object.assign(comVacio(), { actualizado: '' })))
  || (c === 'psicologia' && huella(Object.assign({}, x, { actualizado: '' })) === huella(Object.assign(psiVacio(), { actualizado: '' })));
const OBJETOS = ['config', 'usaer'];
const SELLO_ANTIGUO = '2000-01-01T00:00:00.000Z';   // datos de antes de la 1.3: se sabe que existen, no cuándo cambiaron
const NOMBRES_COL = { usuarios: ['profesional', 'profesionales'], escuelas: ['escuela', 'escuelas'], grupos: ['grupo', 'grupos'], alumnos: ['alumno', 'alumnos'], registros: ['registro', 'registros'], evidencias: ['evidencia', 'evidencias'], documentos: ['documento', 'documentos'], informes: ['informe', 'informes'], planes: ['plan de intervención', 'planes de intervención'], valoraciones: ['valoración', 'valoraciones'], config: ['dato del ciclo', 'datos del ciclo'], usaer: ['dato del servicio', 'datos del servicio'] };
const huella = x => JSON.stringify(x, (k, v) => k === '_m' ? undefined : v);
let HUELLA_PLAN_VACIO = null;
const planVacioSinFecha = p => { if (HUELLA_PLAN_VACIO === null) HUELLA_PLAN_VACIO = huella(Object.assign(planVacio(), { actualizado: '' })); return huella(Object.assign({}, p, { actualizado: '' })) === HUELLA_PLAN_VACIO; };
/* Recorre todos los datos sellables: [clave, colección, id, objeto] */
function cadaDato(d, fn) {
  COLECCIONES.forEach(c => (d[c] || []).forEach(x => fn(c + ':' + x.id, c, x.id, x)));
  MAPAS.forEach(c => Object.keys(d[c] || {}).forEach(id => { const x = d[c][id]; if (!mapaVacio(c, x)) fn(c + ':' + id, c, id, x); }));
  OBJETOS.forEach(c => d[c] && fn(c, c, '', d[c]));
}
let HUELLAS = {};
function calcularHuellas() { HUELLAS = {}; cadaDato(DB, (k, c, id, x) => HUELLAS[k] = huella(x)); }
const sello = () => ({ t: new Date().toISOString(), u: USUARIO ? USUARIO.id : '', n: USUARIO ? USUARIO.nombre : '' });
function sellar() {
  DB.borrados = DB.borrados || [];
  const vistos = new Set();
  cadaDato(DB, (k, c, id, x) => {
    vistos.add(k);
    const h = huella(x), antes = HUELLAS[k];
    if (antes === undefined || antes !== h) x._m = sello();          // nuevo o cambiado
    else if (!x._m) x._m = { t: SELLO_ANTIGUO, u: '', n: '' };       // sin cambio, de antes de la 1.3
    HUELLAS[k] = h;
  });
  for (const k in HUELLAS) if (!vistos.has(k)) {                     // se quitó: queda la marca
    const [c, id] = k.split(':');
    if (id) DB.borrados.push(Object.assign({ c, id }, sello()));
    delete HUELLAS[k];
  }
}
const tiempo = x => (x && x._m && x._m.t) || '';

/* Combina dos estados sin perder nada. Regla: si el mismo dato cambió en los dos, gana el cambio más reciente.
   Devuelve { datos, resumen } y NO toca DB: así se puede mostrar el resumen antes de aplicar. */
function combinarEstados(local, entrante) {
  const L = JSON.parse(JSON.stringify(local)), E = migrar(JSON.parse(JSON.stringify(entrante)));
  const res = { nuevos: {}, actualizados: {}, quitados: {}, conflictos: 0, porPersona: {}, unidosCurp: 0 };
  unirPorCurp(L, E, res);
  const suma = (o, c) => o[c] = (o[c] || 0) + 1;
  /* Marcas de borrado de los dos lados (la más reciente de cada dato) */
  const marcas = {};
  [...(L.borrados || []), ...(E.borrados || [])].forEach(b => { const k = b.c + ':' + b.id; if (!marcas[k] || b.t > marcas[k].t) marcas[k] = b; });
  const decidir = (c, l, e, k) => {                                   // devuelve el objeto que se queda (o null)
    const m = marcas[k];
    if (m && m.t >= tiempo(e) && (!l || m.t >= tiempo(l))) { if (l) suma(res.quitados, c); return null; }
    if (!e) return l;
    if (!l) { suma(res.nuevos, c); if (c === 'registros' || c === 'informes' || c === 'documentos') { const quien = (e._m && e._m.n) || nombreEn(E, e.usuarioId) || 'Sin nombre'; res.porPersona[quien] = res.porPersona[quien] || {}; suma(res.porPersona[quien], c); } return e; }
    if (huella(l) === huella(e)) return tiempo(e) > tiempo(l) ? e : l;
    if (tiempo(e) > tiempo(l)) { suma(res.actualizados, c); return e; }
    if (tiempo(e) === tiempo(l)) res.conflictos++;                   // cambiaron los dos sin sello: se conserva lo de este dispositivo
    return l;
  };
  for (const c of COLECCIONES) {
    const mapa = new Map((L[c] || []).map(x => [x.id, x])), orden = (L[c] || []).map(x => x.id);
    (E[c] || []).forEach(x => { if (!mapa.has(x.id)) orden.push(x.id); });
    const porE = new Map((E[c] || []).map(x => [x.id, x]));
    L[c] = orden.map(id => decidir(c, mapa.get(id), porE.get(id), c + ':' + id)).filter(Boolean);
  }
  for (const c of MAPAS) {
    const out = {}, ids = new Set([...Object.keys(L[c] || {}), ...Object.keys(E[c] || {})]);
    const util = (x) => x && !mapaVacio(c, x) ? x : undefined;
    ids.forEach(id => {
      const l = util((L[c] || {})[id]), e = util((E[c] || {})[id]);
      const r = l || e ? decidir(c, l, e, c + ':' + id) : (L[c] || {})[id];   // un plan vacío no cuenta como cambio
      if (r) out[id] = r;
    });
    L[c] = out;
  }
  for (const c of OBJETOS) { const r = decidir(c, L[c], E[c], c); if (r) L[c] = r; }
  /* Bitácora: se juntan las dos, sin repetir */
  const vistos = new Set(), bit = [];
  [...(L.bitacora || []), ...(E.bitacora || [])].forEach(b => { const k = b.f + '|' + b.u + '|' + b.a; if (!vistos.has(k)) { vistos.add(k); bit.push(b); } });
  L.bitacora = bit.sort((a, b) => a.f.localeCompare(b.f)).slice(-500);
  L.borrados = Object.values(marcas);
  return { datos: L, resumen: res };
}
function nombreEn(d, uid_) { return ((d.usuarios || []).find(u => u.id === uid_) || {}).nombre; }
const cuenta = (n, c) => n + ' ' + NOMBRES_COL[c][n === 1 ? 0 : 1];
function textoResumen(r) {
  const lin = [], lista = o => Object.entries(o).map(([c, n]) => cuenta(n, c)).join(', ');
  if (Object.keys(r.nuevos).length) lin.push('Entran nuevos: ' + lista(r.nuevos) + '.');
  Object.entries(r.porPersona).forEach(([p, o]) => lin.push('De ' + p + ': ' + lista(o) + '.'));
  if (Object.keys(r.actualizados).length) lin.push('Se actualizan con el cambio más reciente: ' + lista(r.actualizados) + '.');
  if (Object.keys(r.quitados).length) lin.push('Se quitan porque alguien los quitó después: ' + lista(r.quitados) + '.');
  if (r.unidosCurp) lin.push(r.unidosCurp + (r.unidosCurp === 1 ? ' alumno dado de alta en otro aparato tiene' : ' alumnos dados de alta en otro aparato tienen') + ' la misma CURP que uno de aquí: se unen en una sola carpeta.');
  if (r.conflictos) lin.push(r.conflictos + (r.conflictos === 1 ? ' dato cambió' : ' datos cambiaron') + ' en los dos lados sin fecha (datos de antes de la versión 1.3): se conservó lo de este dispositivo.');
  return lin.length ? lin : ['No hay nada nuevo: este dispositivo ya tiene todo lo del respaldo.'];
}

/* ---------- Interfaz común ---------- */
function aviso(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
}
function abrirModal(html, ancho) {
  const v = document.createElement('div'); v.className = 'velo';
  v.innerHTML = `<div class="modal ${ancho ? 'ancho' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(v);
  v.cerrar = () => { detenerVoz(); v.remove(); };
  return v;
}
function confirmar(msg, fn, textoBoton) {
  const v = abrirModal(`<h2>Confirmar</h2><p>${esc(msg)}</p><div class="fila"><button class="peligro" data-ok>${esc(textoBoton || 'Sí, continuar')}</button><button class="sec" data-no>Cancelar</button></div>`);
  $('[data-ok]', v).onclick = () => { v.cerrar(); fn(); };
  $('[data-no]', v).onclick = () => v.cerrar();
}
/* Formulario genérico: campos = [{k,label,tipo,opciones,req,ayuda,def}]
   tipos: text, date, number, select, textarea, lista (una idea por renglón → arreglo), checks (casillas → arreglo) */
function formulario(titulo, campos, valores, alGuardar, intro) {
  valores = valores || {};
  const cuerpo = campos.map(c => {
    const v = valores[c.k] ?? c.def ?? '';
    let ctl;
    if (c.tipo === 'select') {
      const ops = c.opciones.map(o => { const [val, txt] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(txt)}</option>`; }).join('');
      ctl = `<select id="f_${c.k}">${c.req ? '' : '<option value="">—</option>'}${ops}</select>`;
    } else if (c.tipo === 'textarea' || c.tipo === 'lista') ctl = `<textarea id="f_${c.k}" ${c.alto ? `style="min-height:${c.alto}rem"` : ''}>${esc(Array.isArray(v) ? v.join('\n') : v)}</textarea>`;
    else if (c.tipo === 'checks') ctl = `<div class="chips chips-col" id="f_${c.k}">${c.opciones.map(o => { const [val, txt] = Array.isArray(o) ? o : [o, o]; return `<label><input type="checkbox" value="${esc(val)}" ${(v || []).includes(val) ? 'checked' : ''}>${esc(txt)}</label>`; }).join('')}</div>`;
    else ctl = `<input id="f_${c.k}" type="${c.tipo || 'text'}" value="${esc(v)}" ${c.tipo === 'number' ? 'min="0" max="100"' : ''}>`;
    const mic = c.tipo === 'textarea' || c.tipo === 'lista' ? `<button type="button" class="sec chico mic" data-mic="${esc(c.k)}" aria-label="Dictar en ${esc(c.label)}">🎙 Dictar</button>` : '';
    return `<div class="etiqueta-mic"><label for="f_${c.k}">${esc(c.label)}${c.req ? ' *' : ''}</label>${mic}</div>${ctl}${c.ayuda ? `<div class="nota">${esc(c.ayuda)}</div>` : ''}${c.tipo === 'lista' ? '<div class="nota">Escriba una idea por renglón.</div>' : ''}`;
  }).join('');
  const conMic = campos.filter(c => c.tipo === 'textarea' || c.tipo === 'lista');
  const ayudaVoz = conMic.length ? `${guiaFormulario(conMic.some(c => c.tipo === 'lista'))}<p class="voz-estado" id="f_voz" role="status"></p>` : '';
  const v = abrirModal(`<h2>${esc(titulo)}</h2>${intro || ''}${ayudaVoz}<form>${cuerpo}<div class="fila" style="margin-top:1rem"><button type="submit">Guardar</button><button type="button" class="sec" data-no>Cancelar</button></div></form>`, campos.length > 6);
  $('[data-no]', v).onclick = () => v.cerrar();
  v.querySelectorAll('[data-mic]').forEach(b => {
    const c = campos.find(x => x.k === b.dataset.mic), caja = $('#f_' + c.k, v);
    botonMicrofono(b, { caja, separador: c.tipo === 'lista' ? '\n' : ' ', alEstado: (t, err) => { const e = $('#f_voz', v); e.textContent = t; e.classList.toggle('error', err); } });
  });
  $('form', v).onsubmit = e => {
    e.preventDefault(); detenerVoz();
    const out = {};
    for (const c of campos) {
      const el = $('#f_' + c.k, v);
      if (c.tipo === 'checks') out[c.k] = [...el.querySelectorAll('input:checked')].map(i => i.value);
      else if (c.tipo === 'lista') out[c.k] = lineas(el.value);
      else out[c.k] = el.value.trim();
      if (c.normalizar) out[c.k] = c.normalizar(out[c.k]);
      if (c.req && !out[c.k]) { aviso('Falta: ' + c.label); el.focus(); return; }
      if (c.validar) { const msg = c.validar(out[c.k]); if (msg) { aviso(msg); el.focus(); return; } }
    }
    v.cerrar(); alGuardar(out);
  };
  const p = $('input:not([type=checkbox]),select,textarea', v); if (p) p.focus();
  return v;
}
function descargar(nombre, contenido, tipo) {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const archivoSeguro = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_');

/* ---------- Dictado por voz (1.3) ----------
   Sigue las bases del documento «Dictado por voz en aplicaciones web: bases, patrones y código reutilizable» (23/11/2026):
   · Patrón 1: un solo dictador para cualquier caja de texto. Escucha de corrido, se vuelve a encender solo tras cada silencio,
     escribe solo los resultados definitivos, respeta lo corregido a mano y explica cada error con lo que hay que hacer.
   · Patrón 3: encontrar un alumno diciendo su nombre, aunque se diga mal o incompleto.
   · Patrón 5: guía plegable «Cómo dictar aquí» con un ejemplo que pasa por el mismo lector que usa la pantalla.
   Límite que no depende del código: el navegador suele enviar el audio a su servicio de reconocimiento (en Chrome, Google). */
const enAndroid = /Android/i.test(navigator.userAgent || '');
const sinAcentos = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const palabrasDe = t => sinAcentos(t).replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter(Boolean);
function normalizarDictado(t) {
  return t.replace(/\s*\bpunto y (aparte|seguido)\b\s*/gi, '. ').replace(/(^|\s+)\bpunto\b\s*/gi, '. ').replace(/\s+\bcoma\b\s*/gi, ', ').replace(/\s+/g, ' ').trim().replace(/^[.,]\s*/, '').replace(/([.!?]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
}
const mayus = t => t.replace(/^\s*(\S)/, (m, c) => c.toUpperCase());
function limpiarActividad(t) { return mayus(t.replace(/^(hoy\s+)?(se\s+trabaj[óo]|trabajamos|se\s+realiz[óo]|realizamos|se\s+hizo|hicimos|vimos|se\s+vio)\s+((con|en)\s+)?/i, '').replace(/[.\s]+$/, '')); }
function dividirDictado(t) {
  const m = t.match(/^(.+?[.!?])\s+(.+)$/s);
  return m ? [m[1], m[2]] : [t, ''];
}
/* Android suele mandar la misma frase varias veces, cada vez más larga: si una frase repite la anterior y la amplía, la sustituye */
function unirFrases(lista) {
  const out = [];
  for (const f of lista) {
    const previa = out.length ? palabrasDe(out[out.length - 1]).join(' ') : null, nueva = palabrasDe(f).join(' ');
    if (previa !== null && nueva.length > previa.length && (nueva + ' ').startsWith(previa + ' ')) out[out.length - 1] = f;
    else out.push(f);
  }
  return out;
}
/* Une lo que ya había en la caja con las frases dictadas. Mayúscula al empezar y después de punto o renglón. */
function componer(base, frases, sep) {
  let t = base || '';
  frases.map(normalizarDictado).filter(Boolean).forEach(f => {
    t += t && !/\s$/.test(t) ? sep : '';
    t += !t.trim() || /[.!?\n]\s*$/.test(t) ? mayus(f) : f;
  });
  return t;
}
/* Registro de un toque: la primera frase (hasta la primera pausa o «punto») es la ACTIVIDAD; lo demás, la OBSERVACIÓN */
function repartirDictado(frases, base) {
  let act = base.act, resto = frases.map(normalizarDictado).filter(Boolean);
  if (base.modo === 'act' && resto.length) {
    const [a, o] = dividirDictado(resto[0]);
    act = (act.trim() ? act.trim() + ' ' : '') + limpiarActividad(a);
    resto = (o ? [o] : []).concat(resto.slice(1));
  }
  return { act, obs: componer(base.obs, resto, ' ') };
}

const MSG_VOZ = {
  sinVoz: 'Este navegador no tiene dictado integrado (funciona en Chrome o Edge). Toque el cuadro y use el micrófono del teclado de su celular.',
  inseguro: 'El micrófono solo funciona cuando EVAU se abre desde su dirección https (por ejemplo, GitHub Pages), no como archivo descargado. Mientras tanto, toque el cuadro y use el micrófono del teclado.',
  'not-allowed': 'No se dio permiso al micrófono. Toque el candado junto a la dirección, permita el micrófono e intente de nuevo. También puede usar el micrófono del teclado.',
  'service-not-allowed': 'El navegador no permite el dictado en esta página. Use el micrófono del teclado.',
  'audio-capture': 'No se encontró un micrófono. Revise que esté conectado o use el micrófono del teclado.',
  'language-not-supported': 'El navegador no reconoce español en este equipo. Use el micrófono del teclado.',
  network: 'El dictado necesita internet y no hay conexión. Escriba o use el micrófono del teclado.',
  falla: 'El dictado se detuvo varias veces seguidas. Intente de nuevo o use el micrófono del teclado.',
  silencio: 'El micrófono se apagó porque no se escuchó nada durante un minuto. Tóquelo otra vez para seguir.'
};
const FATALES = ['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported'];
/* Revisa antes de encender si el lugar lo permite */
function lugarParaDictar() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return { motivo: 'sinVoz' };
  if (location.protocol === 'file:' || window.isSecureContext === false) return { motivo: 'inseguro' };
  return { SR };
}

/* Patrón 1 · el dictador. op = { caja, cajas, separador, tomarBase, escribir, alEstado, alEncender, alApagar }
   · caja: dónde se escribe; cajas: todas las que, si se corrigen a mano, hacen que lo siguiente se agregue después.
   · escribir(frases, base): para pantallas que reparten lo dictado (registro de un toque). Por omisión, se agrega a la caja. */
let DICTADOR = null;
function detenerVoz() { if (DICTADOR) DICTADOR.apagar(); }
function encenderDictado(op) {
  detenerVoz();
  const lugar = lugarParaDictar();
  const estado = (t, err) => op.alEstado && op.alEstado(t, !!err);
  if (!lugar.SR) { estado(MSG_VOZ[lugar.motivo], true); if (op.caja) op.caja.focus(); return null; }
  const cajas = op.cajas || [op.caja], sep = op.separador ?? ' ';
  const tomarBase = op.tomarBase || (() => op.caja.value);
  const e = { quiere: true, activo: false, cerrado: false, rec: null, base: tomarBase(), previas: [], sesion: [], desde: 0, largo: 0, fallos: 0, motivo: '', reloj: null, crono: null, prov: '', t0: Date.now(), ultimaVoz: Date.now(), escribiendo: false };
  const escribir = () => {
    const frases = unirFrases(e.previas.concat(e.sesion));
    e.escribiendo = true;
    if (op.escribir) op.escribir(frases, e.base); else op.caja.value = componer(e.base, frases, sep);
    e.escribiendo = false;
  };
  /* Respeta lo corregido a mano: lo que ya está en las cajas pasa a ser la base y lo siguiente se agrega después */
  const rebase = () => { if (e.escribiendo) return; e.base = tomarBase(); e.previas = []; e.sesion = []; e.desde = e.largo; };
  cajas.forEach(c => c && c.addEventListener('input', rebase));
  const ctl = {
    caja: op.caja,
    rebase,
    apagar(motivo) {
      e.quiere = false; clearTimeout(e.reloj);
      if (e.activo && e.rec) { e.motivoFinal = motivo; try { e.rec.stop(); } catch (x) { terminar(motivo); } }
      else terminar(motivo);
    }
  };
  function terminar(motivo) {
    if (e.cerrado) return; e.cerrado = true;
    clearInterval(e.crono); cajas.forEach(c => c && c.removeEventListener('input', rebase));
    if (DICTADOR === ctl) DICTADOR = null;
    if (motivo && MSG_VOZ[motivo]) estado(MSG_VOZ[motivo], true); else estado('Dictado terminado. Revise el texto: puede corregirlo a mano.');
    if (op.alApagar) op.alApagar(motivo);
  }
  function arrancar() {
    if (!e.quiere) return terminar();
    const rec = new lugar.SR(); e.rec = rec;
    rec.lang = 'es-MX'; rec.continuous = true; rec.interimResults = !enAndroid;   // en Android los provisionales llegan duplicados
    e.desde = 0; e.largo = 0; e.sesion = [];
    rec.onstart = () => { e.activo = true; e.motivo = ''; };
    rec.onresult = ev => {
      const frases = []; let prov = '';
      for (let k = e.desde; k < ev.results.length; k++) {
        const f = String(ev.results[k][0].transcript || '').trim(); if (!f) continue;
        if (!ev.results[k].isFinal) { prov += ' ' + f; continue; }             // los provisionales solo se muestran
        frases.push(f);
      }
      e.largo = ev.results.length; e.prov = prov.trim(); e.ultimaVoz = Date.now(); e.fallos = 0;
      const antes = e.sesion.join('|'); e.sesion = frases;
      if (frases.join('|') !== antes) escribir();
    };
    rec.onerror = ev => { e.motivo = ev.error; if (ev.error !== 'no-speech' && ev.error !== 'aborted') e.fallos++; };
    rec.onend = () => {
      e.activo = false; e.previas = unirFrases(e.previas.concat(e.sesion)); e.sesion = []; e.prov = '';
      if (!e.quiere) return terminar(e.motivoFinal);
      if (FATALES.includes(e.motivo)) { e.quiere = false; return terminar(e.motivo); }
      if (e.fallos >= 4) { e.quiere = false; return terminar(e.motivo === 'network' ? 'network' : 'falla'); }
      if (Date.now() - e.ultimaVoz > 60000) { e.quiere = false; return terminar('silencio'); }
      e.reloj = setTimeout(arrancar, 250);                                        // se vuelve a encender sola
    };
    try { rec.start(); } catch (x) { e.fallos++; e.reloj = setTimeout(() => e.fallos >= 4 ? (e.quiere = false, terminar('falla')) : arrancar(), 400); }
  }
  DICTADOR = ctl;
  e.crono = setInterval(() => { const s = Math.floor((Date.now() - e.t0) / 1000); estado('🎙 Escuchando ' + p2(Math.floor(s / 60)) + ':' + p2(s % 60) + (e.prov ? ' · «' + e.prov + '»' : ' · hable con pausas')); }, 400);
  estado('🎙 Escuchando · hable con pausas');
  if (op.alEncender) op.alEncender();
  arrancar();
  return ctl;
}
/* Botón de micrófono que se pone y se quita (un solo dictado a la vez en toda la app) */
function botonMicrofono(boton, op) {
  const texto = boton.textContent;
  boton.onclick = () => {
    if (DICTADOR && boton.classList.contains('grab')) { detenerVoz(); return; }
    encenderDictado(Object.assign({}, op, {
      alEncender: () => { boton.classList.add('grab'); boton.textContent = '⏹ Detener'; op.alEncender && op.alEncender(); },
      alApagar: m => { boton.classList.remove('grab'); boton.textContent = texto; op.alApagar && op.alApagar(m); }
    }));
  };
}

/* Registro de un toque: dicta actividad y observación con un solo botón */
function dictarRegistro(act, obs, boton, estado, cambiar) {
  if (DICTADOR) { detenerVoz(); return; }
  let modo = act.value.trim() ? 'obs' : 'act', ctl = null;
  const marcar = () => { act.classList.toggle('destino', !!DICTADOR && modo === 'act'); obs.classList.toggle('destino', !!DICTADOR && modo === 'obs'); if (cambiar) cambiar.disabled = !DICTADOR || modo === 'obs'; };
  ctl = encenderDictado({
    caja: obs, cajas: [act, obs],
    tomarBase: () => { if (act.value.trim()) modo = 'obs'; return { act: act.value, obs: obs.value, modo }; },
    escribir: (frases, base) => { const r = repartirDictado(frases, base); act.value = r.act; obs.value = r.obs; if (frases.length) modo = 'obs'; marcar(); },
    alEstado: (t, err) => { estado.textContent = t; estado.classList.toggle('error', err); },
    alEncender: () => { boton.classList.add('grab'); boton.textContent = '⏹ Detener dictado'; },
    alApagar: () => { boton.classList.remove('grab'); boton.textContent = '🎙 Dictar'; marcar(); }
  });
  if (cambiar) cambiar.onclick = () => { modo = 'obs'; if (ctl) ctl.rebase(); marcar(); };
  marcar();
}

/* Patrón 5 · guía plegable con un ejemplo comprobado: el ejemplo pasa por el mismo lector que usa la pantalla */
const EJEMPLO_REGISTRO = ['Se trabajó lectura de cuento', 'respondió dos preguntas sin ayuda punto en la tercera pidió apoyo'];
const AVISO_AUDIO = 'El navegador manda el audio a su servicio de reconocimiento (en Chrome, a Google) para convertirlo en texto. Mientras EVAU use datos ficticios no hay problema; con datos reales hay que revisar antes las normas de la autoridad.';
function guiaRegistro() {
  const r = repartirDictado(EJEMPLO_REGISTRO, { act: '', obs: '', modo: 'act' });
  return `<details class="guia"><summary>Cómo dictar aquí</summary><ol><li>Toque <strong>🎙 Dictar</strong> y hable con calma.</li><li>Diga primero <strong>la actividad</strong> y haga una pausa.</li><li>Luego diga <strong>lo que observó</strong>. Puede hacer pausas para pensar: el micrófono sigue encendido hasta que toque <strong>⏹ Detener</strong>.</li><li>Diga «punto» para separar ideas. Si corrige una palabra a mano, lo siguiente se agrega después.</li></ol>
  <p><strong>Ejemplo.</strong> Si dice: «${esc(EJEMPLO_REGISTRO[0])}» (pausa) «${esc(EJEMPLO_REGISTRO[1])}»</p><p>Sale: <strong>Actividad:</strong> ${esc(r.act)}<br><strong>Observación:</strong> ${esc(r.obs)}</p><p class="nota">${esc(AVISO_AUDIO)}</p></details>`;
}
const EJEMPLO_LISTA = ['sigue instrucciones de un paso', 'recuerda las rutinas del aula'];
const EJEMPLO_TEXTO = ['la alumna vive con su madre y dos hermanos punto', 'en la escuela tiene buena relación con su maestra'];
function guiaFormulario(hayLista) {
  const ej = hayLista ? EJEMPLO_LISTA : EJEMPLO_TEXTO, sale = componer('', ej, hayLista ? '\n' : ' ');
  return `<details class="guia"><summary>Cómo dictar aquí</summary><ol><li>Toque <strong>🎙 Dictar</strong> junto al cuadro donde quiere escribir.</li><li>Hable con pausas. ${hayLista ? 'En las listas, <strong>cada pausa es un renglón nuevo</strong>.' : 'Diga «punto» para terminar una idea.'}</li><li>Toque <strong>⏹ Detener</strong> al terminar y revise el texto.</li></ol>
  <p><strong>Ejemplo.</strong> Si dice: ${ej.map(f => '«' + esc(f) + '»').join(' (pausa) ')}</p><p>Sale:</p><div class="ejemplo-sale">${esc(sale).replace(/\n/g, '<br>')}</div><p class="nota">${esc(AVISO_AUDIO)}</p></details>`;
}

/* Patrón 3 · encontrar en una lista lo que se dijo, aunque se diga mal o incompleto.
   Clave fonética del español (b=v, c=s=z, qu=k, ll=y, h muda), distancia de edición (parecido de al menos 72 %),
   peso de las palabras raras (log(1 + N/n)) y prudencia: solo se elige si el puntaje pasa de 0.7 y le saca 0.1 al segundo. */
const PALABRAS_VACIAS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'a', 'en', 'con', 'por', 'para', 'un', 'una', 'al']);
function claveFonetica(p) {
  return sinAcentos(p).replace(/ñ/g, 'ny').replace(/ch/g, '§').replace(/ll/g, 'y').replace(/qu/g, 'k').replace(/c([ei])/g, 's$1').replace(/g([ei])/g, 'j$1')
    .replace(/z/g, 's').replace(/c/g, 'k').replace(/v/g, 'b').replace(/w/g, 'u').replace(/h/g, '').replace(/y$/, 'i').replace(/(.)\1+/g, '$1').replace(/§/g, 'ch');
}
function distanciaEdicion(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const parecido = (a, b) => a === b ? 1 : 1 - distanciaEdicion(a, b) / Math.max(a.length, b.length);
function buscarPorVoz(dicho, lista) {
  const items = lista.map(x => typeof x === 'string' ? { texto: x } : x).map(x => Object.assign({}, x, { claves: palabrasDe(x.texto).filter(p => !PALABRAS_VACIAS.has(p)).map(claveFonetica) }));
  const q = palabrasDe(dicho).filter(p => !PALABRAS_VACIAS.has(p)).map(claveFonetica);
  if (!q.length || !items.length) return { estado: 'no', elegido: null, candidatos: [] };
  const N = items.length, n = {};
  items.forEach(it => new Set(it.claves).forEach(k => n[k] = (n[k] || 0) + 1));
  const peso = k => Math.log(1 + N / (n[k] || 1));
  const puntajes = items.map(it => {
    let arriba = 0, abajo = 0;
    q.forEach(w => {
      let mejor = 0, cual = null;
      it.claves.forEach(k => { const s = parecido(w, k); if (s > mejor) { mejor = s; cual = k; } });
      if (mejor < 0.72) { mejor = 0; cual = null; }
      const pw = cual ? peso(cual) : Math.log(1 + N);
      arriba += mejor * pw; abajo += pw;
    });
    return { texto: it.texto, id: it.id, puntaje: Math.round(arriba / abajo * 100) / 100 };
  }).sort((a, b) => b.puntaje - a.puntaje);
  const [p1, p2_] = puntajes, segundo = p2_ ? p2_.puntaje : 0;
  if (p1.puntaje > 0.7 && p1.puntaje - segundo >= 0.1) return { estado: 'ok', elegido: p1, candidatos: [p1] };
  const cand = puntajes.filter(x => x.puntaje >= 0.45 && x.puntaje >= p1.puntaje - 0.25).slice(0, 5);
  return cand.length ? { estado: 'duda', elegido: null, candidatos: cand } : { estado: 'no', elegido: null, candidatos: [] };
}
