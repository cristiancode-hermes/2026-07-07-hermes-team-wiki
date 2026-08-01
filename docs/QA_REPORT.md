# QA Report — Hermes Team Wiki

## Resumen
✅ **PASS** — Builds verificados, 51 tests pasando, cobertura de lógica de negocio crítica.

## Build
- `nest build`: ✅
- `ng build`: ✅ (9 warnings de imports no usados en Angular)

## Tests
- **Existentes (previos):** 1 test (AppController "Hello World")
- **Nuevos añadidos:** 50 tests
- **Total:** 51 tests — **6 suites, 0 fallos, 0 pendientes**

### Tests nuevos por suite
| Suite | Tests | Cobertura |
|-------|-------|-----------|
| `AuthService` | 8 | register (éxito + email duplicado), login (credenciales, usuario no encontrado, password inválido, cuenta inactiva), getProfile |
| `PagesService` | 13 | findAll (con/sin spaceId, vacío), findOne, findBySlug (con/sin espacio), create (con/sin parent), update, remove, getVersions, revertToVersion (éxito + version no encontrada) |
| `SpacesService` | 8 | findAll (con pageCount), findOne, create (con/sin author), update, remove |
| `CommentsService` | 11 | findByPage, findOne, create, update (dentro/después de ventana, no autor), remove (dentro/después de ventana, no autor) |
| `OrgService` | 9 | getMembers, updateMemberRole (admin ok, no-admin, no encontrado, auto-cambio), removeMember (admin ok, no-admin, no encontrado, auto-eliminación) |

## Auditoría

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Build API** | ✅ | `nest build` sin errores |
| **Build Web** | ⚠️ | `ng build` exitoso con 9 warnings de `NG8113` (imports no usados en templates) |
| **Lint API** | ⚠️ | **224 errores**: mayoritariamente `prettier/prettier` (formato), algunos `@typescript-eslint/no-unused-vars` y `no-unsafe-assignment` |
| **Types** | ⚠️ | error TS151002 en ts-jest (Node16/18/Next con `isolatedModules: false`), errores TS1240 en decoradores de entidades/DTOs (compatibilidad decorators experimentales vs TS 5.7) |
| **Documentación** | ✅ | ARCHITECTURE.md, API.md, FRONTEND.md, DATABASE.md, DECISIONS.md, LEARNINGS.md — completos y detallados |
| **Edge Cases** | ⚠️ | Tests cubren: email duplicado, cuenta inactiva, página no encontrada, espacio no encontrado, comentario fuera de ventana de edición, permisos de admin, auto-cambio de rol |
| **Design Compliance** | ✅ | `styles.css` implementa fielmente el design system (Indigo primary, Slate secondary, Amber accent, Emerald success, Yellow warning, Red danger). Componentes usan tokens correctamente (`bg-secondary-50`, `text-primary-600`, etc.) |
| **Test Angular** | ❌ | El `angular.json` solo define targets `build` y `serve`. No hay test builder configurado. `skipTests: true` en todos los schematics. Sin dependencias de testing en `package.json`. |

## Issues

### [🔥 Alta] Angular sin configuración de testing
**Archivo:** `apps/web/angular.json` y `apps/web/package.json`
**Problema:** La aplicación Angular no tiene target `test` configurado. No hay karma/jasmine/jest como dependencias. Imposible ejecutar tests en el frontend.
**Solución:** Agregar un test runner (Jest o Karma), configurar `angular.json` con el target `test`, y escribir tests para los componentes y servicios Angular.

### [🔥 Alta] 224 errores de lint en el API
**Archivo:** `apps/api/src/**`
**Problema:** La mayoría son de formato Prettier (objetos multilínea, imports en una línea). También hay variables sin usar (`homePage`, `space` en `auth.service.ts`, `IsOptional`, `IsIn`, `ApiPropertyOptional` en DTOs), y accesos inseguros a `any`.
**Solución:** Ejecutar `npx prettier --write src/` y eliminar imports/variables no usados.

### [⚠️ Media] Error de configuración TypeScript + ts-jest
**Archivo:** `apps/api/tsconfig.json`
**Problema:** `isolatedModules: false` con module `nodenext` causa warning TS151002 en ts-jest. Los decoradores de TypeORM no son compatibles con TypeScript 5.7 en modo estándar (TS1240).
**Solución:** Si se usa TypeORM con decoradores, usar `experimentalDecorators: true` (ya está) y considerar `isolatedModules: true` o eliminar advertencias con `diagnostics.ignoreCodes`.

### [⚠️ Media] Unused imports en componentes Angular (9 warnings)
**Archivos:** `page-view-page.component.ts`, `search-results-page.component.ts`, `profile-page.component.ts`, `page-tree.component.ts`, `space-detail-page.component.ts`, `space-list-page.component.ts`
**Problema:** NG8113 warnings por imports (DatePipe, RouterLink, SkeletonLoaderComponent, ErrorStateComponent) que no se usan en los templates.
**Solución:** Revisar y remover imports no utilizados de cada componente.

### [📝 Baja] Prettier/formato de código
**Archivo:** Todo el API
**Problema:** 224 errores de formato Prettier. Estilo inconsistente en imports y parámetros.
**Solución:** `cd apps/api && npx prettier --write src/`

## Recomendaciones

1. **Prioridad máxima:** Configurar test runner para Angular (Karma + Jasmine o Jest con `@angular-builders/jest`)
2. **Antes de producción:** Ejecutar `prettier --write` en el API para limpiar los 224 errores de formato
3. **Agregar tests de integración (e2e):** El `test/app.e2e-spec.ts` existe pero solo prueba GET / → "Hello World"
4. **Agregar tests de DashboardService, Fts5Service y NotificationsService** para cobertura completa del backend
5. **Fix de compatibilidad TS:** Evaluar migración a `isolatedModules: true` o ajustar configuración de ts-jest
