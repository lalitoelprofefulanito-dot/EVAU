/* EVAU 1.5.0 · Lo que se platicó con la maestra de apoyo el 25/11/2026:
   1. Pedir por voz, como a un secretario («nuevo registro de Juan», «imprime el plan de Ana», «descarga el respaldo»).
   2. Clave personal: cada quien puede cambiar la 0000 por la suya (protege la entrada; los datos no se cifran).
   3. CURP: se revisa al capturar y sirve para unir al mismo alumno cuando se combinan respaldos de aparatos distintos.
   4. Aviso cuando hace días que no se descarga el respaldo; combinar varios respaldos a la vez (corte de la directora). */

/* ---------- CURP ---------- */
const normCurp = s => String(s || '').toUpperCase().replace(/[^A-Z0-9Ñ]/g, '');
const RE_CURP = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;
const curpValida = c => RE_CURP.test(normCurp(c));
function validarCurp(valor, alumnoId) {
  const c = normCurp(valor);
  if (!c) return '';
  if (!curpValida(c)) return 'La CURP «' + c + '» no tiene el formato correcto (18 caracteres: 4 letras, 6 números de la fecha, H o M, 2 letras del estado, 3 consonantes, 1 carácter y 1 número). Revísela con el acta o la boleta.';
  const otro = DB.alumnos.find(a => a.id !== alumnoId && normCurp(a.curp) === c);
  if (otro) return 'Ya hay un alumno con esa CURP: ' + otro.nombre + '. Abra su carpeta en lugar de darlo de alta otra vez.';
  return '';
}
/* Al combinar: un alumno dado de alta en otro aparato con la misma CURP se une a la carpeta que ya existe aquí */
function unirPorCurp(L, E, res) {
  const aqui = new Map(), idsL = new Set((L.alumnos || []).map(a => a.id));
  (L.alumnos || []).forEach(a => { const c = normCurp(a.curp); if (curpValida(c)) aqui.set(c, a.id); });
  const mapa = {};
  (E.alumnos || []).forEach(a => { const c = normCurp(a.curp), lid = curpValida(c) && aqui.get(c); if (lid && lid !== a.id && !idsL.has(a.id)) mapa[a.id] = lid; });
  const viejos = Object.keys(mapa);
  if (!viejos.length) return;
  E.alumnos.forEach(a => { if (mapa[a.id]) a.id = mapa[a.id]; });
  ['registros', 'evidencias', 'documentos', 'informes'].forEach(c => (E[c] || []).forEach(x => { if (mapa[x.alumnoId]) x.alumnoId = mapa[x.alumnoId]; }));
  MAPAS.forEach(c => { const m = E[c] || {}; viejos.forEach(v => { if (m[v] === undefined) return; const n = mapa[v]; if (m[n] === undefined || tiempo(m[v]) > tiempo(m[n])) m[n] = m[v]; delete m[v]; }); });
  (E.borrados || []).forEach(b => { if (b.c === 'alumnos' && mapa[b.id]) b.id = mapa[b.id]; });
  res.unidosCurp = (res.unidosCurp || 0) + viejos.length;
}

/* ---------- Clave personal ---------- */
async function huellaClave(userId, clave) {
  const t = 'EVAU|' + userId + '|' + clave;
  if (window.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return 'h1:' + [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261; for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }   // respaldo sin crypto (archivo local)
  return 'h0:' + h.toString(16);
}
async function claveCorrecta(u, clave) { return u.clave ? (await huellaClave(u.id, clave)) === u.clave : clave === CLAVE; }
function cambiarMiClave() {
  formulario('Cambiar mi clave', [
    { k: 'actual', label: 'Clave actual' + (USUARIO.clave ? '' : ' (hoy es 0000)'), req: 1, tipo: 'password' },
    { k: 'nueva', label: 'Clave nueva (4 a 8 números)', req: 1, tipo: 'password' },
    { k: 'otra', label: 'Repita la clave nueva', req: 1, tipo: 'password' }],
  {}, async o => {
    if (!(await claveCorrecta(USUARIO, o.actual))) { aviso('La clave actual no es correcta.'); return; }
    if (!/^\d{4,8}$/.test(o.nueva)) { aviso('La clave nueva debe tener de 4 a 8 números.'); return; }
    if (o.nueva !== o.otra) { aviso('Las dos claves nuevas no coinciden.'); return; }
    const u = porId('usuarios', USUARIO.id); u.clave = await huellaClave(u.id, o.nueva); USUARIO = u;
    await guardar('Cambio de clave personal'); pintar();
    aviso('Clave cambiada. Para que también sirva en otro aparato, combine allá un respaldo descargado aquí.');
  }, '<p class="nota">La clave protege la entrada a EVAU en este aparato. <strong>No cifra la información</strong>: quien tenga el aparato desbloqueado y sepa usar el navegador podría verla. Si la olvida, otra persona del equipo puede volverla a 0000 en Ajustes → Profesionales.</p>');
}

/* ---------- Aviso de respaldo ---------- */
const LLAVE_RESP = 'evau-ultimo-respaldo';
function ultimoRespaldo() { try { return localStorage.getItem(LLAVE_RESP) || ''; } catch (e) { return ''; } }
function marcarRespaldo() { try { localStorage.setItem(LLAVE_RESP, hoy()); } catch (e) { } }
function diasSinRespaldo() { const u = ultimoRespaldo(); return u ? Math.floor((new Date(hoy() + 'T12:00:00') - new Date(u + 'T12:00:00')) / 864e5) : null; }
function avisoRespaldo() {
  if (!DB.alumnos.length) return '';
  const d = diasSinRespaldo();
  if (d !== null && d < 7) return '';
  return `<div class="caja alerta aviso-resp"><p><strong>⚠ ${d === null ? 'Todavía no ha descargado ningún respaldo en este aparato.' : 'Hace ' + d + ' días que no descarga su respaldo.'}</strong> Si se borra el navegador o se resetea el aparato, se pierde lo que no esté respaldado.</p><button id="resp-ya">💾 Descargar respaldo ahora</button></div>`;
}
function activarAvisoRespaldo(v) { const b = $('#resp-ya', v); if (b) b.onclick = async () => { await exportarRespaldo(); pintar(); }; }

/* ---------- Pedir por voz (como a un secretario) ---------- */
const normOrden = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
const AYUDA_ORDENES = [
  ['Nuevo registro de <em>nombre</em>', 'Abre el registro de ese alumno y empieza a escuchar.'],
  ['Abre la carpeta de <em>nombre</em>', 'Abre el expediente del alumno.'],
  ['Plan de <em>nombre</em> · Imprime el plan de <em>nombre</em>', 'Abre el plan; con «imprime», «exporta» o «Word» abre la hoja para imprimir o bajar.'],
  ['Informe de <em>nombre</em>', 'Abre la pantalla para generar su informe.'],
  ['Plan de comunicación de <em>nombre</em> · Informe de comunicación de <em>nombre</em>', 'Abre esos formatos listos para imprimir o bajar a Word.'],
  ['Plan de psicología de <em>nombre</em> · Informe de psicología de <em>nombre</em>', 'Abre los formatos de psicología listos para imprimir o bajar a Word.'],
  ['Nuevo alumno', 'Abre el alta de un alumno.'],
  ['Descarga el respaldo', 'Descarga el archivo de respaldo de este aparato.'],
  ['Combina un respaldo', 'Lleva a Ajustes para elegir los archivos.'],
  ['Descarga la estadística', 'Baja la estadística para Excel.'],
  ['Ve a escuelas · grupos · informes · resumen · ajustes · alumnos', 'Cambia de pantalla.'],
  ['Cambiar mi clave', 'Abre el cambio de clave personal.']
];
function irA(hash, luego) {
  if (location.hash === hash) { pintar(); if (luego) setTimeout(luego, 60); return; }
  if (luego) window.addEventListener('hashchange', () => setTimeout(luego, 60), { once: true });
  location.hash = hash;
}
const clic = sel => { const b = document.querySelector(sel); if (b) b.click(); return !!b; };
/* Devuelve { hecho: true } o { pregunta: [...candidatos], seguir } o { msg } */
function interpretarOrden(dicho) {
  const t = normOrden(dicho);
  const conNombre = (resto, accion) => {
    const nombre = resto.replace(/^(de|del|a|al|para|sobre|la|el|alumno|alumna|nino|nina)\s+/g, '').replace(/^(de|del|a|al|para|el|la|alumno|alumna)\s+/g, '').trim();
    if (!nombre) return { msg: 'Falta el nombre del alumno. Diga, por ejemplo: «' + dicho + ' Juan Pérez».' };
    const r = buscarPorVoz(nombre, DB.alumnos.map(a => ({ texto: a.nombre, id: a.id })));
    if (r.estado === 'ok') { accion(r.elegido.id); return { hecho: true }; }
    if (r.estado === 'duda') return { pregunta: r.candidatos, seguir: accion, msg: 'Se escuchó «' + nombre + '». ¿A quién se refiere?' };
    return { msg: 'Se escuchó «' + nombre + '», pero no hay un alumno con ese nombre. Intente de nuevo.' };
  };
  let m;
  if (/^(ayuda|que puedo (decir|pedir)|comandos|ordenes)/.test(t)) return { ayuda: true };
  if (/(cambia|cambiar|pon|poner).*(mi )?clave/.test(t)) { cerrarOrdenes(); cambiarMiClave(); return { hecho: true }; }
  if (/(descarga|descargar|exporta|exportar|guarda|guardar|haz|hacer|saca|sacar|baja|bajar).*respaldo/.test(t)) { cerrarOrdenes(); exportarRespaldo().then(() => { aviso('Respaldo descargado.'); pintar(); }); return { hecho: true }; }
  if (/(combina|combinar|importa|importar|junta|juntar|carga|cargar|sube|subir).*(respaldo|archivo)/.test(t)) { cerrarOrdenes(); irA('#ajustes', () => { const c = document.querySelector('#comb'); if (c) { c.closest('.opcion-resp').scrollIntoView({ block: 'center' }); c.closest('.opcion-resp').classList.add('resaltar'); } aviso('Toque «Combinar respaldos» y elija los archivos.'); }); return { hecho: true }; }
  if (/estadistica/.test(t)) { cerrarOrdenes(); irA('#estadistica', /(excel|descarg|export|baja)/.test(t) ? () => clic('#csv') : null); return { hecho: true }; }
  if (/(nuevo|nueva|agrega|agregar|registra|registrar|alta|da de alta|dar de alta) (un |una |a un |al )?(alumn|nino|nina)/.test(t)) { cerrarOrdenes(); irA('#inicio', () => clic('#nuevo')); return { hecho: true }; }
  if ((m = t.match(/^(?:nuevo registro|registro|anota|anotar|apunta|apuntar|registra|registrar|dicta|dictar|toma nota|tomar nota)\b\s*(.*)$/))) {
    if (!puedeEditar()) return { msg: 'Con el perfil de dirección no se hacen registros de alumnos.' };
    if (!m[1]) { cerrarOrdenes(); nuevoRegistro({}, true); return { hecho: true }; }
    return conNombre(m[1], id => { cerrarOrdenes(); nuevoRegistro({ alumnoId: id }, true); });
  }
  if ((m = t.match(/(plan|informe)(?: final)?(?: de atencion)?(?: de| del area de)? psicologia\s*(.*)$/))) {
    const boton = m[1] === 'plan' ? '#vpp' : '#vip';
    return conNombre(m[2], id => { cerrarOrdenes(); irA('#alumno/' + id + '/psicologia', () => clic(boton)); });
  }
  if ((m = t.match(/(plan|informe)(?: final)? de comunicacion\s*(.*)$/))) {
    const boton = m[1] === 'plan' ? '#vpc' : '#vic';
    return conNombre(m[2], id => { cerrarOrdenes(); irA('#alumno/' + id + '/comunicacion', () => clic(boton)); });
  }
  if ((m = t.match(/plan(?: de intervencion)?(?: educativa)?\s*(.*)$/))) {
    const ver = /(imprim|export|descarg|word|pdf|ver |baja)/.test(t);
    return conNombre(m[1], id => { cerrarOrdenes(); irA('#alumno/' + id + '/plan', ver ? () => clic('#ver') : null); });
  }
  if ((m = t.match(/informe(?: final| de corte| trimestral| para la familia)?\s*(.*)$/)) && m[1] && !/^(s|es)$/.test(m[1])) {
    return conNombre(m[1], id => { cerrarOrdenes(); irA('#alumno/' + id + '/informes', () => clic('#gi')); });
  }
  const PANT = [['escuela', '#escuelas'], ['grupo', '#grupos'], ['informe', '#informes'], ['resumen', '#resumen'], ['ajuste', '#ajustes'], ['configuracion', '#ajustes'], ['alumnos', '#inicio'], ['inicio', '#inicio']];
  if ((m = t.match(/^(?:abre|abrir|ve a|ir a|vamos a|muestra|mostrar|ver|llevame a|pasa a|regresa a)?\s*(?:la |el |los |las |a )?(?:seccion de |pantalla de )?(\w+)$/))) {
    const p = PANT.find(([k]) => m[1].startsWith(k));
    if (p) { cerrarOrdenes(); irA(p[1]); return { hecho: true }; }
  }
  if ((m = t.match(/^(?:abre|abrir|busca|buscar|muestra|mostrar|ver|ensename|carpeta|expediente)(?: la| el)?(?: carpeta| expediente)?(?: de| del| a| al)?\s+(.*)$/))) {
    return conNombre(m[1], id => { cerrarOrdenes(); irA('#alumno/' + id); });
  }
  const r = buscarPorVoz(t, DB.alumnos.map(a => ({ texto: a.nombre, id: a.id })));
  if (r.estado === 'ok') { cerrarOrdenes(); irA('#alumno/' + r.elegido.id); return { hecho: true }; }
  return { msg: 'No entendí «' + dicho + '». Toque «Qué puedo pedir» para ver ejemplos.' };
}
let MODAL_ORDENES = null;
function cerrarOrdenes() { detenerVoz(); if (MODAL_ORDENES) { MODAL_ORDENES.cerrar(); MODAL_ORDENES = null; } }
function abrirOrdenes(escucharYa) {
  const v = abrirModal(`<h2>🗣 Pedir por voz</h2><p>Diga lo que necesita, como si se lo pidiera a un secretario. Ejemplo: <strong>«nuevo registro de Juan»</strong> o <strong>«imprime el plan de Ana»</strong>.</p>
  <div class="buscar-fila"><input id="ord" type="text" class="buscar" placeholder="Diga o escriba lo que necesita" autocomplete="off"><button id="ordvoz" class="sec" type="button">🎙 Hablar</button></div>
  <p id="ordest" class="nota" aria-live="polite"></p><div id="ordcand" class="fila"></div>
  <div class="fila"><button id="ordok">Hacer</button><button class="sec" data-no>Cerrar</button></div>
  <details class="guia"${escucharYa ? '' : ' open'}><summary>Qué puedo pedir</summary><table>${AYUDA_ORDENES.map(([a, b]) => `<tr><td><strong>«${a}»</strong></td><td>${b}</td></tr>`).join('')}</table></details>`);
  MODAL_ORDENES = v;
  const est = (t, err) => { const e = $('#ordest', v); if (e) { e.textContent = t; e.classList.toggle('error', !!err); } };
  const hacer = dicho => {
    dicho = (dicho || '').trim(); if (!dicho) { est('Diga o escriba qué necesita.', true); return; }
    const r = interpretarOrden(dicho);
    if (r.ayuda) { $('details.guia', v).open = true; est('Estos son algunos ejemplos.'); return; }
    if (r.hecho) return;
    est(r.msg || '', !r.pregunta);
    $('#ordcand', v).innerHTML = (r.pregunta || []).map((c, i) => `<button class="sec" data-c="${i}">${esc(c.texto)}</button>`).join('');
    v.querySelectorAll('[data-c]').forEach(b => b.onclick = () => r.seguir(r.pregunta[Number(b.dataset.c)].id));
  };
  $('[data-no]', v).onclick = () => cerrarOrdenes();
  $('#ordok', v).onclick = () => hacer($('#ord', v).value);
  $('#ord', v).onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); hacer($('#ord', v).value); } };
  botonMicrofono($('#ordvoz', v), { caja: $('#ord', v), alEstado: est, escribir: frases => { const dicho = frases.join(' ').trim(); if (dicho) { $('#ord', v).value = dicho; detenerVoz(); hacer(dicho); } } });
  if (escucharYa) $('#ordvoz', v).click(); else $('#ord', v).focus();
}
