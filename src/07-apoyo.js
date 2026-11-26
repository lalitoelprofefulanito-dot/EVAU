/* EVAU · Informe de evaluación psicopedagógica e Informe final de la maestra de apoyo (1.7.0)
   Estructura tomada de los formatos de la maestra de apoyo de la USAER (recibidos el 25/11/2026). Solo la estructura: ningún dato de alumnos. */
const EVAL_SECS = [
  ['motivo', '2. Motivo de la evaluación'], ['tecnicas', '3. Técnicas e instrumentos aplicados'], ['apariencia', '4. Apariencia física'], ['conducta', '5. Conducta durante la evaluación'],
  ['antecedentes', '6. Antecedentes del desarrollo'], ['motor', '7. Desarrollo motor'], ['lenguaje', '8. Desarrollo del lenguaje'], ['social', '9. Desarrollo de las relaciones sociales e interacción social'],
  ['historia', '10. Historia escolar'], ['familiar', '11. Situación familiar']];
const EVAL_ACTUAL = [['cognitiva', 'Cognitiva y académica'], ['comunicativa', 'Área comunicativa lingüística (lenguaje y comunicación)'], ['flexibilidad', 'Flexibilidad en su conducta e intereses']];
const EVAL_FIN = [['estilo', '13. Estilo y motivación para aprender'], ['conclusion', '14. Conclusión'], ['interpretacion', '15. Interpretación de resultados']];
const FINAL_SECS = [['habilidades', 'Habilidades'], ['fortalezas', 'Fortalezas'], ['oportunidades', 'Áreas de oportunidad'], ['comunicacion', 'Área de comunicación'], ['social', 'Área social'], ['competencia', 'Competencia curricular']];
const FINAL_SECS2 = [['bap', 'Barreras para el aprendizaje y la participación (B.A.P.)'], ['recursos', 'Recursos teóricos, metodológicos, didácticos y/o estrategias especializadas que requiere ajustar o incorporar, para contribuir en la eliminación y/o minimización de las BAP y con ello favorecer la inclusión, el aprendizaje y la participación del alumnado que requiere mayor apoyo'], ['acciones', 'Acciones de la USAER'], ['recDocente', 'Recomendaciones generales de intervención para el docente que atenderá al educando el próximo ciclo escolar'], ['recFamilia', 'Recomendaciones para la familia'], ['evaluacion', 'Evaluación'], ['observaciones', 'Observaciones']];
function apoyoVacio() {
  const ev = { fecha: '', madre: '', edadMadre: '', ocupMadre: '', padre: '', edadPadre: '', ocupPadre: '', domicilioFam: '', necFamiliar: [], necEscolar: [], recomendaciones: [] };
  [...EVAL_SECS, ...EVAL_ACTUAL, ...EVAL_FIN].forEach(([k]) => ev[k] = '');
  const fi = { fecha: '', intro: '', campos: {} };
  [...FINAL_SECS, ...FINAL_SECS2].forEach(([k]) => fi[k] = '');
  CAT.campos.forEach(c => fi.campos[c] = '');
  return { eval: ev, final: fi, actualizado: '' };
}
function apoDe(id) { DB.apoyo = DB.apoyo || {}; if (!DB.apoyo[id]) DB.apoyo[id] = apoyoVacio(); return DB.apoyo[id]; }
const maestraApoyoDe = a => DB.usuarios.find(u => u.rol === 'apoyo' && atiende(u, a.escuelaId)) || { nombre: '' };
const mesAnio = f => { if (!f) return ''; const [y, m] = f.split('-'); return MESES[Number(m) - 1] + ' de ' + y; };
const seccionTxt = (tit, txt) => `<h2>${esc(tit.toUpperCase())}</h2>${parrafos(txt) || '<p><em>Sin redactar.</em></p>'}`;

function htmlEval(a, c) {
  const x = c.eval, g = porId('grupos', a.grupoId) || {}, eq = equipoDe(a.escuelaId);
  const quien = rol => eq.filter(u => u.rol === rol).map(u => u.nombre).join(', ');
  return `${encabezadoInst()}
  <h1>INFORME DE EVALUACIÓN PSICOPEDAGÓGICA</h1><p style="text-align:center"><strong>CICLO ESCOLAR ${esc(DB.config.ciclo)}</strong></p>
  <h2>1. DATOS GENERALES</h2>
  <table class="datos-com"><tr><td colspan="2"><strong>Nombre del alumno:</strong> ${esc(a.nombre)}</td></tr>
  <tr><td><strong>Fecha de nacimiento:</strong> ${esc(flarga(a.nacimiento))}</td><td><strong>Edad:</strong> ${esc(edad(a.nacimiento))}</td></tr>
  <tr><td><strong>Grado y grupo:</strong> ${esc((g.grado || '') + ' ' + (g.grupo || ''))}</td><td><strong>Maestro de grupo:</strong> ${esc(g.docente || '')}</td></tr>
  <tr><td><strong>Nombre de la madre:</strong> ${esc(x.madre)}</td><td><strong>Edad:</strong> ${esc(x.edadMadre)} · <strong>Ocupación:</strong> ${esc(x.ocupMadre)}</td></tr>
  <tr><td><strong>Nombre del padre:</strong> ${esc(x.padre)}</td><td><strong>Edad:</strong> ${esc(x.edadPadre)} · <strong>Ocupación:</strong> ${esc(x.ocupPadre)}</td></tr>
  <tr><td colspan="2"><strong>Domicilio:</strong> ${esc(x.domicilioFam || a.domicilio || '')}</td></tr></table>
  <p><strong>Personal participante:</strong> Maestra(o) de apoyo: ${esc(quien('apoyo'))} · Psicología: ${esc(quien('psicologia'))} · Maestra(o) de comunicación: ${esc(quien('comunicacion'))}</p>
  ${EVAL_SECS.map(([k, t]) => seccionTxt(t, x[k])).join('')}
  <h2>12. SITUACIÓN ACTUAL</h2><p><strong>ÁREA INTELECTUAL</strong></p>${EVAL_ACTUAL.map(([k, t]) => `<p><strong>${esc(t)}:</strong></p>${parrafos(x[k]) || '<p><em>Sin redactar.</em></p>'}`).join('')}
  ${EVAL_FIN.map(([k, t]) => seccionTxt(t, x[k])).join('')}
  <h2>16. DETERMINACIÓN DE SUS NECESIDADES EDUCATIVAS</h2><p><strong>Contexto familiar</strong></p>${ul(x.necFamiliar) || '<p>—</p>'}<p><strong>Contexto escolar</strong></p>${ul(x.necEscolar) || '<p>—</p>'}
  <h2>17. RECOMENDACIONES GENERALES</h2>${ul(x.recomendaciones) || '<p>—</p>'}
  <p><strong>Elaboraron:</strong></p><table class="firmas"><tr>${[['MAESTRA(O) DE APOYO', quien('apoyo')], ['PSICOLOGÍA', quien('psicologia')], ['MAESTRA(O) DE COMUNICACIÓN', quien('comunicacion')]].map(([f, n]) => `<td><div class="linea"></div><strong>${MAYUS(n)}</strong><br>${f}</td>`).join('')}</tr><tr><td colspan="3">Vo. Bo.<div class="linea" style="max-width:50%;margin:2.2rem auto .3rem"></div><strong>${MAYUS(DB.usaer.directora)}</strong><br>DIRECTORA DE LA USAER</td></tr></table>`;
}
function htmlFinalApoyo(a, c) {
  const x = c.final, g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {};
  const camps = CAT.campos.filter(k => (x.campos[k] || '').trim());
  return `${encabezadoInst()}
  <h1>INFORME FINAL</h1>
  <table class="datos-com"><tr><td colspan="2"><strong>${MAYUS(e.nombre)}</strong> &nbsp; <strong>C.C.T.:</strong> ${esc(e.cct || '')}</td></tr>
  <tr><td colspan="2"><strong>ALUMNO:</strong> ${MAYUS(a.nombre)}</td></tr>
  <tr><td><strong>FECHA DE NACIMIENTO:</strong> ${esc(fcorta(a.nacimiento))}</td><td><strong>EDAD:</strong> ${MAYUS(edad(a.nacimiento))}</td></tr>
  <tr><td><strong>GRADO:</strong> ${esc((g.grado || '') + ' ' + (g.grupo || ''))} DE PRIMARIA</td><td><strong>N.E.E.:</strong> ${MAYUS(a.diagnostico || a.condicion)}</td></tr>
  <tr><td><strong>MAESTRA(O) DE GRUPO:</strong> ${MAYUS(g.docente)}</td><td><strong>MAESTRA(O) DE APOYO:</strong> ${MAYUS(maestraApoyoDe(a).nombre)}</td></tr>
  <tr><td colspan="2"><strong>FECHA DE ELABORACIÓN:</strong> ${MAYUS(mesAnio(x.fecha || hoy()))}</td></tr></table>
  ${parrafos(x.intro)}
  ${FINAL_SECS.map(([k, t]) => seccionTxt(t, x[k])).join('')}
  ${camps.map(k => `<h2>${esc(k.toUpperCase())}</h2>${parrafos(x.campos[k])}`).join('')}
  ${FINAL_SECS2.map(([k, t]) => seccionTxt(t, x[k])).join('')}
  <table class="firmas"><tr><td>Elaboró<div class="linea"></div><strong>${MAYUS(maestraApoyoDe(a).nombre)}</strong><br>MAESTRA(O) DE APOYO</td><td>Vo. Bo.<div class="linea"></div><strong>${MAYUS(DB.usaer.directora)}</strong><br>DIRECTORA DE LA USAER</td></tr></table>`;
}
/* Llenar con lo que ya hay: solo cuadros vacíos, a partir del plan, de comunicación y de los registros del ciclo */
function propuestaFinal(a) {
  const p = DB.planes[a.id], cm = (DB.comunicacion || {})[a.id], cic = ciclo(), o = {};
  if (p) {
    const fort = CAT.areas.flatMap(ar => p.areas[ar].fortalezas), opo = CAT.areas.flatMap(ar => p.areas[ar].oportunidades);
    if (fort.length) o.fortalezas = fort.join('. ').replace(/\.\./g, '.') + '.';
    if (opo.length) o.oportunidades = opo.join('. ').replace(/\.\./g, '.') + '.';
    const soc = [...p.areas['Sociales'].fortalezas, ...p.areas['Sociales'].oportunidades];
    if (soc.length) o.social = soc.join('. ') + '.';
    const bap = CAT.bapCats.flatMap(k => p.bap[k]);
    if (bap.length) o.bap = bap.join('. ') + '.';
    const rec = [...CAT.aula.map(k => p.aula[k].adecuacion), ...CAT.apoyos.map(k => p.apoyos[k].adecuacion), ...(p.curriculo['Metodología'] || [])].filter(Boolean);
    if (rec.length) o.recursos = rec.join('. ') + '.';
  }
  if (cm && cm.informe && (cm.informe.etapa || '').trim()) o.comunicacion = cm.informe.etapa;
  const logros = vigentes().filter(r => r.alumnoId === a.id && r.fecha >= cic.ini && r.fecha <= cic.fin && (r.marcas || []).includes('Logro')).sort((x, y) => x.fecha.localeCompare(y.fecha));
  if (logros.length) o.observaciones = 'Durante el ciclo escolar ' + DB.config.ciclo + ' se registraron estos logros: ' + logros.map(r => (r.observacion || r.actividad).replace(/\.$/, '')).join('; ') + '.';
  return o;
}
function editarApoyo(a, c, cual, clave) {
  const listo = m => { c.actualizado = hoy(); guardar(m); pintar(); };
  const ta = (k, label, alto) => ({ k, label, tipo: 'textarea', alto: alto || 5 });
  const x = cual === 'eval' ? c.eval : c.final;
  const forms = {
    'eval|datos': ['1. Datos generales (familia)', [{ k: 'fecha', label: 'Fecha de la evaluación', tipo: 'date' }, { k: 'madre', label: 'Nombre de la madre' }, { k: 'edadMadre', label: 'Edad de la madre' }, { k: 'ocupMadre', label: 'Ocupación de la madre' }, { k: 'padre', label: 'Nombre del padre' }, { k: 'edadPadre', label: 'Edad del padre' }, { k: 'ocupPadre', label: 'Ocupación del padre' }, { k: 'domicilioFam', label: 'Domicilio', ayuda: 'Si lo deja vacío se usa el de los datos del alumno.' }]],
    'eval|motivo': ['Motivo, instrumentos y observación', EVAL_SECS.slice(0, 4).map(([k, t]) => ta(k, t))],
    'eval|desarrollo': ['Desarrollo, historia escolar y familia', EVAL_SECS.slice(4).map(([k, t]) => ta(k, t))],
    'eval|actual': ['12. Situación actual · Área intelectual', EVAL_ACTUAL.map(([k, t]) => ta(k, t, 6))],
    'eval|conclusion': ['Estilo, conclusión e interpretación', EVAL_FIN.map(([k, t]) => ta(k, t, 6))],
    'eval|necesidades': ['16 y 17. Necesidades y recomendaciones', [{ k: 'necFamiliar', label: 'Necesidades educativas · contexto familiar', tipo: 'lista', alto: 5 }, { k: 'necEscolar', label: 'Necesidades educativas · contexto escolar', tipo: 'lista', alto: 5 }, { k: 'recomendaciones', label: '17. Recomendaciones generales', tipo: 'lista', alto: 6 }]],
    'final|intro': ['Fecha y presentación del alumno', [{ k: 'fecha', label: 'Fecha de elaboración', tipo: 'date' }, ta('intro', 'Presentación (quién es el alumno, cómo trabaja, apoyo recibido)', 6)]],
    'final|perfil': ['Habilidades, fortalezas y áreas', FINAL_SECS.map(([k, t]) => ta(k, t))],
    'final|campos': ['Competencia curricular por campo formativo', CAT.campos.map((k, i) => ta('c' + i, k))],
    'final|bap': ['BAP, recursos y recomendaciones', FINAL_SECS2.map(([k, t]) => ta(k, t))]
  };
  const [tit, campos] = forms[cual + '|' + clave];
  const vals = clave === 'campos' ? Object.fromEntries(CAT.campos.map((k, i) => ['c' + i, x.campos[k] || ''])) : x;
  formulario(tit, campos, vals, o => {
    if (clave === 'campos') CAT.campos.forEach((k, i) => x.campos[k] = o['c' + i]); else Object.assign(x, o);
    listo((cual === 'eval' ? 'Evaluación psicopedagógica: ' : 'Informe final: ') + tit);
  }, cual === 'final' ? apoyoRegistrosApoyo(a) : '');
}
function apoyoRegistrosApoyo(a) {
  const cic = ciclo(), rs = vigentes().filter(r => r.alumnoId === a.id && r.fecha >= cic.ini && r.fecha <= cic.fin).sort((x, y) => y.fecha.localeCompare(x.fecha));
  if (!rs.length) return '';
  return `<details class="caja nota"><summary><strong>Ver los ${rs.length} registros del ciclo</strong> (apoyo para redactar)</summary><ul>${rs.slice(0, 50).map(r => `<li><strong>${esc(fcorta(r.fecha))}</strong> · ${esc(r.actividad)}${r.observacion ? ' — ' + esc(r.observacion) : ''}${(r.marcas || []).length ? ' <em>(' + esc(r.marcas.join(', ')) + ')</em>' : ''}</li>`).join('')}</ul></details>`;
}
function guardarInformeDoc(a, tipo, html) {
  const prev = DB.informes.find(i => i.alumnoId === a.id && i.tipo === tipo && i.ciclo === DB.config.ciclo);
  const inf = prev || { id: uid(), alumnoId: a.id, tipo, ciclo: DB.config.ciclo, desde: ciclo().ini, hasta: hoy(), usuarioId: USUARIO.id };
  inf.html = html; inf.fecha = hoy(); if (!prev) DB.informes.push(inf);
  guardar('Informe guardado: ' + tipo); aviso('Informe guardado en el expediente.'); pintar();
}
function tEvaluacion(t, a) {
  const c = apoDe(a.id), edit = puedeEditar(), det = determinado(a), x = c.eval, f = c.final;
  const caja = (tit, dato, html) => `<div class="caja seccion"><div class="fila"><h3>${esc(tit)}</h3><span class="sep"></span>${edit ? `<button class="sec chico" data-apo="${dato}">Editar</button>` : ''}</div>${html}</div>`;
  const resumen = (o, pares) => pares.map(([k, tt]) => `<p><strong>${esc(tt.split(' (')[0].split(', para')[0])}:</strong> ${esc(((o[k] || '').trim() || '—').slice(0, 140))}${(o[k] || '').length > 140 ? '…' : ''}</p>`).join('');
  t.innerHTML = `<p>Formatos de la <strong>maestra de apoyo</strong> con la estructura de la USAER. Todos los cuadros se pueden dictar con 🎙.${c.actualizado ? ` Última actualización: ${esc(flarga(c.actualizado))}.` : ''}</p>
  ${det ? `<div class="fila"><h2>Informe de evaluación psicopedagógica</h2><span class="sep"></span><button id="vev">🖨 Ver, imprimir o Word</button></div>
  <p class="nota">Lo elaboran juntos apoyo, psicología y comunicación. El personal participante y las firmas salen solos con el equipo de la escuela.</p>
  ${caja('1. Datos generales (familia)', 'eval|datos', `<p><strong>Madre:</strong> ${esc(x.madre || '—')} · <strong>Padre:</strong> ${esc(x.padre || '—')}</p>`)}
  ${caja('2 a 5. Motivo, instrumentos y observación', 'eval|motivo', resumen(x, EVAL_SECS.slice(0, 4)))}
  ${caja('6 a 11. Desarrollo, historia escolar y familia', 'eval|desarrollo', resumen(x, EVAL_SECS.slice(4)))}
  ${caja('12. Situación actual', 'eval|actual', resumen(x, EVAL_ACTUAL))}
  ${caja('13 a 15. Estilo, conclusión e interpretación', 'eval|conclusion', resumen(x, EVAL_FIN))}
  ${caja('16 y 17. Necesidades y recomendaciones', 'eval|necesidades', `<p><strong>Contexto familiar:</strong> ${x.necFamiliar.length} · <strong>Contexto escolar:</strong> ${x.necEscolar.length} · <strong>Recomendaciones:</strong> ${x.recomendaciones.length}</p>`)}` : '<p class="caja nota">Alumno sin diagnóstico: no lleva evaluación psicopedagógica, solo el informe final del ciclo.</p>'}
  <div class="fila"><h2>Informe final · maestra de apoyo</h2><span class="sep"></span>${edit ? '<button class="sec" id="llenar">✨ Llenar con lo que ya hay</button>' : ''}<button id="vif">🖨 Ver, imprimir o Word</button></div>
  ${caja('Fecha y presentación del alumno', 'final|intro', `<p><strong>Fecha:</strong> ${esc(mesAnio(f.fecha) || '—')}</p><p>${esc((f.intro || '—').slice(0, 160))}</p>`)}
  ${caja('Habilidades, fortalezas y áreas', 'final|perfil', resumen(f, FINAL_SECS))}
  ${caja('Competencia curricular por campo formativo', 'final|campos', CAT.campos.map(k => `<p><strong>${esc(k)}:</strong> ${esc(((f.campos[k] || '').trim() || '—').slice(0, 120))}</p>`).join(''))}
  ${caja('BAP, recursos, acciones y recomendaciones', 'final|bap', resumen(f, FINAL_SECS2))}`;
  if ($('#vev', t)) $('#vev', t).onclick = () => visorDoc('Evaluación psicopedagógica · ' + a.nombre, htmlEval(a, c), 'Evaluacion_psicopedagogica_' + a.nombre, html => guardarInformeDoc(a, 'Evaluación psicopedagógica', html), 'plan');
  $('#vif', t).onclick = () => visorDoc('Informe final · ' + a.nombre, htmlFinalApoyo(a, c), 'Informe_final_' + a.nombre + '_' + DB.config.ciclo, html => guardarInformeDoc(a, 'Final de la maestra de apoyo', html), 'plan');
  if (!edit) return;
  t.querySelectorAll('[data-apo]').forEach(b => b.onclick = () => { const [cual, k] = b.dataset.apo.split('|'); editarApoyo(a, c, cual, k); });
  $('#llenar', t).onclick = () => {
    const o = propuestaFinal(a), vacios = Object.keys(o).filter(k => !(f[k] || '').trim());
    if (!vacios.length) { aviso('No hay nada nuevo que pasar: esos cuadros ya tienen texto, o el plan y los registros todavía están vacíos.'); return; }
    vacios.forEach(k => f[k] = o[k]); c.actualizado = hoy(); guardar('Informe final: llenado con el plan y los registros'); pintar();
    aviso('Se llenaron ' + vacios.length + ' cuadros vacíos con el plan, comunicación y los registros. Revíselos y corríjalos.');
  };
}
