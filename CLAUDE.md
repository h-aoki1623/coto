# Coto — Project Instructions

## OpenAPI TypeScript Type Generation

When backend API schemas change (Pydantic models in `apps/api/src/coto/schemas/`), you MUST regenerate the mobile TypeScript types to keep them in sync.

### Workflow

1. **Export OpenAPI spec** from FastAPI:
   ```bash
   cd apps/api && .venv/bin/python scripts/export_openapi.py openapi.json
   ```

2. **Generate TypeScript types** from the spec:
   ```bash
   cd apps/mobile && npx openapi-typescript ../api/openapi.json -o src/types/generated/api.ts
   ```

3. **Or use the combined Makefile target**:
   ```bash
   make generate-api-types
   ```

4. **Verify** TypeScript compiles:
   ```bash
   cd apps/mobile && npx tsc --noEmit
   ```

### File Structure

- `apps/api/scripts/export_openapi.py` — Extracts OpenAPI JSON from FastAPI app
- `apps/api/openapi.json` — Intermediate file (gitignored)
- `apps/mobile/src/types/generated/api.ts` — Auto-generated types (DO NOT edit manually)
- `apps/mobile/src/types/conversation.ts` — Re-exports from generated types with union literal narrowing
- `apps/mobile/src/types/api.ts` — Client-side types (ApiResponse envelope, SSE TurnEvent) not in OpenAPI

### Rules

- NEVER edit `src/types/generated/api.ts` by hand — it will be overwritten
- When adding/changing API endpoints or response schemas, always run `make generate-api-types`
- SSE event types (`TurnEvent`) are maintained manually in `src/types/api.ts` because SSE is not modelled by OpenAPI
- Screen files should import types from `@/types/conversation` (not define local interfaces)
