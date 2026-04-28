# Sistema de Inscripciones para Gimnasio - Frontend

## 1. Descripción del proyecto

Este repositorio contiene el frontend del Sistema de Inscripciones para Gimnasio desarrollado para SUPERINKA.

El sistema permite gestionar alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes desde una interfaz web. El frontend se comunica con el backend mediante peticiones HTTP y utiliza autenticación basada en JWT.

El proyecto forma parte de una solución web orientada a mejorar la administración de una escuela de gimnasia, permitiendo centralizar la información de alumnos, clases disponibles, horarios asignados, instructores responsables e inscripciones realizadas.

---

## 2. Tecnologías utilizadas

- React
- Vite
- JavaScript
- TailwindCSS
- Fetch API
- Recharts
- LocalStorage para almacenamiento del token de sesión
- Vercel para despliegue del frontend

---

## 3. Requisitos previos

Antes de ejecutar el proyecto, se debe tener instalado:

- Node.js
- npm
- Backend del sistema ejecutándose localmente o desplegado en la nube
- Archivo `.env` correctamente configurado

---

## 4. Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO_FRONTEND
```

Ingresar a la carpeta del proyecto:

```bash
cd gym-frontend
```

Instalar dependencias:

```bash
npm install
```

---

## 5. Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`.

Ejemplo para entorno local:

```env
VITE_API_URL=http://localhost:3000
```

Ejemplo para entorno de producción:

```env
VITE_API_URL=https://URL_DEL_BACKEND_EN_RENDER
```

La variable `VITE_API_URL` indica la URL donde se encuentra ejecutándose el backend.

---

## 6. Ejecución en desarrollo

Para iniciar el frontend en modo desarrollo:

```bash
npm run dev
```

Luego abrir en el navegador:

```txt
http://localhost:5173
```

---

## 7. Compilación para producción

Para generar la versión de producción:

```bash
npm run build
```

La carpeta generada será:

```txt
dist/
```

---

## 8. Estructura principal del proyecto

```txt
src/
├── api.js
├── App.jsx
├── Students.jsx
├── Classes.jsx
├── Schedules.jsx
├── Instructors.jsx
├── Enrollments.jsx
├── Dashboard.jsx
├── Reports.jsx
└── dashboard/
    ├── ClasesDemandadasChart.jsx
    ├── HorariosMasLlenosChart.jsx
    └── ResumenKpiChart.jsx
```

---

## 9. Módulos implementados

### Autenticación

Permite iniciar sesión mediante correo y contraseña. Al iniciar sesión correctamente, el frontend almacena el token JWT para consumir rutas protegidas del backend.

### Panel principal

Muestra las opciones disponibles según el rol del usuario autenticado.

### Gestión de alumnos

Permite registrar, listar, editar y eliminar alumnos dentro del sistema.

### Gestión de clases

Permite administrar las clases de gimnasia, incluyendo nombre, descripción, nivel y capacidad.

### Gestión de horarios

Permite crear y administrar horarios asociados a clases e instructores, indicando día, hora de inicio, hora de fin y sala.

### Gestión de instructores

Permite al administrador gestionar usuarios instructores del sistema.

### Gestión de inscripciones

Permite inscribir alumnos en horarios disponibles, cambiar una inscripción existente o cancelar una inscripción registrada.

### Dashboard

Permite visualizar estadísticas generales del sistema, como cantidad de alumnos, clases, horarios, inscripciones, capacidad total y cupos disponibles.

### Reportes

Permite visualizar reportes relacionados con las inscripciones por clase y por alumno.

---

## 10. Roles del sistema

| Rol | Permisos generales |
|---|---|
| ADMIN | Acceso completo a alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes. |
| INSTRUCTOR | Acceso limitado a módulos operativos permitidos según las reglas del sistema. |

---

## 11. Conexión con el backend

El frontend se conecta con el backend mediante la variable de entorno:

```env
VITE_API_URL=http://localhost:3000
```

Todas las peticiones al backend se centralizan en el archivo:

```txt
src/api.js
```

Este archivo se encarga de:

- Leer el token JWT desde `localStorage`.
- Agregar el token en el header `Authorization`.
- Enviar peticiones HTTP al backend.
- Manejar respuestas y errores básicos de la API.

---

## 12. Despliegue en Vercel

Para desplegar el frontend en producción se utiliza Vercel.

Pasos generales:

1. Subir el repositorio actualizado a GitHub.
2. Ingresar a Vercel.
3. Seleccionar la opción para importar un nuevo proyecto.
4. Conectar el repositorio del frontend.
5. Configurar el framework como Vite.
6. Agregar la variable de entorno:

```env
VITE_API_URL=https://URL_DEL_BACKEND_EN_RENDER
```

7. Ejecutar el despliegue.
8. Verificar que el sistema cargue correctamente en navegador.
9. Validar que el frontend pueda comunicarse con el backend.

---

## 13. Archivos importantes

| Archivo | Descripción |
|---|---|
| README.md | Documentación principal del frontend. |
| .env.example | Ejemplo de variables de entorno necesarias. |
| .gitignore | Archivo que excluye carpetas o archivos que no deben subirse al repositorio. |
| package.json | Archivo con dependencias y scripts del proyecto. |
| src/api.js | Archivo encargado de centralizar la comunicación con el backend. |
| src/App.jsx | Archivo principal de la interfaz del sistema. |

---

## 14. Archivo .env.example

El repositorio incluye un archivo `.env.example` como referencia para configurar el proyecto.

Contenido sugerido:

```env
VITE_API_URL=http://localhost:3000
```

En producción, este valor debe reemplazarse por la URL pública del backend desplegado en Render.

---

## 15. Archivos excluidos del repositorio

El archivo `.gitignore` debe evitar subir archivos sensibles o innecesarios, como:

```gitignore
node_modules
.env
dist
build
.DS_Store
npm-debug.log
```

El archivo `.env` real no debe subirse al repositorio porque puede contener información de configuración sensible.

---

## 16. Estado del proyecto

El frontend se encuentra actualizado con la última versión estable del Sistema de Inscripciones para Gimnasio desarrollado para SUPERINKA.

La rama principal del repositorio es `main` y contiene la versión preparada para entrega final.