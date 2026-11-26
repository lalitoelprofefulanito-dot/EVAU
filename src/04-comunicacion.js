/* EVAU · Área de comunicación (1.4.0)
   Plan de intervención individual de comunicación e Informe final de comunicación.
   Estructura tomada de los formatos de la maestra de comunicación de la USAER (recibidos el 24/11/2026).
   De esos formatos solo se tomó la estructura: ningún dato de alumnos. */
CAT.funcionesCom = ['Sintáctico (estructuración del lenguaje)', 'Fonológico (sonidos del lenguaje)', 'Semántico (significado de las palabras)', 'Pragmático (uso del lenguaje)'];
CAT.componentesCom = ['Componente pragmático', 'Componente morfosintáctico', 'Componente fonético-fonológico', 'Componente semántico'];
function comVacio() {
  const o = {
    plan: { periodo: '', sesiones: '', diagnostico: '', funciones: {}, pda: [], contenidos: {}, metodologias: [], materiales: [], fecha: '' },
    informe: { fecha: '', diagnostico: '', etapa: '', componentes: {}, recPadres: [], recDocentes: [] },
    actualizado: ''
  };
  CAT.funcionesCom.forEach(f => o.plan.funciones[f] = []);
  CAT.campos.forEach(c => o.plan.contenidos[c] = []);
  CAT.componentesCom.forEach(c => o.informe.componentes[c] = '');
  return o;
}
function comDe(id) { DB.comunicacion = DB.comunicacion || {}; if (!DB.comunicacion[id]) DB.comunicacion[id] = comVacio(); return DB.comunicacion[id]; }
function comTieneContenido(x) { return !!x && JSON.stringify(Object.assign({}, x, { actualizado: '', _m: undefined })) !== JSON.stringify(Object.assign(comVacio(), { actualizado: '' })); }
/* Edad como en los formatos: años.meses (12.5 = 12 años 5 meses) a una fecha dada */
function edadAM(fn, fecha) {
  if (!fn) return '';
  const h = new Date((fecha || hoy()) + 'T12:00:00'), n = new Date(fn + 'T12:00:00');
  let a = h.getFullYear() - n.getFullYear(), m = h.getMonth() - n.getMonth();
  if (h.getDate() < n.getDate()) m--;
  if (m < 0) { a--; m += 12; }
  return a + '.' + m;
}
const fnCorta = f => f ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(2, 4) : '';
const maestraCom = a => DB.usuarios.find(u => u.rol === 'comunicacion' && atiende(u, a.escuelaId)) || { nombre: '' };
const MAYUS = s => esc(String(s || '').toUpperCase());
/* Encabezado oficial como en los formatos de la USAER: escudo a la izquierda, texto al centro y escudo(s) a la derecha */
function logosEnc() {
  const u = DB.usaer, img = x => x ? `<img class="logo-img" src="${x}" alt="">` : '';
  return { izq: img(u.logoIzq), der: [u.logoDer, u.logoExtra].filter(Boolean).map(img).join(' ') };
}
function encabezadoInst() {
  const u = DB.usaer, L = logosEnc();
  return `<table class="enc-oficial"><tr><td class="enc-l">${L.izq}</td><td class="enc-t">${lineas(u.dependencia).map(l => `<p>${esc(l.toUpperCase())}</p>`).join('')}${u.zona ? `<p><strong>${MAYUS(u.zona)}</strong></p>` : ''}
  <p><strong>${MAYUS(u.unidad)}</strong></p><p><strong>C.C.T.: ${esc(u.cct)} &nbsp; TURNO: ${MAYUS(u.turno)}</strong></p><p>${MAYUS(u.domicilio)}</p>
  <p><strong>CICLO ESCOLAR ${esc(DB.config.ciclo)}</strong></p>${u.leyenda ? `<p class="leyenda">«${esc(u.leyenda)}»</p>` : ''}</td><td class="enc-r">${L.der}</td></tr></table>`;
}
const firmasCom = (a, elaboro) => `<table class="firmas"><tr><td>${elaboro}<div class="linea"></div>MAESTRA DE COMUNICACIÓN<br><strong>${MAYUS(maestraCom(a).nombre)}</strong></td><td>Vo. Bo.<div class="linea"></div>DIRECTORA DE USAER<br><strong>${MAYUS(DB.usaer.directora)}</strong></td></tr></table>`;
const lugarFecha = f => `<p style="text-align:right">${esc(DB.usaer.lugar || '')}${DB.usaer.lugar ? ', ' : ''}${esc(flarga(f))}</p>`;

function htmlPlanCom(a, c) {
  const p = c.plan, g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {};
  const fns = CAT.funcionesCom.filter(f => p.funciones[f].length), camps = CAT.campos.filter(k => p.contenidos[k].length);
  const filasFn = (fns.length ? fns : CAT.funcionesCom.slice(0, 2)).map((f, i, arr) => `<tr><td><strong>${MAYUS(f.split(' (')[0])}</strong><br>(${esc(f.split(' (')[1] || '').replace(')', '')})</td><td>${ul(p.funciones[f]) || '&nbsp;'}</td>${i === 0 ? `<td rowspan="${arr.length}">${ul(p.pda) || '&nbsp;'}</td>` : ''}</tr>`).join('');
  return `${encabezadoInst()}
  <h1>PLAN DE INTERVENCIÓN INDIVIDUAL</h1>
  <table class="datos-com"><tr><td colspan="2"><strong>SERVICIO DE EDUCACIÓN ESPECIAL:</strong> ${MAYUS(DB.usaer.unidad)} &nbsp; <strong>TURNO:</strong> ${MAYUS(DB.usaer.turno)}</td><td><strong>ÁREA:</strong> COMUNICACIÓN</td><td colspan="2"><strong>RESPONSABLE:</strong> ${MAYUS(maestraCom(a).nombre)}</td></tr>
  <tr><td colspan="2"><strong>ESCUELA:</strong> ${MAYUS(e.nombre)}</td><td colspan="2"><strong>DOCENTE:</strong> ${MAYUS(g.docente)}</td><td><strong>GDO.:</strong> ${esc(g.grado || '')} &nbsp; <strong>GPO.:</strong> ${esc(g.grupo || '')}</td></tr>
  <tr><td colspan="2"><strong>ALUMNO:</strong> ${MAYUS(a.nombre)}</td><td><strong>F.N.:</strong> ${esc(fnCorta(a.nacimiento))}</td><td><strong>EDAD:</strong> ${esc(edadAM(a.nacimiento, p.fecha))}</td><td><strong>No. SESIONES:</strong> ${esc(p.sesiones)}</td></tr>
  <tr><td colspan="5"><strong>PERIODO:</strong> ${MAYUS(p.periodo)}</td></tr>
  <tr><td colspan="5" class="centro"><strong>${MAYUS(p.diagnostico || a.diagnostico || a.condicion)}</strong></td></tr></table>
  <table><thead><tr><th style="width:24%">FUNCIONES / CAPACIDADES</th><th>ACTIVIDADES</th><th style="width:36%">PROCESOS DE DESARROLLO DE APRENDIZAJE (PDA)</th></tr></thead>${filasFn}</table>
  <table><thead><tr><th style="width:24%">CAMPOS FORMATIVOS</th><th>CONTENIDOS</th></tr></thead>${(camps.length ? camps : ['']).map(k => `<tr><td><strong>${MAYUS(k)}</strong></td><td>${ul(p.contenidos[k] || []) || '&nbsp;'}</td></tr>`).join('')}</table>
  <table><tr><th style="width:24%">METODOLOGÍAS APLICADAS</th><td>${ul(p.metodologias) || '&nbsp;'}</td></tr><tr><th>MATERIALES A UTILIZAR</th><td>${ul(p.materiales) || '&nbsp;'}</td></tr></table>
  ${lugarFecha(p.fecha || hoy())}${firmasCom(a, 'ELABORÓ')}`;
}
function htmlInfCom(a, c) {
  const x = c.informe, g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {}, f = x.fecha || hoy();
  const comps = CAT.componentesCom.filter(k => (x.componentes[k] || '').trim());
  return `${encabezadoInst()}
  <h1>INFORME FINAL DE COMUNICACIÓN</h1>
  <table class="datos-com"><tr><td colspan="2"><strong>ALUMNO:</strong> ${MAYUS(a.nombre)}</td><td><strong>F.N.:</strong> ${esc(fnCorta(a.nacimiento))}</td><td><strong>EDAD:</strong> ${esc(edadAM(a.nacimiento, f))}</td></tr>
  <tr><td><strong>ESCUELA:</strong> ${MAYUS(e.nombre)}</td><td><strong>GDO.:</strong> ${esc(g.grado || '')} &nbsp; <strong>GPO.:</strong> ${esc(g.grupo || '')}</td><td colspan="2"><strong>DOCENTE:</strong> ${MAYUS(g.docente)}</td></tr>
  <tr><td colspan="4"><strong>FECHA:</strong> ${MAYUS(flarga(f))}</td></tr></table>
  <h2>DIAGNÓSTICO</h2>${parrafos(x.diagnostico) || '<p><em>Sin redactar.</em></p>'}
  <h2>ETAPA DEL LENGUAJE Y COMUNICACIÓN</h2>${parrafos(x.etapa) || '<p><em>Sin redactar.</em></p>'}
  <h2>DESCRIPCIÓN POR COMPONENTES DEL LENGUAJE</h2>${comps.map(k => lineas(x.componentes[k]).map((l, i) => `<p>${i === 0 ? `<strong>${esc(k)}.</strong> ` : ''}${esc(l)}</p>`).join('')).join('') || '<p><em>Sin redactar.</em></p>'}
  <h2>RECOMENDACIONES</h2><p><strong>PADRES DE FAMILIA</strong></p>${ul(x.recPadres) || '<p><em>—</em></p>'}<p><strong>DOCENTES</strong></p>${ul(x.recDocentes) || '<p><em>—</em></p>'}
  ${firmasCom(a, '')}`;
}
/* Registros de comunicación del ciclo, como apoyo para redactar (no se copian solos) */
function apoyoRegistrosCom(a, max) {
  const cic = ciclo(), rs = vigentes().filter(r => r.alumnoId === a.id && r.fecha >= cic.ini && r.fecha <= cic.fin && (porId('usuarios', r.usuarioId) || {}).rol === 'comunicacion').sort((x, y) => y.fecha.localeCompare(x.fecha));
  if (!rs.length) return '<p class="caja nota">Todavía no hay registros de la maestra de comunicación en este ciclo. Cuando los haya, aparecerán aquí como apoyo para redactar.</p>';
  return `<details class="caja nota"><summary><strong>Ver los ${rs.length} registros de comunicación del ciclo</strong> (apoyo para redactar)</summary><ul>${rs.slice(0, max || 40).map(r => `<li><strong>${esc(fcorta(r.fecha))}</strong> · ${esc(r.actividad)}${r.observacion ? ' — ' + esc(r.observacion) : ''}${r.nivel ? ' <em>(' + esc(r.nivel) + ')</em>' : ''}</li>`).join('')}</ul></details>`;
}
const SECCIONES_PCOM = [
  ['datos', 'Datos del plan', p => `<p><strong>Periodo:</strong> ${esc(p.periodo || '—')} · <strong>Sesiones:</strong> ${esc(p.sesiones || '—')} · <strong>Fecha:</strong> ${esc(flarga(p.fecha) || '—')}</p><p><strong>Diagnóstico o condición:</strong> ${esc(p.diagnostico || '—')}</p>`],
  ['funciones', 'Funciones o capacidades y actividades', p => CAT.funcionesCom.map(f => p.funciones[f].length ? `<p><strong>${esc(f)}</strong></p>${ul(p.funciones[f])}` : '').join('') || '<p><em>Sin actividades.</em></p>'],
  ['pda', 'Procesos de desarrollo de aprendizaje (PDA)', p => ul(p.pda) || '<p><em>Sin PDA.</em></p>'],
  ['contenidos', 'Campos formativos y contenidos', p => CAT.campos.map(k => p.contenidos[k].length ? `<p><strong>${esc(k)}</strong></p>${ul(p.contenidos[k])}` : '').join('') || '<p><em>Sin contenidos.</em></p>'],
  ['metodo', 'Metodologías aplicadas y materiales', p => `<p><strong>Metodologías</strong></p>${ul(p.metodologias) || '<p>—</p>'}<p><strong>Materiales</strong></p>${ul(p.materiales) || '<p>—</p>'}`]
];
const SECCIONES_ICOM = [
  ['datos', 'Fecha, diagnóstico y etapa del lenguaje', x => `<p><strong>Fecha del informe:</strong> ${esc(flarga(x.fecha) || '—')}</p><p><strong>Diagnóstico:</strong></p>${parrafos(x.diagnostico) || '<p>—</p>'}<p><strong>Etapa del lenguaje y comunicación:</strong></p>${parrafos(x.etapa) || '<p>—</p>'}`],
  ['componentes', 'Descripción por componentes del lenguaje', x => CAT.componentesCom.map(k => (x.componentes[k] || '').trim() ? `<p><strong>${esc(k)}.</strong></p>${parrafos(x.componentes[k])}` : '').join('') || '<p><em>Sin redactar.</em></p>'],
  ['rec', 'Recomendaciones', x => `<p><strong>Padres de familia</strong></p>${ul(x.recPadres) || '<p>—</p>'}<p><strong>Docentes</strong></p>${ul(x.recDocentes) || '<p>—</p>'}`]
];
function editarCom(a, c, cual, clave) {
  const listo = m => { c.actualizado = hoy(); guardar('Comunicación: ' + m); pintar(); };
  const p = c.plan, x = c.informe;
  if (cual === 'plan') {
    if (clave === 'datos') return formulario('Datos del plan de comunicación', [{ k: 'periodo', label: 'Periodo', ayuda: 'Ejemplo: oct-nov-dic 2026 / ene 2027' }, { k: 'sesiones', label: 'Número de sesiones' }, { k: 'fecha', label: 'Fecha del plan (para la firma y la edad)', tipo: 'date' }, { k: 'diagnostico', label: 'Diagnóstico o condición (renglón en negritas debajo de los datos)', tipo: 'textarea', ayuda: 'Si lo deja vacío se usa el diagnóstico de los datos del alumno.' }], p, o => { Object.assign(p, o); listo('datos del plan'); });
    if (clave === 'funciones') return formulario('Funciones o capacidades y actividades', CAT.funcionesCom.map((f, i) => ({ k: 'f' + i, label: f + ': actividades', tipo: 'lista', alto: 6 })), Object.fromEntries(CAT.funcionesCom.map((f, i) => ['f' + i, p.funciones[f]])), o => { CAT.funcionesCom.forEach((f, i) => p.funciones[f] = o['f' + i]); listo('actividades'); }, '<p class="nota">Una actividad por renglón. En el plan impreso solo salen las funciones que tengan actividades. Los formatos recibidos usan <strong>sintáctico</strong> y <strong>fonológico</strong>; <strong>semántico</strong> y <strong>pragmático</strong> se agregaron por si se necesitan.</p>');
    if (clave === 'pda') return formulario('Procesos de desarrollo de aprendizaje (PDA)', [{ k: 'pda', label: 'PDA (uno por renglón)', tipo: 'lista', alto: 10 }], p, o => { p.pda = o.pda; listo('PDA'); });
    if (clave === 'contenidos') return formulario('Campos formativos y contenidos', CAT.campos.map((k, i) => ({ k: 'c' + i, label: k, tipo: 'lista', alto: 5 })), Object.fromEntries(CAT.campos.map((k, i) => ['c' + i, p.contenidos[k]])), o => { CAT.campos.forEach((k, i) => p.contenidos[k] = o['c' + i]); listo('contenidos'); }, '<p class="nota">Un contenido por renglón. Deje vacío el campo formativo que no se trabaje.</p>');
    if (clave === 'metodo') return formulario('Metodologías y materiales', [{ k: 'metodologias', label: 'Metodologías aplicadas', tipo: 'lista', alto: 5, ayuda: 'Ejemplo: Acompañamiento en el aula (actividades aplicadas por el docente) · Trabajo individual: juego social, juego de mesa.' }, { k: 'materiales', label: 'Materiales a utilizar', tipo: 'lista', alto: 5 }], p, o => { p.metodologias = o.metodologias; p.materiales = o.materiales; listo('metodologías y materiales'); });
  } else {
    if (clave === 'datos') return formulario('Informe final de comunicación', [{ k: 'fecha', label: 'Fecha del informe', tipo: 'date' }, { k: 'diagnostico', label: 'Diagnóstico', tipo: 'textarea', alto: 7, ayuda: 'Un párrafo por renglón. Incluya el instrumento de valoración aplicado y su resultado.' }, { k: 'etapa', label: 'Etapa del lenguaje y comunicación', tipo: 'textarea', alto: 7 }], x, o => { Object.assign(x, o); listo('diagnóstico y etapa'); }, apoyoRegistrosCom(a));
    if (clave === 'componentes') return formulario('Descripción por componentes del lenguaje', CAT.componentesCom.map((k, i) => ({ k: 'c' + i, label: k, tipo: 'textarea', alto: 7 })), Object.fromEntries(CAT.componentesCom.map((k, i) => ['c' + i, x.componentes[k] || ''])), o => { CAT.componentesCom.forEach((k, i) => x.componentes[k] = o['c' + i]); listo('componentes'); }, '<p class="nota">Deje vacío el componente que no aplique. El formato recibido usa <strong>pragmático</strong>, <strong>morfosintáctico</strong> y <strong>fonético-fonológico</strong>; <strong>semántico</strong> se agregó por si se necesita.</p>' + apoyoRegistrosCom(a));
    if (clave === 'rec') return formulario('Recomendaciones', [{ k: 'recPadres', label: 'Para padres de familia (una por renglón)', tipo: 'lista', alto: 7 }, { k: 'recDocentes', label: 'Para docentes (una por renglón)', tipo: 'lista', alto: 7 }], x, o => { x.recPadres = o.recPadres; x.recDocentes = o.recDocentes; listo('recomendaciones'); });
  }
}
function tComunicacion(t, a) {
  const c = comDe(a.id), edit = puedeEditar(), mc = maestraCom(a);
  const bloque = (cual, secs, obj) => secs.map(([k, tit, fn]) => `<div class="caja seccion"><div class="fila"><h3>${esc(tit)}</h3><span class="sep"></span>${edit ? `<button class="sec chico" data-com="${cual}|${k}">Editar</button>` : ''}</div>${fn(obj)}</div>`).join('');
  t.innerHTML = `<p>Lo llena la <strong>maestra de comunicación</strong>${mc.nombre ? ` (${esc(mc.nombre)})` : ''}. Sigue los formatos de comunicación de la USAER. Todos los cuadros se pueden dictar con 🎙.${c.actualizado ? ` Última actualización: ${esc(flarga(c.actualizado))}.` : ''}</p>
  <div class="fila"><h2>Plan de intervención individual · comunicación</h2><span class="sep"></span><button id="vpc">🖨 Ver, imprimir o Word</button></div>${bloque('plan', SECCIONES_PCOM, c.plan)}
  <div class="fila"><h2>Informe final de comunicación</h2><span class="sep"></span><button id="vic">🖨 Ver, imprimir o Word</button></div>${bloque('informe', SECCIONES_ICOM, c.informe)}`;
  $('#vpc', t).onclick = () => visorDoc('Plan de comunicación · ' + a.nombre, htmlPlanCom(a, c), 'Plan_comunicacion_' + a.nombre + '_' + DB.config.ciclo, null, 'plan horizontal');
  $('#vic', t).onclick = () => {
    const prev = DB.informes.find(i => i.alumnoId === a.id && i.tipo === 'Final de comunicación' && i.ciclo === DB.config.ciclo);
    const inf = prev ? Object.assign({}, prev, { html: htmlInfCom(a, c) }) : { id: uid(), alumnoId: a.id, tipo: 'Final de comunicación', ciclo: DB.config.ciclo, desde: ciclo().ini, hasta: c.informe.fecha || hoy(), fecha: hoy(), usuarioId: USUARIO.id, html: htmlInfCom(a, c) };
    visorDoc('Informe final de comunicación · ' + a.nombre, inf.html, 'Informe_final_comunicacion_' + a.nombre, html => { inf.html = html; inf.fecha = hoy(); if (prev) Object.assign(prev, inf); else DB.informes.push(inf); guardar('Informe guardado: Final de comunicación'); aviso('Informe guardado en el expediente.'); pintar(); }, 'plan');
  };
  if (!edit) return;
  t.querySelectorAll('[data-com]').forEach(b => b.onclick = () => { const [cual, k] = b.dataset.com.split('|'); editarCom(a, c, cual, k); });
}
