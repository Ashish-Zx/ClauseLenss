# ClauseLens Frontend

A chat-first web UI for the ClauseLens RAG engine (FastAPI backend). Ask
questions over your document corpus and get grounded, cited answers — plus a
hybrid search explorer and document manager.

## Stack

- **Next.js 16** (App Router, TypeScript, `src/`)
- **Tailwind CSS v4** + **shadcn/ui** (Radix, Nova preset)
- **next-themes** (light / dark / system)
- **react-markdown** + **remark-gfm** for answer rendering

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Backend URL

The UI calls the FastAPI backend directly from the browser. Configure the base
URL with an env var (defaults to `http://localhost:8000`):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the backend from the repository root:

```bash
uvicorn backend.src.api.main:app --port 8000
```

CORS is already open on the backend for development.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | **Home** — landing page with hero, live index stats, and feature links |
| `/chat` | **Chat** — grounded Q&A with clickable `[n]` citation popovers |
| `/dashboard` | Index health + stats overview |
| `/search` | Hybrid search explorer with per-stage telemetry |
| `/documents` | PDF upload dropzone + document list |

## Structure

```
src/
  app/            Next.js routes (page.tsx per route)
  components/
    layout/       App shell + sidebar ()
    chat/         Chat, markdown viewer, citation popover
    search/       Ranked chunk card with telemetry
    documents/    Upload dropzone
    ui/           shadcn/ui components
  lib/
    api.ts        Typed client mirroring backend Pydantic schemas
```

## Validation

- `npm run build`
- `npm run lint`

The API client types in `src/lib/api.ts` mirror the backend schemas in
`backend/src/schemas/`. Keep them in sync when the backend schema changes.
