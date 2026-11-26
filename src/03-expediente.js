/* EVAU · expediente del alumno, plan de intervención (formato real), análisis de registros e informes */
const TABS = [['historial', 'Registro cronológico'], ['plan', 'Plan de intervención'], ['informes', 'Informes'], ['psicologia', 'Psicología'], ['comunicacion', 'Comunicación'], ['datos', 'Datos y documentos'], ['evidencias', 'Evidencias'], ['valoracion', 'Valoración']];

function cajaDocumentos(a) {
  const c = DB.config.ciclo, prev = (Number(c.slice(0, 4)) - 1) + '-' + c.slice(0, 4);
  const docs = DB.documentos.filter(d => d.alumnoId === a.id);
  const cons = (a.consentimiento || {}).estado === 'Activo' || docs.some(d => d.tipo === 'Consentimiento informado');
  const plan = planTieneContenido(DB.planes[a.id]) || docs.some(d => d.tipo === 'Plan de intervención' && d.ciclo === c);
  const finalAnt = docs.some(d => d.tipo === 'Informe final' && d.ciclo === prev);
  const doc = (tipo, cic) => docs.some(d => d.tipo === tipo && (!cic || d.ciclo === cic));
  const it = (ok, txt, ir) => `<a href="#alumno/${a.id}/${ir}" class="doc-item ${ok ? 'ok' : 'falta'}"><span aria-hidden="true">${ok ? '✅' : '⬜'}</span> ${txt}${ok ? '' : ' <span class="etq r">Falta</span>'}</a>`;
  if (!determinado(a)) {
    const finalCiclo = doc('Informe final', c) || DB.informes.some(i => i.alumnoId === a.id && i.tipo === 'Final del ciclo');
    return `<div class="docs"><strong>Documentos · sin diagnóstico</strong>${it(cons, 'Consentimiento informado', 'datos')}${it(finalCiclo, 'Informe final ' + esc(c), 'informes')}<span class="nota">Solo lleva el informe final del ciclo: sin plan de intervención, propuesta ni evaluación psicopedagógica.</span></div>`;
  }
  return `<div class="docs"><strong>Documentos</strong>${it(cons, 'Consentimiento informado', 'datos')}${it(plan, 'Plan de intervención ' + esc(c), 'plan')}${it(doc('Informe de evaluación psicopedagógica'), 'Informe psicopedagógico', 'datos')}${it(doc('Informe psicológico', c) || DB.informes.some(i => i.alumnoId === a.id && i.tipo === 'Final de psicología' && i.ciclo === c), 'Informe psicológico ' + esc(c), 'datos')}${it(doc('Informe de comunicación', c) || DB.informes.some(i => i.alumnoId === a.id && i.tipo === 'Final de comunicación' && i.ciclo === c), 'Informe de comunicación ' + esc(c), 'datos')}${it(finalAnt, 'Informe final ' + esc(prev), 'datos')}</div>`;
}
function vAlumno(v, id, tab) {
  const a = porId('alumnos', id); if (!a) return vInicio(v);
  tab = tab || 'historial';
  const g = porId('grupos', a.grupoId), e = porId('escuelas', a.escuelaId) || {};
  v.innerHTML = `<p><a href="#inicio">← Alumnos</a></p><h1>📂 ${esc(a.nombre)}</h1>
  <p><strong>${esc(condicionVisible(a))}</strong> · Grupo ${esc(nomGrupo(g))} · ${esc(e.nombre || '')} ${a.estatus !== 'Activo' ? `<span class="etq g">${esc(a.estatus)}</span>` : ''}</p>
  ${cajaDocumentos(a)}
  <div class="pestanas">${TABS.filter(t => determinado(a) || t[0] !== 'valoracion').map(t => `<a href="#alumno/${id}/${t[0]}" class="${t[0] === tab ? 'activo' : ''}">${t[1]}</a>`).join('')}</div><div id="tab"></div>`;
  if (tab === 'valoracion' && !determinado(a)) tab = 'historial';   // sin diagnóstico no lleva valoración
  ({ datos: tDatos, historial: tHistorial, evidencias: tEvidencias, valoracion: tValoracion, plan: tPlan, informes: tInformes, psicologia: tPsicologia, comunicacion: tComunicacion }[tab] || tHistorial)($('#tab'), a);
}

/* ---------- Datos y documentos ---------- */
function tDatos(t, a) {
  const c = a.consentimiento || {}, e = porId('escuelas', a.escuelaId) || {};
  const d = (k, val) => `<tr><th style="width:38%">${k}</th><td>${esc(val || '—')}</td></tr>`;
  const docs = DB.documentos.filter(x => x.alumnoId === a.id).sort((x, y) => (y.fecha || '').localeCompare(x.fecha || ''));
  t.innerHTML = `<div class="caja"><div class="fila"><h2>Documentos del expediente</h2><span class="sep"></span>${ed('<button id="ndoc">＋ Agregar documento</button>')}</div>
  <p>Suba aquí lo que hoy está en la carpeta en papel: el consentimiento firmado, el plan de intervención, el informe final del ciclo anterior, la evaluación psicopedagógica o el documento médico. Puede ser PDF o foto.</p>
  ${docs.length ? `<table><tr><th>Tipo</th><th>Ciclo</th><th>Archivo</th><th></th></tr>${docs.map(x => `<tr><td><strong>${esc(x.tipo)}</strong></td><td>${esc(x.ciclo || '')}</td><td><div class="miniaturas" data-evs="${x.sinArchivo ? '' : x.id}">${x.sinArchivo ? esc(x.nombre) : ''}</div></td><td>${ed(`<button class="sec chico" data-qdoc="${x.id}">Quitar</button>`)}</td></tr>`).join('')}</table>` : '<p><strong>No hay documentos todavía.</strong></p>'}</div>
  <div class="caja ${c.estado === 'Activo' ? 'ok' : 'alerta'}"><h2>Consentimiento informado</h2><p>Estado: <span class="etq ${c.estado === 'Activo' ? 'v' : 'r'}">${esc(c.estado || 'Pendiente')}</span><br>Fecha de firma: <strong>${esc(fcorta(c.fecha) || '—')}</strong> · Vigencia: <strong>${esc(fcorta(c.vigencia) || '—')}</strong><br>${esc(c.obs || '')}</p>${ed('<button class="sec" id="cons">Actualizar consentimiento</button>')}</div>
  <div class="caja"><h2>Identificación</h2><table>${d('Nombre completo', a.nombre)}${d('CURP', a.curp)}${d('Fecha de nacimiento', flarga(a.nacimiento))}${d('Edad', edad(a.nacimiento))}${d('Sexo', a.sexo === 'H' ? 'Hombre' : 'Mujer')}${d('Grado y grupo', nomGrupo(porId('grupos', a.grupoId)))}${d('Escuela', e.nombre)}${d('Turno', e.turno)}${d('Ciclo escolar', DB.config.ciclo)}${d('Estatus', a.estatus)}</table>
  <h2>Datos familiares</h2><table>${d('Madre, padre o tutor', a.tutor)}${d('Parentesco', a.parentesco)}${d('Teléfono', a.telefono)}${d('Correo', a.correo)}${d('Domicilio', a.domicilio)}</table>
  <h2>Datos de salud</h2><table>${d('Condición o categoría (estadística)', a.condicion)}${d('Diagnóstico', a.diagnostico)}${d('Medicación', a.medicacion)}${d('Especialistas o instituciones externas', a.especialistas)}${d('Observaciones', a.obsSalud)}</table>${ed('<button id="edit">Editar datos</button>')}</div>`;
  t.querySelectorAll('[data-evs]').forEach(pintarMiniaturas);
  if (!puedeEditar()) return;
  $('#edit').onclick = () => formulario('Editar alumno', camposAlumno(a.id), a, o => { Object.assign(a, o); a.escuelaId = porId('grupos', a.grupoId).escuelaId; guardar('Edición de alumno'); pintar(); });
  $('#cons').onclick = () => formulario('Consentimiento informado', [{ k: 'estado', label: 'Estado', tipo: 'select', req: 1, opciones: ['Pendiente', 'Activo', 'Retirado por la familia', 'Vencido'] }, { k: 'fecha', label: 'Fecha de firma', tipo: 'date' }, { k: 'vigencia', label: 'Vigente hasta', tipo: 'date' }, { k: 'obs', label: 'Observaciones o condiciones de la familia', tipo: 'textarea' }], c, o => { a.consentimiento = { ...c, ...o }; guardar('Actualización de consentimiento'); pintar(); });
  $('#ndoc').onclick = () => {
    const v = abrirModal(`<h2>Agregar documento</h2><form><label for="d_tipo">Tipo de documento</label><select id="d_tipo">${CAT.docTipos.map(x => `<option>${esc(x)}</option>`).join('')}</select>
    <label for="d_ciclo">Ciclo escolar</label><input id="d_ciclo" value="${esc(DB.config.ciclo)}"><label for="d_arch">Archivo (PDF o foto) *</label><input id="d_arch" type="file" accept="application/pdf,image/*">
    <div class="fila" style="margin-top:1rem"><button type="submit">Guardar</button><button type="button" class="sec" data-no>Cancelar</button></div></form>`);
    $('[data-no]', v).onclick = () => v.cerrar();
    $('form', v).onsubmit = async ev => {
      ev.preventDefault(); const f = $('#d_arch', v).files[0];
      if (!f) { aviso('Elija el archivo.'); return; }
      const id = uid(); await guardarArchivo(id, f);
      DB.documentos.push({ id, alumnoId: a.id, tipo: $('#d_tipo', v).value, ciclo: $('#d_ciclo', v).value.trim(), nombre: f.name, tipoArchivo: f.type, peso: f.size, fecha: hoy() });
      if ($('#d_tipo', v).value === 'Consentimiento informado' && (a.consentimiento || {}).estado !== 'Activo') a.consentimiento = { ...(a.consentimiento || {}), estado: 'Activo', fecha: a.consentimiento && a.consentimiento.fecha || hoy() };
      await guardar('Documento agregado'); v.cerrar(); pintar();
    };
  };
  t.querySelectorAll('[data-qdoc]').forEach(b => b.onclick = () => confirmar('¿Quitar este documento del expediente?', () => { DB.documentos = DB.documentos.filter(x => x.id !== b.dataset.qdoc); guardar('Documento quitado'); pintar(); }, 'Sí, quitar'));
}
function tHistorial(t, a) {
  const regs = DB.registros.filter(r => r.alumnoId === a.id).sort((x, y) => (y.fecha + y.hora).localeCompare(x.fecha + x.hora));
  t.innerHTML = `<p><strong>${regs.filter(r => !r.anulado).length} registros.</strong> Lo más reciente aparece primero. Así se veía la carpeta en papel: fecha, actividad, observación y quién la hizo.</p><div id="lista"></div>`;
  pintarRegistros($('#lista', t), regs);
}
function tEvidencias(t, a) {
  const ids = new Set(DB.registros.filter(r => r.alumnoId === a.id && !r.anulado).map(r => r.id));
  const evs = DB.evidencias.filter(x => ids.has(x.registroId)).sort((x, y) => (y.fecha || '').localeCompare(x.fecha || ''));
  t.innerHTML = `<h2>Evidencias</h2><p>${evs.length} archivos guardados en los registros de este alumno.</p>` + evs.map(x => `<div class="caja"><strong>${esc(fcorta(x.fecha))}</strong> · ${esc(x.nombre)} · ${Math.max(1, Math.round(x.peso / 1024))} KB<div class="miniaturas" data-evs="${x.id}"></div></div>`).join('');
  t.querySelectorAll('[data-evs]').forEach(pintarMiniaturas);
}
function tValoracion(t, a) {
  const val = DB.valoraciones[a.id] || {};
  const sel = (i, k) => puedeEditar() ? `<select data-i="${i}" data-k="${k}" aria-label="${esc(CAT.componentes[i])}">${Object.entries(CAT.escala).map(([c, n]) => `<option value="${c}" ${((val[i] || {})[k] || '') === c ? 'selected' : ''}>${c ? c + ' · ' + n : '—'}</option>`).join('')}</select>` : esc(CAT.escala[(val[i] || {})[k] || '']);
  t.innerHTML = `<h2>Valoración por componentes (opcional)</h2><p>No forma parte del plan de intervención. Escala de referencia, <strong>no oficial</strong>: L = Logrado · P = En proceso · R = Requiere apoyo. Los cambios se guardan solos.</p>
  <div class="tabla-scroll"><table><tr><th>Componente</th><th>Inicial</th><th>Intermedia</th><th>Final</th><th>Evidencia</th></tr>${CAT.componentes.map((c, i) => `<tr><td><strong>${esc(c)}</strong></td><td>${sel(i, 'i')}</td><td>${sel(i, 'm')}</td><td>${sel(i, 'f')}</td><td>${puedeEditar() ? `<input data-i="${i}" data-k="ev" value="${esc((val[i] || {}).ev || '')}" aria-label="Evidencia" style="min-width:12rem">` : esc((val[i] || {}).ev || '')}</td></tr>`).join('')}</table></div>`;
  t.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { const vv = DB.valoraciones[a.id] = DB.valoraciones[a.id] || {}; (vv[c.dataset.i] = vv[c.dataset.i] || {})[c.dataset.k] = c.value; guardar('Valoración actualizada'); aviso('Guardado.'); });
}

/* ---------- Análisis de los registros de un periodo ---------- */
function periodoCorte(nombre) {
  const c = ciclo();
  return { Noviembre: [c.ini, c.a + '-11-30'], Marzo: [c.a + '-12-01', c.b + '-03-31'], Junio: [c.b + '-04-01', c.fin] }[nombre];
}
function periodoInforme(tipo) {
  const c = ciclo();
  if (tipo.includes('noviembre')) return periodoCorte('Noviembre');
  if (tipo.includes('marzo')) return periodoCorte('Marzo');
  if (tipo.includes('junio')) return periodoCorte('Junio');
  return [c.ini, hoy() < c.fin ? hoy() : c.fin];
}
function analizar(a, desde, hasta) {
  const regs = DB.registros.filter(r => r.alumnoId === a.id && !r.anulado && r.fecha >= desde && r.fecha <= hasta).sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora));
  const con = m => regs.filter(r => (r.marcas || []).includes(m));
  const area = r => r.area || 'Sin área';
  const agrupar = xs => { const o = {}; xs.forEach(r => (o[area(r)] = o[area(r)] || []).push(r)); return o; };
  const dif = agrupar(con('Dificultad'));
  const persistentes = Object.entries(dif).filter(([, rs]) => rs.length >= 2).map(([k, rs]) => ({ area: k, rs }));
  const ocasionales = Object.entries(dif).filter(([, rs]) => rs.length < 2).map(([k, rs]) => ({ area: k, rs }));
  const evol = Object.entries(agrupar(regs)).map(([k, rs]) => {
    const ns = rs.filter(r => r.nivel); if (ns.length < 2) return null;
    const i = CAT.nivelesApoyo.indexOf(ns[0].nivel), f = CAT.nivelesApoyo.indexOf(ns[ns.length - 1].nivel);
    return { area: k, de: ns[0], a: ns[ns.length - 1], sentido: f > i ? 'menos' : f < i ? 'mas' : 'igual', n: ns.length };
  }).filter(Boolean);
  return { regs, logros: agrupar(con('Logro')), persistentes, ocasionales, apoyos: con('Apoyo brindado'), evol, familia: regs.filter(r => r.tipo === 'Orientación a familia'), sinMarca: regs.filter(r => !(r.marcas || []).length && r.tipo !== 'Orientación a familia') };
}
const vineta = r => `${fdm(r.fecha)}: ${r.observacion || r.actividad}`;
function textoEvol(x) {
  return x.sentido === 'menos' ? `${x.area}: pasó de «${x.de.nivel}» (${fdm(x.de.fecha)}) a «${x.a.nivel}» (${fdm(x.a.fecha)}); necesita menos apoyo.`
    : x.sentido === 'mas' ? `${x.area}: pasó de «${x.de.nivel}» (${fdm(x.de.fecha)}) a «${x.a.nivel}» (${fdm(x.a.fecha)}); necesitó más apoyo al final del periodo.`
      : `${x.area}: se mantiene en «${x.a.nivel}» (${x.n} registros).`;
}
function recomendaciones(an) {
  const r = [];
  an.persistentes.forEach(p => r.push(`Continuar trabajando en el área ${p.area}: ${p.rs[p.rs.length - 1].observacion}`));
  an.evol.filter(x => x.sentido === 'menos' && x.a.nivel === 'Independiente').forEach(x => r.push(`Retirar gradualmente el apoyo en el área ${x.area}, donde ya trabaja de forma independiente.`));
  an.evol.filter(x => x.sentido === 'mas').forEach(x => r.push(`Revisar los apoyos del área ${x.area}: requirió más ayuda al final del periodo.`));
  return r;
}
function propuestaCorte(a, corte) {
  const [d, h] = periodoCorte(corte), an = analizar(a, d, h);
  const L = [];
  const logros = Object.values(an.logros).flat().sort((x, y) => x.fecha.localeCompare(y.fecha));
  if (logros.length) L.push('Logros:', ...logros.map(r => '• ' + vineta(r)));
  const difs = [...an.persistentes, ...an.ocasionales].flatMap(p => p.rs).sort((x, y) => x.fecha.localeCompare(y.fecha));
  if (difs.length) L.push('Dificultades:', ...difs.map(r => '• ' + vineta(r)));
  if (an.evol.length) L.push('Nivel de apoyo:', ...an.evol.map(x => '• ' + textoEvol(x)));
  return { logros: L.join('\n') || 'No hay registros marcados en este periodo.', padres: an.familia.map(r => '• ' + vineta(r)).join('\n') || 'Sin registros de orientación a la familia en este periodo.', n: an.regs.length };
}

/* ---------- Plan de intervención: apartados del formato ---------- */
const ul = xs => xs.length ? `<ul>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
const parrafos = t => lineas(t).map(x => `<p>${esc(x)}</p>`).join('');
const br = t => esc(t).replace(/\n/g, '<br>');
function participantesDe(a, p) {
  if (p.participantes.length) return p.participantes;
  const g = porId('grupos', a.grupoId) || {};
  const L = [{ funcion: 'Maestra(o) de grupo', nombre: g.docente || '' }, { funcion: (a.parentesco || 'Madre, padre o tutor') + ' del alumno', nombre: a.tutor || '' }];
  [['apoyo', 'Maestra(o) de apoyo'], ['psicologia', 'Psicología'], ['comunicacion', 'Maestra(o) de comunicación']].forEach(([rol, f]) => DB.usuarios.filter(u => u.rol === rol && atiende(u, a.escuelaId)).forEach(u => L.push({ funcion: f, nombre: u.nombre })));
  return L;
}
const SECCIONES = [
  ['datos', 'Datos generales', (p) => parrafos(p.datosGenerales) || '<p><em>Sin redactar.</em></p>'],
  ['areas', 'Habilidades y áreas de oportunidad del alumno', (p) => `<table class="t2"><tr><th>FORTALEZAS</th><th>ÁREAS DE OPORTUNIDAD</th></tr>${CAT.areas.map(ar => `<tr><td><strong>${esc(ar.toUpperCase())}:</strong>${ul(p.areas[ar].fortalezas)}</td><td><strong>${esc(ar.toUpperCase())}:</strong>${ul(p.areas[ar].oportunidades)}</td></tr>`).join('')}</table>`],
  ['bap', 'Barreras para el aprendizaje y la participación', (p) => { const c = CAT.bapCats.filter(k => p.bap[k].length); return `<table><tr><th>BARRERAS PARA EL APRENDIZAJE Y LA PARTICIPACIÓN</th></tr><tr><td>${c.map(k => `<p><strong>${esc(k)}</strong></p>${ul(p.bap[k])}`).join('') || '<em>Sin registrar.</em>'}</td></tr></table>`; }],
  ['acceso', 'Tipos de adecuaciones de acceso que se requieren para apoyar al alumno', (p) => { const bloque = (obj, tipos) => { const f = tipos.filter(k => obj[k].adecuacion); return [f.map(k => `<p><strong>${esc(k)}:</strong> ${esc(obj[k].adecuacion)}</p>`).join('') || '<em>—</em>', f.map(k => `<p><strong>${esc(k)}:</strong> ${esc(obj[k].responsables)}</p>`).join('')]; }; const A = bloque(p.aula, CAT.aula), B = bloque(p.apoyos, CAT.apoyos); return `<table><tr><th style="width:18%">TIPOS</th><th>ADECUACIONES</th><th style="width:30%">RESPONSABILIDADES</th></tr><tr><td><strong>EN EL AULA</strong></td><td>${A[0]}</td><td>${A[1]}</td></tr><tr><td><strong>APOYOS PERSONALES Y/O TÉCNICOS</strong></td><td>${B[0]}</td><td>${B[1]}</td></tr></table>`; }],
  ['curriculo', 'Adecuaciones a los elementos del currículo', (p) => `<table>${CAT.curriculo.map(k => `<tr><th style="width:28%">${esc(k.toUpperCase())}</th><td>${ul(p.curriculo[k]) || '—'}</td></tr>`).join('')}</table>`],
  ['curriculares', 'Adecuaciones curriculares en la metodología, evaluación y procesos de desarrollo de aprendizaje', (p, a, edit) => { const grupos = {}; p.curriculares.forEach(x => (grupos[x.fase + '|' + x.campo] = grupos[x.fase + '|' + x.campo] || []).push(x)); return Object.entries(grupos).map(([k, xs]) => { const [f, c] = k.split('|'); return `<table><tr><th colspan="${edit ? 4 : 3}" class="centro">PROGRAMA DE ESTUDIOS ${esc(f.toUpperCase())}<br>CAMPO FORMATIVO: ${esc(c.toUpperCase())}</th></tr><tr><th>CONTENIDO</th><th>PDA</th><th>AJUSTES</th>${edit ? '<th></th>' : ''}</tr>${xs.map(x => `<tr><td>${esc(x.contenido)}</td><td>${esc(x.pda)}</td><td>${esc(x.ajustes)}</td>${edit ? `<td><button class="sec chico" data-edcur="${x.id}">Editar</button> <button class="sec chico" data-qcur="${x.id}">Quitar</button></td>` : ''}</tr>`).join('')}</table>`; }).join('') || '<p><em>Sin contenidos registrados.</em></p>'; }],
  ['registro', 'Registro de evaluación del alumno (información relevante)', (p, a, edit) => `<table><tr><th style="width:16%">FECHAS / MES</th><th>OBSERVACIÓN DE LOGROS Y DIFICULTADES</th><th style="width:30%">CONOCIMIENTO DE LOS PADRES DE FAMILIA</th></tr>${CAT.cortes.map(c => `<tr><td><strong>${c}</strong>${edit ? `<br><button class="chico" data-prop="${c}">Llenar con los registros</button>` : ''}</td><td>${br(p.registroEval[c].logros)}</td><td>${br(p.registroEval[c].padres)}</td></tr>`).join('')}</table>`],
  ['padres', 'Necesidades de orientación de los padres de familia', (p) => `<table><tr><th>¿Cuáles son las necesidades de orientación y apoyo a los padres de familia?</th><th style="width:16%" class="centro">Señale con una X</th></tr>${CAT.necesidadesPadres.map(n => `<tr><td>${esc(n)}</td><td class="centro">${casilla(p.necesidades.includes(n))}</td></tr>`).join('')}<tr><td>Otras necesidades: ${esc(p.necesidadesOtras)}</td><td class="centro">${casilla(!!p.necesidadesOtras)}</td></tr></table>`],
  ['compromisos', 'Compromiso y acciones con los padres de familia', (p, a, edit) => `<table><tr><th>Compromiso y acciones con los padres de familia</th><th style="width:28%">Responsables para el seguimiento</th><th style="width:18%">Fecha</th>${edit ? '<th></th>' : ''}</tr>${p.compromisos.map(x => `<tr><td>${esc(x.accion)}</td><td>${esc(x.responsables)}</td><td>${esc(x.fecha)}</td>${edit ? `<td><button class="sec chico" data-edcom="${x.id}">Editar</button> <button class="sec chico" data-qcom="${x.id}">Quitar</button></td>` : ''}</tr>`).join('') || `<tr><td colspan="${edit ? 4 : 3}"><em>Sin compromisos.</em></td></tr>`}</table>`],
  ['final', 'Desempeño general del alumno · fin de ciclo escolar', (p) => { const f = p.final, sn = v => `SÍ ${casilla(v === 'SI')} &nbsp; NO ${casilla(v === 'NO')}`; return `<table><tr><td>Tomando en cuenta el plan de intervención educativa del alumno del ciclo escolar, ¿avanzó de acuerdo con lo que se esperaba?</td><td style="width:22%">${sn(f.avanzo)}</td></tr><tr><th colspan="2">Evaluación final (promoción y continuidad)</th></tr><tr><td>Promoción: ¿será promovido al siguiente grado o nivel educativo?</td><td>${sn(f.promocion)}</td></tr><tr><td colspan="2"><strong>Continuidad.</strong> Razones, elementos considerados y quiénes participaron en la toma de decisiones: ${esc(f.razones)}</td></tr><tr><td colspan="2">En caso de que el educando no continúe en la misma escuela, ¿dónde estará? ${esc(f.destino)}</td></tr></table>`; }],
  ['participantes', 'Participantes', (p, a) => { const g = porId('escuelas', a.escuelaId) || {}; return `<table><tr><th>FUNCIÓN</th><th>NOMBRE</th><th style="width:28%">FIRMA</th></tr>${participantesDe(a, p).map(x => `<tr><td>${esc(x.funcion.toUpperCase())}</td><td>${esc(x.nombre)}</td><td></td></tr>`).join('')}</table>${firmas(['Vo. Bo.<br>DIRECTOR(A) DE LA USAER<br><strong>' + esc(DB.usaer.directora) + '</strong>', 'Vo. Bo.<br>DIRECTOR(A) DE LA PRIMARIA<br><strong>' + esc(g.director || '') + '</strong>'])}`; }]
];
function editarSeccion(a, p, clave) {
  const listo = msg => { p.actualizado = hoy(); guardar('Plan: ' + msg); pintar(); };
  if (clave === 'datos') return formulario('Datos generales', [{ k: 'datosGenerales', label: 'Datos generales', tipo: 'textarea', alto: 18, ayuda: 'Un párrafo por renglón: diagnóstico y atención externa; contexto familiar; contexto escolar (incluya el aula y la escuela, para que las barreras no aparezcan «de la nada»); propósito del plan.' }], p, o => { p.datosGenerales = o.datosGenerales; listo('datos generales'); });
  if (clave === 'areas') {
    const v = abrirModal(`<h2>Fortalezas y áreas de oportunidad</h2><p class="nota">Elija el área. <strong>Fortaleza</strong> = lo que ya hace. <strong>Área de oportunidad</strong> = lo que necesita aprender, empezando con verbo (Favorecer, Fortalecer, Regular…). El «cómo» va en adecuaciones y apoyos.</p><div class="chips">${CAT.areas.map(ar => `<button type="button" class="sec chico" data-ar="${esc(ar)}">${esc(ar)}</button>`).join('')}</div><div class="fila"><button class="sec" data-no>Cerrar</button></div>`);
    $('[data-no]', v).onclick = () => v.cerrar();
    v.querySelectorAll('[data-ar]').forEach(b => b.onclick = () => { v.cerrar(); const ar = b.dataset.ar; formulario('Área ' + ar, [{ k: 'fortalezas', label: 'Fortalezas', tipo: 'lista', alto: 9 }, { k: 'oportunidades', label: 'Áreas de oportunidad', tipo: 'lista', alto: 9 }], p.areas[ar], o => { p.areas[ar] = o; listo('área ' + ar); }); });
    return;
  }
  if (clave === 'bap') return formulario('Barreras para el aprendizaje y la participación', CAT.bapCats.map((c, i) => ({ k: 'c' + i, label: c, tipo: 'lista' })), Object.fromEntries(CAT.bapCats.map((c, i) => ['c' + i, p.bap[c]])), o => { CAT.bapCats.forEach((c, i) => p.bap[c] = o['c' + i]); listo('barreras'); },
    '<p class="caja nota">Una barrera es una <strong>condición del contexto</strong> (escuela, aula, práctica docente, organización o familia) que limita el aprendizaje o la participación. Si la frase habla de lo que el alumno hace o le cuesta, es área de oportunidad.<br>✗ «No tolera el ruido» · ✓ «Uso de bocinas en eventos sin aviso previo».</p>');
  if (clave === 'acceso') {
    const campos = [], vals = {};
    [['aula', CAT.aula, 'En el aula'], ['apoyos', CAT.apoyos, 'Apoyos personales y/o técnicos']].forEach(([obj, tipos, tit]) => tipos.forEach((t, i) => { campos.push({ k: obj + i + 'a', label: tit + ' · ' + t + ': adecuación', tipo: 'textarea' }, { k: obj + i + 'r', label: t + ': responsables' }); vals[obj + i + 'a'] = p[obj][t].adecuacion; vals[obj + i + 'r'] = p[obj][t].responsables; }));
    return formulario('Adecuaciones de acceso', campos, vals, o => { [['aula', CAT.aula], ['apoyos', CAT.apoyos]].forEach(([obj, tipos]) => tipos.forEach((t, i) => p[obj][t] = { adecuacion: o[obj + i + 'a'], responsables: o[obj + i + 'r'] })); listo('adecuaciones de acceso'); }, '<p class="nota">Deje en blanco lo que no aplique. Cada adecuación debería responder a una barrera ya nombrada.</p>');
  }
  if (clave === 'curriculo') return formulario('Adecuaciones a los elementos del currículo', CAT.curriculo.map((c, i) => ({ k: 'c' + i, label: c, tipo: 'lista', alto: 7 })), Object.fromEntries(CAT.curriculo.map((c, i) => ['c' + i, p.curriculo[c]])), o => { CAT.curriculo.forEach((c, i) => p.curriculo[c] = o['c' + i]); listo('elementos del currículo'); });
  const CC = [{ k: 'fase', label: 'Programa de estudios', tipo: 'select', req: 1, opciones: CAT.fases }, { k: 'campo', label: 'Campo formativo', tipo: 'select', req: 1, opciones: CAT.campos }, { k: 'contenido', label: 'Contenido', tipo: 'textarea', req: 1 }, { k: 'pda', label: 'PDA', tipo: 'textarea', req: 1 }, { k: 'ajustes', label: 'Ajustes', tipo: 'textarea' }];
  if (clave === 'curriculares') return formulario('Agregar contenido y PDA', CC, { fase: 'Fase 4', campo: 'Lenguajes' }, o => { p.curriculares.push({ id: uid(), ...o }); listo('contenido agregado'); });
  if (clave === 'registro') return formulario('Registro de evaluación', CAT.cortes.flatMap(c => [{ k: c + 'l', label: c + ': observación de logros y dificultades', tipo: 'textarea', alto: 6 }, { k: c + 'p', label: c + ': conocimiento de los padres de familia', tipo: 'textarea' }]), Object.fromEntries(CAT.cortes.flatMap(c => [[c + 'l', p.registroEval[c].logros], [c + 'p', p.registroEval[c].padres]])), o => { CAT.cortes.forEach(c => p.registroEval[c] = { logros: o[c + 'l'], padres: o[c + 'p'] }); listo('registro de evaluación'); });
  if (clave === 'padres') return formulario('Necesidades de orientación de los padres', [{ k: 'necesidades', label: 'Señale las que apliquen', tipo: 'checks', opciones: CAT.necesidadesPadres }, { k: 'necesidadesOtras', label: 'Otras necesidades' }], p, o => { p.necesidades = o.necesidades; p.necesidadesOtras = o.necesidadesOtras; listo('necesidades de los padres'); });
  const CM = [{ k: 'accion', label: 'Compromiso y acciones', tipo: 'textarea', req: 1 }, { k: 'responsables', label: 'Responsables para el seguimiento' }, { k: 'fecha', label: 'Fecha (o periodo)' }];
  if (clave === 'compromisos') return formulario('Agregar compromiso', CM, {}, o => { p.compromisos.push({ id: uid(), ...o }); listo('compromiso agregado'); });
  if (clave === 'final') return formulario('Fin de ciclo escolar', [{ k: 'avanzo', label: '¿Avanzó de acuerdo con lo que se esperaba?', tipo: 'select', opciones: [['SI', 'Sí'], ['NO', 'No']] }, { k: 'promocion', label: '¿Será promovido al siguiente grado o nivel?', tipo: 'select', opciones: [['SI', 'Sí'], ['NO', 'No']] }, { k: 'razones', label: 'Razones, elementos considerados y quiénes participaron', tipo: 'textarea' }, { k: 'destino', label: 'Si no continúa en la misma escuela, ¿dónde estará?' }], p.final, o => { p.final = o; listo('fin de ciclo'); });
  if (clave === 'participantes') {
    const actual = participantesDe(a, p);
    return formulario('Participantes', [{ k: 'lista', label: 'Una persona por renglón: Función | Nombre', tipo: 'textarea', alto: 10 }], { lista: actual.map(x => x.funcion + ' | ' + x.nombre).join('\n') }, o => { p.participantes = lineas(o.lista).map(l => { const [f, n] = l.split('|'); return { funcion: (f || '').trim(), nombre: (n || '').trim() }; }); listo('participantes'); });
  }
  return { CC, CM };
}

/* Revisión rápida: reglas tomadas de la revisión del plan */
function revisarPlan(a, p) {
  const obs = [], nombre = a.nombre.split(' ')[0].toLowerCase();
  const todo = [p.datosGenerales, ...Object.values(p.areas).flatMap(x => [...x.fortalezas, ...x.oportunidades]), ...Object.values(p.bap).flat(), ...Object.values(p.aula).map(x => x.adecuacion), ...Object.values(p.apoyos).map(x => x.adecuacion)].join('\n');
  if (/\[(especificar|confirmar)/i.test(todo)) obs.push(['Pendientes', 'Hay textos marcados como [ESPECIFICAR] o [CONFIRMAR] sin resolver.']);
  if (!lineas(p.datosGenerales).length) obs.push(['Datos generales', 'Falta redactar los datos generales.']);
  else if (Object.values(p.bap['Del contexto físico y sensorial']).length && !/(aula|sal[oó]n|escuela|espacio)/i.test(p.datosGenerales)) obs.push(['Datos generales', 'Hay barreras del contexto físico, pero los datos generales no describen el aula ni la escuela.']);
  const vistos = new Map();
  CAT.areas.forEach(ar => {
    const x = p.areas[ar];
    x.oportunidades.forEach(o => {
      const pal = (o.match(/^[\s¿¡"«]*([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/) || [])[1] || '';
      if (!/(ar|er|ir|arse|erse|irse)$/i.test(pal)) obs.push(['Área ' + ar, `«${o}» debería empezar con verbo (Favorecer, Fortalecer, Regular…).`]);
      if (/\((.*(pictograma|agenda|reloj|caja|tarjeta|material).*)\)/i.test(o)) obs.push(['Área ' + ar, `«${o}» incluye una estrategia entre paréntesis; el «cómo» va en adecuaciones y apoyos.`]);
    });
    [...x.fortalezas, ...x.oportunidades].forEach(t => { const k = t.toLowerCase().replace(/[^a-záéíóúñ ]/g, '').trim(); if (vistos.has(k) && vistos.get(k) !== ar) obs.push(['Repetición', `«${t}» aparece en ${vistos.get(k)} y en ${ar}.`]); else vistos.set(k, ar); });
    if (!x.fortalezas.length && !x.oportunidades.length) obs.push(['Área ' + ar, 'Está vacía.']);
  });
  CAT.bapCats.forEach(c => p.bap[c].forEach(b => { if (b.toLowerCase().includes(nombre) || /\b(no tolera|le cuesta|no puede|presenta|su diagn[oó]stico|el alumno|la alumna)\b/i.test(b)) obs.push(['Barreras', `«${b}» parece describir al alumno, no al contexto. Puede ser área de oportunidad.`]); }));
  const nBap = Object.values(p.bap).flat().length, nAcc = [...Object.values(p.aula), ...Object.values(p.apoyos)].filter(x => x.adecuacion).length;
  if (nAcc && !nBap) obs.push(['Cadena del plan', 'Hay adecuaciones, pero ninguna barrera que las justifique.']);
  if (p.bap['Metodológicas o didácticas'].length === 0 && (p.aula['Comunicativas'].adecuacion || p.curriculo['Metodología'].length)) obs.push(['Cadena del plan', 'Se proponen adecuaciones comunicativas o de metodología, pero no hay barreras metodológicas o didácticas nombradas.']);
  [...Object.entries(p.aula), ...Object.entries(p.apoyos)].forEach(([t, x]) => { if (x.adecuacion && !x.responsables) obs.push(['Adecuaciones', `«${t}» no tiene responsables.`]); });
  return obs;
}
function htmlPlan(a, p, edit) {
  const g = porId('grupos', a.grupoId) || {}, e = porId('escuelas', a.escuelaId) || {}, u = DB.usaer;
  const enc = `<div class="encab"><strong>NOMBRE DEL ALUMNO:</strong> <u>${esc(a.nombre.toUpperCase())}</u> &nbsp; <strong>GRADO Y GRUPO:</strong> <u>${esc(nomGrupo(g))}</u><br><strong>ESCUELA PRIMARIA:</strong> <u>${esc((e.nombre || '').toUpperCase())}</u> &nbsp; <strong>CICLO ESCOLAR:</strong> <u>${esc(DB.config.ciclo)}</u><br>${esc(u.encabezado)} <strong><u>${esc(a.condicion.toUpperCase())}</u></strong></div>`;
  const cuerpo = SECCIONES.map(([k, tit, fn]) => `<h2>${esc(tit.toUpperCase())}</h2>${fn(p, a, edit)}`).join('')
    .replace(/<table([^>]*)><tr>((?:<th[^>]*>[\s\S]*?<\/th>)+)<\/tr>/g, '<table$1><thead><tr>$2</tr></thead>');
  return `<div class="portada">${u.logoIzq || u.logoDer ? `<div class="logos">${u.logoIzq ? `<img src="${u.logoIzq}" alt="">` : '<span></span>'}${u.logoDer ? `<img src="${u.logoDer}" alt="">` : '<span></span>'}</div>` : ''}<p><strong>${esc(u.unidad)}</strong><br><strong>C.C.T.: ${esc(u.cct)} &nbsp; TURNO: ${esc(u.turno)}</strong><br>${esc(u.domicilio)}</p>
  <p class="t-plan">PLAN DE INTERVENCIÓN EDUCATIVA</p><p><strong>NIVEL EDUCATIVO:</strong><br>PRIMARIA</p><p><strong>NOMBRE DEL ALUMNO:</strong><br><u>${esc(a.nombre.toUpperCase())}</u></p><p><strong>CICLO ESCOLAR ${esc(DB.config.ciclo)}</strong></p><p><strong>GRADO Y GRUPO:</strong><br>${esc(nomGrupo(g))}</p><p class="nota">Formato de uso en la USAER · datos ficticios de prueba</p></div>
  <div class="salto"></div><table class="marco"><thead><tr><td>${enc}</td></tr></thead><tbody><tr><td>${cuerpo}</td></tr></tbody></table>`;
}
function tPlan(t, a) {
  if (!determinado(a) && !planTieneContenido(DB.planes[a.id])) {
    t.innerHTML = `<div class="caja"><h2>Plan de intervención</h2><p>${esc(a.nombre)} está registrado sin diagnóstico (<strong>${esc(a.condicion)}</strong>). A los alumnos sin diagnóstico no se les hace plan de intervención ni evaluación psicopedagógica: con los registros de todo el ciclo se elabora solo el <a href="#alumno/${a.id}/informes">informe final</a>.</p><p class="nota">Si el alumno recibe un diagnóstico, cambie su condición en «Datos y documentos» y aquí aparecerá el plan.</p></div>`;
    return;
  }
  const p = planDe(a.id), edit = puedeEditar();
  const n = revisarPlan(a, p).length;
  t.innerHTML = `<div class="fila"><h2>Plan de intervención educativa · ${esc(DB.config.ciclo)}</h2><span class="sep"></span><button id="ver">🖨 Ver, imprimir o Word</button><button class="sec" id="rev">Revisión rápida${n ? ` (${n})` : ''}</button></div>
  <p>Se llena al inicio y <strong>se actualiza cuando hace falta</strong>, no cada día. El <strong>Registro de evaluación</strong> (noviembre, marzo, junio) se puede llenar con el registro cronológico.${p.actualizado ? ` Última actualización: ${esc(flarga(p.actualizado))}.` : ''}</p>` +
    SECCIONES.map(([k, tit, fn]) => `<div class="caja seccion"><div class="fila"><h3>${esc(tit)}</h3><span class="sep"></span>${edit ? `<button class="sec chico" data-sec="${k}">${['curriculares', 'compromisos'].includes(k) ? '＋ Agregar' : 'Editar'}</button>` : ''}</div><div class="tabla-scroll">${fn(p, a, edit)}</div></div>`).join('');
  $('#ver', t).onclick = () => visorDoc('Plan de intervención · ' + a.nombre, htmlPlan(a, p, false), 'Plan_de_intervencion_' + a.nombre + '_' + DB.config.ciclo, null, 'plan');
  $('#rev', t).onclick = () => { const obs = revisarPlan(a, p); const v = abrirModal(`<h2>Revisión rápida del plan</h2><p>Basada en los criterios de la revisión del plan: la cadena <strong>lo que hace → qué del entorno se lo impide (BAP) → qué cambiamos (adecuaciones) → quién lo hace</strong>.</p>${obs.length ? `<table><tr><th>Apartado</th><th>Observación</th></tr>${obs.map(o => `<tr><td><strong>${esc(o[0])}</strong></td><td>${esc(o[1])}</td></tr>`).join('')}</table>` : '<p class="caja ok"><strong>Sin observaciones.</strong></p>'}<p class="nota">Es una ayuda automática, no sustituye la revisión de la dirección.</p><button data-no>Cerrar</button>`); $('[data-no]', v).onclick = () => v.cerrar(); };
  if (!edit) return;
  t.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => editarSeccion(a, p, b.dataset.sec));
  const { CC, CM } = editarSeccion(a, p, '');
  const listo = m => { p.actualizado = hoy(); guardar('Plan: ' + m); pintar(); };
  t.querySelectorAll('[data-edcur]').forEach(b => b.onclick = () => { const x = p.curriculares.find(y => y.id === b.dataset.edcur); formulario('Editar contenido', CC, x, o => { Object.assign(x, o); listo('contenido editado'); }); });
  t.querySelectorAll('[data-qcur]').forEach(b => b.onclick = () => { p.curriculares = p.curriculares.filter(y => y.id !== b.dataset.qcur); listo('contenido quitado'); });
  t.querySelectorAll('[data-edcom]').forEach(b => b.onclick = () => { const x = p.compromisos.find(y => y.id === b.dataset.edcom); formulario('Editar compromiso', CM, x, o => { Object.assign(x, o); listo('compromiso editado'); }); });
  t.querySelectorAll('[data-qcom]').forEach(b => b.onclick = () => { p.compromisos = p.compromisos.filter(y => y.id !== b.dataset.qcom); listo('compromiso quitado'); });
  t.querySelectorAll('[data-prop]').forEach(b => b.onclick = () => {
    const c = b.dataset.prop, pr = propuestaCorte(a, c), [d, h] = periodoCorte(c);
    formulario('Registro de evaluación · ' + c, [{ k: 'logros', label: 'Observación de logros y dificultades', tipo: 'textarea', alto: 14 }, { k: 'padres', label: 'Conocimiento de los padres de familia', tipo: 'textarea', alto: 5 }], pr, o => { p.registroEval[c] = o; listo('registro de evaluación ' + c); },
      `<p class="caja nota">Propuesta armada con <strong>${pr.n} registros</strong> del ${esc(flarga(d))} al ${esc(flarga(h))}: los marcados como logro o dificultad y los cambios en el nivel de apoyo. <strong>Revísela y corríjala antes de guardar.</strong></p>`);
  });
}

/* ---------- Informes ---------- */
function armarInforme(a, tipo, desde, hasta) {
  const g = porId('grupos', a.grupoId), e = porId('escuelas', a.escuelaId) || {}, fam = tipo === 'Para la familia', p = DB.planes[a.id];
  const an = analizar(a, desde, hasta), nEv = DB.evidencias.filter(x => an.regs.some(r => r.id === x.registroId)).length;
  const vacio = txt => `<p><em>${txt}</em></p>`;
  const fila = (k, v1, k2, v2) => `<tr><th>${k}</th><td>${esc(v1 || '')}</td><th>${k2}</th><td>${esc(v2 || '')}</td></tr>`;
  const porAreaHTML = obj => Object.entries(obj).map(([ar, rs]) => `<p><strong>${esc(ar)}</strong></p>${ul(rs.map(vineta))}`).join('');
  let n = 1; const h = t => `<h2>${n++}. ${t}</h2>`;
  let s = `<h1>${fam ? 'INFORME PARA LA FAMILIA' : 'INFORME DE SEGUIMIENTO DEL ALUMNO'}<br>${fam ? '' : esc(tipo.replace('Seguimiento — ', '').toUpperCase())}</h1>
  <p style="text-align:center"><strong>Elaborado con el registro cronológico · formato de uso común (no oficial) · datos ficticios de prueba</strong></p>
  ${h('Datos de identificación')}<table>${fila('Escuela', e.nombre, 'CCT', e.cct)}${fila('Servicio de apoyo', DB.usaer.unidad, 'Ciclo escolar', DB.config.ciclo)}${fila('Alumno', a.nombre, 'Grado y grupo', nomGrupo(g))}${fila('Periodo', 'Del ' + flarga(desde) + ' al ' + flarga(hasta), 'Registros analizados', String(an.regs.length))}${fila('Elaboró', USUARIO.nombre, 'Fecha', flarga(hoy()))}</table>`;
  if (fam) {
    s += h('Lo que ha logrado') + (Object.keys(an.logros).length ? porAreaHTML(an.logros) : vacio('No hay logros marcados en el periodo.'));
    s += h('En qué seguimos trabajando') + (an.persistentes.length + an.ocasionales.length ? ul([...an.persistentes, ...an.ocasionales].map(x => x.area + ': ' + x.rs[x.rs.length - 1].observacion)) : vacio('Sin dificultades marcadas.'));
    s += h('Cómo puede apoyar en casa') + '<div contenteditable="true">Escriba aquí dos o tres sugerencias sencillas.</div>';
  } else {
    s += h('Fortalezas observadas') + (Object.keys(an.logros).length ? porAreaHTML(an.logros) : vacio('No hay registros marcados como logro en el periodo.'));
    s += h('Dificultades persistentes') + (an.persistentes.length ? an.persistentes.map(x => `<p><strong>${esc(x.area)}</strong> (${x.rs.length} registros)</p>${ul(x.rs.map(vineta))}`).join('') : vacio('Ninguna dificultad se repitió en el periodo.')) + (an.ocasionales.length ? `<p><strong>Dificultades ocasionales:</strong></p>${ul(an.ocasionales.flatMap(x => x.rs.map(r => x.area + ' — ' + vineta(r))))}` : '');
    const ajustes = p ? [...Object.entries(p.aula), ...Object.entries(p.apoyos)].filter(([, x]) => x.adecuacion).map(([k, x]) => k + ': ' + x.adecuacion) : [];
    s += h('Apoyos implementados') + (an.apoyos.length ? ul(an.apoyos.map(vineta)) : vacio('No hay registros marcados como apoyo brindado.')) + (ajustes.length ? `<p><strong>Adecuaciones previstas en el plan de intervención:</strong></p>${ul(ajustes)}` : '');
    s += h('Avances: cambio en el nivel de apoyo') + (an.evol.length ? ul(an.evol.map(textoEvol)) : vacio('Se necesitan al menos dos registros con nivel de apoyo en una misma área para mostrar el avance.'));
    s += h('Comunicación con la familia') + (an.familia.length ? ul(an.familia.map(vineta)) : vacio('Sin registros de orientación a la familia en el periodo.'));
    const rec = recomendaciones(an);
    s += h('Recomendaciones') + `<div contenteditable="true">${rec.length ? ul(rec) : 'Escriba aquí las recomendaciones.'}</div>`;
  }
  s += h('Acuerdos') + '<div contenteditable="true">Escriba aquí los acuerdos.</div>';
  s += firmas([esc(USUARIO.nombre) + '<br>' + esc(CAT.roles[USUARIO.rol]), fam ? 'Docente de grupo' : 'Vo. Bo. Director(a) de la USAER<br>' + esc(DB.usaer.directora)]) + firmas(['Vo. Bo. Dirección escolar<br>' + esc(e.director || ''), 'Madre, padre o tutor (enterado)']);
  if (!fam && an.regs.length) s += `<div class="salto"></div><h2>Anexo · Registro cronológico del periodo</h2><table><tr><th style="width:13%">Fecha</th><th>Actividad</th><th>Observación</th><th style="width:20%">Registró</th></tr>${an.regs.map(r => `<tr><td>${esc(fcorta(r.fecha))}</td><td>${esc(r.actividad)}</td><td>${esc(r.observacion)}${r.nivel ? ' <em>(' + esc(r.nivel) + ')</em>' : ''}</td><td>${esc(nomUsuario(r.usuarioId))}</td></tr>`).join('')}</table><p>Evidencias guardadas en el periodo: <strong>${nEv}</strong>.</p>`;
  return s;
}
function verInforme(inf, nuevo) {
  const a = porId('alumnos', inf.alumnoId) || { nombre: '' };
  visorDoc(inf.tipo + ' · ' + a.nombre, inf.html, 'Informe_' + inf.tipo + '_' + a.nombre, html => { inf.html = html; if (nuevo && !porId('informes', inf.id)) DB.informes.push(inf); guardar('Informe guardado: ' + inf.tipo); aviso('Informe guardado en el expediente.'); pintar(); });
}
function nuevoInforme(alumnoId) {
  if (!activos().length) { aviso('No hay alumnos en atención.'); return; }
  const v = formulario('Generar informe', [{ k: 'alumnoId', label: 'Alumno', tipo: 'select', req: 1, opciones: activos().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(a => [a.id, a.nombre]) }, { k: 'tipo', label: 'Tipo de informe', tipo: 'select', req: 1, opciones: CAT.tiposInforme, ayuda: 'A los alumnos sin diagnóstico solo se les hace el informe final del ciclo.' }, { k: 'desde', label: 'Desde', tipo: 'date', req: 1 }, { k: 'hasta', label: 'Hasta', tipo: 'date', req: 1 }],
    { alumnoId: alumnoId || '' },
    o => verInforme({ id: uid(), alumnoId: o.alumnoId, tipo: o.tipo, desde: o.desde, hasta: o.hasta, fecha: hoy(), usuarioId: USUARIO.id, html: armarInforme(porId('alumnos', o.alumnoId), o.tipo, o.desde, o.hasta) }, true),
    '<p class="nota">El informe se arma con los registros del periodo: los marcados como <strong>logro</strong>, <strong>dificultad</strong> o <strong>apoyo brindado</strong>, y los cambios en el <strong>nivel de apoyo</strong>.</p>');
  const periodo = () => { const p = periodoInforme($('#f_tipo', v).value); $('#f_desde', v).value = p[0]; $('#f_hasta', v).value = p[1]; };
  const tipos = () => { const ts = tiposInformeDe(porId('alumnos', $('#f_alumnoId', v).value)); $('#f_tipo', v).innerHTML = ts.map(t => `<option>${esc(t)}</option>`).join(''); periodo(); };
  $('#f_alumnoId', v).onchange = tipos; $('#f_tipo', v).onchange = periodo; tipos();
}
function tablaInformes(cont, xs) {
  cont.innerHTML = xs.length ? `<div class="tabla-scroll"><table><tr><th>Fecha</th><th>Alumno</th><th>Tipo</th><th>Periodo</th><th>Elaboró</th><th></th></tr>${xs.slice().reverse().map(i => `<tr><td>${esc(fcorta(i.fecha))}</td><td>${esc((porId('alumnos', i.alumnoId) || {}).nombre || '')}</td><td>${esc(i.tipo)}</td><td>${esc(fcorta(i.desde))} – ${esc(fcorta(i.hasta))}</td><td>${esc(nomUsuario(i.usuarioId))}</td><td><button class="chico" data-ver="${i.id}">Abrir</button></td></tr>`).join('')}</table></div>` : '<p>Todavía no hay informes guardados.</p>';
  cont.querySelectorAll('[data-ver]').forEach(b => b.onclick = () => verInforme(porId('informes', b.dataset.ver), false));
}
function tInformes(t, a) {
  t.innerHTML = `<div class="fila"><h2>Informes</h2><span class="sep"></span>${ed('<button id="gi">Generar informe</button>')}</div><p>El informe analiza el registro cronológico: fortalezas, dificultades persistentes, apoyos, avance en el nivel de apoyo y recomendaciones. Todo se puede corregir antes de guardar.</p><div id="li"></div>`;
  tablaInformes($('#li', t), DB.informes.filter(i => i.alumnoId === a.id));
  if ($('#gi', t)) $('#gi', t).onclick = () => nuevoInforme(a.id);
}
function vInformes(v) {
  const sin = activos().filter(a => !DB.informes.some(i => i.alumnoId === a.id));
  v.innerHTML = `<div class="fila"><h1>Informes</h1><span class="sep"></span>${ed('<button id="gi">Generar informe</button>')}</div>
  ${sin.length ? `<div class="caja alerta"><strong>Alumnos sin informe en el expediente (${sin.length}):</strong> ${sin.map(a => `<a href="#alumno/${a.id}/informes">${esc(a.nombre)}</a>`).join(' · ')}</div>` : ''}<div id="li"></div>`;
  tablaInformes($('#li'), DB.informes);
  if ($('#gi')) $('#gi').onclick = () => nuevoInforme();
}

/* ---------- Arranque ---------- */
(async function () {
  await abrirIDB();
  const previo = await leerEstado();
  if (previo && Array.isArray(previo.alumnos)) { DB = migrar(previo); if (previo.version !== DB.version) await idbOp('kv', 'readwrite', s => s.put(DB, 'estado')); }
  calcularHuellas();
  pantallaAcceso();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
