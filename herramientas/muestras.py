"""Genera el plan y el informe de muestra (datos ficticios) en docs/."""
import asyncio, pathlib, subprocess, sys, time
from playwright.async_api import async_playwright
RAIZ = pathlib.Path(__file__).resolve().parent.parent; URL = 'http://localhost:8769/index.html'
M = {'top': '1.5cm', 'bottom': '1.5cm', 'left': '1.6cm', 'right': '1.6cm'}
async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8769', '--directory', str(RAIZ)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            pg = await (await b.new_context(viewport={'width': 1100, 'height': 900})).new_page()
            await pg.goto(URL); await pg.fill('#clave', '0000'); await pg.click('button[type=submit]'); await pg.click('#demo'); await pg.wait_for_selector('a.carpeta')
            await pg.goto(URL + '#alumno/a1/plan'); await pg.wait_for_selector('.seccion')
            await pg.click('[data-prop=Noviembre]'); await pg.wait_for_selector('#f_logros'); await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(300)
            await pg.click('#ver'); await pg.wait_for_selector('#hoja'); await pg.emulate_media(media='print')
            await pg.pdf(path=str(RAIZ / 'docs/Ejemplo_Plan_de_intervencion.pdf'), format='Letter', margin=M); await pg.emulate_media(media='screen'); await pg.click('#cer')
            await pg.goto(URL + '#alumno/a1/informes'); await pg.click('#gi'); await pg.click('.modal button[type=submit]'); await pg.wait_for_selector('#hoja')
            await pg.emulate_media(media='print'); await pg.pdf(path=str(RAIZ / 'docs/Ejemplo_Informe_corte_noviembre.pdf'), format='Letter', margin=M)
            await b.close()
    finally: srv.terminate()
asyncio.run(main())
