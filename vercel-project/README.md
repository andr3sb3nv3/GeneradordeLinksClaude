# Generador de Enlaces - Atenea Growth

Generador de URLs cortas inteligentes que redirigen a propuestas comerciales personalizadas (Desktop/Mobile). Deployado en Vercel con Vercel Postgres.

## Arquitectura

```
Frontend (Vite + React)  →  Vercel Edge Network (CDN)
API Serverless Functions  →  /api/links (POST) + /api/links/[slug] (GET)
Base de Datos             →  Vercel Postgres (gratuito)
```

## Deploy en Vercel (paso a paso)

### 1. Subí el repo a GitHub

```bash
git init
git add .
git commit -m "Migración a Vercel"
git remote add origin https://github.com/TU_USUARIO/generador-enlaces.git
git push -u origin main
```

### 2. Importá el proyecto en Vercel

1. Andá a [vercel.com/new](https://vercel.com/new)
2. Seleccioná tu repo de GitHub
3. **Framework Preset**: Vite
4. **Build Command**: `vite build` (viene por defecto)
5. **Output Directory**: `dist` (viene por defecto)
6. Hacé clic en **Deploy**

### 3. Creá la base de datos Postgres

1. En el dashboard de Vercel, andá a **Storage**
2. Hacé clic en **Create Database** → **Postgres**
3. Elegí un nombre (ej: `atenea-links-db`)
4. Seleccioná la región más cercana (ej: `sao1` para Argentina)
5. Hacé clic en **Create**
6. Conectá la DB al proyecto: **Connect to Project** → seleccioná tu proyecto

> Vercel inyecta automáticamente las variables de entorno `POSTGRES_URL`, etc.

### 4. Redeploy

Después de vincular la DB, hacé un redeploy para que tome las variables:

1. Andá a **Deployments** en tu proyecto
2. Hacé clic en los 3 puntos del último deploy → **Redeploy**

### 5. Configurá tu dominio

1. Andá a **Settings** → **Domains**
2. Agregá tu dominio (ej: `propuestas.ateneagrowth.com`)
3. Configurá los DNS según las instrucciones de Vercel

### 6. Verificá que funciona

```bash
# Health check
curl https://TU_DOMINIO/api/health

# Crear un link de prueba
curl -X POST https://TU_DOMINIO/api/links \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test","desktopPayload":"dGVzdA==","mobilePayload":"dGVzdA=="}'
```

## Estructura del proyecto

```
├── api/
│   ├── health.ts              # GET /api/health
│   └── links/
│       ├── index.ts           # POST /api/links (crear link)
│       └── [slug].ts          # GET /api/links/:slug (obtener payloads)
├── src/
│   ├── App.tsx                # Frontend principal
│   ├── main.tsx               # Entry point React
│   └── index.css              # Tailwind import
├── index.html
├── package.json
├── vercel.json                # Rewrites para SPA + slugs
├── vite.config.ts
└── tsconfig.json
```

## Cambios respecto a la versión anterior (Google AI Studio + Render)

| Antes | Ahora |
|-------|-------|
| Express monolítico (`server.ts`) | Serverless functions (`/api/`) |
| Render.com hosting | Vercel (gratuito) |
| `pg` + connection string manual | `@vercel/postgres` (auto-config) |
| `@google/genai` dependency | Eliminada (no se usaba) |
| URLs hardcodeadas a Render | `window.location.origin` dinámico |
| Cold starts de 30-50s | Cold starts < 1s |

## Límites del plan gratuito de Vercel Postgres

- 256 MB de storage
- 60 horas de compute por mes
- Suficiente para ~50,000+ links
