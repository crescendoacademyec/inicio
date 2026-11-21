# Manual de usuario — Editor Crescendo

Editor Crescendo es un espacio para escribir, revisar y reproducir ejercicios de notación musical. Los cambios se conservan localmente en el navegador hasta que el ejercicio se guarda en la biblioteca o se exporta.

## 1. Que es el Cuaderno de estudio
El Cuaderno de estudio es un editor ligero de partituras pensado para preparar ejercicios, ejemplos de clase, fragmentos de analisis y materiales breves de estudio. Permite escribir notas, silencios, acordes, cifrados, texto, dinamicas, articulaciones, compases, claves, repeticiones, casillas, escenas y archivos exportables.

La app esta orientada a trabajo rapido: se puede escribir con teclado de computador, mouse, teclado MIDI o combinando estos metodos. El resultado se puede guardar como ejercicio local, exportar como archivo JSON del cuaderno o exportar como MusicXML para abrirlo en programas de notacion.

## 2. Seguridad del trabajo y memoria local
El cuaderno guarda automaticamente una copia local del canvas mientras se trabaja. Si la pagina se refresca por error, al volver a abrir el cuaderno se restaura el trabajo local que estaba en el canvas.

La memoria local incluye:

notas, silencios, acordes y compases;
sistemas y pentagramas;
cifrados, textos, dinamicas y marcas;
zoom, cursor y seleccion;
titulo, descripcion y escenas del ejercicio.
Esta memoria vive en el navegador. No sustituye el guardado formal de ejercicios, porque depende del mismo navegador y dispositivo. Para conservar un material de manera intencional, use Archivo > Guardar en biblioteca o Archivo > Guardar o exportar.

## 3. Estructura general de la pantalla
La pantalla tiene cuatro zonas principales:

Archivo, Escenas y Ayuda: menus superiores para cargar, guardar, importar, exportar, organizar versiones del ejercicio y consultar este manual dentro de la app.
Barra principal del editor: contiene seleccion, escritura, figuras, ligaduras, compases, tempo, claves, articulaciones, armaduras, dinamicas, herramientas de acordes, barras, reordenamiento, MusicXML, escenas, pantalla completa, BPM, Jazz mode y reproduccion.
Canvas de partitura: zona central donde se escribe y edita la musica.
Panel MIDI inferior: incluye una tira de figuras y herramientas MIDI, un boton de modo acorde y un teclado desde A0 hasta C8.

## 4. Menu Archivo
El menu Archivo administra ejercicios completos.

Ejercicios muestra los ejercicios locales y los ejercicios incluidos con la app.

Titulo y Descripcion permiten nombrar el material y escribir una indicacion breve para el estudiante.

Cargar abre el ejercicio seleccionado y reemplaza el contenido actual del canvas.

Guardar guarda el estado actual como ejercicio local en el navegador.

Exportar descarga un archivo JSON del cuaderno. Este archivo conserva el ejercicio, su metadata y sus escenas. Es el formato mas seguro para volver a importar exactamente el material en el Cuaderno de estudio.

Exportar XML descarga un archivo MusicXML. Sirve para llevar la musica a programas de notacion. MusicXML exporta la informacion musical principal, pero puede no reproducir exactamente todos los detalles visuales del canvas.

Importar permite cargar un archivo JSON previamente exportado desde el cuaderno.

Eliminar local elimina el ejercicio local seleccionado del navegador. No borra archivos que ya hayan sido exportados.

## 5. Escenas
Las escenas son capturas del estado del ejercicio. Sirven para preparar una secuencia de pasos, comparar versiones o crear una ruta de estudio.

Guardar escena captura el estado actual del canvas y pide un nombre breve.

Ir carga la escena seleccionada.

Reescribir reemplaza la escena seleccionada con el estado actual del canvas.

Escena anterior y Escena siguiente navegan por la lista.

Mover arriba y Mover abajo cambian el orden de las escenas.

Borrar elimina la escena seleccionada.

Repaso y Ejercicio cambian el modo de navegacion. En ambos casos se recorren escenas, pero el mensaje de estado distingue si se esta usando como repaso o como ejercicio.

5A. Menu Ayuda
El menu Ayuda abre este manual dentro del cuaderno.

La ventana de ayuda incluye:

indice automatico por secciones;
buscador de texto;
resaltado de coincidencias;
contador de resultados;
cierre con el boton x, click fuera del panel o tecla Escape.
Use el indice para recorrer el manual por tema. Use el buscador para encontrar rapidamente herramientas como Gen., Gen↑, MusicXML, Escenas, Drops, Tuplets, Jazz mode o Cif..

## 6. Cursor, grid y escritura basica
La seleccion y el cursor de escritura son estados diferentes. Un click selecciona el elemento sin crear una nota sombra. Shift + N, Return o doble click sobre el pentagrama inicia la escritura; Escape vuelve a seleccion y apaga los modificadores activos.

El cursor indica voz, compas y pulso activos. L1 usa plicas superiores y L2 plicas inferiores. Las letras que aparecen junto al cursor muestran modificadores activos:

Q: construir un acorde sin avanzar el cursor.
I: insertar y desplazar el contenido posterior.
L: conservar las duraciones existentes y reescribir solamente alturas.
O: forzar la duracion elegida sin dividirla en limites metricos internos.
K: elegir primero la altura y confirmarla despues con una figura.
El selector Grid define el paso con el que se mueve el cursor horizontalmente. Por ejemplo, si el grid esta en corcheas, las flechas izquierda/derecha avanzan o retroceden por corcheas.

El grid es independiente de la ultima figura escrita. En el mapa espanol de Dorico, Alt/Option + 1 lo hace mas grueso y Alt/Option + 2 mas fino. Durante la entrada de notas, Space avanza el cursor por la duracion activa. V pasa a la siguiente voz y Shift + V crea o activa la segunda voz disponible.

La escritura puede hacerse de varias formas:

Seleccione una figura y haga click en el canvas.
Use el teclado de computador para escribir alturas.
Use el teclado MIDI inferior.
Use un teclado MIDI conectado.
El cuaderno completa y normaliza ritmos de manera automatica: ajusta silencios, verifica duraciones de compas y reorganiza ciertos grupos ritmicos cuando corresponde.

## 7. Figuras, silencios y puntillos
La paleta Figuras contiene duraciones desde garrapatea hasta cuadrada, silencios equivalentes y puntillos.

Atajos numericos:

1: garrapatea (1/128).
2: semifusa (1/64).
3: fusa (1/32).
4: semicorchea (1/16).
5: corchea (1/8).
6: negra (1/4).
7: blanca (1/2).
8: redonda.
9: cuadrada o breve.
El Cuaderno usa un unico mapa de teclado, basado directamente en los comandos de Dorico. Sus popovers abren la herramienta equivalente disponible:

Shift + B: barras y barras de compas.
Shift + C: claves.
Shift + D: dinamicas.
Shift + H: calderones, respiraciones y cesuras.
Shift + I: herramientas de notas y Drops.
Shift + K: armaduras.
Shift + M: signaturas de medida.
Shift + O: ornamentos.
Shift + P: tecnicas de ejecucion disponibles en Articulaciones.
Shift + Q: cifrados.
Shift + R: repeticiones.
Shift + T: tempo.
Shift + X: texto.
Shift + Alt/Option + X: texto de sistema.
Ñ: tuplets.
Shift + Ñ: terminar la escritura de tuplets.
Los popovers de Dorico que no tienen todavía un equivalente musical real en el Cuaderno, como letras, digitaciones, bajo cifrado o cues, no se reasignan a otra función.

El punto . activa o desactiva el puntillo. Alt/Option + . recorre cero, uno y dos puntillos. El doble puntillo tambien esta disponible desde la paleta.

Para escribir silencios, use los botones de silencio en la paleta o la tira MIDI inferior. Durante la entrada de notas, la coma , activa o desactiva el modo silencio; una letra de nota o Y escribe entonces el silencio explicito de la duracion activa.

## 8. Alturas y alteraciones
Las letras del teclado escriben notas segun la altura musical correspondiente. Las flechas arriba/abajo mueven el cursor o la nota seleccionada por pasos diatonicos.

Atajos principales:

Flecha arriba/abajo durante la escritura: mover la altura del cursor.
Alt/Option + flecha arriba/abajo: subir o bajar diatonicamente una nota seleccionada.
Shift + flecha arriba/abajo: subir o bajar una octava las notas o compases seleccionados del pentagrama activo. Conserva ritmo, alteraciones y las otras partes; admite deshacer. Si selecciona solo cabezas de un acorde, mueve solo esas cabezas. También se conserva Cmd/Ctrl + Alt/Option + flecha arriba/abajo.
¡: sostenido.
': bemol.
0: becuadro.
Shift + Alt/Option + A-G: escribir la nota indicada por encima de la altura actual.
Cmd + A-G en macOS o Ctrl + Alt + A-G en Windows: escribirla por debajo.
La app intenta mantener una escritura enarmonica coherente. Cuando el contexto de cifrado esta disponible, la ortografia de las notas se calcula a partir del cifrado, no solo del MIDI.

## 9. Seleccion y edicion
El boton de seleccion activa el modo de seleccion.

La paleta de seleccion incluye:

Seleccion simple.
Seleccionar todo.
Seleccionar clase.
Voz superior.
Voz inferior.
Seleccionar figura.
Convertir seleccion a L2.
Operaciones utiles:

Backspace o Delete: borrar seleccion, marca, texto o nota activa.
Cmd/Ctrl + Z: deshacer.
Cmd/Ctrl + Shift + Z o Cmd/Ctrl + Y: rehacer.
Cmd/Ctrl + C: copiar seleccion.
Cmd/Ctrl + V: pegar en el punto activo.
R: repetir la ultima nota o la seleccion.
El menu contextual aparece con click derecho o gesto equivalente. Desde ahi se pueden cambiar duraciones, alteraciones, barrados, colores, opacidad, plicas, ligaduras, copiar, pegar, duplicar y borrar.

## 10. Modo edicion
Ed. activa el modo de edicion. Este modo permite manipular elementos ya escritos con mas precision.

Puede usarse para editar notas, acordes, silencios, marcas, textos y otros objetos del canvas. Al seleccionar elementos, aparecen acciones contextuales segun el tipo de objeto.

## 11. Modo desplazamiento
El boton D activa el modo desplazamiento. No ocupa un atajo de Dorico; Shift + D queda reservado al popover de dinamicas.

En este modo, al insertar o borrar, el contenido puede correrse en el tiempo en vez de reemplazarse directamente. Es util para insertar material en medio de una frase sin reconstruir todo el compas.

## 12. Lineas y voces
El menu de herramientas contiene L1 y L2.

L1 escribe en la linea o voz principal.

L2 escribe en una segunda linea. Esto permite escribir dos voces dentro del mismo sistema.

Atajos:

V: pasar a la siguiente voz.
Shift + V: crear o activar la segunda voz.
La seleccion puede convertirse a L2 desde la paleta de seleccion.

## 13. Ligaduras
La paleta de ligaduras contiene:

Ligadura de prolongacion.
Ligadura de fraseo.
Ligadura de fraseo punteada.
Atajos:

T: ligadura de prolongacion.
S: ligadura de fraseo.
Shift + S: terminar una ligadura iniciada durante la escritura.
Las ligaduras pueden aplicarse desde la paleta o desde el menu contextual de una nota.

## 14. Tresillos y tuplets
La paleta de tuplets incluye:

Tresillo de corcheas.
Tresillo de negras.
Seisillo de semicorcheas.
Tuplet irregular x:y.
Al activar un tuplet, la siguiente escritura usa esa subdivision. Para tuplets irregulares, la app pide la proporcion.

## 15. Compases y amalgamas
La paleta de compases incluye:

2/2.
2/4.
3/4.
4/4.
6/8.
9/8.
12/8.
Amalgama.
Tambien se puede escribir un compas personalizado desde los menus contextuales, por ejemplo 5/4 o una amalgama como 2+3/8.

La app ajusta la duracion del compas y verifica que el contenido ritmico encaje.

## 16. Armaduras
El boton de armadura permite escribir tonalidades. La armadura se aplica desde el compas activo.

La escritura de alteraciones toma en cuenta la armadura: una nota que ya esta incluida en la armadura no necesita accidental escrito, mientras que una alteracion fuera de armadura se muestra explicitamente.

## 17. Claves y sistemas
La paleta de claves incluye:

Clave de sol.
Clave de do.
Clave de fa.
Clave de sol octavada arriba.
Clave de sol octavada abajo.
Clave de fa octavada arriba.
Clave de fa octavada abajo.
Clave de percusion.
Puede agregarse un pentagrama, una linea de percusion o quitarse el sistema activo desde la paleta Canvas o el menu contextual.

En partituras con dos sistemas, muchas funciones armonicas pueden usar el primer sistema como voces superiores y el segundo como bajo.

## 18. Tempo y reproduccion
La paleta de tempo permite escribir marcas como:

Negra igual a un valor.
Corchea igual a un valor.
Blanca igual a un valor.
Figuras con puntillo.
Texto de tempo.
El control BPM define la reproduccion local.

El boton de reproduccion inicia o detiene la reproduccion MIDI desde la seleccion o desde el punto activo.

La barra de espacio tambien reproduce o detiene.

## 19. Jazz mode
Jazz mode activa una interpretacion ritmica con swing.

Presets disponibles:

Straight: sin swing.
Light: subdivision aproximada 60/40.
Medium: subdivision aproximada 66/33.
Hard: subdivision aproximada 72/28.
Jazz mode afecta la reproduccion, no necesariamente la escritura visual.

## 20. Dinamicas, articulaciones y marcas
La paleta de dinamicas incluye:

ppp, pp, p, mp, mf, f, ff, fff.
Crescendo.
Diminuendo.
Textos cresc. y dim..
La paleta de articulaciones incluye acentos, staccato, tenuto, marcato, fermatas, respiraciones, caesuras, ornamentos y marcas de jazz o instrumentos.

Los atajos de articulacion del mapa espanol de Dorico tambien estan disponibles: ! acento, " staccato, · marcato, % enfasis, & staccatissimo, $ tenuto, ( portato y / sin enfasis.

Se pueden sumar varias articulaciones a una misma nota o cabeza de acorde. El Cuaderno las apila automaticamente sin colisiones y las coloca siempre al lado opuesto de la plica; por eso cambian de lado si cambia la direccion de la voz o de la plica.

Las marcas pueden moverse, colorearse, cambiar opacidad o borrarse desde el menu contextual. Los reguladores admiten una sola direccion por punto: < y > sustituyen la direccion existente, en vez de superponer dos reguladores.

## 21. Texto, cifrado y dinamicas libres
El boton T activa texto libre.

El boton C7 activa escritura de cifrado.

El boton de dinamicas permite escribir dinamicas y textos dinamicos.

Al escribir o editar texto aparece un editor flotante. Ese editor permite varias lineas: use Enter para crear saltos de linea. El cuadro crece mientras escribe para mostrar el contenido. Para terminar y conservar lo escrito, haga click fuera del cuadro, pulse Cmd/Ctrl + Enter o pulse Escape.

La barra de texto permite ajustar:

fuente;
tamano;
color;
enclosure;
justificacion.
Los textos existentes tienen menu contextual para editar contenido, duplicar, copiar, borrar, cambiar color, tamano, opacidad, fuente, enclosure y alineacion. Tambien se puede copiar la apariencia a todos los textos del mismo tipo.

## 22. Cifrados y generacion armonica
El cuaderno puede reconocer y generar acordes a partir de cifrados.

Cif.
Cif. reconoce el cifrado de las notas seleccionadas o del contenido escrito. Es util para convertir notas ya escritas en simbolos de acorde.

AutoCif.
AutoCif. activa un modo en el que se tocan acordes en el teclado MIDI y la app escribe el cifrado automaticamente.

Gen.
Gen. genera notas desde un cifrado.

Comportamiento general:

escribe bajo en registro grave;
escribe un acorde superior de minimo cuatro notas aparte del bajo;
usa notas obligatorias del cifrado;
agrega notas opcionales cuando hacen falta para completar el acorde superior;
si todavia faltan notas, puede duplicar el bajo dentro del bloque superior;
corrige clusters problematicos;
usa escritura enarmonica coherente con el cifrado;
mantiene la logica de notas guia del generador original cuando corresponde.
Gen↑
Gen↑ genera notas desde un cifrado usando una nota ya escrita como voz superior.

Uso:

Escriba una nota en el pulso del cifrado.
Escriba o seleccione el cifrado en ese mismo pulso.
Pulse Gen↑.
Comportamiento:

la nota escrita se conserva como voz superior;
el acorde se cierra hacia abajo desde esa nota;
se agrega bajo grave aparte;
el acorde superior tiene minimo cuatro notas;
se usan opcionales si ayudan a completar el acorde;
si hace falta, puede duplicarse el bajo en el bloque superior;
no se promedia hacia C4;
la voz inferior del bloque superior no esta obligada a ser nota guia;
conserva la correccion de clusters y la escritura enarmonica del generador.
En cifrados ambiguos como 7alt, la nota superior puede seleccionar una variante compatible. Por ejemplo, si la melodia implica b5, la app puede elegir una variante con b5 aunque el default de 7alt sea otra sonoridad.

## 23. Herramientas de voicing
La paleta Drops contiene herramientas de disposicion:

Auto-drops.
Auto-skips.
Drop 2.
Drop 3.
Drop 2-4.
Skip 2.
Skip 3.
Skip 2-4.
Rotar arriba.
Rotar abajo.
Repartir.
Linea 1.
Linea 2.
Estas herramientas trabajan sobre acordes o selecciones y sirven para transformar disposiciones cerradas en disposiciones abiertas, rotar voces o repartir notas.

## 24. Barras de compas, repeticiones y casillas
La paleta de barras incluye:

barra simple;
barra doble;
barra final;
inicio de repeticion;
fin de repeticion;
doble repeticion.
La paleta de casillas incluye:

primera casilla;
segunda casilla;
casilla abierta;
casilla cerrada.
Estas marcas se aplican al compas o frontera correspondiente y pueden editarse desde el menu contextual.

## 25. Canvas, zoom y sistemas
La paleta Canvas incluye:

color;
agregar pentagrama;
agregar linea de percusion;
quitar sistema activo;
agregar compas;
quitar compas;
ocultar/mostrar compas;
alejar;
zoom actual;
acercar.
Atajos de zoom:

Cmd/Ctrl + +: acercar.
Cmd/Ctrl + -: alejar.
Cmd/Ctrl + 0: volver a 100%.
Z: acercar.
X: alejar.
Reorg. reorganiza la partitura: recalcula espaciado, normaliza ciertos ritmos y actualiza la distribucion visual.

## 26. Exportacion MusicXML
El boton XML o Archivo > Guardar o exportar > MusicXML descarga un archivo MusicXML.

Use MusicXML cuando quiera abrir el material en MuseScore, Dorico, Finale u otro programa de notacion.

La exportacion incluye informacion musical principal como notas, ritmos, compases, claves, armaduras, textos, cifrados y marcas compatibles. Algunos detalles visuales propios del canvas pueden no traducirse exactamente.

## 27. Teclado MIDI inferior
El panel MIDI inferior tiene tres partes:

Tira de figuras y herramientas.
Boton Acorde.
Teclado MIDI visual.
La tira MIDI permite elegir duraciones, silencios, tuplets y herramientas armonicas (Cif., AutoCif., Gen↑, Gen.).

El boton Acorde cambia entre escritura melodica y escritura simultanea de acordes.

El teclado visual permite escribir o probar notas con el mouse.

Si hay un teclado MIDI conectado, la app puede capturar notas y acordes.

## 28. Menu contextual
El menu contextual es una de las formas mas rapidas de trabajar. Segun donde se haga click, aparecen opciones distintas:

Sobre una nota o acorde:

cambiar duracion;
convertir en silencio;
alterar notas;
cambiar color;
cambiar opacidad;
cambiar cabeza de nota;
conectar o separar barrado;
invertir plicas;
ajustar extremos de barrado;
agregar ligaduras;
copiar, pegar, duplicar o borrar.
Sobre texto, cifrado o dinamica:

editar contenido;
duplicar;
copiar;
borrar;
cambiar color, tamano, opacidad, fuente, enclosure o alineacion;
copiar apariencia a todos los elementos del mismo tipo.
Sobre el canvas:

crear texto libre;
crear cifrado;
crear dinamica;
escribir tonalidad;
agregar o quitar sistemas;
insertar o quitar compases;
ocultar o mostrar compases;
pegar contenido;
ajustar zoom.
Sobre marcas:

cambiar tipo;
editar texto o numeral;
invertir;
cambiar color u opacidad;
copiar o borrar.

## 29. Colores y apariencia de elementos
El cuaderno permite cambiar color de:

una figura o acorde;
una cabeza especifica dentro de un acorde;
todas las notas iguales;
la seleccion;
una voz completa;
textos, cifrados, dinamicas y marcas.
Tambien permite cambiar opacidad en varios niveles.

El modo administrador de apariencia existe para ajustes profundos de iconos, fuentes y espaciado, pero no forma parte del flujo normal del estudiante.

## 30. Pantalla completa
El boton de pantalla completa amplia el area de trabajo para escribir o revisar sin distracciones.

Puede combinarse con zoom y reorganizacion para preparar una vista comoda antes de proyectar en clase.

## 31. Flujo recomendado para crear un ejercicio
Abra el cuaderno.
Escriba titulo y descripcion en Archivo.
Configure compas, armadura y clave inicial.
Escriba el material musical.
Use cifrados, textos y dinamicas para explicar el objetivo.
Si necesita varios pasos, guarde escenas.
Use Reorg. para limpiar el espaciado.
Guarde en Archivo > Guardar.
Exporte JSON si quiere conservar una copia externa.
Exporte MusicXML si necesita terminar la edicion en otro programa.

## 32. Flujo recomendado para generar acordes desde cifrados
Para usar Gen.:

Escriba el cifrado.
Seleccione el cifrado o coloque el cursor donde quiere generar.
Pulse Gen..
Revise bajo, disposicion y enarmonias.
Para usar Gen↑:

Escriba la nota melodica superior.
Escriba el cifrado en el mismo pulso.
Seleccione el cifrado.
Pulse Gen↑.
La nota escrita queda como soprano del acorde.

## 33. Atajos principales
Escritura y navegacion:

1 a 9: seleccionar duraciones desde garrapatea hasta cuadrada.
Shift + N: iniciar o cerrar entrada de notas.
Q: modo acorde.
I: modo insertar.
L: bloquear duraciones y repitch.
O: forzar duracion.
K: altura antes de duracion.
V: pasar a la siguiente voz.
Shift + V: crear o activar una voz nueva.
,: activar o desactivar modo silencio.
Ñ: abrir tuplet irregular.
Shift + Ñ: cerrar escritura de tuplet.
Space: avanzar por la duracion activa durante la entrada de notas.
Y: escribir la altura actual del cursor o un silencio en modo silencio.
Alt/Option + 1: grid mas grueso.
Alt/Option + 2: grid mas fino.
Letras de nota: escribir alturas.
Shift + Alt/Option + A-G: elegir la nota indicada por encima.
Cmd + A-G en macOS o Ctrl + Alt + A-G en Windows: elegirla por debajo.
Flechas izquierda/derecha: mover cursor o seleccion.
Flechas arriba/abajo: mover altura.
Alt/Option + flecha arriba/abajo: mover una nota diatonicamente.
Shift + flecha arriba/abajo: subir o bajar una octava las notas o compases seleccionados del pentagrama activo. Conserva ritmo, alteraciones y las otras partes; admite deshacer. Si selecciona solo cabezas de un acorde, mueve solo esas cabezas. También se conserva Cmd/Ctrl + Alt/Option + flecha arriba/abajo.
Alt/Option + flecha izquierda/derecha: desplazar la seleccion por el grid activo.
Shift + Alt/Option + flecha izquierda/derecha: recortar o alargar las duraciones seleccionadas por el grid activo.
Return: entrar o salir de escritura.
Backspace o Delete: borrar.
Edicion:

Cmd/Ctrl + Z: deshacer.
Cmd/Ctrl + Shift + Z: rehacer.
Cmd/Ctrl + Y: rehacer.
Cmd/Ctrl + C: copiar.
Cmd/Ctrl + X: cortar.
Cmd/Ctrl + V: pegar.
Cmd/Ctrl + Shift + A: seleccionar todo.
Cmd/Ctrl + D: deseleccionar.
R: repetir seleccion.
F: invertir plicas o marca seleccionada.
Alt/Option + N: mover notas al pentagrama superior.
Alt/Option + M: mover notas al pentagrama inferior.
Alteraciones:

¡: sostenido.
': bemol.
0: becuadro.
Ligaduras y articulacion:

T: ligadura de prolongacion.
S: ligadura de fraseo.
Shift + S: terminar ligadura de fraseo durante la escritura.
.: puntillo.
Alt/Option + .: recorrer cantidad de puntillos.
!: acento.
": staccato.
·: marcato.
%: enfasis.
&: staccatissimo.
$: tenuto.
(: portato.
/: sin enfasis.
<: crescendo.
>: diminuendo.
Popovers equivalentes:

Shift + B: barras de compas.
Shift + C: claves.
Shift + D: dinamicas.
Shift + H: calderones, respiraciones y cesuras.
Shift + I: herramientas de notas y Drops.
Shift + K: armaduras.
Shift + M: signaturas de medida.
Shift + O: ornamentos.
Shift + P: tecnicas de ejecucion disponibles.
Shift + Q: cifrados.
Shift + R: repeticiones.
Shift + T: tempo.
Shift + X: texto.
Shift + Alt/Option + X: texto de sistema.
Vistas:

Space: reproducir o detener fuera de la entrada de notas.
P: reproducir desde la seleccion.
Cmd/Ctrl + +: acercar.
Cmd/Ctrl + -: alejar.
Cmd/Ctrl + 0: zoom 100%.
Z: acercar.
X: alejar.
Escape: volver a seleccion.
Voces:

V: voz siguiente.
Shift + V: crear o activar voz nueva.

## 34. Consejos de uso
Guarde escenas antes de hacer transformaciones grandes. Las escenas son una forma rapida de volver a un estado anterior dentro del mismo ejercicio.

Use Archivo > Guardar o exportar para conservar una copia fuera del navegador.

Use Reorg. despues de insertar muchos compases, tuplets o marcas.

Si un acorde generado no tiene la disposicion deseada, use las herramientas de Drops, rotacion o reparto.

Si una nota aparece con enarmonia inesperada, revise el cifrado: la app usa el contexto del cifrado para decidir la ortografia cuando ese contexto esta disponible.

## 35. Problemas comunes
Si refresco la pagina por error: el cuaderno restaura el trabajo local guardado automaticamente.

Si no veo un cambio reciente: recargue la pagina. Las versiones de los archivos se actualizan para evitar cache, pero el navegador puede tardar unos segundos.

Si el MusicXML no se ve igual en otro programa: revise el archivo en el programa de notacion. MusicXML prioriza informacion musical y puede reinterpretar espaciado o apariencia.

Si el teclado MIDI no responde: revise permisos del navegador, conexion del dispositivo y que no haya otra app usando el MIDI.

Si un compas se llena y necesita seguir escribiendo: al llegar al final, el cuaderno puede pedir cuantos compases agregar.

Si una seleccion no responde como espera: pulse Escape para volver al modo seleccion y vuelva a seleccionar el elemento.

## 36. Mapa rapido de herramientas
Esta seccion resume donde esta cada grupo de funciones.

Menu superior:

Archivo: ejercicios, titulo, descripcion, cargar, guardar, exportar JSON, exportar XML, importar y eliminar local.
Escenas: modo repaso/ejercicio, selector de escenas, guardar, ir, reescribir, navegar, mover y borrar.
Ayuda: abre este manual con indice y buscador.
Barra principal:

Seleccionar: cambia al modo de seleccion y abre acciones de seleccion.
Ed.: activa edicion detallada.
Figuras: duraciones, silencios y puntillos.
Grid: define la unidad de movimiento del cursor.
Ligadura: prolongacion, fraseo y fraseo punteado.
Tuplets: tresillo de corcheas, tresillo de negras, seisillo y tuplet irregular.
Compas: 2/2, 2/4, 3/4, 4/4, 6/8, 9/8, 12/8 y amalgama.
Tempo: marcas metronomicas y texto de tempo.
Clave: claves de sol, do, fa, octavadas y percusion.
Articulaciones: acentos, staccato, tenuto, marcato, fermatas, respiraciones, caesuras, ornamentos y signos instrumentales.
Armadura: tonalidad desde el compas activo.
Dinamicas: dinamicas, crescendo, diminuendo y textos dinamicos.
Casillas: primera, segunda, abierta y cerrada.
Canvas: color, sistemas, compases, visibilidad de compas y zoom.
Drops: drops, skips, rotaciones, reparto y voces L1/L2.
Barras: barras simples, dobles, finales y repeticiones.
Reorg.: reorganiza la partitura visualmente.
XML: exporta MusicXML.
Guardar escena: captura el estado actual como escena.
Escenas: abre la paleta rapida de escenas.
Pantalla completa: amplia el area de trabajo.
BPM: valor de reproduccion.
Jazz mode: presets de swing para playback.
Play: reproduce o detiene.
Controles de escritura:

Nota: la siguiente escritura crea notas.
Silencio: la siguiente escritura crea silencios.
Deshacer y Rehacer: controlan el historial.
D: modo desplazamiento.
T: texto libre.
C7: cifrado.
Limpiar: limpia el contenido del canvas.
Barra de texto:

Fuente: cambia la familia tipografica.
Tamano: cambia el tamano del texto seleccionado o activo.
Color: cambia el color.
Enclosure: aplica marco, circulo, rectangulo u otra envoltura disponible.
Alineacion: define la justificacion del texto.
Panel MIDI:

Tira de figuras: duraciones y herramientas armonicas rapidas.
Acorde: alterna escritura melodica y escritura simultanea.
Teclado visual: permite escribir notas con mouse.
Teclado MIDI externo: permite capturar notas y acordes si el navegador lo autoriza.

## 37. Como buscar una funcion en la ayuda
Abra Ayuda > Abrir manual.

Para navegar por secciones, use el indice lateral. En pantallas pequenas, el indice aparece como una fila horizontal desplazable.

Para buscar, escriba una palabra en el campo de busqueda. El manual resalta las coincidencias y muestra cuantas encontro. Algunas busquedas utiles:

Gen para generacion armonica.
Escenas para repaso y secuencias.
MusicXML o XML para exportacion.
MIDI para teclado inferior y dispositivos externos.
Tuplet o Tresillo para subdivisiones irregulares.
Drop o Skip para disposiciones de acordes.
Cifrado para simbolos armonicos.
Si una busqueda no encuentra resultados, pruebe una palabra mas corta. Por ejemplo, use escena en vez de una frase larga.

## 38. Cobertura del manual
El manual cubre las funciones visibles para el usuario: menus superiores, canvas, escritura, seleccion, edicion, voces, ligaduras, tuplets, compases, armaduras, claves, tempo, reproduccion, Jazz mode, dinamicas, articulaciones, texto, cifrados, generacion armonica, voicings, barras, casillas, sistemas, MusicXML, MIDI, menu contextual, apariencia de elementos, pantalla completa, flujos recomendados, atajos y problemas comunes.

Las herramientas administrativas de apariencia profunda aparecen solo cuando se entra en modo administrador. No forman parte del flujo normal de clase, por eso se mencionan como administracion y no se documentan paso a paso aqui.

### Escritura con el puntero y cifrados

En modo de escritura, la nota se coloca en la línea o espacio pulsado, también al pulsar sobre un silencio. Pulsar otra altura en el mismo tiempo añade una nota al acorde directamente, sin activar ningún botón; se conserva la duración de la figura existente. Pulsar una cabeza existente permite seleccionarla o cambiar su duración. **Modo acorde (Q)** sigue disponible para mantener el cursor en el mismo tiempo al introducir alturas sucesivas con el teclado. Las líneas superiores, la vista previa y las figuras comparten las posiciones temporales del compás.

La paleta Figuras incluye **Cm7 · Cifrado de acordes**. Actívalo y pulsa un compás para escribir encima del pentagrama. Pulsa el mismo anclaje para editar un cifrado existente. Seleccionar una figura devuelve al modo de escritura. Los cifrados usan el sistema de texto anclado del documento, con deshacer/rehacer y exportación MusicXML.

Las figuras largas también se pueden dibujar en pulsos interiores: después de dos corcheas, una blanca puede empezar en el tiempo 2. Al dibujar con el puntero se conserva la figura escogida, sin dividirla automáticamente en el centro del compás; las barras de compás siguen dividiendo las notas que las cruzan. Las líneas de escritura incluyen esos pulsos y los comienzos/finales de las notas previas.

Clic derecho sobre una barra → **Signatura de medida** o **Armadura** permite cambios desde ese compás. Clic derecho sobre una nota → **Alteraciones** ofrece sostenido, bemol, becuadro y dobles alteraciones, sin cambiar la duración de la nota.

### Ajustar la altura con el teclado

Pulsa la cabeza de una nota existente para seleccionarla y usa ↑ o ↓ para moverla un semitono. Al subir se escriben sostenidos (Do → Do♯ → Re); al bajar, bemoles (Re → Re♭ → Do). Se respetan las armaduras, la duración y la posición rítmica. En un acorde se mueve la cabeza seleccionada. Los cambios admiten deshacer y rehacer.

### Reemplazar figuras y dibujar ligaduras

Con una figura seleccionada, pulsa exactamente la cabeza de una nota para cambiar su duración conservando su altura y las demás notas del acorde. Al acortarla, el tiempo liberado queda como silencio; las notas posteriores mantienen su posición. Al alargarla, se ocupa el tiempo necesario y se conserva la parte restante de la figura siguiente con sus alturas y alteraciones. Si una figura supera el compás, se ofrece repartirla en figuras ligadas tras una confirmación; no se permite cortar parcialmente un grupo irregular. Alt + clic permite seleccionar una cabeza sin cambiar su duración.

Para dibujar una ligadura, escoge una figura y activa la ligadura de frase o de prolongación. Dibuja o selecciona sus dos extremos: la ligadura se completa y la herramienta se desactiva. Puedes cambiar de figura entre ambos extremos. La prolongación requiere notas consecutivas de igual altura sonora, también entre compases; la ligadura de frase admite alturas distintas. Ambos extremos deben estar en el mismo pentagrama y voz. Escape cancela la herramienta. Estas operaciones admiten deshacer y rehacer.

### Conteo previo a la reproducción

Cada reproducción comienza con un compás de preparación: aparecen números grandes animados sobre el pentagrama y suenan clics, con acento en el primer tiempo. El conteo respeta la medida y el tempo vigentes en la posición de inicio, incluida la unidad de las indicaciones de tempo. Por ejemplo, en 3/4 cuenta tres tiempos y en 6/8 cuenta seis corcheas. Las notas y la barra de reproducción comienzan al terminar el conteo. Detener cancela tanto el conteo como la reproducción.

### Figuras que continúan en otro compás

Al dibujar una figura que no cabe, o al aumentar la duración de una nota escrita, aparece un aviso con el tiempo disponible y una propuesta equivalente con ligaduras. En 4/4, una blanca en el tiempo 4 se divide en negra ligada a negra; una redonda se divide en negra ligada a blanca con puntillo. **Sí, escribir con ligaduras** aplica el cambio completo; **No** conserva la escritura. Se añaden compases si hacen falta. Las notas que ocupen el tramo nuevo se reemplazan, conservando los fragmentos que queden fuera. Toda la operación se puede deshacer de una vez. Los grupos irregulares mantienen su protección contra reemplazos parciales.

### Elegir instrumento

El selector de la barra superior cambia el instrumento del pentagrama activo. Los otros pentagramas conservan su instrumento. Al cambiarlo se conserva la altura sonora de la escritura y se ajustan su clave y transposición; la reproducción se detiene para cargar el nuevo sonido. También hay instrumentos de cuerda frotada, metales y maderas. Los sonidos se cargan por SoundFont y requieren conexión la primera vez.

### Cifrados y exportación visual

Los cifrados se muestran con Times New Roman y comparten una altura por pentagrama, calculada a partir de la nota más alta de todo el sistema y de los espacios necesarios para evitar colisiones. En Archivo > Guardar o exportar están disponibles Imagen PNG y PDF. Ambas opciones conservan los símbolos Bravura y omiten el cursor y las guías de escritura.

## 39. Arreglos para varios instrumentos

Abra **Instrumentos > Instrumentos de la partitura**. Elija un instrumento, escriba su nombre (por ejemplo, Violín I) y pulse **Añadir instrumento**. Puede repetir instrumentos y añadir más después de empezar a escribir. El piano nuevo tiene dos pentagramas; los demás instrumentos, uno. Si la partitura aún está vacía, **Comenzar solo con este instrumento** sustituye los pentagramas vacíos por el instrumento elegido.

Cada fila permite activar el pentagrama, cambiar su nombre o sonido, silenciarlo, moverlo hacia arriba o abajo y quitarlo. Las notas no se borran al ocultar un pentagrama. Quitar uno con notas pide confirmación y se puede deshacer. El nombre sobre cada pentagrama también permite activarlo. La tablatura se activa por pentagrama con TAB; los instrumentos de cuerda frotada comienzan con notación convencional.

Los instrumentos transpositores se escriben en su altura escrita y suenan en su altura real: entre ellos, trompeta y clarinete en Si bemol, saxofones, trompa en Fa y contrabajo. Las claves de viola, violonchelo y contrabajo se eligen automáticamente. El editor conserva el registro al copiar una voz; el arreglista decide después si conviene desplazarla de octava para la tesitura del instrumento.

## 40. Enviar las voces del piano a instrumentos

Escriba melodías y voicings en el piano. Seleccione notas o un compás si quiere trabajar solo un fragmento. Abra **Instrumentos > Enviar voces a instrumentos** (también está en Voicings).

Elija el tramo y cómo separar la música:

- **De agudo a grave**: la nota 1 es la más aguda de cada acorde.
- **De grave a agudo**: la nota 1 es la más grave.
- **Voz escrita completa**: copia L1, L2, L3 o L4 con su ritmo independiente.
- **Cabezas seleccionadas**: copia las notas concretas seleccionadas dentro de los acordes.

Añada uno o varios destinos. Cada destino puede ser un instrumento nuevo o un pentagrama existente. Los botones Cuarteto de cuerdas y Sección de metales preparan cuatro destinos que puede modificar. Si en un acorde falta la nota de ese número, el destino recibe silencio; no se duplica otra nota. Para líneas que se cruzan conviene utilizar voces escritas independientes o seleccionar las cabezas deseadas.

La operación copia alturas y duraciones y conserva el original. Puede silenciar todo el piano de origen después de copiar. Un destino con notas coincidentes requiere activar **Reemplazar notas existentes**; los compases fuera del tramo enviado se conservan. El reparto completo se puede deshacer de una vez.

## 41. Consola de canales

Abra **Instrumentos > Consola de canales**. Hay un canal por instrumento; los dos pentagramas de un piano comparten canal. **M** silencia ese instrumento. **S** activa solo: se escuchan únicamente los instrumentos marcados con S. Puede activar varios a la vez. Un instrumento con M permanece silenciado aunque tenga S.

El volumen cambia durante la reproducción. Los botones Reproducir/pausa y Detener permiten escuchar desde la consola. **Desactivar todos los solos** recupera el conjunto manteniendo los mute. Los ajustes se conservan en el proyecto y admiten deshacer/rehacer.

## 42. Página, títulos y letra

Un doble clic en el título, compositor, arreglista o transcriptor de la hoja permite editar ese texto; también puede enfocarlo y pulsar Enter. Archivo conserva los campos para añadir nuevos créditos.

En **Archivo > Configurar página** puede elegir A4, Carta o A3, orientación, márgenes iguales de impresión, máximo de compases automáticos y separación entre pentagramas y sistemas. Seleccione un compás para añadir o quitar un salto de página antes de él desde esa ventana. Los saltos manuales y los símbolos que cruzan sistemas se conservan en la exportación.

Para añadir letra, seleccione una nota y abra **Texto > Letra bajo las notas**. Separe palabras con espacios y sílabas con guiones, por ejemplo `Can-ta con-mi-go`. Cada sílaba se asigna a la siguiente nota de esa voz, omitiendo silencios. Un doble clic en una sílaba permite corregirla. La letra queda vinculada a las notas y se conserva en MusicXML.

MusicXML exporta las partes instrumentales por separado dentro del mismo archivo, con sus nombres, claves, sonidos y transposiciones. Al reabrir un conjunto se importan todas sus partes; no solo la primera. Para conservar también todos los ajustes propios del editor use el archivo de proyecto.

## 43. MIDI del conjunto o por instrumento

Abra **Archivo > Guardar o exportar** o el botón Guardar/exportar y elija MIDI. En Contenido MIDI puede elegir:

- **Conjunto completo**: un archivo MIDI de tipo 1, con una pista por instrumento y una pista de tempo. Los dos pentagramas de un piano se reúnen en su pista.
- **Solo un instrumento**: un MIDI con la parte elegida.
- **Un MIDI por instrumento**: un ZIP con archivos independientes y sus nombres. Todos conservan el mismo inicio y mapa de tempo; impórtelos desde el mismo punto en el DAW.

Los MIDI contienen las alturas que suenan, los sonidos General MIDI, las velocidades, los tempos y el recorrido interpretado de repeticiones, casillas, D.C. y D.S. Si está activada la interpretación jazz, sus desplazamientos rítmicos se incluyen. **Respetar mute y solos** permite limitar la exportación a los instrumentos que se están escuchando; desactivado conserva todos los instrumentos.

Para conjuntos de más de quince instrumentos con altura, el archivo completo asigna puertos MIDI adicionales. El DAW debe respetar esos puertos para mantener aislados sus sonidos; la exportación por instrumento evita depender de esa asignación. MIDI conserva la interpretación, mientras MusicXML conserva la notación para editores de partituras.

## 44. Seleccionar varios compases con el ratón

Mantenga **Shift** y haga clic en cada compás que quiera añadir a la selección. Los compases permanecen marcados, incluso si no son consecutivos o están en otro sistema de la hoja. Repetir Shift + clic sobre un compás ya seleccionado lo mantiene seleccionado, sin duplicarlo. También funciona desde el botón Seleccionar compases.

Un clic sin Shift sustituye la selección por ese compás. Escape limpia la selección. La selección pertenece al pentagrama activo: al elegir otro pentagrama comienza una selección nueva. **Shift + ↑ / ↓** cambia de octava todas las notas de los compases marcados, conservando los compases intermedios que no haya seleccionado.

## 45. Archivo y configuración de proyectos

**Archivo** reúne comandos compactos: Nuevo proyecto, Abrir proyecto, Guardar en biblioteca, Guardar como, Guardar o exportar, Importar partitura, Configurar proyecto, Historial de versiones y Configurar página. Abrir proyecto permite elegir un proyecto de la biblioteca local o abrir su archivo JSON. Guardar en biblioteca conserva el proyecto en la biblioteca; Guardar como descarga el archivo editable. Guardar o exportar reúne PDF, PNG, MusicXML, MIDI y JSON en una sola ventana.

**Nuevo proyecto** abre una ventana para escribir título, compositor, arreglista, transcriptor y descripción, seleccionar la tonalidad de concierto, elegir el compás y establecer de 1 a 1000 compases iniciales. Añada los instrumentos que necesite, incluidos instrumentos repetidos con nombres de parte distintos. El piano genera dos pentagramas. Los transpositores reciben la armadura escrita correspondiente a la tonalidad de concierto. Cancelar conserva el proyecto abierto.

**Configurar proyecto** permite modificar los datos y la tonalidad, o añadir instrumentos después de comenzar. Para cambiar sonidos o quitar instrumentos existentes utilice Instrumentos > Instrumentos de la partitura.

Audio/YouTube inicia cerrado después de recargar, incluso si el proyecto contiene una grabación. Pulse el botón gris para abrirlo: se resaltará en dorado mientras esté abierto. Otro clic lo oculta y pausa el audio.

**F8** abre Instrumentos de la partitura con el selector de instrumento nuevo enfocado. **F9** abre directamente la Consola de canales. Estos atajos no actúan mientras escribe en campos de texto. En teclados que reservan esas teclas para funciones del sistema puede ser necesario mantener Fn.

## 46. Atajos visibles en los menús

Cada comando con atajo lo muestra a su derecha. En macOS se usa ⌘; en Windows y Linux, Ctrl.

| Comando | Mac | Windows / Linux |
| --- | --- | --- |
| Nuevo proyecto | ⌘N | Ctrl+N |
| Abrir proyecto | ⌘A | Ctrl+A |
| Guardar o exportar | ⌘S | Ctrl+S |
| Guardar en biblioteca | ⌘⌥S | Ctrl+Alt+S |
| Guardar como archivo editable | ⌘⇧S | Ctrl+Shift+S |
| Importar partitura | ⌘⇧I | Ctrl+Shift+I |
| Configurar proyecto | ⌘, | Ctrl+, |
| Configurar página | ⌘⇧P | Ctrl+Shift+P |
| Historial | ⌘⇧H | Ctrl+Shift+H |
| Seleccionar todo | ⌘⇧A | Ctrl+Shift+A |
| Añadir instrumentos | F8 | F8 |
| Consola de canales | F9 | F9 |
| Manual | F1 | F1 |

Abrir proyecto usa ⌘A/Ctrl+A en el lienzo. Dentro de los campos, esa combinación conserva la selección de texto. Las ventanas de diálogo mantienen sus propios controles. Escribir, Notación, Texto, Escenas, Reproducir y Ayuda también muestran los atajos disponibles junto a cada acción; los atajos ya existentes de escritura conservan su comportamiento.

## 47. Exportar con tablaturas o solo pentagramas

En **Archivo > Guardar o exportar** elija PDF, Imagen PNG o MusicXML. Si el proyecto incluye un instrumento compatible con tablatura, aparece **Contenido de la partitura**: puede escoger **Solo pentagramas** o **Pentagramas y tablaturas**. El formato MIDI conserva la interpretación y no utiliza esa opción visual. El proyecto JSON conserva la edición completa.

La exportación ajusta los espacios según la opción elegida, sin alterar la vista de trabajo ni su botón TAB. MusicXML con tablatura conserva afinación, cuerdas y trastes; al reabrir en este editor sus TAB generadas no duplican la melodía. Si una digitación no puede representarse dentro de los 22 trastes, se informa del compás para corregirla o elegir solo pentagramas.

Los menús superiores se presentan como listas de texto, sin iconos ni encabezados repetidos. Un clic fuera o Escape cierra el menú. Ayuda > Atajos del teclado reúne las combinaciones disponibles.
