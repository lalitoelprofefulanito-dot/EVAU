# EVAU · Expediente Vivo de Atención USAER/UDEEI (versión 1.7.1)

Prototipo de aplicación web (PWA) para sustituir la carpeta física de la maestra de apoyo.
**Usar solo con datos ficticios.** Clave de acceso: **0000**.

## Cómo usarla
- **Probar en la computadora:** abrir `index.html` con Chrome o Edge.
- **Publicar en GitHub Pages:** subir a un repositorio `index.html`, `manifest.webmanifest`, `sw.js` y la carpeta `icons/`; activar Pages. Con la dirección https funciona el dictado por voz del navegador, se puede instalar en el celular y abre sin internet.
- **Dictado por voz:** botón «🎙 Dictar» (Chrome o Edge, con internet y permiso de micrófono). Solo funciona en la dirección https (GitHub Pages), no abriendo el archivo. En cualquier celular también sirve el micrófono del teclado.

## Qué incluye
- **Portada = la carpeta:** buscador y lista de alumnos.
- **Registro de un toque:** el botón verde empieza a escuchar. La primera frase queda como actividad y el resto como observación. Marcas opcionales: logro, dificultad, apoyo brindado; área del plan y nivel de apoyo (ayuda total → independiente).
- **Expediente:** registro cronológico, plan de intervención, informes, datos y documentos (consentimiento, plan, informe final anterior, etc.), evidencias y valoración opcional.
- **Plan de Intervención Educativa** con los apartados del formato que usa la USAER; «Revisión rápida» con los criterios de la revisión del plan; impresión/PDF y Word.
- **Registro de evaluación (noviembre, marzo, junio)** que se llena con el registro cronológico.
- **Informes de corte** que analizan los registros: fortalezas, dificultades persistentes, apoyos, avance en el nivel de apoyo, comunicación con la familia y recomendaciones.
- **Bitácora de incidencia** imprimible, carpetas de grupo, estadística 911 USAER-1, respaldo con documentos, bitácora de acciones.
- **Alumnos con y sin diagnóstico (1.2):** «En detección» y las tres «Dificultad severa de conducta / comunicación / aprendizaje» no llevan plan de intervención ni evaluación psicopedagógica: su caja de documentos pide solo consentimiento e informe final del ciclo, y solo pueden generar el informe final del ciclo (1.3.1: sin informe para la familia ni pestaña de valoración, confirmado por la maestra el 23/11/2026). En la carpeta se muestran como «Sin diagnóstico». Con diagnóstico, la caja pide además informe psicopedagógico, psicológico y de comunicación.
- **Documentos por área (1.7.1):** la caja de documentos de cada alumno se agrupa como entrega cada área: maestra de apoyo (plan en oct.–nov., evaluación psicopedagógica e informe final al fin de ciclo), psicología y comunicación (plan e informe final). El informe de psicología solo aplica si el psicólogo determinó el diagnóstico y no cuenta como falta.
- **Evaluación psicopedagógica e informe final de la maestra de apoyo (1.7.0):** pestaña «Evaluación e informe final» con el **Informe de evaluación psicopedagógica** (17 apartados; personal participante y firmas del equipo de la escuela) y el **Informe final** (presentación, habilidades, fortalezas, áreas de oportunidad, comunicación, social, competencia curricular por campo formativo, BAP, recursos, acciones de la USAER, recomendaciones, evaluación y observaciones), con la estructura de los formatos de la maestra de apoyo. «✨ Llenar con lo que ya hay» propone, solo en cuadros vacíos, texto del plan, de comunicación y de los registros marcados como logro. Los alumnos sin diagnóstico solo llevan el informe final.
- **Área de psicología (1.6.0):** pestaña «Psicología» con el **Plan de atención / intervención** (modalidad, sesiones, periodo, DX y una o más áreas de desarrollo con funciones, secuencia de actividades, indicadores, campos formativos, aprendizajes facilitados y adecuaciones) y el **Informe final de psicología** (datos personales, dominios conceptual, práctico y social, y sugerencias a padres y maestro de grupo), con la estructura de los formatos de los psicólogos de la USAER. El informe guardado marca «Informe psicológico» en la caja de documentos. «Pedir por voz» entiende «plan / informe de psicología de…».
- **Pedir por voz, clave personal, CURP y respaldos (1.5.0)** (lo platicado con la maestra de apoyo el 25/11/2026):
  - Botón **«🗣 Pedir»** arriba: se le habla como a un secretario («nuevo registro de Juan», «imprime el plan de Ana», «informe de comunicación de Luis», «descarga el respaldo», «ve a escuelas»). Si el nombre se parece a varios, pregunta a quién.
  - **Clave personal:** cada quien entra con 0000 hasta que la cambia en Ajustes → «Cambiar mi clave». Se guarda solo una huella (SHA-256), viaja en el respaldo y otra persona puede volverla a 0000. Protege la entrada; no cifra los datos.
  - **CURP:** se revisa el formato, se guarda en mayúsculas y no se deja repetir. Al combinar, un alumno dado de alta en otro aparato con la misma CURP se une a la carpeta que ya existe.
  - **Combinar varios respaldos a la vez** (corte mensual de la directora) y **aviso** en la portada cuando lleva 7 días o más sin descargar el respaldo.
- **Catálogo de la Plantilla interna y logotipos (1.4.1):** las condiciones siguen la Plantilla interna de la USAER (estructura del 911 USAER-1): «Dificultad severa de conducta / comunicación / aprendizaje» y las cinco aptitudes sobresalientes. Los datos anteriores se convierten solos. En Ajustes se cargan dos logotipos opcionales para el plan y los formatos de comunicación. `herramientas/insumos_formulario.gs` crea un formulario de Google para reunir los insumos pendientes.
- **Área de comunicación (1.4.0):** pestaña «Comunicación» en cada alumno con el **Plan de intervención individual** (funciones o capacidades con sus actividades, PDA, campos formativos y contenidos, metodologías y materiales) y el **Informe final de comunicación** (diagnóstico, etapa del lenguaje, descripción por componentes y recomendaciones para padres y docentes), con la estructura de los formatos de la maestra de comunicación de la USAER (24/11/2026). Se imprimen o bajan a Word con el encabezado institucional, edad en años.meses y firmas de la maestra de comunicación y la directora. El informe guardado marca «Informe de comunicación» en la caja de documentos. Ajustes agrega dependencias, zona escolar, lugar y leyenda del año para los encabezados.
- **Equipo de cada escuela (1.3.2):** en Ajustes → Profesionales se marcan las escuelas que atiende cada persona (la maestra de apoyo suele tener una o dos, y cada escuela puede tener otro psicólogo). El plan de intervención pone en «Participantes» solo al equipo de la escuela del alumno, y la pantalla Escuelas muestra el equipo de cada una. La maestra de comunicación, única en la USAER, se deja sin escuelas marcadas y aparece en todas (explicado por la maestra el 23/11/2026).
- **Carpeta general de la escuela (1.2):** notas de cada visita, por escuela. Dirección consulta todo y escribe solo aquí.
- **Combinar respaldos (1.3):** cada dato guarda cuándo cambió y quién lo cambió (`_m`), y lo que se quita deja una marca (`borrados`). «Combinar un respaldo» junta lo de otro dispositivo con lo de este sin perder nada: si el mismo dato cambió en los dos, gana el cambio más reciente. Antes de aplicar muestra qué va a entrar. «Reemplazar todo» queda solo para un dispositivo nuevo.
- **Dictado por voz reutilizable (1.3),** según el documento «Dictado por voz en aplicaciones web»: el micrófono se vuelve a encender solo tras cada pausa, escribe solo lo definitivo, respeta lo corregido a mano, no duplica las frases repetidas de Android y explica cada error. Hay 🎙 en todos los cuadros de texto de los formularios (en las listas, cada pausa es un renglón), búsqueda de alumnos diciendo el nombre (aunque se diga mal) y guía «Cómo dictar aquí» con un ejemplo que sale del mismo lector.

## Dónde se guarda la información
Solo en el navegador del dispositivo (IndexedDB). No hay servidor: la información se comparte con «Descargar respaldo» y «Combinar un respaldo» (ver Ajustes → «Cómo trabajar en equipo con respaldos»).

## Estructura
```
index.html              Aplicación completa (se genera; no editar a mano)
manifest.webmanifest    Instalación en celular
sw.js                   Funcionamiento sin internet (solo archivos de la app)
icons/                  Iconos
src/                    Código fuente: base.html, estilos.css, 01-nucleo.js, 02-pantallas.js, 03-expediente.js
herramientas/           construir.py (une src/ en index.html), prueba.py (105 comprobaciones, simula el micrófono y dos dispositivos), muestras.py, iconos.py
docs/                   QUE_HACE_EVAU.pdf, INSUMOS_REQUERIDOS.md, PROMPT_CONTINUIDAD.html, Ejemplo_Plan_de_intervencion.pdf, Ejemplo_Informe_corte_noviembre.pdf
```
Para cambiar algo: editar `src/`, ejecutar `python3 herramientas/construir.py .` y subir la versión en `sw.js` (CACHE) y en `01-nucleo.js` (VERSION).

## Origen de los catálogos
- Plan de intervención: apartados, áreas y tipos del formato «Plan de Intervención Educativa» de la USAER (sin datos de ningún alumno real).
- Bitácora de incidencia: clasificación y antecedentes de una bitácora escolar de uso real.
- Estadística: catálogo de condiciones de la Plantilla interna de la USAER (estructura del 911 USAER-1).
- Los documentos «Evaluación psicopedagógica» de versiones anteriores se renombran solos a «Informe de evaluación psicopedagógica».
- Los datos de respaldos 1.0 se convierten solos al formato nuevo (función `migrar`).

## Pendientes
1. Probar el dictado real en el celular de la maestra (Android o iPhone) y ajustar la separación actividad/observación.
2. Confirmar con la dirección de la USAER el encabezado del plan («Condición del alumno» o el texto original) y el resto del formato.
3. Validar los tipos de registro y las marcas con las maestras.
4. Para datos reales: claves personales, cifrado, respaldo automático, servidor para trabajo en equipo y autorización de la autoridad.
5. Grabación de audio dentro de la app; entrega-recepción entre ciclos.
6. **Sincronización automática** (pedido de la directora, 19/11/2026; la 1.3 ya combina respaldos a mano). Siguiente paso: probar con un prototipo las cuentas de Gmail y Drive de cada persona: un espacio por maestro de apoyo (4) donde da de alta sus escuelas, su psicólogo por escuela, la maestra de comunicación y la directora. Requiere servidor y decidir cómo entran comunicación y dirección a los cuatro espacios.
7. Plan de atención de psicología (recibido el 23/11/2026, falta integrarlo) e informe psicológico, informe psicopedagógico e informe final del maestro de apoyo (formatos por recibir). Comunicación ya está en la 1.4.0.
