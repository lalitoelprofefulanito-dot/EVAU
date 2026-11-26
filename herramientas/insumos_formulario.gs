/**
 * EVAU · Formulario de insumos pendientes (versión 1.6.0, 25/11/2026)
 *
 * Qué hace: crea en SU cuenta de Google un formulario con los insumos que faltan
 * para terminar EVAU y una hoja de cálculo donde se guardan las respuestas.
 *
 * Cómo usarlo:
 *   1. Abra https://script.google.com con su cuenta y toque «Nuevo proyecto».
 *   2. Borre lo que aparece, pegue TODO este código y guarde (ícono de disquete).
 *   3. Arriba elija la función «crearFormularioInsumos» y toque «Ejecutar».
 *   4. La primera vez Google pide permisos: «Revisar permisos» → su cuenta →
 *      «Configuración avanzada» → «Ir a … (no seguro)» → «Permitir».
 *      (Es «no seguro» solo porque el script lo hizo usted y no Google.)
 *   5. Abajo, en «Registro de ejecución», aparecen tres enlaces:
 *        - el formulario para RESPONDER (este se manda a su hermana),
 *        - el formulario para EDITAR (solo para usted),
 *        - la HOJA DE CÁLCULO con las respuestas.
 *      Los mismos enlaces quedan en la pestaña «Enlaces» de la hoja.
 *   6. Cuando haya respuestas: en la hoja, Archivo → Descargar → Microsoft Excel,
 *      y compártale ese archivo a Claude para completar EVAU.
 *
 * Notas:
 *   - Google no permite crear preguntas de «subir archivo» desde un script. Por eso,
 *     para los formatos se pide un ENLACE de Google Drive o avisar que se mandarán
 *     por WhatsApp.
 *   - Varias personas pueden responder (su hermana, la directora, la psicóloga…).
 *     Ninguna pregunta es obligatoria: cada quien llena lo que sabe.
 *   - El formulario pide NO escribir datos de alumnos.
 */

const TITULO = 'EVAU · Insumos pendientes para terminar la aplicación';

function crearFormularioInsumos() {
  const form = FormApp.create(TITULO);
  form.setDescription(
    'Este formulario reúne lo que falta para terminar EVAU, la carpeta digital de la USAER.\n\n' +
    '• Conteste solo lo que sepa. Si una parte la sabe otra persona (la directora, la psicóloga, la maestra de comunicación), ' +
    'escriba quién es al final de esa sección y compártale este mismo formulario.\n' +
    '• Pueden responder varias personas; cada respuesta se guarda por separado.\n' +
    '• NO escriba nombres ni datos de alumnos.\n\n' +
    'Gracias. Con esto se terminan los formatos que faltan.'
  );
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('¡Gracias! Su respuesta quedó guardada. Si alguna parte la sabe otra persona, compártale este formulario.');

  // ---------- 0. Quién responde ----------
  form.addSectionHeaderItem().setTitle('¿Quién responde?');
  form.addTextItem().setTitle('Su nombre');
  opciones(form.addMultipleChoiceItem().setTitle('Su función en la USAER'),
    ['Maestra(o) de apoyo', 'Psicología', 'Comunicación', 'Directora de la USAER'], true);

  // ---------- 1. Celular, dictado y «Combinar» ----------
  seccion(form, '1. Celular, dictado y respaldos',
    'Para saber si el micrófono de EVAU funciona en los celulares del equipo.');
  opciones(form.addMultipleChoiceItem().setTitle('¿Qué celular usa?'), ['Android', 'iPhone'], true);
  form.addTextItem().setTitle('Marca y modelo del celular (ejemplo: Samsung A15)');
  opciones(form.addMultipleChoiceItem().setTitle('¿Con qué navegador abre EVAU?'),
    ['Chrome', 'Samsung Internet', 'Safari', 'Edge', 'Todavía no la abro'], true);
  opciones(form.addMultipleChoiceItem().setTitle('¿Probó dictar con el botón verde «Nuevo registro»?'),
    ['Sí, funcionó bien', 'Sí, pero tuvo problemas', 'Todavía no lo pruebo']);
  opciones(form.addMultipleChoiceItem().setTitle('Al hacer una pausa, ¿la actividad y la observación quedaron en su cuadro correcto?'),
    ['Sí, siempre', 'A veces', 'No', 'Todavía no lo pruebo']);
  opciones(form.addMultipleChoiceItem().setTitle('¿Probó «Combinar un respaldo» con el archivo de una compañera?'),
    ['Sí, funcionó bien', 'Sí, pero tuvo problemas', 'Todavía no lo pruebo']);
  form.addParagraphTextItem().setTitle('Si hubo problemas con el dictado o con los respaldos, descríbalos (qué hizo y qué pasó)');
  quienSabe(form);

  // ---------- 2. Marcas y niveles de apoyo ----------
  seccion(form, '2. Marcas y niveles de apoyo del registro',
    'Son las opciones que se tocan al guardar un registro. Sirven para que EVAU arme solo los informes.');
  opciones(form.addCheckboxItem().setTitle('¿Qué marcas le sirven? (marque todas las que use)'),
    ['Logro', 'Dificultad', 'Apoyo brindado']);
  form.addParagraphTextItem().setTitle('¿Qué marca falta o cuál cambiaría?');
  opciones(form.addCheckboxItem().setTitle('¿Qué niveles de apoyo le sirven? (marque todos los que use)'),
    ['Ayuda total', 'Modelado', 'Indicación verbal', 'Recordatorio visual', 'Independiente']);
  form.addParagraphTextItem().setTitle('¿Qué nivel de apoyo falta o cuál cambiaría?');
  quienSabe(form);

  // ---------- 3. Encabezado del plan ----------
  seccion(form, '3. Encabezado del Plan de Intervención',
    'Es el renglón que va antes de la condición del alumno en cada hoja del plan.');
  opciones(form.addMultipleChoiceItem().setTitle('¿Qué texto debe llevar?'),
    ['CONDICIÓN DEL ALUMNO:', 'EL ALUMNO PRESENTA UNA BARRERA DE APRENDIZAJE Y PARTICIPACIÓN ASOCIADA A:', 'No sé; lo decide la directora'], true);
  quienSabe(form);

  // ---------- 4. Formatos en blanco ----------
  seccion(form, '4. Formatos que faltan (en blanco o con datos tapados)',
    'Para cada formato, suba el archivo a Google Drive, compártalo «Cualquier persona con el enlace» y pegue aquí el enlace. ' +
    'Si es más fácil, mándelo por WhatsApp a Eduardo. Si su USAER no usa ese formato, márquelo.\n' +
    'Ya NO hacen falta: Plan de intervención, formatos de comunicación, formatos de psicología (plan e informe final), Ámbito ni Plantilla interna.');
  [
    'Informe final de alumnos SIN diagnóstico (En detección o Dificultad severa)',
    'Informe de seguimiento (si es distinto del Plan de intervención)',
    'Informe psicopedagógico (evaluación psicopedagógica)',
    'Informe final del maestro de apoyo',
    'Formato de detección inicial'
  ].forEach(nombre => {
    opciones(form.addMultipleChoiceItem().setTitle(nombre + ': ¿cómo lo envía?'),
      ['Pego el enlace de Drive abajo', 'Lo mando por WhatsApp a Eduardo', 'Lo tiene otra persona (escribo quién al final)', 'Nuestra USAER no usa este formato']);
    form.addTextItem().setTitle(nombre + ': enlace de Google Drive');
  });
  quienSabe(form);

  // ---------- 5. Cuándo se entrega cada informe ----------
  seccion(form, '5. Cuándo se entrega cada informe',
    'Marque en qué meses se entrega cada uno. Así EVAU avisa cuándo falta.');
  form.addCheckboxGridItem().setTitle('Meses de entrega')
    .setRows(['Informe psicopedagógico', 'Informe final del maestro de apoyo', 'Informe de seguimiento', 'Informe final de alumnos sin diagnóstico'])
    .setColumns(['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']);
  form.addParagraphTextItem().setTitle('Algo más sobre las fechas (por ejemplo: «solo a alumnos de nuevo ingreso»)');
  quienSabe(form);

  // ---------- 6. Datos reales y trabajo en equipo ----------
  seccion(form, '6. Para usar EVAU con datos reales (lo decide la directora)',
    'Hoy EVAU solo debe usarse con datos de prueba. Estas respuestas dicen qué falta para usarla con alumnos reales.');
  opciones(form.addMultipleChoiceItem().setTitle('¿La directora autoriza usar EVAU con datos reales de alumnos?'),
    ['Sí, por escrito', 'Sí, de palabra', 'Todavía no', 'Falta preguntarle']);
  opciones(form.addMultipleChoiceItem().setTitle('¿La autoridad educativa tiene un aviso de privacidad para estos datos?'),
    ['Sí, lo mando a Eduardo', 'No', 'No sé']);
  opciones(form.addMultipleChoiceItem().setTitle('Claves para entrar a EVAU'),
    ['Seguir con 0000 mientras sea de prueba', 'Que cada persona tenga su propia clave', 'Lo decide la directora']);
  form.addTextItem().setTitle('¿Quién se encarga de guardar y juntar los respaldos de todo el equipo? (nombre y cargo)');
  opciones(form.addCheckboxItem().setTitle('¿Qué cuentas de correo usa el equipo para trabajar?'),
    ['Gmail personal de cada quien', 'Correo de la USAER (@seg.gob.mx)', 'Ninguna para esto'], true);
  quienSabe(form);

  // ---------- 7. Cierre ----------
  seccion(form, '7. Para terminar', '');
  form.addParagraphTextItem().setTitle('¿Algo más que EVAU deba hacer o que le estorbe?');

  // ---------- Hoja de respuestas ----------
  const hoja = SpreadsheetApp.create(TITULO + ' (respuestas)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  const enlaces = hoja.insertSheet('Enlaces', 0);
  enlaces.getRange('A1:B4').setValues([
    ['Qué', 'Enlace'],
    ['Formulario para RESPONDER (mándelo a su hermana)', form.getPublishedUrl()],
    ['Formulario para EDITAR (solo usted)', form.getEditUrl()],
    ['Esta hoja de respuestas', hoja.getUrl()]
  ]);
  enlaces.getRange('A1:B1').setFontWeight('bold');
  enlaces.setColumnWidth(1, 380); enlaces.setColumnWidth(2, 600);
  enlaces.getRange('A1:B4').setFontSize(14).setFontFamily('Arial');

  Logger.log('Formulario para RESPONDER (mándelo a su hermana): ' + form.getPublishedUrl());
  Logger.log('Formulario para EDITAR (solo usted): ' + form.getEditUrl());
  Logger.log('Hoja con las respuestas: ' + hoja.getUrl());
}

/* ---------- Ayudantes ---------- */
function seccion(form, titulo, ayuda) {
  form.addPageBreakItem().setTitle(titulo).setHelpText(ayuda || '');
}
function opciones(item, lista, conOtro) {
  item.setChoiceValues(lista);
  if (conOtro) item.showOtherOption(true);
  return item;
}
function quienSabe(form) {
  form.addTextItem().setTitle('Si no sabe algo de esta sección: ¿quién lo sabe? (nombre y cargo; compártale este formulario)');
}
