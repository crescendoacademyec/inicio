# Herramientas de Crescendo Academy

La carpeta principal local es `herramientas-pedagogicas`; no es necesario crear una carpeta `inicio` dentro de ella. `/inicio/` es el prefijo de publicación de GitHub Pages.

```text
herramientas-pedagogicas/
├── index.html                 # Escuela
├── herramientas/
│   ├── index.html             # Catálogo público
│   └── <programa>/            # Todos los programas, incluidos los ocultos
├── mi-crescendo/              # Portal
├── escuela/                   # Estilos, imágenes, vídeo y scripts institucionales
├── shared/                    # Recursos compartidos y comprobaciones
└── auditorias/                # Informes y pruebas
```

La escuela se publica en `https://crescendoacademyec.github.io/inicio/`.
El catálogo está en `https://crescendoacademyec.github.io/inicio/herramientas/`.
Cada herramienta vive en su propia carpeta aquí, por ejemplo:
`https://crescendoacademyec.github.io/inicio/herramientas/piano-virtual/`.

Las antiguas carpetas de redirección de los programas se retiraron de la raíz. Los enlaces internos utilizan las rutas nuevas; los marcadores externos con las rutas antiguas deben actualizarse. Las herramientas ocultas conservan su visibilidad anterior en el catálogo.

Comprobar estructura, páginas, enlaces y recursos locales:
`node --test shared/tool-routes.test.cjs` desde la raíz.
