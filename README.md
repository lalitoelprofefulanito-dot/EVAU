# EVAU · Expediente Vivo de Atención USAER/UDEEI (versión 1.3.2)

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
- **Alumnos con y sin diagnóstico (1.2):** «En detección» y las tres categorías de la estadística de la USAER (problemas severos de comunicación, de conducta y de aprendizaje) no llevan plan de intervención ni evaluación psicopedagógica: su caja de documentos pide solo consentimiento e informe final del ciclo, y solo pueden generar el informe final del ciclo (1.3.1: sin informe para la familia ni pestaña de valoración, confirmado por la maestra el 23/11/2026). En la carpeta se muestran como «Sin diagnóstico». Con diagnóstico, la caja pide además informe psicopedagógico, psicológico y de comunicación.
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
herramientas/           construir.py (une src/ en index.html), prueba.py (69 comprobaciones, simula el micrófono y dos dispositivos), muestras.py, iconos.py
docs/                   QUE_HACE_EVAU.pdf, INSUMOS_REQUERIDOS.md, PROMPT_CONTINUIDAD.html, Ejemplo_Plan_de_intervencion.pdf, Ejemplo_Informe_corte_noviembre.pdf
```
Para cambiar algo: editar `src/`, ejecutar `python3 herramientas/construir.py .` y subir la versión en `sw.js` (CACHE) y en `01-nucleo.js` (VERSION).

## Origen de los catálogos
- Plan de intervención: apartados, áreas y tipos del formato «Plan de Intervención Educativa» de la USAER (sin datos de ningún alumno real).
- Bitácora de incidencia: clasificación y antecedentes de una bitácora escolar de uso real.
- Estadística: estructura oficial del 911 USAER-1, más las tres filas «Problemas severos…» que la USAER usa en su estadística (falta confirmar si el 911 vigente las pide). Lo demás son modelos de uso común, no oficiales.
- Los documentos «Evaluación psicopedagógica» de versiones anteriores se renombran solos a «Informe de evaluación psicopedagógica».
- Los datos de respaldos 1.0 se convierten solos al formato nuevo (función `migrar`).

## Pendientes
1. Probar el dictado real en el celular de la maestra (Android o iPhone) y ajustar la separación actividad/observación.
2. Confirmar con la dirección de la USAER el encabezado del plan («Condición del alumno» o el texto original) y el resto del formato.
3. Validar los tipos de registro y las marcas con las maestras.
4. Para datos reales: claves personales, cifrado, respaldo automático, servidor para trabajo en equipo y autorización de la autoridad.
5. Grabación de audio dentro de la app; entrega-recepción entre ciclos.
6. **Sincronización automática** (pedido de la directora, 19/11/2026; la 1.3 ya combina respaldos a mano). Siguiente paso: probar con un prototipo las cuentas de Gmail y Drive de cada persona: un espacio por maestro de apoyo (4) donde da de alta sus escuelas, su psicólogo por escuela, la maestra de comunicación y la directora. Requiere servidor y decidir cómo entran comunicación y dirección a los cuatro espacios.
7. Informes propios de psicología y comunicación, con sus formatos.
