/* EVAU · Área de psicología (1.6.0)
   Plan de atención / intervención del área de psicología e Informe final de psicología.
   Estructura tomada de los formatos de los psicólogos de la USAER (archivos del proyecto, recibidos el 25/11/2026).
   De esos formatos solo se tomó la estructura: ningún dato de alumnos. */
CAT.modalidadesPsi = ['Individual', 'Subgrupal', 'Grupal'];
function psiVacio() {
  return {
    plan: { modalidad: 'Individual', sesiones: '', periodo: '', diagnostico: '', fecha: '', areas: [] },
    informe: { fecha: '', conceptual: '', practico: '', social: '', sugPadres: [], sugMaestro: [] },
    actualizado: ''
  };
}
const areaPsiVacia = () => ({ area: '', funciones: [], actividades: [], indicadores: [], campos: [], aprendizajes: [], adecuaciones: [] });
function psiDe(id) { DB.psicologia = DB.psicologia || {}; if (!DB.psicologia[id]) DB.psicologia[id] = psiVacio(); return DB.psicologia[id]; }
const psicologoDe = a => DB.usuarios.find(u => u.rol === 'psicologia' && atiende(u, a.escuelaId)) || { nombre: '' };
const firmasPsi = (a, izq) => `<table class="firmas"><tr><td>${izq}<div class="linea"></div><strong>${MAYUS(psicologoDe(a).nombre)}</strong><br>PSICOLOGÍA</td><td>Vo. Bo.<div class="linea"></div><strong>${MAYUS(DB.usaer.directora)}</strong><br>DIRECTORA DE LA USAER</td></tr></table>`;

function htmlPlanPsi(a, c) {
  const p = c.plan, g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {};
  const marca = m => (p.modalidad === m ? '☑' : '☐') + ' ' + m.toUpperCase();
  const areas = p.areas.length ? p.areas : [areaPsiVacia()];
  return `${encabezadoInst()}
  <h1>PLAN DE ATENCIÓN / INTERVENCIÓN ÁREA DE PSICOLOGÍA</h1>
  <table class="datos-com"><tr><td colspan="3"><strong>SERVICIO DE EDUCACIÓN ESPECIAL:</strong> ${MAYUS(DB.usaer.unidad)}</td><td colspan="2"><strong>PSICÓLOGO(A):</strong> ${MAYUS(psicologoDe(a).nombre)}</td></tr>
  <tr><td colspan="2"><strong>ALUMNO(S):</strong> ${MAYUS(a.nombre)}</td><td><strong>EDAD:</strong> ${esc(edad(a.nacimiento))}</td><td><strong>GRADO:</strong> ${esc(g.grado || '')}</td><td><strong>GRUPO:</strong> ${esc(g.grupo || '')}</td></tr>
  <tr><td colspan="3"><strong>ESCUELA:</strong> ${MAYUS(e.nombre)}</td><td colspan="2"><strong>DOCENTE:</strong> ${MAYUS(g.docente)}</td></tr>
  <tr><td colspan="5"><strong>DX:</strong> ${MAYUS(p.diagnostico || a.diagnostico || a.condicion)}</td></tr>
  <tr><td colspan="3"><strong>MODALIDAD DE ATENCIÓN:</strong> ${CAT.modalidadesPsi.map(marca).join(' &nbsp; ')}</td><td colspan="2"><strong>TOTAL DE SESIONES:</strong> ${esc(p.sesiones)}</td></tr>
  <tr><td colspan="3"><strong>PERIODO (MESES Y DÍAS):</strong> ${MAYUS(p.periodo)}</td><td colspan="2"><strong>CICLO ESCOLAR:</strong> ${esc(DB.config.ciclo)}</td></tr></table>
  ${areas.map((x, i) => `<table><thead><tr><th colspan="3">ÁREA DE DESARROLLO ${i + 1}: ${MAYUS(x.area)}</th></tr>
  <tr><th style="width:28%">FUNCIONES / CAPACIDADES A DESARROLLAR</th><th>SECUENCIA DE ACTIVIDADES (EN EL ORDEN DE APLICACIÓN)</th><th style="width:30%">INDICADORES DE EVALUACIÓN (LO QUE SE ESPERA QUE LOGRE EL ALUMNO DURANTE ESTE PERIODO)</th></tr></thead>
  <tr><td>${ul(x.funciones) || '&nbsp;'}</td><td>${ul(x.actividades) || '&nbsp;'}</td><td>${ul(x.indicadores) || '&nbsp;'}</td></tr>
  <tr><th>ALGUNOS CAMPOS FORMATIVOS CON LOS QUE SE RELACIONAN ESTAS CAPACIDADES</th><th>EJEMPLOS DE PROBABLES APRENDIZAJES FACILITADOS</th><th>ADECUACIONES INDIVIDUALES</th></tr>
  <tr><td>${ul(x.campos) || '&nbsp;'}</td><td>${ul(x.aprendizajes) || '&nbsp;'}</td><td>${ul(x.adecuaciones) || '&nbsp;'}</td></tr></table>`).join('')}
  ${lugarFecha(p.fecha || hoy())}${firmasPsi(a, 'REALIZÓ')}`;
}
function htmlInfPsi(a, c) {
  const x = c.informe, g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {}, f = x.fecha || hoy();
  const dom = (t, k) => `<h2>${t}</h2>${parrafos(x[k]) || '<p><em>Sin redactar.</em></p>'}`;
  return `${encabezadoInst()}
  <h1>INFORME FINAL DE PSICOLOGÍA</h1>
  <h2>DATOS PERSONALES</h2>
  <table class="datos-com"><tr><td colspan="2"><strong>ESCUELA:</strong> ${MAYUS(e.nombre)}</td></tr>
  <tr><td colspan="2"><strong>ALUMNO:</strong> ${MAYUS(a.nombre)}</td></tr>
  <tr><td><strong>EDAD:</strong> ${esc(edad(a.nacimiento))}</td><td><strong>FECHA DE NACIMIENTO:</strong> ${esc(flarga(a.nacimiento))}</td></tr>
  <tr><td><strong>GRADO:</strong> ${esc(g.grado || '')}</td><td><strong>GRUPO:</strong> ${esc(g.grupo || '')}</td></tr>
  <tr><td colspan="2"><strong>DOCENTE:</strong> ${MAYUS(g.docente)}</td></tr>
  <tr><td colspan="2"><strong>FECHA DE ELABORACIÓN:</strong> ${esc(flarga(f))}</td></tr></table>
  ${dom('DOMINIO CONCEPTUAL', 'conceptual')}${dom('DOMINIO PRÁCTICO', 'practico')}${dom('DOMINIO SOCIAL', 'social')}
  <h2>SUGERENCIAS</h2><p><strong>PADRES DE FAMILIA</strong></p>${ul(x.sugPadres) || '<p><em>—</em></p>'}<p><strong>MAESTRO DE GRUPO</strong></p>${ul(x.sugMaestro) || '<p><em>—</em></p>'}
  ${firmasPsi(a, 'ELABORÓ')}`;
}
function apoyoRegistrosPsi(a) {
  const cic = ciclo(), rs = vigentes().filter(r => r.alumnoId === a.id && r.fecha >= cic.ini && r.fecha <= cic.fin && (porId('usuarios', r.usuarioId) || {}).rol === 'psicologia').sort((x, y) => y.fecha.localeCompare(x.fecha));
  if (!rs.length) return '<p class="caja nota">Todavía no hay registros de psicología en este ciclo. Cuando los haya, aparecerán aquí como apoyo para redactar.</p>';
  return `<details class="caja nota"><summary><strong>Ver los ${rs.length} registros de psicología del ciclo</strong> (apoyo para redactar)</summary><ul>${rs.slice(0, 40).map(r => `<li><strong>${esc(fcorta(r.fecha))}</strong> · ${esc(r.actividad)}${r.observacion ? ' — ' + esc(r.observacion) : ''}</li>`).join('')}</ul></details>`;
}
function editarPsi(a, c, cual, clave) {
  const listo = m => { c.actualizado = hoy(); guardar('Psicología: ' + m); pintar(); };
  const p = c.plan, x = c.informe;
  if (cual === 'plan' && clave === 'datos') return formulario('Datos del plan de psicología', [
    { k: 'modalidad', label: 'Modalidad de atención', tipo: 'select', req: 1, opciones: CAT.modalidadesPsi },
    { k: 'sesiones', label: 'Total de sesiones' }, { k: 'periodo', label: 'Periodo (meses y días)', ayuda: 'Ejemplo: octubre a junio' },
    { k: 'fecha', label: 'Fecha del plan', tipo: 'date' },
    { k: 'diagnostico', label: 'Diagnóstico (DX)', tipo: 'textarea', alto: 3, ayuda: 'Si lo deja vacío se usa el diagnóstico de los datos del alumno.' }], p, o => { Object.assign(p, o); listo('datos del plan'); });
  if (cual === 'area') {
    const i = Number(clave), nueva = i < 0, ar = nueva ? areaPsiVacia() : p.areas[i];
    return formulario(nueva ? 'Agregar área de desarrollo' : 'Área de desarrollo ' + (i + 1), [
      { k: 'area', label: 'Área de desarrollo', req: 1, ayuda: 'Ejemplos de los formatos: Intelectual, Cognitiva.' },
      { k: 'funciones', label: 'Funciones o capacidades a desarrollar', tipo: 'lista', alto: 4 },
      { k: 'actividades', label: 'Secuencia de actividades (en el orden de aplicación)', tipo: 'lista', alto: 7 },
      { k: 'indicadores', label: 'Indicadores de evaluación (lo que se espera que logre)', tipo: 'lista', alto: 5 },
      { k: 'campos', label: 'Campos formativos con los que se relacionan', tipo: 'lista', alto: 3 },
      { k: 'aprendizajes', label: 'Ejemplos de probables aprendizajes facilitados', tipo: 'lista', alto: 5 },
      { k: 'adecuaciones', label: 'Adecuaciones individuales (si son necesarias)', tipo: 'lista', alto: 4 }], ar, o => {
      Object.assign(ar, o); if (nueva) p.areas.push(ar); listo(nueva ? 'área agregada' : 'área ' + (i + 1));
    }, apoyoRegistrosPsi(a));
  }
  if (cual === 'informe' && clave === 'dominios') return formulario('Informe final de psicología', [
    { k: 'fecha', label: 'Fecha de elaboración', tipo: 'date' },
    { k: 'conceptual', label: 'Dominio conceptual', tipo: 'textarea', alto: 7 },
    { k: 'practico', label: 'Dominio práctico', tipo: 'textarea', alto: 7 },
    { k: 'social', label: 'Dominio social', tipo: 'textarea', alto: 7 }], x, o => { Object.assign(x, o); listo('dominios'); }, apoyoRegistrosPsi(a));
  if (cual === 'informe' && clave === 'sug') return formulario('Sugerencias', [
    { k: 'sugPadres', label: 'Para padres de familia (una por renglón)', tipo: 'lista', alto: 6 },
    { k: 'sugMaestro', label: 'Para el maestro de grupo (una por renglón)', tipo: 'lista', alto: 6 }], x, o => { x.sugPadres = o.sugPadres; x.sugMaestro = o.sugMaestro; listo('sugerencias'); });
}
function tPsicologia(t, a) {
  const c = psiDe(a.id), edit = puedeEditar(), ps = psicologoDe(a), p = c.plan, x = c.informe;
  const caja = (tit, dato, html) => `<div class="caja seccion"><div class="fila"><h3>${esc(tit)}</h3><span class="sep"></span>${edit ? `<button class="sec chico" data-psi="${dato}">Editar</button>` : ''}</div>${html}</div>`;
  t.innerHTML = `<p>Lo llena el <strong>área de psicología</strong>${ps.nombre ? ` (${esc(ps.nombre)})` : ''}. Sigue los formatos de psicología de la USAER. Todos los cuadros se pueden dictar con 🎙.${c.actualizado ? ` Última actualización: ${esc(flarga(c.actualizado))}.` : ''}</p>
  <div class="fila"><h2>Plan de atención / intervención · psicología</h2><span class="sep"></span><button id="vpp">🖨 Ver, imprimir o Word</button></div>
  ${caja('Datos del plan', 'plan|datos', `<p><strong>Modalidad:</strong> ${esc(p.modalidad || '—')} · <strong>Sesiones:</strong> ${esc(p.sesiones || '—')} · <strong>Periodo:</strong> ${esc(p.periodo || '—')}</p><p><strong>DX:</strong> ${esc(p.diagnostico || a.diagnostico || a.condicion || '—')}</p>`)}
  ${p.areas.map((ar, i) => `<div class="caja seccion"><div class="fila"><h3>Área de desarrollo ${i + 1}: ${esc(ar.area)}</h3><span class="sep"></span>${edit ? `<button class="sec chico" data-psi="area|${i}">Editar</button><button class="sec chico" data-qarea="${i}">Quitar</button>` : ''}</div><p><strong>Funciones:</strong> ${esc(ar.funciones.join('; ') || '—')}</p><p><strong>Actividades:</strong> ${ar.actividades.length} · <strong>Indicadores:</strong> ${ar.indicadores.length}</p></div>`).join('') || '<p class="caja"><em>Todavía no hay áreas de desarrollo.</em></p>'}
  ${edit ? '<button class="sec" data-psi="area|-1">＋ Agregar área de desarrollo</button>' : ''}
  <div class="fila"><h2>Informe final de psicología</h2><span class="sep"></span><button id="vip">🖨 Ver, imprimir o Word</button></div>
  ${caja('Dominios conceptual, práctico y social', 'informe|dominios', `<p><strong>Fecha:</strong> ${esc(flarga(x.fecha) || '—')}</p>${['conceptual', 'practico', 'social'].map(k => `<p><strong>${{ conceptual: 'Conceptual', practico: 'Práctico', social: 'Social' }[k]}:</strong> ${esc((x[k] || '—').slice(0, 160))}${(x[k] || '').length > 160 ? '…' : ''}</p>`).join('')}`)}
  ${caja('Sugerencias', 'informe|sug', `<p><strong>Padres de familia</strong></p>${ul(x.sugPadres) || '<p>—</p>'}<p><strong>Maestro de grupo</strong></p>${ul(x.sugMaestro) || '<p>—</p>'}`)}`;
  $('#vpp', t).onclick = () => visorDoc('Plan de psicología · ' + a.nombre, htmlPlanPsi(a, c), 'Plan_psicologia_' + a.nombre + '_' + DB.config.ciclo, null, 'plan horizontal');
  $('#vip', t).onclick = () => {
    const prev = DB.informes.find(i => i.alumnoId === a.id && i.tipo === 'Final de psicología' && i.ciclo === DB.config.ciclo);
    const inf = prev ? Object.assign({}, prev, { html: htmlInfPsi(a, c) }) : { id: uid(), alumnoId: a.id, tipo: 'Final de psicología', ciclo: DB.config.ciclo, desde: ciclo().ini, hasta: x.fecha || hoy(), fecha: hoy(), usuarioId: USUARIO.id, html: htmlInfPsi(a, c) };
    visorDoc('Informe final de psicología · ' + a.nombre, inf.html, 'Informe_final_psicologia_' + a.nombre, html => { inf.html = html; inf.fecha = hoy(); if (prev) Object.assign(prev, inf); else DB.informes.push(inf); guardar('Informe guardado: Final de psicología'); aviso('Informe guardado en el expediente.'); pintar(); }, 'plan');
  };
  if (!edit) return;
  t.querySelectorAll('[data-psi]').forEach(b => b.onclick = () => { const [cual, k] = b.dataset.psi.split('|'); editarPsi(a, c, cual, k); });
  t.querySelectorAll('[data-qarea]').forEach(b => b.onclick = () => confirmar('Se quitará el área de desarrollo ' + (Number(b.dataset.qarea) + 1) + ' del plan.', () => { p.areas.splice(Number(b.dataset.qarea), 1); c.actualizado = hoy(); guardar('Psicología: área quitada'); pintar(); }));
}
