"""Prueba automática de EVAU 1.3 (Playwright + Chrome). Uso: python3 herramientas/prueba.py [respaldo_v1.json]"""
import asyncio, json, pathlib, subprocess, sys, time
from playwright.async_api import async_playwright
RAIZ = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(__file__).resolve().parent / 'salida'; OUT.mkdir(exist_ok=True)
V1 = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
URL = 'http://localhost:8768/index.html'
ok = []
def chk(n, c, extra=''):
    ok.append(bool(c)); print(('OK   ' if c else 'FALLA'), n, extra)

# Micrófono simulado, como Chrome: cada start() «escucha» una sola vez las frases pendientes de window.__frases;
# los resultados se acumulan en la misma escucha (resultIndex apunta al nuevo) y al terminar llega onend.
# window.__error simula un error del navegador en la siguiente escucha.
FAKE_SR = """
window.__frases = []; window.__error = null; window.__inicios = 0;
class FakeSR { constructor(){ this.lang=''; }
  start(){ const fr = window.__frases.splice(0), err = window.__error; window.__error = null; window.__inicios++;
    setTimeout(()=>{ if (this._fin) return; this.onstart && this.onstart();
      if (err) { this.onerror && this.onerror({error: err}); setTimeout(()=>this._end(), 50); return; }
      const res = []; let i = 0;
      const paso = () => { if (this._fin) return; if (i >= fr.length) { setTimeout(()=>this._end(), 150); return; }
        res.push({0:{transcript: fr[i]}, isFinal:true, length:1}); this.onresult && this.onresult({resultIndex: res.length-1, results: res}); i++; setTimeout(paso, 250); };
      setTimeout(paso, 200); }, 50); }
  _end(){ if (this._fin) return; this._fin = true; this.onend && this.onend(); }
  stop(){ this._end(); } }
window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
"""

async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8768', '--directory', str(RAIZ)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            ctx = await b.new_context(viewport={'width': 1100, 'height': 900}, accept_downloads=True)
            await ctx.add_init_script(FAKE_SR)
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(URL); await pg.fill('#clave', '0000'); await pg.click('button[type=submit]')
            await pg.click('#demo'); await pg.wait_for_selector('a.carpeta')
            chk('portada = carpeta de alumnos', await pg.locator('a.carpeta').count() == 7, str(await pg.locator('a.carpeta').count()))
            await pg.fill('#q', 'luc'); await pg.wait_for_timeout(200)
            chk('buscador sin acentos', await pg.locator('a.carpeta').count() == 1)
            await pg.screenshot(path=OUT / '1_portada.png')
            await pg.goto(URL + '#alumno/a1'); await pg.wait_for_selector('.docs')
            docs = await pg.inner_text('.docs'); chk('documentos completos en a1', docs.count('✅') == 3, docs)
            await pg.goto(URL + '#alumno/a4'); await pg.wait_for_selector('.docs')
            chk('sin diagnóstico: solo consentimiento e informe final', (await pg.inner_text('.docs')).count('Falta') == 2 and 'sin diagnóstico' in await pg.inner_text('.docs'))
            await pg.goto(URL + '#alumno/a1'); await pg.wait_for_selector('.docs')
            d1 = await pg.inner_text('.docs'); chk('con diagnóstico: pide informes psicopedagógico, psicológico y de comunicación', all(x in d1 for x in ['Informe psicopedagógico', 'Informe psicológico', 'Informe de comunicación']), d1)
            await pg.goto(URL + '#alumno/a7/plan'); await pg.wait_for_selector('#tab .caja')
            chk('sin diagnóstico: no muestra plan', await pg.locator('.seccion').count() == 0 and 'solo el' in await pg.inner_text('#tab'))
            chk('categoría «Problemas severos» no aparece en la carpeta', 'Sin diagnóstico' in await pg.inner_text('main h1 + p'))
            await pg.goto(URL + '#alumno/a7/informes'); await pg.click('#gi')
            ops = await pg.locator('#f_tipo option').all_inner_texts(); chk('sin diagnóstico: solo informe final', ops == ['Final del ciclo'], str(ops))
            chk('sin diagnóstico: sin pestaña de valoración', await pg.locator('.pestanas a', has_text='Valoración').count() == 0)
            await pg.select_option('#f_alumnoId', 'a1'); ops = await pg.locator('#f_tipo option').all_inner_texts(); chk('con diagnóstico: todos los tipos de informe', len(ops) == 5, str(ops))
            await pg.click('.modal [data-no]')
            # 1.3.2: cada profesional con sus escuelas; la maestra de comunicación en todas
            await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('#tab .seccion'); t1 = await pg.inner_text('#tab')
            await pg.goto(URL + '#alumno/a5/plan'); await pg.wait_for_selector('#tab .seccion'); t5 = await pg.inner_text('#tab')
            chk('participantes: psicólogo de la escuela del alumno', 'Psic. Psicología Ficticio' in t1 and 'Psic. Segundo Ficticio' not in t1 and 'Psic. Segundo Ficticio' in t5 and 'Psic. Psicología Ficticio' not in t5)
            chk('participantes: comunicación y apoyo en las dos escuelas', all('Mtra. Comunicación Ficticio' in t and 'Mtra. Apoyo Ficticio' in t for t in (t1, t5)))
            await pg.goto(URL + '#escuelas'); await pg.wait_for_selector('main .caja'); te = await pg.inner_text('main')
            chk('escuelas muestran su equipo', te.count('Equipo USAER en esta escuela') == 2 and 'Psic. Segundo Ficticio (Psicología)' in te)
            await pg.goto(URL + '#ajustes'); await pg.click('[data-u=u2]'); await pg.wait_for_selector('#f_escuelas')
            chk('editar profesional: casillas de escuelas', await pg.locator('#f_escuelas input:checked').count() == 1 and await pg.locator('#f_escuelas input').count() == 2)
            await pg.click('.modal [data-no]')
            await pg.goto(URL + '#estadistica'); await pg.wait_for_selector('#tab table')
            est = await pg.inner_text('#tab'); chk('estadística con las tres categorías', all(x in est for x in ['Problemas severos de comunicación', 'Problemas severos de conducta', 'Problemas severos de aprendizaje']))
            await pg.goto(URL + '#resumen'); await pg.wait_for_selector('.tarjetas')
            chk('resumen: sin plan solo cuenta alumnos con diagnóstico', 'Con diagnóstico y sin plan' in await pg.inner_text('.tarjetas'))
            # Dictado de un toque: dos frases con pausa
            await pg.goto(URL + '#alumno/a1/historial'); await pg.wait_for_selector('.registro'); n0 = await pg.locator('.registro').count()
            await pg.evaluate("window.__frases = ['Hoy se trabajó clasificación de figuras geométricas', 'identificó círculo y cuadrado de forma independiente punto presentó dificultad con triángulo']")
            await pg.click('#fab'); await pg.wait_for_timeout(1600)
            act, obs = await pg.input_value('#r_act'), await pg.input_value('#r_obs')
            chk('dictado: actividad', act == 'Clasificación de figuras geométricas', act)
            chk('dictado: observación', obs == 'Identificó círculo y cuadrado de forma independiente. Presentó dificultad con triángulo', obs)
            await pg.click('label:has(input[name=marca][value=Logro])'); await pg.click('label:has(input[name=marca][value=Dificultad])')
            await pg.select_option('#r_area', 'Académicas'); await pg.select_option('#r_nivel', 'Independiente')
            await pg.screenshot(path=OUT / '2_dictado.png', full_page=True)
            await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(500)
            chk('registro guardado', await pg.locator('.registro').count() == n0 + 1)
            primero = await pg.locator('.registro').first.inner_text()
            chk('registro con marcas, área y nivel', all(s in primero for s in ['Logro', 'Dificultad', 'Académicas', 'Independiente']), primero[:120])
            # Dictado en una sola frase con «punto»
            await pg.evaluate("window.__frases = ['se trabajó lectura en voz alta punto leyó cinco palabras sin ayuda']")
            await pg.click('#fab'); await pg.wait_for_timeout(1200)
            chk('dictado con «punto»', (await pg.input_value('#r_act')) == 'Lectura en voz alta' and (await pg.input_value('#r_obs')) == 'Leyó cinco palabras sin ayuda', await pg.input_value('#r_act') + ' | ' + await pg.input_value('#r_obs'))
            # 1.3 · el micrófono sigue encendido tras la pausa y agrega lo que se dice después
            await pg.evaluate("window.__frases = ['pidió ayuda para la sexta']"); await pg.wait_for_timeout(1300)
            chk('dictado: se vuelve a encender solo', (await pg.input_value('#r_obs')) == 'Leyó cinco palabras sin ayuda pidió ayuda para la sexta' and await pg.evaluate('window.__inicios') >= 3, await pg.input_value('#r_obs'))
            # 1.3 · respeta lo corregido a mano: lo siguiente se agrega después
            await pg.fill('#r_obs', 'Leyó seis palabras sin ayuda.'); await pg.dispatch_event('#r_obs', 'input')
            await pg.evaluate("window.__frases = ['se cansó al final']"); await pg.wait_for_timeout(1300)
            chk('dictado: respeta la corrección a mano', (await pg.input_value('#r_obs')) == 'Leyó seis palabras sin ayuda. Se cansó al final', await pg.input_value('#r_obs'))
            # 1.3 · repetición ampliada (Android): la frase que repite y amplía a la anterior la sustituye
            await pg.evaluate("window.__frases = ['muy contento', 'muy contento con su logro']"); await pg.wait_for_timeout(1500)
            chk('dictado: no duplica frases repetidas y ampliadas', (await pg.input_value('#r_obs')).endswith('Se cansó al final muy contento con su logro'), await pg.input_value('#r_obs'))
            await pg.click('#r_voz'); await pg.wait_for_timeout(200)
            chk('dictado: se apaga con el botón', 'Dictar' in await pg.inner_text('#r_voz') and 'terminado' in await pg.inner_text('#r_est'))
            await pg.click('.guia summary'); guia = await pg.inner_text('.guia')
            chk('guía con ejemplo que sale del mismo lector', 'Actividad: Lectura de cuento' in guia and 'Observación: Respondió dos preguntas sin ayuda. En la tercera pidió apoyo' in guia, guia[-260:])
            await pg.screenshot(path=OUT / '2b_guia_dictado.png', full_page=True)
            await pg.click('.modal [data-no]')
            # 1.3 · errores explicados
            await pg.evaluate("window.__error = 'not-allowed'"); await pg.click('#fab'); await pg.wait_for_timeout(600)
            chk('dictado: explica el permiso negado', 'permiso' in await pg.inner_text('#r_est') and 'Dictar' in await pg.inner_text('#r_voz'), await pg.inner_text('#r_est'))
            await pg.click('.modal [data-no]')
            # 1.3 · micrófono en cualquier cuadro de texto de un formulario (cada pausa, un renglón en las listas)
            await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('.seccion')
            await pg.evaluate("formulario('Prueba', [{k:'lista', label:'Fortalezas', tipo:'lista'}, {k:'texto', label:'Datos', tipo:'textarea'}], {}, () => {})")
            chk('formulario: un micrófono por cuadro de texto y guía', await pg.locator('.modal [data-mic]').count() == 2 and await pg.locator('.modal .guia').count() == 1)
            await pg.evaluate("window.__frases = ['sigue instrucciones de un paso', 'recuerda las rutinas del aula']"); await pg.click('.modal [data-mic=lista]'); await pg.wait_for_timeout(1400)
            chk('formulario: dictado por renglones en listas', (await pg.input_value('#f_lista')) == 'Sigue instrucciones de un paso\nRecuerda las rutinas del aula', repr(await pg.input_value('#f_lista')))
            await pg.evaluate("window.__frases = ['vive con su madre punto', 'tiene buena relación con su maestra']"); await pg.click('.modal [data-mic=texto]'); await pg.wait_for_timeout(1400)
            chk('formulario: un solo micrófono a la vez', 'Dictar' in await pg.inner_text('.modal [data-mic=lista]') and 'Detener' in await pg.inner_text('.modal [data-mic=texto]'))
            chk('formulario: dictado de texto corrido', (await pg.input_value('#f_texto')) == 'Vive con su madre. Tiene buena relación con su maestra', await pg.input_value('#f_texto'))
            await pg.click('.modal [data-no]')
            # 1.3 · búsqueda por voz (patrón 3): ejemplos del documento y nombres de alumnos
            pr = await pg.evaluate("() => { const l = ['Pantalón de mezclilla', 'Camisa azul de manga larga', 'Camisa blanca', 'Arroz integral', 'Tenis deportivos']; return ['arros integral', 'pantalon de mesclilla', 'tenis', 'camisa', 'licuadora'].map(d => { const r = buscarPorVoz(d, l); return r.estado + ':' + (r.elegido ? r.elegido.texto : r.candidatos.map(c => c.texto).sort().join('|')); }); }")
            chk('búsqueda por voz: ejemplos del documento', pr == ['ok:Arroz integral', 'ok:Pantalón de mezclilla', 'ok:Tenis deportivos', 'duda:Camisa azul de manga larga|Camisa blanca', 'no:'], str(pr))
            await pg.goto(URL + '#inicio'); await pg.wait_for_selector('a.carpeta')
            await pg.evaluate("window.__frases = ['diego fictisio']"); await pg.click('#qvoz'); await pg.wait_for_timeout(900)
            chk('búsqueda por voz: encuentra al alumno aunque se diga mal', await pg.locator('a.carpeta').count() == 1 and 'Diego' in await pg.inner_text('#lista') and 'Encontrado' in await pg.inner_text('#qest'), await pg.inner_text('#qest'))
            await pg.evaluate("window.__frases = ['ficticio']"); await pg.click('#qvoz'); await pg.wait_for_timeout(900)
            chk('búsqueda por voz: si hay duda muestra candidatos', await pg.locator('a.carpeta').count() > 1 and 'más de un nombre' in await pg.inner_text('#qest'), await pg.inner_text('#qest'))
            await pg.evaluate("window.__frases = ['licuadora']"); await pg.click('#qvoz'); await pg.wait_for_timeout(900)
            chk('búsqueda por voz: dice cuando no está', 'no está en la lista' in await pg.inner_text('#qest'))
            await pg.screenshot(path=OUT / '1b_busqueda_voz.png')
            await pg.evaluate("delete window.SpeechRecognition; delete window.webkitSpeechRecognition"); await pg.click('#qvoz'); await pg.wait_for_timeout(200)
            chk('dictado: sin reconocimiento ofrece el teclado', 'micrófono del teclado' in await pg.inner_text('#qest'))
            await pg.reload(); await pg.fill('#clave', '0000'); await pg.click('button[type=submit]'); await pg.wait_for_selector('a.carpeta')
            # Plan de intervención
            await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('.seccion')
            chk('plan con 11 apartados', await pg.locator('.seccion').count() == 11)
            await pg.click('#rev'); txt = await pg.inner_text('.modal')
            chk('revisión rápida detecta áreas vacías', 'Está vacía' in txt); await pg.click('.modal [data-no]')
            await pg.click('[data-sec=bap]'); await pg.fill('#f_c0', 'Lucía no tolera el ruido de la cancha.'); await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(300)
            await pg.click('#rev'); chk('revisión detecta BAP que describe al alumno', 'parece describir al alumno' in await pg.inner_text('.modal')); await pg.click('.modal [data-no]')
            await pg.click('[data-prop=Noviembre]'); await pg.wait_for_selector('#f_logros')
            prop = await pg.input_value('#f_logros'); padres = await pg.input_value('#f_padres')
            chk('corte de noviembre llenado con registros', 'Logros:' in prop and 'Dificultades:' in prop and 'Nivel de apoyo:' in prop and 'Académicas: pasó de' in prop, prop[-160:])
            chk('conocimiento de padres', 'lectura compartida' in padres.lower(), padres)
            await pg.screenshot(path=OUT / '3_corte.png', full_page=True)
            await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(300)
            await pg.click('#ver'); await pg.wait_for_selector('#hoja')
            hoja = await pg.inner_text('#hoja')
            chk('plan impreso con el formato', all(s in hoja for s in ['PLAN DE INTERVENCIÓN EDUCATIVA', 'CONDICIÓN DEL ALUMNO', 'HABILIDADES Y ÁREAS DE OPORTUNIDAD', 'TIPOS DE ADECUACIONES DE ACCESO', 'REGISTRO DE EVALUACIÓN DEL ALUMNO', 'PARTICIPANTES', 'DIRECTOR(A) DE LA USAER']))
            await pg.emulate_media(media='print'); await pg.pdf(path=str(OUT / 'plan_ejemplo.pdf'), format='Letter', margin={'top': '1.5cm', 'bottom': '1.5cm', 'left': '1.6cm', 'right': '1.6cm'}); await pg.emulate_media(media='screen')
            async with pg.expect_download() as d: await pg.click('#doc')
            chk('plan en Word', (await d.value).suggested_filename.endswith('.doc'), (await d.value).suggested_filename)
            await pg.click('#cer')
            # Informe de corte
            await pg.goto(URL + '#alumno/a1/informes'); await pg.click('#gi')
            chk('periodo noviembre', (await pg.input_value('#f_desde')) == '2026-08-01' and (await pg.input_value('#f_hasta')) == '2026-11-30')
            await pg.click('.modal button[type=submit]'); await pg.wait_for_selector('#hoja')
            inf = await pg.inner_text('#hoja')
            chk('informe analiza los registros', all(s in inf for s in ['Fortalezas observadas', 'Dificultades persistentes', 'Apoyos implementados', 'pasó de', 'Recomendaciones', 'Continuar trabajando en el área Académicas', 'Registro cronológico del periodo']), '')
            await pg.emulate_media(media='print'); await pg.pdf(path=str(OUT / 'informe_ejemplo.pdf'), format='Letter', margin={'top': '1.5cm', 'bottom': '1.5cm', 'left': '1.6cm', 'right': '1.6cm'}); await pg.emulate_media(media='screen')
            await pg.click('#g'); await pg.wait_for_selector('[data-ver]')
            # Bitácora de incidencia
            await pg.goto(URL + '#grupo/g2'); await pg.click('[data-bit]'); await pg.wait_for_selector('#hoja')
            bit = await pg.inner_text('#hoja')
            chk('bitácora de incidencia', 'BITÁCORA DE INCIDENCIA' in bit and 'Agresión verbal' in bit and 'X' in bit)
            await pg.click('#cer')
            # Documentos: subir consentimiento a a4
            await pg.goto(URL + '#alumno/a4/datos'); await pg.click('#ndoc')
            pdf = OUT / 'consentimiento_ficticio.pdf'; pdf.write_bytes(b'%PDF-1.4\n%ficticio\n')
            await pg.select_option('#d_tipo', 'Consentimiento informado'); await pg.set_input_files('#d_arch', str(pdf)); await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(400)
            chk('documento sube y activa el consentimiento', (await pg.inner_text('.docs')).count('Falta') == 1)
            # Respaldo y restauración con documentos
            await pg.goto(URL + '#ajustes')
            async with pg.expect_download() as d: await pg.click('#exp')
            rp = OUT / 'respaldo_v2.json'; await (await d.value).save_as(rp)
            j = json.loads(rp.read_text()); chk('respaldo incluye documentos y plan', len(j['archivos']) >= 1 and 'a1' in j['datos']['planes'] and j['datos']['version'] == 2)
            if V1 and V1.exists():
                await pg.set_input_files('#imp', str(V1)); await pg.click('[data-ok]'); await pg.wait_for_timeout(800)
                await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('.seccion')
                t = await pg.inner_text('#tab')
                chk('migración de respaldo 1.0 al plan real', 'Actividades iguales para todo el grupo' in t and 'Reconocimiento de sílabas' in t)
                await pg.goto(URL + '#ajustes')
            await pg.set_input_files('#imp', str(rp)); await pg.click('[data-ok]'); await pg.wait_for_timeout(800)
            await pg.goto(URL + '#alumno/a4/datos'); await pg.wait_for_selector('.miniaturas a.arch')
            chk('restauración con documentos', True)
            # 1.3 · sellos: cada dato guarda cuándo cambió y quién lo cambió
            sel = await pg.evaluate("(() => { const r = DB.registros.find(x => x.observacion.startsWith('Identificó círculo y cuadrado de forma independiente')); return r && r._m ? r._m.n + '|' + r._m.t.slice(0, 2) : ''; })()")
            chk('sellos: el registro guarda quién y cuándo', sel == 'Mtra. Apoyo Ficticio|20', sel)
            chk('sellos: datos de antes quedan con sello antiguo', await pg.evaluate("porId('escuelas', 'e2')._m.t") == '2000-01-01T00:00:00.000Z')
            # 1.3 · combinar entre dos dispositivos (A = esta página, B = otro navegador)
            async def respaldo(pag, nombre):
                await pag.goto(URL + '#ajustes')
                async with pag.expect_download() as d: await pag.click('#exp')
                ruta = OUT / nombre; await (await d.value).save_as(ruta); return ruta
            base = await respaldo(pg, 'equipo_inicial.json')
            ctxB = await b.new_context(viewport={'width': 1100, 'height': 900}, accept_downloads=True); await ctxB.add_init_script(FAKE_SR); pB = await ctxB.new_page()
            pB.on('pageerror', lambda e: errs.append('B: ' + str(e)))
            await pB.goto(URL); await pB.select_option('#quien', 'u2'); await pB.fill('#clave', '0000'); await pB.click('button[type=submit]')
            await pB.goto(URL + '#ajustes'); await pB.set_input_files('#imp', str(base)); await pB.click('[data-ok]'); await pB.wait_for_timeout(900)
            chk('equipo: el otro dispositivo recibe todo con «Reemplazar todo»', await pB.evaluate('DB.alumnos.length') == 7 and await pB.evaluate('DB.registros.length') == await pg.evaluate('DB.registros.length'))
            # A y B trabajan por separado
            await pg.goto(URL + '#alumno/a3/historial'); await pg.wait_for_selector('.registro'); await pg.evaluate("window.__frases = ['Lectura en parejas', 'leyó con su compañero']"); await pg.click('#fab'); await pg.wait_for_timeout(1300); await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(400)
            await pg.evaluate("(async () => { porId('alumnos', 'a2').telefono = '55 1111 1111'; await guardar('prueba A'); })()"); await pg.wait_for_timeout(300)
            await pB.goto(URL + '#alumno/a3/historial'); await pB.wait_for_selector('.registro'); await pB.evaluate("window.__frases = ['Sesión de autorregulación', 'usó la tarjeta de pausa dos veces']"); await pB.click('#fab'); await pB.wait_for_timeout(1300); await pB.click('.modal button[type=submit]'); await pB.wait_for_timeout(400)
            await pB.evaluate("(async () => { porId('alumnos', 'a2').telefono = '55 2222 2222'; await guardar('prueba B'); })()"); await pB.wait_for_timeout(300)
            await pB.goto(URL + '#alumno/a1/datos'); await pB.wait_for_selector('.docs'); nd = await pB.evaluate('DB.documentos.length')
            await pB.locator('[data-qdoc="d1"]').click(); await pB.click('[data-ok]'); await pB.wait_for_timeout(300)
            chk('borrados: quitar un documento deja marca', await pB.evaluate("DB.borrados.some(b => b.c === 'documentos' && b.id === 'd1')") and await pB.evaluate('DB.documentos.length') == nd - 1)
            deB = await respaldo(pB, 'de_psicologia.json')
            nA = await pg.evaluate('DB.registros.length')
            await pg.goto(URL + '#ajustes'); await pg.set_input_files('#comb', str(deB)); await pg.wait_for_selector('.resumen-comb')
            res = await pg.inner_text('.resumen-comb'); await pg.screenshot(path=OUT / '7_combinar_resumen.png', full_page=True)
            chk('combinar: muestra antes qué va a entrar', 'De Psic. Psicología Ficticio: 1 registro' in res and 'Se actualizan con el cambio más reciente: 1 alumno' in res and 'Se quitan porque alguien los quitó después: 1 documento' in res, res)
            await pg.click('[data-ok]'); await pg.wait_for_timeout(900)
            chk('combinar: no se pierde nada (registros de los dos)', await pg.evaluate('DB.registros.length') == nA + 1 and await pg.evaluate("DB.registros.some(r => r.actividad === 'Lectura en parejas') && DB.registros.some(r => r.actividad === 'Sesión de autorregulación')"))
            chk('combinar: gana el cambio más reciente', await pg.evaluate("porId('alumnos', 'a2').telefono") == '55 2222 2222')
            chk('combinar: lo quitado no reaparece', await pg.evaluate("!porId('documentos', 'd1')"))
            chk('combinar: queda en la bitácora', 'Combinación del respaldo de Psic. Psicología Ficticio' in await pg.inner_text('main'))
            # De regreso: B combina el respaldo de A y quedan iguales
            deA = await respaldo(pg, 'de_apoyo.json')
            await pB.goto(URL + '#ajustes'); await pB.set_input_files('#comb', str(deA)); await pB.wait_for_selector('.resumen-comb'); await pB.click('[data-ok]'); await pB.wait_for_timeout(900)
            q = "JSON.stringify([DB.registros.map(r => r.id).sort(), DB.alumnos.map(a => a.telefono), DB.documentos.map(d => d.id).sort()])"
            chk('combinar: los dos dispositivos quedan iguales', await pB.evaluate(q) == await pg.evaluate(q))
            await pg.goto(URL + '#ajustes'); await pg.set_input_files('#comb', str(deA)); await pg.wait_for_selector('.resumen-comb')
            chk('combinar dos veces lo mismo no duplica', 'No hay nada nuevo' in await pg.inner_text('.resumen-comb'), await pg.inner_text('.resumen-comb'))
            await pg.click('.modal [data-no]')
            # Respaldo de la 1.2 (sin sellos): se combina sin duplicar
            j = json.loads(deA.read_text()); d = j['datos']
            for c in ['usuarios', 'escuelas', 'grupos', 'alumnos', 'registros', 'evidencias', 'documentos', 'informes']:
                for x in d[c]: x.pop('_m', None)
            for c in ['planes', 'valoraciones']:
                for x in d[c].values(): x.pop('_m', None)
            d.pop('borrados', None); d['config'].pop('_m', None); d['usaer'].pop('_m', None); j['version'] = '1.2.0'
            viejo = OUT / 'respaldo_1_2_sin_sellos.json'; viejo.write_text(json.dumps(j))
            await pg.set_input_files('#comb', str(viejo)); await pg.wait_for_selector('.resumen-comb')
            chk('combinar respaldo de la 1.2 sin duplicar', 'No hay nada nuevo' in await pg.inner_text('.resumen-comb'), await pg.inner_text('.resumen-comb'))
            await pg.click('.modal [data-no]'); await ctxB.close()
            # Dirección: solo consulta
            await pg.reload(); await pg.select_option('#quien', 'u4'); await pg.fill('#clave', '0000'); await pg.click('button[type=submit]')
            await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('.seccion')
            chk('dirección sin edición', await pg.locator('#fab').count() == 0 and await pg.locator('[data-sec]').count() == 0)
            # Dirección: escribe en la carpeta general de la escuela
            await pg.goto(URL + '#escuela/e1'); await pg.wait_for_selector('#nota'); n1 = await pg.locator('.registro').count()
            await pg.click('#nota'); dests = await pg.locator('#r_dest option').count()
            chk('dirección solo elige carpetas generales', dests == 2, str(dests))
            await pg.fill('#r_act', 'Visita de supervisión'); await pg.fill('#r_obs', 'Se acuerda revisar consentimientos pendientes.')
            await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(500)
            chk('dirección guarda nota en carpeta general', await pg.locator('.registro').count() == n1 + 1 and 'Asunto' in await pg.locator('.registro').first.inner_text())
            chk('dirección puede anular su nota', await pg.locator('[data-anular]').count() >= 1)
            await pg.screenshot(path=OUT / '6_carpeta_general.png', full_page=True)
            # Celular
            m = await b.new_context(viewport={'width': 390, 'height': 800}, device_scale_factor=2); await m.add_init_script(FAKE_SR); mp = await m.new_page()
            await mp.goto(URL); await mp.fill('#clave', '0000'); await mp.click('button[type=submit]'); await mp.click('#demo'); await mp.wait_for_selector('a.carpeta')
            await mp.screenshot(path=OUT / '4_celular_portada.png')
            for h in ['#alumno/a1/historial', '#alumno/a1/plan', '#inicio']:
                await mp.goto(URL + h); await mp.wait_for_timeout(400)
                w = await mp.evaluate('document.documentElement.scrollWidth'); chk('sin desbordamiento en celular ' + h, w <= 390, str(w))
            await mp.goto(URL + '#alumno/a1/historial'); await mp.evaluate("window.__frases=['Lectura de cuento','respondió dos preguntas']"); await mp.click('#fab'); await mp.wait_for_timeout(1500)
            await mp.screenshot(path=OUT / '5_celular_dictado.png')
            chk('sin errores de consola', not errs, str(errs[:5]))
            await b.close()
    finally:
        srv.terminate()
    print('RESULTADO', sum(ok), 'de', len(ok))
asyncio.run(main())
