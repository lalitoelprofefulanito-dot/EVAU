/* EVAU · pantallas generales: acceso, carpeta de alumnos, grupos, registros, escuelas, estadística y ajustes */

/* ---------- Datos de ejemplo (todos ficticios e inventados) ---------- */
function cargarEjemplo() {
  const d = estadoVacio();
  d.escuelas = [
    { id: 'e1', nombre: 'Escuela Primaria «Ejemplo Uno»', cct: '00DPR0000Z', turno: 'Matutino', zona: '000', director: 'Dir. Primaria Ficticio', telefono: '55 0000 0000', domicilio: 'Calle Ficticia 1, Colonia Ejemplo' },
    { id: 'e2', nombre: 'Escuela Primaria «Ejemplo Dos»', cct: '00DPR0001Z', turno: 'Vespertino', zona: '000', director: 'Dir. Segunda Ficticio', telefono: '55 0000 0001', domicilio: 'Calle Ficticia 2, Colonia Ejemplo' }
  ];
  const gs = [['g1', 'e1', '1°', 'A'], ['g2', 'e1', '2°', 'A'], ['g3', 'e1', '4°', 'B'], ['g4', 'e1', '6°', 'A'], ['g5', 'e2', '3°', 'A'], ['g6', 'e2', '5°', 'A']];
  d.usuarios = [
    { id: 'u1', nombre: 'Mtra. Apoyo Ficticio', rol: 'apoyo', escuelas: ['e1', 'e2'] },
    { id: 'u2', nombre: 'Psic. Psicología Ficticio', rol: 'psicologia', escuelas: ['e1'] },
    { id: 'u5', nombre: 'Psic. Segundo Ficticio', rol: 'psicologia', escuelas: ['e2'] },
    { id: 'u3', nombre: 'Mtra. Comunicación Ficticio', rol: 'comunicacion', escuelas: [] },
    { id: 'u4', nombre: 'Dir. Dirección Ficticio', rol: 'direccion', escuelas: [] }
  ];
  d.grupos = gs.map(g => ({ id: g[0], escuelaId: g[1], grado: g[2], grupo: g[3], docente: 'Docente ' + g[2] + g[3] + ' Ficticio' }));
  const al = [
    ['a1', 'Lucía Ficticio Uno', 'M', '2017-03-14', 'g3', 'Discapacidad intelectual', true],
    ['a2', 'Emiliano Ficticio Dos', 'H', '2019-11-02', 'g2', 'Trastorno del espectro autista', true],
    ['a3', 'Diego Ficticio Tres', 'H', '2015-06-21', 'g4', 'TDAH', true],
    ['a4', 'Valeria Ficticio Cuatro', 'M', '2020-01-30', 'g1', 'En detección (sin condición identificada)', false],
    ['a5', 'Mateo Ficticio Cinco', 'H', '2018-09-09', 'g5', 'Hipoacusia', true],
    ['a6', 'Regina Ficticio Seis', 'M', '2016-04-18', 'g6', 'Aptitudes sobresalientes intelectuales', true],
    ['a7', 'Santiago Ficticio Siete', 'H', '2017-08-05', 'g5', 'Dificultad severa de aprendizaje', true]
  ];
  d.alumnos = al.map(a => {
    const g = d.grupos.find(x => x.id === a[4]);
    return {
      id: a[0], nombre: a[1], sexo: a[2], nacimiento: a[3], grupoId: a[4], escuelaId: g.escuelaId, condicion: a[5], curp: '', estatus: 'Activo',
      diagnostico: 'Dato ficticio de ejemplo.', medicacion: '', especialistas: '', obsSalud: '',
      tutor: 'Tutor de ' + a[1].split(' ')[0] + ' Ficticio', parentesco: 'Madre', telefono: '55 0000 0000', correo: '', domicilio: 'Domicilio ficticio',
      consentimiento: a[6] ? { estado: 'Activo', fecha: '2026-09-15', vigencia: '2027-07-09', obs: 'Carta firmada (ejemplo).' } : { estado: 'Pendiente', fecha: '', vigencia: '', obs: '' }
    };
  });
  let nr = 0; const R = (alumnoId, grupoId, fecha, hora, tipo, actividad, observacion, usuarioId, area, marcas, nivel, inc) => d.registros.push({ id: 'r' + (++nr), alumnoId, grupoId, fecha, hora, tipo, actividad, observacion, usuarioId, area: area || '', marcas: marcas || [], nivel: nivel || '', inc: inc || null });
  R('a1', '', '2026-09-22', '09:10', 'Apoyo individual', 'Reconocimiento de colores', 'Identifica rojo y azul con indicación verbal; confunde verde y amarillo.', 'u1', 'Académicas', ['Dificultad'], 'Indicación verbal');
  R('a1', '', '2026-09-29', '09:20', 'Apoyo individual', 'Lectura de sílabas directas', 'Lee ma, me, mi con modelado de la maestra. Se distrae al tercer intento.', 'u1', 'Académicas', ['Apoyo brindado'], 'Modelado');
  R('a1', '', '2026-10-06', '10:00', 'Apoyo individual', 'Lectura de sílabas con m y p', 'Lee sílabas directas con m y p con indicación verbal.', 'u1', 'Académicas', ['Logro'], 'Indicación verbal');
  R('a1', '', '2026-10-13', '09:30', 'Acompañamiento en aula', 'Trabajo en equipo de 4', 'Se queda en su lugar sin integrarse; acepta el material cuando una compañera se lo ofrece.', 'u1', 'Sociales', ['Dificultad'], 'Indicación verbal');
  R('a1', '', '2026-10-20', '09:30', 'Acompañamiento en aula', 'Clasificación de figuras geométricas', 'Identificó círculo y cuadrado sin ayuda. Presentó dificultad con triángulo.', 'u1', 'Académicas', ['Logro', 'Dificultad'], 'Independiente');
  R('a1', '', '2026-10-28', '12:00', 'Orientación a familia', 'Reunión con la tutora', 'Se acuerda lectura compartida 10 minutos diarios en casa con tarjetas de sílabas.', 'u1', '', [], '');
  R('a1', '', '2026-11-03', '09:30', 'Acompañamiento en aula', 'Juego por parejas', 'Comparte el material con su pareja sin que se le indique.', 'u1', 'Sociales', ['Logro'], 'Recordatorio visual');
  R('a1', '', '2026-11-10', '09:15', 'Apoyo individual', 'Lectura de palabras', 'Lee palabras de dos sílabas directas con apoyo de tarjetas. Todavía confunde b y d.', 'u1', 'Académicas', ['Logro', 'Dificultad'], 'Recordatorio visual');
  R('a1', '', '2026-11-12', '11:00', 'Acompañamiento en aula', 'Exposición frente al grupo', 'Participó durante 15 minutos frente al grupo con su tarjeta de apoyo.', 'u1', 'Comunicativo-lingüística', ['Logro', 'Apoyo brindado'], 'Recordatorio visual');
  R('a2', '', '2026-10-05', '08:40', 'Apoyo individual', 'Ejercicios de articulación', 'Mejora la producción del fonema /r/ en sílaba directa.', 'u3', 'Comunicativo-lingüística', ['Logro'], 'Modelado');
  R('a2', '', '2026-10-14', '10:20', 'Asesoría a docente', 'Uso de agenda visual', 'La docente incorpora pictogramas para anticipar cambios de actividad.', 'u1', 'Independencia y autocuidado', ['Apoyo brindado'], '');
  R('a2', '', '2026-11-09', '08:45', 'Apoyo individual', 'Articulación en palabras', 'Produce /r/ en 6 de 10 palabras trabajadas.', 'u3', 'Comunicativo-lingüística', ['Logro'], 'Indicación verbal');
  R('a3', '', '2026-10-01', '09:00', 'Seguimiento', 'Sesión de regulación emocional', 'Abandona la tarea al primer error; acepta la tarjeta de pausa con ayuda.', 'u2', 'Afectivas', ['Dificultad'], 'Ayuda total');
  R('a3', '', '2026-11-05', '09:05', 'Seguimiento', 'Uso de tarjeta de pausa', 'Pidió pausa en 4 de 5 ocasiones y retomó la tarea.', 'u2', 'Afectivas', ['Logro'], 'Recordatorio visual');
  R('a4', '', '2026-11-03', '10:10', 'Observación', 'Observación en aula (detección)', 'Durante la lectura en voz alta se detiene y no continúa. Se solicitará consentimiento a la familia.', 'u1', 'Académicas', ['Dificultad'], '');
  R('a5', '', '2026-10-19', '15:00', 'Asesoría a docente', 'Ubicación en el aula', 'Se acuerda sentarlo al frente y hablarle de cara.', 'u1', 'Comunicativo-lingüística', ['Apoyo brindado'], '');
  R('a6', '', '2026-10-22', '16:00', 'Apoyo individual', 'Proyecto de enriquecimiento', 'Propone investigar sobre volcanes y elabora su plan de trabajo.', 'u1', 'Cognoscitiva', ['Logro'], 'Independiente');
  R('a7', '', '2026-11-11', '15:30', 'Apoyo individual', 'Escritura de enunciados', 'Escribe enunciados de tres palabras copiando del pizarrón con indicación verbal.', 'u1', 'Académicas', ['Apoyo brindado'], 'Indicación verbal');
  R('', 'g2', '2026-09-30', '11:30', 'Incidencia', 'Conflicto en el recreo entre varios alumnos por el uso del balón.', 'Se medió con el grupo y se retomaron los acuerdos de convivencia.', 'u1', '', [], '', { clasif: ['Agresión verbal'], antec: ['Diálogo con el alumno'], acuerdos: 'Turnos para el balón acordados con el grupo; seguimiento durante dos semanas.' });
  R('', 'g3', '2026-10-15', '09:00', 'Observación', 'El grupo muestra dificultad para seguir instrucciones largas.', 'Se sugiere a la docente dar instrucciones en pasos cortos con apoyo visual.', 'u1');
  R('', 'g5', '2026-11-04', '15:20', 'Canalización', 'Dos alumnos sin diagnóstico con dificultades de atención.', 'Se informa a dirección para iniciar la detección inicial.', 'u2');
  d.registros.push({ id: 'r' + (++nr), alumnoId: '', grupoId: '', escuelaId: 'e1', fecha: '2026-11-06', hora: '10:00', tipo: 'Nota de carpeta general', actividad: 'Visita de seguimiento a la escuela', observacion: 'Se revisaron los expedientes de 4° B y 6° A. Queda pendiente el consentimiento de una alumna de 1° A.', usuarioId: 'u4', area: '', marcas: [], nivel: '', inc: null });
  /* Plan de intervención de ejemplo (redacción inventada) */
  const p = planVacio();
  p.datosGenerales = 'El presente Plan de Intervención se elabora para Lucía Ficticio Uno, alumna de cuarto grado, grupo «B», de la Escuela Primaria «Ejemplo Uno» (datos ficticios). Su diseño parte de sus características, fortalezas, intereses y necesidades de apoyo, y de las barreras que se presentan en los contextos en que participa.\nEn el contexto familiar vive con su madre y dos hermanos mayores, quienes la acompañan en sus tareas cuando su horario de trabajo lo permite. En el contexto escolar mantiene una relación de confianza con su maestra de grupo. El aula es amplia, pero las mesas están organizadas en filas y los materiales de apoyo se guardan fuera del alcance de los alumnos.\nEl Plan busca impulsar su aprendizaje, participación y autonomía mediante el trabajo coordinado entre la docente de grupo, la familia y el equipo de USAER, ofreciendo la ayuda necesaria y retirándola gradualmente conforme demuestre mayor autonomía.';
  p.areas['Cognoscitiva'] = { fortalezas: ['Sigue instrucciones de un paso cuando son claras y concretas.', 'Recuerda rutinas conocidas del aula.'], oportunidades: ['Ampliar el tiempo de permanencia en una actividad.', 'Seguir instrucciones de dos pasos con apoyo visual.'] };
  p.areas['Sociales'] = { fortalezas: ['Acepta la ayuda de sus compañeras.'], oportunidades: ['Participar en actividades por parejas y equipos pequeños.'] };
  p.areas['Académicas'] = { fortalezas: ['Identifica colores primarios.', 'Lee sílabas directas con m y p.'], oportunidades: ['Leer palabras de dos sílabas directas.', 'Distinguir las letras b y d.', 'Identificar figuras geométricas básicas.'] };
  p.areas['Comunicativo-lingüística'] = { fortalezas: ['Expresa sus necesidades con frases cortas.'], oportunidades: ['Participar frente al grupo con apoyo de tarjetas.'] };
  p.areas['Independencia y autocuidado'] = { fortalezas: ['Guarda sus materiales cuando se le indica.'], oportunidades: ['Organizar sus materiales sin recordatorios constantes.'] };
  p.bap['Metodológicas o didácticas'] = ['Actividades iguales para todo el grupo, sin apoyos visuales ni material concreto.', 'Instrucciones orales largas y varias a la vez.'];
  p.bap['Organizativas'] = ['Mesas acomodadas en filas que dificultan el trabajo en equipos pequeños.'];
  p.bap['Sociofamiliares'] = ['Poco tiempo disponible en casa para acompañar las tareas por el horario laboral de la familia.'];
  p.aula['Comunicativas'] = { adecuacion: 'Dar instrucciones breves, de una en una, acompañadas de una imagen o modelado.', responsables: 'Docente de grupo y USAER.' };
  p.aula['Para la participación'] = { adecuacion: 'Organizar actividades en parejas antes de pasar a equipos de cuatro.', responsables: 'Docente de grupo.' };
  p.apoyos['Material didáctico'] = { adecuacion: 'Tarjetas de sílabas y material concreto para clasificar figuras.', responsables: 'USAER elabora; docente de grupo utiliza.' };
  p.apoyos['Apoyos visuales'] = { adecuacion: 'Tarjeta de pasos para exponer frente al grupo.', responsables: 'USAER y docente de grupo.' };
  p.curriculo['Metodología'] = ['Implementar actividades breves y secuenciadas.', 'Utilizar material concreto y apoyos visuales.'];
  p.curriculo['Evaluación'] = ['Registrar en cada actividad el nivel de apoyo requerido para documentar su retiro gradual.', 'Permitir diversas formas de demostrar lo aprendido.'];
  p.curriculo['Procesos de desarrollo de aprendizaje'] = ['Se priorizarán los PDA de Lenguajes relacionados con la lectura de palabras y la escritura de su nombre.'];
  p.curriculares = [{ id: 'c1', fase: 'Fase 4', campo: 'Lenguajes', contenido: 'Lectura compartida (contenido de ejemplo).', pda: 'Lee palabras de dos sílabas con apoyo de imágenes (PDA de ejemplo).', ajustes: 'Tarjetas de sílabas; lectura en voz alta de una palabra a la vez.' }];
  p.necesidades = [CAT.necesidadesPadres[3]];
  p.compromisos = [{ id: 'm1', accion: 'Lectura compartida en casa 10 minutos diarios con las tarjetas de sílabas.', responsables: 'Madre de familia; maestra de apoyo da seguimiento.', fecha: 'Todo el ciclo escolar' }];
  d.planes = { a1: p };
  const cm = comVacio();   // comunicación: contenido de ejemplo, ficticio
  Object.assign(cm.plan, { periodo: 'Oct-nov-dic 2026 / ene 2027 (ejemplo)', sesiones: '8', fecha: '2026-11-20', diagnostico: 'Hipoacusia (dato ficticio de ejemplo)' });
  cm.plan.funciones[CAT.funcionesCom[0]] = ['Ordena tarjetas para formar oraciones de tres palabras (ejemplo).'];
  cm.plan.funciones[CAT.funcionesCom[1]] = ['Ejercicios de soplo con dirección y duración (ejemplo).', 'Discriminación de sonidos con apoyo visual (ejemplo).'];
  cm.plan.pda = ['Expresa ideas y experiencias por medio de mensajes breves (PDA de ejemplo).'];
  cm.plan.contenidos['Lenguajes'] = ['Producción de mensajes breves (contenido de ejemplo).'];
  cm.plan.metodologias = ['Acompañamiento en el aula', 'Trabajo individual: juego de mesa'];
  cm.plan.materiales = ['Tarjetas con imágenes', 'Hojas blancas'];
  Object.assign(cm.informe, { diagnostico: 'Texto de ejemplo del diagnóstico de comunicación.', etapa: 'Texto de ejemplo de la etapa del lenguaje.' });
  cm.informe.componentes['Componente pragmático'] = 'Texto de ejemplo del componente pragmático.';
  cm.informe.recPadres = ['Recomendación de ejemplo para la familia.']; cm.informe.recDocentes = ['Recomendación de ejemplo para el docente.'];
  cm.actualizado = '2026-11-20';
  d.comunicacion = { a5: cm };
  const ps = psiVacio();   // psicología: contenido de ejemplo, ficticio
  Object.assign(ps.plan, { modalidad: 'Individual', sesiones: '8', periodo: 'Octubre a junio (ejemplo)', fecha: '2026-10-20' });
  ps.plan.areas = [Object.assign(areaPsiVacia(), { area: 'Intelectual (ejemplo)', funciones: ['Atención sostenida (ejemplo)'], actividades: ['Juego de memoria con tarjetas (ejemplo).', 'Seguir instrucciones de dos pasos (ejemplo).'], indicadores: ['Mantiene la atención durante 10 minutos (ejemplo).'], campos: ['Lenguajes'], aprendizajes: ['Comprende instrucciones en clase (ejemplo).'], adecuaciones: ['Instrucciones cortas con apoyo visual (ejemplo).'] })];
  Object.assign(ps.informe, { conceptual: 'Texto de ejemplo del dominio conceptual.', practico: 'Texto de ejemplo del dominio práctico.', social: 'Texto de ejemplo del dominio social.', sugPadres: ['Sugerencia de ejemplo para la familia.'], sugMaestro: ['Sugerencia de ejemplo para el maestro de grupo.'] });
  ps.actualizado = '2026-10-20';
  d.psicologia = { a1: ps };
  const ap = apoyoVacio();   // evaluación psicopedagógica e informe final: contenido de ejemplo, ficticio
  Object.assign(ap.eval, { madre: 'Madre Ficticia', ocupMadre: 'Ejemplo', padre: 'Padre Ficticio', ocupPadre: 'Ejemplo', motivo: 'Texto de ejemplo del motivo de la evaluación.', tecnicas: 'Texto de ejemplo de los instrumentos.', cognitiva: 'Texto de ejemplo del área cognitiva y académica.', conclusion: 'Texto de ejemplo de la conclusión.' });
  ap.eval.necEscolar = ['Necesidad de ejemplo en la escuela.']; ap.eval.recomendaciones = ['Recomendación de ejemplo.'];
  Object.assign(ap.final, { fecha: '2026-11-20', intro: 'Texto de ejemplo de la presentación del alumno.', habilidades: 'Texto de ejemplo de habilidades.' });
  ap.final.campos['Lenguajes'] = 'Texto de ejemplo de Lenguajes.';
  ap.actualizado = '2026-11-20';
  d.apoyo = { a1: ap };
  d.documentos = [{ id: 'd1', alumnoId: 'a1', tipo: 'Informe final', ciclo: '2025-2026', nombre: 'informe_final_2025-2026.pdf (ejemplo sin archivo)', tipoArchivo: '', fecha: '2026-07-08', sinArchivo: true }];
  d.valoraciones = { a1: { 0: { i: 'R', m: 'P', f: '', ev: 'Registros de lectura de octubre y noviembre.' } } };
  DB = d; calcularHuellas();
}

/* ---------- Acceso y estructura ---------- */
function pantallaAcceso() {
  document.body.innerHTML = `  <div class="acceso"><h1>EVAU</h1><p><strong>Expediente Digital USAER/UDEEI</strong><br>La carpeta del alumno, en el celular.</p>
  <form><label for="quien">¿Quién registra?</label>
  <select id="quien">${DB.usuarios.map(u => `<option value="${u.id}">${esc(u.nombre)} — ${esc(CAT.roles[u.rol])}</option>`).join('')}</select>
  <label for="clave">Clave</label><input id="clave" type="password" inputmode="numeric" autocomplete="off">
  <p class="nota">Si no ha cambiado su clave, es 0000.</p>
  <button type="submit" style="width:100%">Entrar</button></form></div>`;
  $('form').onsubmit = async e => {
    e.preventDefault();
    const u = porId('usuarios', $('#quien').value);
    if (!(await claveCorrecta(u, $('#clave').value))) { aviso(u.clave ? 'Clave incorrecta. Si la olvidó, otra persona del equipo puede volverla a 0000 en Ajustes → Profesionales.' : 'Clave incorrecta. La clave es 0000.'); return; }
    USUARIO = u;
    guardar('Inicio de sesión'); montar();
  };
  $('#clave').focus();
}
const MENU = [['inicio', 'Alumnos'], ['grupos', 'Carpetas de grupo'], ['informes', 'Informes'], ['resumen', 'Resumen'], ['estadistica', 'Estadística'], ['escuelas', 'Escuelas'], ['ajustes', 'Ajustes']];
function montar() {
  document.body.innerHTML = `<header class="barra"><span class="marca">EVAU</span><span class="sub">Expediente Digital USAER/UDEEI<br><strong>${esc(USUARIO.nombre)}</strong> · ${esc(CAT.roles[USUARIO.rol])}</span><button id="ordenes" class="chico" aria-label="Pedir por voz">🗣 Pedir</button><button id="salir" class="chico">Salir</button></header>
    <nav class="menu" aria-label="Secciones">${MENU.map(m => `<a href="#${m[0]}" data-m="${m[0]}">${m[1]}</a>`).join('')}</nav>
  <main id="vista"></main>${ed('<button class="fab" id="fab" aria-label="Dictar un nuevo registro">🎙 Nuevo registro</button>')}`;
  $('#salir').onclick = () => { USUARIO = null; pantallaAcceso(); };
  $('#ordenes').onclick = () => abrirOrdenes(true);
  if ($('#fab')) $('#fab').onclick = () => {
    const [r, id] = location.hash.slice(1).split('/');
    nuevoRegistro(r === 'alumno' ? { alumnoId: id } : r === 'grupo' ? { grupoId: id } : r === 'escuela' ? { escuelaId: id } : {}, true);
  };
  pintar();
}
window.addEventListener('hashchange', () => { if (USUARIO) pintar(); });
function pintar() {
  const [ruta, id, tab] = (location.hash.slice(1) || 'inicio').split('/');
  const v = $('#vista'); if (!v) return;
  const grupoMenu = { alumno: 'inicio', alumnos: 'inicio', grupo: 'grupos', escuela: 'escuelas' }[ruta] || ruta;
  document.querySelectorAll('nav.menu a').forEach(a => a.classList.toggle('activo', a.dataset.m === grupoMenu));
  const P = { inicio: vInicio, alumnos: vInicio, alumno: vAlumno, grupos: vGrupos, grupo: vGrupo, escuelas: vEscuelas, escuela: vEscuela, informes: vInformes, resumen: vResumen, estadistica: vEstadistica, ajustes: vAjustes };
  (P[ruta] || vInicio)(v, id, tab);
  window.scrollTo(0, 0);
}
const activos = () => DB.alumnos.filter(a => a.estatus === 'Activo');
const vigentes = () => DB.registros.filter(r => !r.anulado);
function barras(pares) {
  const max = Math.max(1, ...pares.map(p => p[1]));
  return pares.map(p => `<div class="barra-h"><span>${esc(p[0])}</span><span class="b"><i style="width:${Math.round(p[1] / max * 100)}%"></i></span><span class="v">${p[1]}</span></div>`).join('') || '<p>Sin datos todavía.</p>';
}
function contar(lista, fn) { const m = new Map(); lista.forEach(x => { const k = fn(x); m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()]; }
const ultimoRegistro = id => vigentes().filter(r => r.alumnoId === id).map(r => r.fecha).sort().pop();

/* ---------- Inicio = la carpeta: buscador y lista de alumnos ---------- */
function vInicio(v) {
  if (!DB.escuelas.length) {
    v.innerHTML = `<h1>Bienvenida, bienvenido</h1><div class="caja"><p>Todavía no hay información. Puede cargar <strong>datos de ejemplo ficticios</strong> para conocer la aplicación, o empezar registrando una escuela.</p>
    <div class="fila">${ed('<button id="demo">Cargar datos de ejemplo</button>')}<a class="boton" href="#escuelas" style="text-decoration:none">Registrar una escuela</a></div></div>`;
    if ($('#demo')) $('#demo').onclick = async () => { const u = USUARIO.id; cargarEjemplo(); USUARIO = porId('usuarios', u); await guardar('Carga de datos de ejemplo'); montar(); aviso('Datos de ejemplo cargados.'); };
    return;
  }
  v.innerHTML = `${avisoRespaldo()}<label for="q" class="buscar-tit">🔎 Buscar alumno</label>
  <div class="buscar-fila"><input id="q" type="search" class="buscar" placeholder="Escriba o diga el nombre" autocomplete="off"><button id="qvoz" class="sec" type="button" aria-label="Buscar diciendo el nombre">🎙 Decir el nombre</button></div><p id="qest" class="voz-estado" role="status"></p>
  <div class="fila"><select id="fe" aria-label="Escuela" style="flex:1;min-width:11rem"><option value="">Todas las escuelas</option>${DB.escuelas.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')}</select>
  <select id="fs" aria-label="Estatus" style="flex:1;min-width:9rem"><option value="Activo">En atención</option><option value="">Todos</option><option value="Baja">Baja</option><option value="Egresado">Egresados</option></select>
  ${ed('<button id="nuevo" class="sec">＋ Nuevo alumno</button>')}</div><div id="lista" class="carpetas"></div>`;
  activarAvisoRespaldo(v);
  let soloIds = null;   // cuando la búsqueda por voz duda, se muestran solo los candidatos
  const enFiltro = a => (!$('#fe').value || a.escuelaId === $('#fe').value) && (!$('#fs').value || a.estatus === $('#fs').value);
  const lista = () => {
    const q = $('#q').value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const xs = DB.alumnos.filter(a => (soloIds ? soloIds.includes(a.id) : a.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)) && enFiltro(a)).sort((a, b) => a.nombre.localeCompare(b.nombre));
    $('#lista').innerHTML = xs.map(a => {
      const u = ultimoRegistro(a.id), c = (a.consentimiento || {}).estado === 'Activo';
      return `<a class="carpeta" href="#alumno/${a.id}"><span class="ic" aria-hidden="true">📂</span><span class="tx"><strong>${esc(a.nombre)}</strong><br>${esc(nomGrupo(porId('grupos', a.grupoId)))} · ${esc(condicionVisible(a))}<br><span class="nota">${u ? 'Último registro: ' + esc(flarga(u)) : 'Sin registros'}${c ? '' : ' · <span class="etq r">Sin consentimiento</span>'}</span></span></a>`;
    }).join('') || '<p>No hay alumnos con esos datos.</p>';
  };
  ['q', 'fe', 'fs'].forEach(i => $('#' + i).oninput = () => { soloIds = null; lista(); }); lista();
  const qest = (t, err) => { $('#qest').textContent = t; $('#qest').classList.toggle('error', !!err); };
  /* Patrón 3: se dice el nombre (aunque sea mal o incompleto) y EVAU busca el alumno que corresponde */
  const resolver = dicho => {
    const r = buscarPorVoz(dicho, DB.alumnos.filter(enFiltro).map(a => ({ texto: a.nombre, id: a.id })));
    if (r.estado === 'ok') { soloIds = null; $('#q').value = r.elegido.texto; qest('Encontrado: ' + r.elegido.texto + '. Toque su carpeta para abrirla.'); }
    else if (r.estado === 'duda') { soloIds = r.candidatos.map(c => c.id); $('#q').value = ''; qest('Se escuchó «' + dicho + '». Hay más de un nombre parecido: elija el correcto.'); }
    else { soloIds = null; $('#q').value = ''; qest('Se escuchó «' + dicho + '», pero no está en la lista. Intente de nuevo o escriba el nombre.', true); }
    lista();
  };
  botonMicrofono($('#qvoz'), { caja: $('#q'), alEstado: (t, err) => qest(t, err), escribir: frases => { const dicho = frases.join(' ').trim(); if (dicho) { detenerVoz(); resolver(dicho); } } });
  if ($('#nuevo')) $('#nuevo').onclick = () => {
    if (!DB.grupos.length) { aviso('Primero registre una escuela y un grupo.'); return; }
    formulario('Nuevo alumno', camposAlumno(), { estatus: 'Activo', condicion: CAT.condiciones[0] }, o => { const a = { id: uid(), ...o, escuelaId: porId('grupos', o.grupoId).escuelaId, consentimiento: { estado: 'Pendiente', fecha: '', vigencia: '', obs: '' } }; DB.alumnos.push(a); guardar('Alta de alumno'); location.hash = '#alumno/' + a.id; });
  };
}

/* ---------- Resumen (tablero) ---------- */
function vResumen(v) {
  const mes = hoy().slice(0, 7), c = ciclo(), regs = vigentes();
  const sinPlan = activos().filter(a => determinado(a) && !planTieneContenido(DB.planes[a.id])).length;
  const sinCons = activos().filter(a => (a.consentimiento || {}).estado !== 'Activo').length;
  const porMes = contar(regs.filter(r => r.fecha >= c.ini && r.fecha <= c.fin), r => r.fecha.slice(0, 7)).sort().map(p => [MESES[Number(p[0].slice(5)) - 1] + ' ' + p[0].slice(0, 4), p[1]]);
  v.innerHTML = `<h1>Resumen</h1>
  <div class="tarjetas">
    <a class="tarjeta" href="#inicio"><div class="num">${activos().length}</div><div class="tit">Alumnos en atención</div></a>
    <a class="tarjeta" href="#escuelas"><div class="num">${DB.escuelas.length}</div><div class="tit">Escuelas atendidas</div></a>
    <div class="tarjeta"><div class="num">${regs.filter(r => r.fecha.startsWith(mes)).length}</div><div class="tit">Registros este mes</div></div>
    <div class="tarjeta"><div class="num">${sinPlan}</div><div class="tit">Con diagnóstico y sin plan de intervención</div></div>
    <div class="tarjeta"><div class="num">${sinCons}</div><div class="tit">Sin consentimiento activo</div></div>
  </div>
  <div class="caja"><h2>Casos por condición</h2>${barras(contar(activos(), a => a.condicion).sort((a, b) => b[1] - a[1]))}</div>
  <div class="caja"><h2>Intervenciones por profesional</h2>${barras(contar(regs, r => rolUsuario(r.usuarioId)).sort((a, b) => b[1] - a[1]))}</div>
  <div class="caja"><h2>Registros por mes (ciclo ${esc(DB.config.ciclo)})</h2>${barras(porMes)}</div>`;
}

/* ---------- Escuelas ---------- */
const CAMPOS_ESCUELA = [{ k: 'nombre', label: 'Nombre de la escuela', req: 1 }, { k: 'cct', label: 'CCT' }, { k: 'turno', label: 'Turno', tipo: 'select', opciones: CAT.turnos }, { k: 'zona', label: 'Zona escolar' }, { k: 'director', label: 'Director(a)' }, { k: 'telefono', label: 'Teléfono' }, { k: 'domicilio', label: 'Domicilio' }];
function vEscuelas(v) {
  v.innerHTML = `<div class="fila"><h1>Escuelas</h1><span class="sep"></span>${ed('<button id="nueva">＋ Nueva escuela</button>')}</div>` +
    (DB.escuelas.map(e => `<div class="caja"><h2>${esc(e.nombre)}</h2><p>CCT: <strong>${esc(e.cct)}</strong> · Turno: ${esc(e.turno)} · Zona: ${esc(e.zona)}<br>Director(a): ${esc(e.director)} · Tel.: ${esc(e.telefono)}<br>${esc(e.domicilio)}</p><p><strong>Equipo USAER en esta escuela:</strong> ${equipoDe(e.id).map(u => esc(u.nombre) + ' (' + esc(CAT.roles[u.rol]) + ')').join(' · ') || 'Sin asignar'}</p>
    <p><strong>${DB.grupos.filter(g => g.escuelaId === e.id).length}</strong> grupos · <strong>${activos().filter(a => a.escuelaId === e.id).length}</strong> alumnos en atención</p>
    <div class="fila"><a href="#escuela/${e.id}">📁 Carpeta general (${vigentes().filter(r => r.escuelaId === e.id).length})</a><a href="#grupos">Ver carpetas de grupo</a>${ed(`<button class="sec chico" data-ed="${e.id}">Editar</button>`)}</div></div>`).join('') || '<p>No hay escuelas registradas.</p>');
  if ($('#nueva')) $('#nueva').onclick = () => formulario('Nueva escuela', CAMPOS_ESCUELA, {}, o => { DB.escuelas.push({ id: uid(), ...o }); guardar('Alta de escuela'); pintar(); });
  v.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { const e = porId('escuelas', b.dataset.ed); formulario('Editar escuela', CAMPOS_ESCUELA, e, o => { Object.assign(e, o); guardar('Edición de escuela'); pintar(); }); });
}

/* ---------- Carpeta general de la escuela: notas de las visitas; Dirección también escribe aquí ---------- */
function vEscuela(v, id) {
  const e = porId('escuelas', id); if (!e) return vEscuelas(v);
  const regs = DB.registros.filter(r => r.escuelaId === id).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  v.innerHTML = `<p><a href="#escuelas">← Escuelas</a></p><div class="fila"><h1>📁 Carpeta general</h1><span class="sep"></span><button id="nota">＋ Nota en la carpeta general</button></div><p><strong>${esc(e.nombre)}</strong>. Aquí se guardan las notas de cada visita a la escuela. Todo el equipo, incluida la Dirección, puede escribir.</p><div id="lista"></div>`;
  pintarRegistros($('#lista'), regs);
  $('#nota').onclick = () => nuevoRegistro({ escuelaId: id }, false);
}

/* ---------- Carpetas de grupo ---------- */
function vGrupos(v) {
  if (!DB.escuelas.length) { v.innerHTML = '<h1>Carpetas de grupo</h1><p>Primero registre una escuela.</p>'; return; }
  v.innerHTML = `<div class="fila"><h1>Carpetas de grupo</h1><span class="sep"></span>${ed('<button id="nuevo">＋ Nuevo grupo</button>')}</div>
  <p>Aquí se guarda lo que ocurre en un grupo aunque todavía no haya alumnos identificados: observaciones, incidencias y canalizaciones.</p>` +
    DB.escuelas.map(e => `<h2>${esc(e.nombre)}</h2><div class="tarjetas">${DB.grupos.filter(g => g.escuelaId === e.id).sort((a, b) => nomGrupo(a).localeCompare(nomGrupo(b))).map(g => `<a class="tarjeta" href="#grupo/${g.id}"><div class="num">📁 ${esc(nomGrupo(g))}</div><div>${esc(g.docente || '')}</div><div class="tit">${vigentes().filter(r => r.grupoId === g.id).length} registros · ${activos().filter(a => a.grupoId === g.id).length} alumnos</div></a>`).join('') || '<p>Sin grupos.</p>'}</div>`).join('');
  if ($('#nuevo')) $('#nuevo').onclick = () => formulario('Nuevo grupo', [{ k: 'escuelaId', label: 'Escuela', tipo: 'select', req: 1, opciones: DB.escuelas.map(e => [e.id, e.nombre]) }, { k: 'grado', label: 'Grado', tipo: 'select', req: 1, opciones: CAT.grados }, { k: 'grupo', label: 'Grupo (letra)', req: 1, def: 'A' }, { k: 'docente', label: 'Docente de grupo' }], {}, o => { DB.grupos.push({ id: uid(), ...o }); guardar('Alta de grupo'); pintar(); });
}
function vGrupo(v, id) {
  const g = porId('grupos', id); if (!g) return vGrupos(v);
  const e = porId('escuelas', g.escuelaId) || {};
  const regs = DB.registros.filter(r => r.grupoId === id).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  v.innerHTML = `<p><a href="#grupos">← Carpetas de grupo</a></p><h1>📁 Grupo ${esc(nomGrupo(g))}</h1><p>${esc(e.nombre || '')} · Docente: ${esc(g.docente || '—')}</p>
  <h2>Alumnos del grupo en atención</h2>${activos().filter(a => a.grupoId === id).map(a => `<p><a href="#alumno/${a.id}">${esc(a.nombre)}</a> — ${esc(condicionVisible(a))}</p>`).join('') || '<p>Ninguno por ahora.</p>'}
  <h2>Registro del grupo</h2><div id="lista"></div>`;
  pintarRegistros($('#lista'), regs);
}

/* ---------- Registros (historial cronológico) ---------- */
function pintarRegistros(cont, regs) {
  cont.innerHTML = regs.map(r => {
    const evs = DB.evidencias.filter(x => x.registroId === r.id), g = !!r.grupoId, inc = r.tipo === 'Incidencia', esc_ = !!r.escuelaId;
    return `<div class="registro ${r.anulado ? 'anulado' : ''} ${inc ? 'incidencia' : ''}"><div class="cab"><span>${esc(flarga(r.fecha))} · ${esc(r.hora)}</span><span class="etq">${esc(r.tipo)}</span>${r.area ? `<span class="etq g">${esc(r.area)}</span>` : ''}${(r.marcas || []).map(m => `<span class="etq ${colorMarca(m)}">${esc(m)}</span>`).join('')}${r.anulado ? '<span class="etq r">ANULADO</span>' : ''}</div>
    <p><strong>${esc_ ? 'Asunto' : g || inc ? 'Situación' : 'Actividad'}:</strong> ${esc(r.actividad)}</p>
    <p><strong>${esc_ ? 'Notas' : g || inc ? 'Intervención' : 'Observación'}:</strong> ${esc(r.observacion)}</p>
    ${r.nivel ? `<p><strong>Nivel de apoyo:</strong> ${esc(r.nivel)}</p>` : ''}
    ${r.inc ? `<p><strong>Clasificación:</strong> ${esc((r.inc.clasif || []).join(', ') || '—')}${(r.inc.antec || []).length ? ' · <strong>Antecedentes:</strong> ' + esc(r.inc.antec.join(', ')) : ''}${r.inc.acuerdos ? '<br><strong>Acuerdos:</strong> ' + esc(r.inc.acuerdos) : ''}</p>` : ''}
    ${r.anulado ? `<p><strong>Motivo de anulación:</strong> ${esc(r.motivo)}</p>` : ''}
    <div class="firma">Registró: ${esc(nomUsuario(r.usuarioId))} (${esc(rolUsuario(r.usuarioId))})</div>
    <div class="miniaturas" data-evs="${evs.map(x => x.id).join(',')}"></div>
    <div class="fila">${inc && !r.anulado ? `<button class="sec chico" data-bit="${r.id}">🖨 Bitácora de incidencia</button>` : ''}${!r.anulado && (puedeEditar() || esc_) && r.usuarioId === USUARIO.id ? `<button class="sec chico" data-anular="${r.id}">Anular registro</button>` : ''}</div></div>`;
  }).join('') || '<p>Todavía no hay registros. Use el botón verde «🎙 Nuevo registro».</p>';
  cont.querySelectorAll('[data-evs]').forEach(pintarMiniaturas);
  cont.querySelectorAll('[data-bit]').forEach(b => b.onclick = () => verBitacora(porId('registros', b.dataset.bit)));
  cont.querySelectorAll('[data-anular]').forEach(b => b.onclick = () => formulario('Anular registro', [{ k: 'motivo', label: 'Motivo de la anulación', tipo: 'textarea', req: 1, ayuda: 'El registro no se borra: queda tachado, con el motivo, para conservar el historial.' }], {}, o => { const r = porId('registros', b.dataset.anular); r.anulado = true; r.motivo = o.motivo; guardar('Anulación de registro'); pintar(); }));
}
async function pintarMiniaturas(div) {
  for (const id of div.dataset.evs.split(',').filter(Boolean)) {
    const m = porId('evidencias', id) || porId('documentos', id), blob = await leerArchivo(id); if (!m) continue;
    if (!blob) { div.insertAdjacentHTML('beforeend', `<span class="arch">📎 ${esc(m.nombre)} (archivo no disponible en este dispositivo)</span>`); continue; }
    const url = URL.createObjectURL(blob), tipo = m.tipo && m.tipo.includes('/') ? m.tipo : (m.tipoArchivo || '');
    div.insertAdjacentHTML('beforeend', tipo.startsWith('image/') ? `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="Evidencia: ${esc(m.nombre)}"></a>` : `<a class="arch" href="${url}" target="_blank" rel="noopener" download="${esc(m.nombre)}">${tipo.startsWith('audio/') ? '🎙' : tipo.startsWith('video/') ? '🎥' : '📄'} ${esc(m.nombre)}</a>`);
  }
}
function nuevoRegistro(pre, dictarYa) {
  if (!DB.escuelas.length) { aviso('Primero registre una escuela.'); return; }
  const dir = !puedeEditar();
  const opsA = dir ? '' : activos().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(a => `<option value="a:${a.id}" ${pre.alumnoId === a.id ? 'selected' : ''}>${esc(a.nombre)} (${esc(nomGrupo(porId('grupos', a.grupoId)))})</option>`).join('');
  const opsE = DB.escuelas.map(e => `<option value="e:${e.id}" ${pre.escuelaId === e.id ? 'selected' : ''}>Carpeta general — ${esc(e.nombre)}</option>`).join('');
  const opsG = dir ? '' : DB.grupos.map(g => `<option value="g:${g.id}" ${pre.grupoId === g.id ? 'selected' : ''}>Grupo ${esc(nomGrupo(g))} — ${esc((porId('escuelas', g.escuelaId) || {}).nombre || '')}</option>`).join('');
  const chips = (nombre, ops) => `<div class="chips">${ops.map(o => `<label><input type="checkbox" name="${nombre}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>`;
  const v = abrirModal(`<h2>Nuevo registro</h2><p><strong>${esc(flarga(hoy()))} · ${ahora()}</strong> · ${esc(USUARIO.nombre)}</p>
  <form><label for="r_dest">¿De quién es el registro?</label><select id="r_dest">${opsA ? `<optgroup label="Alumnos">${opsA}</optgroup>` : ''}${opsG ? `<optgroup label="Carpetas de grupo">${opsG}</optgroup>` : ''}<optgroup label="Carpeta general de la escuela">${opsE}</optgroup></select>
  <div class="caja voz-caja"><div class="fila"><button type="button" id="r_voz">🎙 Dictar</button><button type="button" class="sec chico" id="r_cambiar" disabled>Pasar a observación ➜</button></div>
  ${guiaRegistro()}<p id="r_est" class="voz-estado" role="status"></p></div>
  <label for="r_act" id="l_act">Actividad</label><input id="r_act" placeholder="Ej.: Clasificación de figuras geométricas">
  <label for="r_obs" id="l_obs">Observación</label><textarea id="r_obs" placeholder="Lo que ocurrió, lo que logró, lo que le costó"></textarea>
  <div id="r_alu"><label>Marcar este registro como (opcional)</label>${chips('marca', CAT.marcas)}
  <div class="dos"><div><label for="r_area">Área del plan</label><select id="r_area"><option value="">—</option>${CAT.areas.map(a => `<option>${esc(a)}</option>`).join('')}</select></div>
  <div><label for="r_nivel">Nivel de apoyo que necesitó</label><select id="r_nivel"><option value="">—</option>${CAT.nivelesApoyo.map(a => `<option>${esc(a)}</option>`).join('')}</select></div></div></div>
  <div id="r_tip"><label for="r_tipo">Tipo de registro</label><select id="r_tipo">${CAT.tiposRegistro.map(t => `<option>${esc(t)}</option>`).join('')}</select></div>
  <div id="r_inc" style="display:none"><label>Clasificación de la incidencia</label>${chips('clasif', CAT.incClasif)}<label>Antecedentes</label>${chips('antec', CAT.incAntec)}<label for="r_acu">Acuerdos y próximos pasos</label><textarea id="r_acu" style="min-height:4rem"></textarea></div>
  <div class="dos"><div><label for="r_fecha">Fecha</label><input id="r_fecha" type="date" value="${hoy()}"></div>
  <div><label for="r_arch">Evidencias (fotos, audio, video, PDF)</label><input id="r_arch" type="file" multiple accept="image/*,audio/*,video/*,application/pdf"></div></div>
  <div class="fila" style="margin-top:1rem"><button type="submit">Guardar registro</button><button type="button" class="sec" data-no>Cancelar</button></div></form>`);
  const dest = $('#r_dest', v), tipo = $('#r_tipo', v);
  const ajustar = () => {
    const g = dest.value.startsWith('g:'), e = dest.value.startsWith('e:'), inc = !e && tipo.value === 'Incidencia';
    $('#l_act', v).textContent = e ? 'Asunto' : g || inc ? 'Situación observada' : 'Actividad'; $('#l_obs', v).textContent = e ? 'Notas, acuerdos e indicaciones' : g || inc ? 'Intervención realizada y resultado' : 'Observación';
    $('#r_alu', v).style.display = g || e ? 'none' : ''; $('#r_inc', v).style.display = inc ? '' : 'none'; $('#r_tip', v).style.display = e ? 'none' : '';
  };
  dest.onchange = ajustar; tipo.onchange = ajustar;
  if (pre.grupoId) tipo.value = 'Observación';
  ajustar();
  const iniciar = () => dictarRegistro($('#r_act', v), $('#r_obs', v), $('#r_voz', v), $('#r_est', v), $('#r_cambiar', v));
  $('#r_voz', v).onclick = iniciar;
  $('[data-no]', v).onclick = () => v.cerrar();
  $('form', v).onsubmit = async e => {
    e.preventDefault(); detenerVoz();
    const act = $('#r_act', v).value.trim(), obs = $('#r_obs', v).value.trim();
    if (!act && !obs) { aviso('Dicte o escriba la actividad o la observación.'); return; }
    const [k, id] = dest.value.split(':'), sel = n => [...v.querySelectorAll(`input[name=${n}]:checked`)].map(i => i.value);
    const r = { id: uid(), alumnoId: k === 'a' ? id : '', grupoId: k === 'g' ? id : '', escuelaId: k === 'e' ? id : '', fecha: $('#r_fecha', v).value || hoy(), hora: ahora(), tipo: k === 'e' ? 'Nota de carpeta general' : tipo.value, actividad: act, observacion: obs, usuarioId: USUARIO.id,
      area: k === 'a' ? $('#r_area', v).value : '', marcas: k === 'a' ? sel('marca') : [], nivel: k === 'a' ? $('#r_nivel', v).value : '',
      inc: k !== 'e' && tipo.value === 'Incidencia' ? { clasif: sel('clasif'), antec: sel('antec'), acuerdos: $('#r_acu', v).value.trim() } : null };
    for (const f of $('#r_arch', v).files) {
      if (f.size > 25 * 1024 * 1024) { aviso('«' + f.name + '» pesa más de 25 MB y no se guardó.'); continue; }
      const eid = uid(); await guardarArchivo(eid, f);
      DB.evidencias.push({ id: eid, registroId: r.id, nombre: f.name, tipo: f.type || 'application/octet-stream', peso: f.size, fecha: r.fecha });
    }
    DB.registros.push(r); await guardar('Nuevo registro'); v.cerrar(); aviso('Registro guardado.');
    const nuevoHash = k === 'a' ? '#alumno/' + id + '/historial' : k === 'g' ? '#grupo/' + id : '#escuela/' + id;
    if (location.hash === nuevoHash) pintar(); else location.hash = nuevoHash;
  };
  if (dictarYa) iniciar(); else $('#r_act', v).focus();
}

/* ---------- Visor de documentos (informes, plan, bitácora) ---------- */
const ESTILO_WORD = 'body{font-family:Arial;font-size:12pt;text-align:justify}h1{font-size:15pt;text-align:center}h2{font-size:12.5pt;border-bottom:1.5pt solid #000}table{border-collapse:collapse;width:100%}th,td{border:1pt solid #000;padding:4pt;font-size:11pt;text-align:left;vertical-align:top}th{background:#1f2937;color:#fff}.firmas td,.marco>thead>tr>td,.marco>tbody>tr>td{border:none}.portada{text-align:center}';
function visorDoc(titulo, html, archivo, alGuardar, clase) {
  const v = abrirModal(`<div class="no-imprime"><h2>${esc(titulo)}</h2><p>Revise el texto. Los recuadros punteados se pueden escribir. <strong>Es un borrador: quien lo firma es responsable de revisarlo.</strong></p>
  <div class="fila">${alGuardar && puedeEditar() ? '<button id="g">Guardar en el expediente</button>' : ''}<button class="sec" id="imp">Imprimir o guardar como PDF</button><button class="sec" id="doc">Descargar en Word</button><button class="sec" id="cer">Cerrar</button></div><hr></div><div class="hoja ${clase || ''}" id="hoja">${html}</div>`, true);
  const leer = () => $('#hoja', v).innerHTML;
  if ($('#g', v)) $('#g', v).onclick = () => { alGuardar(leer()); v.cerrar(); };
  $('#imp', v).onclick = () => window.print();
  $('#doc', v).onclick = () => descargar(archivoSeguro(archivo) + '.doc', `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>${ESTILO_WORD}</style></head><body>${leer().replace(/ contenteditable="true"/g, '')}</body></html>`, 'application/msword');
  $('#cer', v).onclick = () => v.cerrar();
  return v;
}
const firmas = lista => `<table class="firmas"><tr>${lista.map(f => `<td><div class="linea"></div>${f}</td>`).join('')}</tr></table>`;
const casilla = ok => ok ? '<strong>X</strong>' : '&nbsp;';
function verBitacora(r) {
  const a = r.alumnoId && porId('alumnos', r.alumnoId), g = porId('grupos', r.grupoId || (a && a.grupoId)), e = porId('escuelas', (g || {}).escuelaId) || {}, inc = r.inc || { clasif: [], antec: [], acuerdos: '' };
  const filas2 = (lista, sel) => { let s = ''; for (let i = 0; i < lista.length; i += 2) s += `<tr>${[lista[i], lista[i + 1]].map(x => x ? `<td style="width:2.5em;text-align:center">${casilla(sel.includes(x))}</td><td>${sel.includes(x) ? '<strong>' + esc(x) + '</strong>' : esc(x)}</td>` : '<td></td><td></td>').join('')}</tr>`; return s; };
  const html = `<h1>BITÁCORA DE INCIDENCIA Y SEGUIMIENTO</h1><p style="text-align:center"><strong>${esc((inc.clasif || []).join(' · ') || 'Incidencia')} — ${esc(flarga(r.fecha))}</strong></p>
  <table><tr><th>Fecha de elaboración</th><td>${esc(flarga(hoy()))}</td><th>Grado y grupo</th><td>${esc(nomGrupo(g))}</td></tr><tr><th>Registró</th><td>${esc(nomUsuario(r.usuarioId))} (${esc(rolUsuario(r.usuarioId))})</td><th>Escuela</th><td>${esc(e.nombre || '')}</td></tr></table>
  <h2>1. Datos generales</h2><table><tr><th>${a ? 'Nombre del alumno' : 'Grupo'}</th><td>${esc(a ? a.nombre : 'Grupo ' + nomGrupo(g))}</td><th>Fecha de los hechos</th><td>${esc(flarga(r.fecha))} · ${esc(r.hora)}</td></tr></table>
  <h2>2. Clasificación de la situación presentada</h2><table>${filas2(CAT.incClasif, inc.clasif || [])}</table>
  <p><strong>Antecedentes:</strong></p><table>${filas2(CAT.incAntec, inc.antec || [])}</table>
  <h2>3. Descripción de la incidencia</h2><p>${esc(r.actividad)}</p>
  <h2>4. Acciones realizadas e intervención</h2><p>${esc(r.observacion)}</p>
  <h2>5. Acuerdos y próximos pasos</h2><div contenteditable="true">${esc(inc.acuerdos || 'Escriba aquí los acuerdos.')}</div>
  <h2>Firmas de enterado y conformidad</h2>${firmas([esc(nomUsuario(r.usuarioId)) + '<br>' + esc(rolUsuario(r.usuarioId)), esc(e.director || 'Director(a) del plantel') + '<br>Director(a) del plantel'])}
  ${a ? firmas(['Madre, padre o tutor de ' + esc(a.nombre.split(' ')[0]) + '<br>Firmo de enterado de la situación registrada.']) : ''}`;
  visorDoc('Bitácora de incidencia', html, 'Bitacora_' + r.fecha);
}

/* ---------- Alumnos: campos ---------- */
function camposAlumno(alumnoId) {
  return [{ k: 'nombre', label: 'Nombre completo', req: 1 }, { k: 'curp', label: 'CURP', normalizar: normCurp, validar: x => validarCurp(x, alumnoId), ayuda: 'Cópiela con cuidado del acta o la boleta: con la CURP, EVAU une al mismo alumno cuando se combinan respaldos de varios aparatos. EVAU revisa que tenga el formato correcto y que no esté repetida.' }, { k: 'nacimiento', label: 'Fecha de nacimiento', tipo: 'date' }, { k: 'sexo', label: 'Sexo', tipo: 'select', req: 1, opciones: [['H', 'Hombre'], ['M', 'Mujer']] },
  { k: 'grupoId', label: 'Escuela y grupo', tipo: 'select', req: 1, opciones: DB.grupos.map(g => [g.id, nomGrupo(g) + ' — ' + ((porId('escuelas', g.escuelaId) || {}).nombre || '')]) },
  { k: 'condicion', label: 'Condición o categoría de la estadística', tipo: 'select', req: 1, opciones: CAT.condiciones, ayuda: 'Sin diagnóstico («En detección» y las tres «Dificultad severa…»): no lleva plan de intervención ni evaluación psicopedagógica, solo informe final del ciclo.' }, { k: 'estatus', label: 'Estatus', tipo: 'select', req: 1, opciones: ['Activo', 'Baja', 'Egresado'] },
  { k: 'tutor', label: 'Madre, padre o tutor' }, { k: 'parentesco', label: 'Parentesco' }, { k: 'telefono', label: 'Teléfono' }, { k: 'correo', label: 'Correo' }, { k: 'domicilio', label: 'Domicilio' },
  { k: 'diagnostico', label: 'Diagnóstico (como lo indica el documento médico)', tipo: 'textarea' }, { k: 'medicacion', label: 'Medicación' }, { k: 'especialistas', label: 'Especialistas o instituciones externas' }, { k: 'obsSalud', label: 'Observaciones relevantes de salud', tipo: 'textarea' }];
}

/* ---------- Estadística (estructura del cuestionario 911 USAER-1) ---------- */
function tablaEstadistica(escuelaId) {
  const xs = activos().filter(a => !escuelaId || a.escuelaId === escuelaId);
  const filas = CAT.condiciones.map(c => {
    const fila = [c]; let tot = 0;
    for (const g of CAT.grados) for (const s of ['H', 'M']) { const n = xs.filter(a => a.condicion === c && a.sexo === s && (porId('grupos', a.grupoId) || {}).grado === g).length; fila.push(n); tot += n; }
    fila.push(tot); return fila;
  });
  const total = ['Total']; for (let i = 1; i <= 13; i++) total.push(filas.reduce((s, f) => s + f[i], 0));
  return { enc: ['Condición', ...CAT.grados.flatMap(g => [g + ' H', g + ' M']), 'Total'], filas: [...filas, total] };
}
function vEstadistica(v) {
  v.innerHTML = `<h1>Estadística</h1><p>Conteo de alumnos en atención por condición, grado y sexo, con el catálogo de condiciones de la <strong>Plantilla interna de la USAER</strong> (estructura del 911 USAER-1), incluidas las tres filas de «Otras condiciones: Dificultad severa…». Sirve para preparar la captura oficial; <strong>no la sustituye</strong>.</p>
  <div class="fila"><select id="fe" aria-label="Escuela" style="max-width:24rem"><option value="">Todas las escuelas</option>${DB.escuelas.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')}</select><button id="csv">Descargar para Excel</button></div><div id="tab"></div>`;
  const pinta = () => { const t = tablaEstadistica($('#fe').value); $('#tab').innerHTML = `<div class="tabla-scroll"><table><tr>${t.enc.map(h => `<th class="n">${esc(h)}</th>`).join('')}</tr>${t.filas.map(f => `<tr>${f.map((c, i) => i ? `<td class="n">${f[0] === 'Total' || i === 13 ? '<strong>' + c + '</strong>' : c}</td>` : `<td><strong>${esc(c)}</strong></td>`).join('')}</tr>`).join('')}</table></div>`; };
  $('#fe').onchange = pinta; pinta();
  $('#csv').onclick = () => { const t = tablaEstadistica($('#fe').value); descargar('EVAU_estadistica_' + hoy() + '.csv', '﻿' + [t.enc, ...t.filas].map(f => f.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n'), 'text/csv;charset=utf-8'); };
}

/* ---------- Ajustes, respaldo y bitácora ---------- */
const aDataURL = blob => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
async function exportarRespaldo() {
  const archivos = {};
  for (const m of [...DB.evidencias, ...DB.documentos]) { const b = await leerArchivo(m.id); if (b) archivos[m.id] = await aDataURL(b); }
  descargar('EVAU_respaldo_' + archivoSeguro(USUARIO ? USUARIO.nombre : '') + '_' + hoy() + '.json', JSON.stringify({ app: 'EVAU', version: VERSION, fecha: hoy(), de: USUARIO ? USUARIO.nombre : '', datos: DB, archivos }), 'application/json');
  marcarRespaldo();
  guardar('Descarga de respaldo');
}
async function leerRespaldo(file) {
  const o = JSON.parse(await file.text());
  if (o.app !== 'EVAU' || !o.datos || !Array.isArray(o.datos.alumnos)) throw new Error('formato');
  return o;
}
/* Combinar: junta lo del respaldo con lo de este dispositivo. Primero muestra qué va a entrar. */
async function combinarRespaldo(files) {
  files = Array.isArray(files) ? files : [files];
  let acc = DB; const partes = [], archivos = {};
  for (const f of files) {
    let o; try { o = await leerRespaldo(f); } catch (e) { aviso('«' + f.name + '» no es un respaldo válido de EVAU.'); return; }
    const r = combinarEstados(acc, o.datos); acc = r.datos; Object.assign(archivos, o.archivos || {});
    partes.push({ o, resumen: r.resumen });
  }
  const tit = partes.length === 1 ? 'Combinar el respaldo' + (partes[0].o.de ? ' de ' + partes[0].o.de : '') : 'Combinar ' + partes.length + ' respaldos';
  const v = abrirModal(`<h2>${esc(tit)}</h2>${partes.map(({ o, resumen }) => `<div class="caja ok"><h3>${esc(o.de ? 'De ' + o.de : 'Respaldo')} · ${esc(flarga(o.fecha) || 'sin fecha')}${o.version ? ' · EVAU ' + esc(o.version) : ''}</h3><ul class="resumen-comb">${textoResumen(resumen).map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`).join('')}
  <p>No se borra nada de este dispositivo, salvo lo que otra persona quitó después de que usted lo guardó.</p>
  <div class="fila"><button data-ok>Sí, combinar</button><button class="sec" data-no>Cancelar</button></div>`);
  $('[data-no]', v).onclick = () => v.cerrar();
  $('[data-ok]', v).onclick = async () => {
    v.cerrar();
    const u = USUARIO.id; DB = acc;
    const usados = new Set([...DB.evidencias, ...DB.documentos].map(x => x.id));
    for (const id in archivos) if (usados.has(id) && !(await leerArchivo(id))) await guardarArchivo(id, await (await fetch(archivos[id])).blob());
    USUARIO = porId('usuarios', u) || USUARIO; calcularHuellas();
    await guardar(partes.length === 1 ? 'Combinación del respaldo' + (partes[0].o.de ? ' de ' + partes[0].o.de : '') : 'Combinación de ' + partes.length + ' respaldos'); montar(); aviso(partes.length === 1 ? 'Respaldo combinado.' : partes.length + ' respaldos combinados.');
  };
}
async function importarRespaldo(file) {
  try {
    const o = await leerRespaldo(file);
    const u = USUARIO.id; DB = migrar(o.datos); calcularHuellas(); await borrarArchivos();
    for (const id in (o.archivos || {})) await guardarArchivo(id, await (await fetch(o.archivos[id])).blob());
    USUARIO = porId('usuarios', u) || DB.usuarios[0]; await guardar('Restauración de respaldo'); montar(); aviso('Respaldo restaurado.');
  } catch (e) { aviso('Ese archivo no es un respaldo válido de EVAU.'); }
}
const CAMPOS_USAER = [{ k: 'unidad', label: 'Nombre de la unidad (como va en el encabezado)', req: 1 }, { k: 'cct', label: 'CCT de la unidad' }, { k: 'turno', label: 'Turno' }, { k: 'domicilio', label: 'Domicilio' }, { k: 'directora', label: 'Director(a) de la USAER (firma Vo. Bo.)' },
  { k: 'encabezado', label: 'Texto antes de la condición en el encabezado del plan', tipo: 'select', req: 1, opciones: ['CONDICIÓN DEL ALUMNO:', 'EL ALUMNO PRESENTA UNA BARRERA DE APRENDIZAJE Y PARTICIPACIÓN ASOCIADA A:'], ayuda: 'La revisión del plan señaló que las barreras están en el contexto y no en el alumno. Use la segunda opción solo si así lo exige el formato oficial.' },
  { k: 'dependencia', label: 'Dependencias del encabezado de los formatos de comunicación (una por renglón)', tipo: 'textarea', alto: 4 }, { k: 'zona', label: 'Zona escolar (ej.: ZONA ESCOLAR NÚM. 000)' }, { k: 'lugar', label: 'Lugar para la fecha de los documentos (ej.: Ciudad, Edo.)' }, { k: 'leyenda', label: 'Leyenda oficial del año (opcional, va en el informe final)' }];
function vAjustes(v) {
  const u = DB.usaer;
  v.innerHTML = `<h1>Ajustes</h1>
  <div class="caja"><h2>Cuidado de la información</h2><p>La información se guarda <strong>solo en este dispositivo y en este navegador</strong>, sin cifrar; no se envía a ningún servidor. Use <strong>bloqueo de pantalla</strong> en el aparato, cambie su clave, descargue su respaldo seguido y compártalo solo con el equipo.</p></div>
  <div class="caja"><h2>Datos del servicio de apoyo (encabezado del plan)</h2><p><strong>${esc(u.unidad)}</strong><br>CCT: ${esc(u.cct)} · Turno: ${esc(u.turno)}<br>${esc(u.domicilio)}<br>Director(a) USAER: ${esc(u.directora)}<br>Encabezado: ${esc(u.encabezado)}<br>${esc(u.zona || '')}${u.lugar ? ' · ' + esc(u.lugar) : ''}</p>
  <p><strong>Logotipos del encabezado</strong> (opcionales; van en el plan y en los formatos de comunicación):</p><div class="fila logos-aj">${['logoIzq', 'logoDer'].map((k, i) => `<div>${u[k] ? `<img src="${u[k]}" alt="Logotipo ${i ? 'derecho' : 'izquierdo'}" style="height:56px;border:1px solid #000">` : `<em>Sin logotipo ${i ? 'derecho' : 'izquierdo'}</em>`}<br>${ed(`<label class="sec chico boton-archivo">${u[k] ? 'Cambiar' : 'Agregar'} ${i ? 'derecho' : 'izquierdo'}<input type="file" accept="image/*" data-logo="${k}" hidden></label>${u[k] ? ` <button class="sec chico" data-qlogo="${k}">Quitar</button>` : ''}`)}</div>`).join('')}</div><p>Ciclo escolar: <strong>${esc(DB.config.ciclo)}</strong></p>${ed('<div class="fila"><button class="sec" id="usa">Editar datos del servicio</button><button class="sec" id="cfg">Cambiar ciclo escolar</button></div>')}</div>
  <div class="caja"><h2>Profesionales</h2><table><tr><th>Nombre</th><th>Función</th><th>Escuelas que atiende</th><th>Clave</th><th></th></tr>${DB.usuarios.map(x => `<tr><td>${esc(x.nombre)}</td><td>${esc(CAT.roles[x.rol])}</td><td>${esc(x.rol === 'direccion' ? 'Todas (consulta)' : escuelasDe(x))}</td><td>${x.clave ? 'Propia' + ed(` <button class="sec chico" data-reset="${x.id}">Volver a 0000</button>`) : '0000'}</td><td>${ed(`<button class="sec chico" data-u="${x.id}">Editar</button>`)}</td></tr>`).join('')}</table>${ed('<button class="sec" id="nu">＋ Agregar profesional</button>')}<div class="fila"><button class="sec" id="miclave">🔑 Cambiar mi clave</button></div><p class="nota">Cada persona entra con 0000 hasta que cambie su clave con «Cambiar mi clave». La clave protege la entrada, pero <strong>no cifra</strong> la información. Dirección consulta todo y escribe solo en la carpeta general de cada escuela. Si la directora también es maestra de apoyo, regístrela dos veces, una con cada función.</p><p class="nota">Cada maestra de apoyo suele atender una o dos escuelas, y cada escuela puede tener otro psicólogo. Marque las escuelas de cada persona: así el plan de intervención pone en «Participantes» solo al equipo de la escuela del alumno. La maestra de comunicación es una sola para toda la USAER: déjela sin escuelas marcadas y aparecerá en todas.</p></div>
  <div class="caja"><h2>Respaldo y trabajo en equipo</h2><p>El respaldo es un archivo con toda la información, las evidencias y los documentos de este dispositivo.</p>
  <div class="opcion-resp"><button id="exp">Descargar respaldo</button><p>Para guardar una copia, o para pasarle su trabajo a otra persona del equipo. <strong>Último respaldo descargado en este aparato:</strong> ${ultimoRespaldo() ? esc(flarga(ultimoRespaldo())) : 'ninguno'}.</p></div>
  ${ed(`<div class="opcion-resp"><label class="boton" style="margin:0">Combinar respaldos<input id="comb" type="file" accept="application/json,.json" multiple hidden></label><p><strong>Recomendado.</strong> Puede elegir <strong>varios archivos a la vez</strong> (por ejemplo, el corte de fin de mes de cada escuela). Junta lo del respaldo con lo de este dispositivo. No se pierde nada: si el mismo dato cambió en los dos lados, se queda el cambio más reciente. Antes de aplicar, EVAU le dice qué va a entrar.</p></div>
  <div class="opcion-resp"><label class="boton peligro" style="margin:0">Reemplazar todo con un respaldo<input id="imp" type="file" accept="application/json,.json" hidden></label><p>Solo para un dispositivo nuevo o vacío: borra lo de este dispositivo y deja únicamente lo del respaldo.</p></div>
  <details class="guia"><summary>Cómo trabajar en equipo con respaldos</summary><ol>
  <li>La maestra de apoyo da de alta sus escuelas, grupos, alumnos y a las personas del equipo. Luego descarga un respaldo.</li>
  <li>Cada persona del equipo abre ese respaldo <strong>una sola vez</strong> con «Reemplazar todo», en su propio celular o computadora.</li>
  <li>Desde ahí, cada quien registra en su dispositivo. Cuando quiera compartir, descarga su respaldo y se lo pasa a la maestra de apoyo.</li>
  <li>La maestra de apoyo lo abre con «Combinar» y después comparte su propio respaldo, para que todos queden iguales.</li></ol>
  <p class="nota">No den de alta al mismo alumno en dos dispositivos distintos: saldría dos veces. No pasen los respaldos por WhatsApp: usen cable, memoria USB o un Drive compartido solo con el equipo.</p></details>
  <div class="fila"><button class="sec" id="demo">Cargar datos de ejemplo</button><button class="peligro" id="borrar">Borrar todo</button></div>`)}</div>
  <div class="caja"><h2>Bitácora de acciones</h2><div class="tabla-scroll"><table><tr><th>Fecha y hora</th><th>Persona</th><th>Acción</th></tr>${DB.bitacora.slice(-40).reverse().map(b => `<tr><td>${esc(b.f)}</td><td>${esc(b.u)}</td><td>${esc(b.a)}</td></tr>`).join('')}</table></div></div>
  <p class="nota">EVAU versión ${VERSION}</p>`;
  const cu = [{ k: 'nombre', label: 'Nombre', req: 1 }, { k: 'rol', label: 'Función', tipo: 'select', req: 1, opciones: Object.entries(CAT.roles) }, { k: 'escuelas', label: 'Escuelas que atiende', tipo: 'checks', opciones: DB.escuelas.map(e => [e.id, e.nombre]), ayuda: 'Deje todas sin marcar si atiende todas las escuelas (por ejemplo, la maestra de comunicación, que es una sola para toda la USAER).' }];
  $('#miclave').onclick = () => cambiarMiClave();
  document.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => { const x = porId('usuarios', b.dataset.reset); confirmar('La clave de ' + x.nombre + ' volverá a ser 0000.', async () => { delete x.clave; if (USUARIO.id === x.id) USUARIO = x; await guardar('Clave de ' + x.nombre + ' vuelta a 0000'); pintar(); aviso('Listo: la clave de ' + x.nombre + ' es 0000.'); }); });
  $('#exp').onclick = exportarRespaldo;
  if (!puedeEditar()) return;
  document.querySelectorAll('[data-logo]').forEach(inp => inp.onchange = async () => { const f = inp.files[0]; if (!f) return; if (f.size > 400000) { aviso('La imagen es muy pesada (más de 400 KB). Use una más chica.'); return; } DB.usaer[inp.dataset.logo] = await aDataURL(f); guardar('Logotipo del encabezado'); pintar(); });
  document.querySelectorAll('[data-qlogo]').forEach(b => b.onclick = () => { delete DB.usaer[b.dataset.qlogo]; guardar('Logotipo quitado'); pintar(); });
  $('#usa').onclick = () => formulario('Datos del servicio de apoyo', CAMPOS_USAER, DB.usaer, o => { DB.usaer = o; guardar('Edición de datos del servicio'); pintar(); });
  $('#cfg').onclick = () => formulario('Ciclo escolar', [{ k: 'ciclo', label: 'Ciclo escolar (ejemplo: 2026-2027)', req: 1 }], DB.config, o => { if (!/^\d{4}-\d{4}$/.test(o.ciclo)) { aviso('El ciclo se escribe así: 2026-2027'); return; } DB.config.ciclo = o.ciclo; guardar('Cambio de ciclo escolar'); pintar(); });
  $('#nu').onclick = () => formulario('Agregar profesional', cu, {}, o => { DB.usuarios.push({ id: uid(), ...o }); guardar('Alta de profesional'); pintar(); });
  v.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { const x = porId('usuarios', b.dataset.u); formulario('Editar profesional', cu, x, o => { if (x.id === USUARIO.id && o.rol === 'direccion') { aviso('No puede quitarse su propio permiso de edición.'); return; } Object.assign(x, o); guardar('Edición de profesional'); montar(); }); });
  $('#imp').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) confirmar('Reemplazar todo borra la información actual de este dispositivo y deja solo la del respaldo. Si quiere juntar las dos, use «Combinar un respaldo».', () => importarRespaldo(f), 'Sí, reemplazar todo'); };
  $('#comb').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) combinarRespaldo(fs); };
  $('#demo').onclick = () => confirmar('Cargar los datos de ejemplo reemplaza toda la información actual.', async () => { const uu = USUARIO.id; await borrarArchivos(); cargarEjemplo(); USUARIO = porId('usuarios', uu) || DB.usuarios[0]; await guardar('Carga de datos de ejemplo'); location.hash = '#inicio'; montar(); });
  $('#borrar').onclick = () => confirmar('Se borrará TODA la información y las evidencias de este dispositivo. No se puede deshacer. Descargue antes un respaldo.', async () => { await borrarArchivos(); DB = estadoVacio(); calcularHuellas(); USUARIO = DB.usuarios[0]; await guardar('Borrado total'); location.hash = '#inicio'; montar(); }, 'Sí, borrar todo');
}
