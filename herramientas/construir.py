import sys, pathlib
raiz = pathlib.Path(sys.argv[1]); src = raiz / 'src'
css = (src / 'estilos.css').read_text(encoding='utf8')
js = '\n'.join((src / f).read_text(encoding='utf8') for f in ['01-nucleo.js', '02-pantallas.js', '03-expediente.js', '04-comunicacion.js', '05-ordenes.js', '06-psicologia.js', '07-apoyo.js'])
assert '</script' not in js
html = (src / 'base.html').read_text(encoding='utf8').replace('/*CSS*/', css).replace('/*JS*/', js)
(raiz / 'index.html').write_text(html, encoding='utf8'); print('index.html', len(html), 'bytes')
