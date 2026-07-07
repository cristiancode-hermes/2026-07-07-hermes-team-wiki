import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization.entity.js';
import { User } from '../entities/user.entity.js';
import { Space } from '../entities/space.entity.js';
import { Page } from '../entities/page.entity.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { Comment } from '../entities/comment.entity.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageVersion)
    private readonly versionRepo: Repository<PageVersion>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async onModuleInit() {
    const orgCount = await this.orgRepo.count();
    if (orgCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }
    this.logger.log('Seeding database with demo data...');
    await this.seed();
    this.logger.log('Database seeded successfully!');
  }

  async seed() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Organization
    const org = await this.orgRepo.save({ name: 'Acme Corp', slug: 'acme-corp' });

    // Users
    const ana = await this.userRepo.save({
      name: 'Ana Silva', email: 'ana@acme.com', passwordHash,
      role: 'admin' as const, status: 'active' as const,
      organization: { id: org.id },
    });
    const carlos = await this.userRepo.save({
      name: 'Carlos López', email: 'carlos@acme.com', passwordHash,
      role: 'editor' as const, status: 'active' as const,
      organization: { id: org.id },
    });
    const maria = await this.userRepo.save({
      name: 'María García', email: 'maria@acme.com', passwordHash,
      role: 'editor' as const, status: 'active' as const,
      organization: { id: org.id },
    });

    // Spaces
    const eng = await this.spaceRepo.save({
      name: 'Engineering', description: 'Documentación técnica del equipo de ingeniería',
      icon: '⚙️', sortOrder: 1, organization: { id: org.id },
    });
    const mkt = await this.spaceRepo.save({
      name: 'Marketing', description: 'Estrategias, campañas y guías de marketing',
      icon: '📊', sortOrder: 2, organization: { id: org.id },
    });
    const hr = await this.spaceRepo.save({
      name: 'HR', description: 'Políticas de RRHH, onboarding y beneficios',
      icon: '👥', sortOrder: 3, organization: { id: org.id },
    });

    // Engineering pages
    const onboarding = await this.pageRepo.save({
      title: 'Guía de Onboarding para Nuevos Developers',
      slug: 'guia-onboarding', content: `# Guía de Onboarding para Nuevos Developers

Bienvenido al equipo de ingeniería de Acme Corp. Esta guía te ayudará a configurar tu entorno y entender nuestros procesos.

## Primeros pasos

1. Configura tu entorno local
2. Clona los repositorios del proyecto
3. Ejecuta la aplicación en modo desarrollo
4. Revisa los PRs abiertos para entender el flujo de trabajo

## Herramientas necesarias

- **Editor:** VS Code o WebStorm
- **Terminal:** iTerm2 + Oh My Zsh
- **Git:** Git 2.40+ con SSH configurado
- **Docker:** Docker Desktop para desarrollo local

## Estándares de código

Seguimos las guías de estilo de TypeScript y Angular. Usamos ESLint + Prettier para formateo automático.

\`\`\`typescript
// Ejemplo de componente signal-based
const count = signal(0);
const doubled = computed(() => count() * 2);
\`\`\`

> **Tip:** Revisa la documentación en /docs antes de preguntar.
`,
      isHomePage: false, sortOrder: 1,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: ana.id }, versionNumber: 3,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Guía de Onboarding', content: '# Onboarding\n\nBienvenido al equipo.', page: { id: onboarding.id }, author: { id: ana.id } });
    await this.versionRepo.save({ versionNumber: 2, title: 'Guía de Onboarding', content: '# Onboarding\n\nBienvenido al equipo.\n\n## Setup', page: { id: onboarding.id }, author: { id: carlos.id } });
    await this.versionRepo.save({ versionNumber: 3, title: 'Guía de Onboarding para Nuevos Developers', content: onboarding.content, page: { id: onboarding.id }, author: { id: ana.id }, summary: 'Versión completa con estándares de código' });

    const archGuide = await this.pageRepo.save({
      title: 'Guía de Arquitectura',
      slug: 'guia-arquitectura', content: `# Guía de Arquitectura

## Stack tecnológico

- **Frontend:** Angular 22 (signals, zoneless, Tailwind CSS)
- **Backend:** NestJS 11 con TypeORM
- **Base de datos:** PostgreSQL (dev: SQLite)
- **Infraestructura:** Docker + Kubernetes

## Patrones

### Modular monolito

Organizamos el backend en módulos NestJS independientes. Cada módulo tiene su propio controlador, servicio y DTOs.

### Multi-tenencia

Cada organización tiene su propio espacio aislado. Todas las queries incluyen \`organizationId\`.

### Signal-first frontend

Los componentes Angular usan signals para estado local y computed() para valores derivados.
`,
      isHomePage: false, sortOrder: 2,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: carlos.id }, versionNumber: 2,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Guía de Arquitectura', content: '# Arquitectura', page: { id: archGuide.id }, author: { id: carlos.id } });
    await this.versionRepo.save({ versionNumber: 2, title: 'Guía de Arquitectura', content: archGuide.content, page: { id: archGuide.id }, author: { id: carlos.id }, summary: 'Agregada sección de multi-tenencia' });

    const deployGuide = await this.pageRepo.save({
      title: 'Guía de Deployment',
      slug: 'guia-deployment', content: `# Guía de Deployment

## Ambientes

| Ambiente | URL | Rama |
|----------|-----|------|
| Desarrollo | dev.acme.com | develop |
| Staging | staging.acme.com | staging |
| Producción | acme.com | main |

## Pipeline CI/CD

1. Push a main → trigger build
2. Tests unitarios
3. Build de producción
4. Deploy a staging
5. Smoke tests
6. Deploy a producción
`,
      isHomePage: false, sortOrder: 3, parentId: archGuide.id,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: ana.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Guía de Deployment', content: deployGuide.content, page: { id: deployGuide.id }, author: { id: ana.id } });

    const codingStandards = await this.pageRepo.save({
      title: 'Estándares de Código',
      slug: 'estandares-codigo', content: `# Estándares de Código

## TypeScript

- Usar tipos explícitos en APIs públicas
- Evitar \`any\` — preferir \`unknown\` cuando el tipo es dinámico
- Nombres en PascalCase para clases, camelCase para métodos/variables

## Angular

- Componentes standalone, NO NgModules
- Signals > RxJS para estado local
- Inputs/outputs con signal APIs: \`input()\`, \`output()\`
- Nuevo control flow: @if, @for, @switch
- Tailwind CSS en templates, no archivos CSS de componente

## NestJS

- DTOs con class-validator
- Servicios delgados, controladores aún más delgados
- Multi-tenencia en todas las queries
- Swagger decorators en todos los endpoints
`,
      isHomePage: false, sortOrder: 4,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: maria.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Estándares de Código', content: codingStandards.content, page: { id: codingStandards.id }, author: { id: maria.id } });

    const apiDocs = await this.pageRepo.save({
      title: 'API Reference',
      slug: 'api-reference', content: `# API Reference

## Autenticación

\`\`\`
POST /api/auth/register    → Registro de organización
POST /api/auth/login       → Inicio de sesión
GET  /api/auth/me          → Perfil del usuario actual
\`\`\`

## Espacios

\`\`\`
GET    /api/spaces          → Lista de espacios
POST   /api/spaces          → Crear espacio
GET    /api/spaces/:id      → Detalle del espacio
PUT    /api/spaces/:id      → Actualizar espacio
DELETE /api/spaces/:id      → Eliminar espacio
\`\`\`

## Páginas

\`\`\`
GET    /api/pages/:id           → Vista de página
POST   /api/pages               → Crear página
PUT    /api/pages/:id           → Actualizar página
DELETE /api/pages/:id           → Eliminar página
GET    /api/pages/:id/versions  → Historial de versiones
POST   /api/pages/:id/revert/:vid → Revertir a versión
\`\`\`
`,
      isHomePage: false, sortOrder: 5,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: ana.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'API Reference', content: apiDocs.content, page: { id: apiDocs.id }, author: { id: ana.id } });

    // Engineering home page
    const engHome = await this.pageRepo.save({
      title: 'Engineering Home',
      slug: 'engineering-home', content: `# Engineering Space

Bienvenido al espacio de Engineering. Aquí encontrarás toda la documentación técnica del equipo.

## Páginas principales

- [Guía de Onboarding](/spaces/${eng.id}/guia-onboarding)
- [Guía de Arquitectura](/spaces/${eng.id}/guia-arquitectura)
- [Estándares de Código](/spaces/${eng.id}/estandares-codigo)
- [API Reference](/spaces/${eng.id}/api-reference)

## Equipo actual

- **Ana** — Tech Lead
- **Carlos** — Senior Developer
- **María** — Full Stack Developer
`,
      isHomePage: true, sortOrder: 0,
      organization: { id: org.id }, space: { id: eng.id },
      author: { id: ana.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Engineering Home', content: engHome.content, page: { id: engHome.id }, author: { id: ana.id } });
    await this.spaceRepo.update(eng.id, { homePageId: engHome.id });

    // Marketing pages
    const mktHome = await this.pageRepo.save({
      title: 'Marketing Home',
      slug: 'marketing-home', content: `# Marketing Space

Estrategias, campañas y guías para el equipo de marketing.

## Próximas campañas

1. Lanzamiento Q3 — Producto nuevo
2. Newsletter semanal — Contenido educativo
3. Webinar — Demos en vivo
`,
      isHomePage: true, sortOrder: 0,
      organization: { id: org.id }, space: { id: mkt.id },
      author: { id: maria.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Marketing Home', content: mktHome.content, page: { id: mktHome.id }, author: { id: maria.id } });
    await this.spaceRepo.update(mkt.id, { homePageId: mktHome.id });

    const contentStrategy = await this.pageRepo.save({
      title: 'Estrategia de Contenido Q3',
      slug: 'estrategia-contenido-q3', content: `# Estrategia de Contenido Q3 2026

## Objetivos

- Aumentar tráfico orgánico en 30%
- Generar 50 leads calificados
- Publicar 12 artículos de blog

## Calendario editorial

| Mes | Tema | Formato |
|-----|------|---------|
| Julio | Angular 22 | Tutorial |
| Agosto | NestJS Avanzado | Guía |
| Septiembre | CI/CD | Caso de estudio |
`,
      isHomePage: false, sortOrder: 1,
      organization: { id: org.id }, space: { id: mkt.id },
      author: { id: maria.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Estrategia de Contenido Q3', content: contentStrategy.content, page: { id: contentStrategy.id }, author: { id: maria.id } });

    const brandGuide = await this.pageRepo.save({
      title: 'Guía de Marca',
      slug: 'guia-marca', content: `# Guía de Marca

## Logo

- Usar siempre la versión horizontal en header
- Fondo claro: logo completo color
- Fondo oscuro: logo versión blanca

## Colores

- **Primario:** Indigo (#6366f1)
- **Secundario:** Slate (#64748b)
- **Acento:** Amber (#f59e0b)

## Tipografía

- **Títulos:** Inter Bold
- **Cuerpo:** Inter Regular
- **Código:** JetBrains Mono
`,
      isHomePage: false, sortOrder: 2,
      organization: { id: org.id }, space: { id: mkt.id },
      author: { id: maria.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Guía de Marca', content: brandGuide.content, page: { id: brandGuide.id }, author: { id: maria.id } });

    // HR pages
    const hrHome = await this.pageRepo.save({
      title: 'HR Home',
      slug: 'hr-home', content: `# Recursos Humanos

Políticas, beneficios y documentación para todos los miembros del equipo.

## Secciones

- Políticas de la empresa
- Proceso de onboarding
- Beneficios y compensación
`,
      isHomePage: true, sortOrder: 0,
      organization: { id: org.id }, space: { id: hr.id },
      author: { id: ana.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'HR Home', content: hrHome.content, page: { id: hrHome.id }, author: { id: ana.id } });
    await this.spaceRepo.update(hr.id, { homePageId: hrHome.id });

    const vacationPolicy = await this.pageRepo.save({
      title: 'Política de Vacaciones 2026',
      slug: 'politica-vacaciones', content: `# Política de Vacaciones 2026

## Días disponibles

- **Full-time:** 22 días hábiles al año
- **Part-time:** Proporcional a horas trabajadas
- **Antigüedad:** +1 día por año de servicio (máx. 30)

## Proceso de solicitud

1. Solicitar con 2 semanas de anticipación
2. Aprobación del manager directo
3. Registrar en el sistema de RRHH

## Días festivos 2026

- 1 de enero — Año Nuevo
- 24-25 de marzo — Semana Santa
- 1 de mayo — Día del Trabajo
- 15 de agosto — Asunción
- 12 de octubre — Fiesta Nacional
- 1 de noviembre — Todos los Santos
- 6-8 de diciembre — Puente Constitución
- 25 de diciembre — Navidad
`,
      isHomePage: false, sortOrder: 1,
      organization: { id: org.id }, space: { id: hr.id },
      author: { id: ana.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Política de Vacaciones 2026', content: vacationPolicy.content, page: { id: vacationPolicy.id }, author: { id: ana.id } });

    const benefits = await this.pageRepo.save({
      title: 'Beneficios y Compensación',
      slug: 'beneficios', content: `# Beneficios y Compensación

## Salario

- Revisión salarial anual basada en rendimiento
- Bono trimestral por cumplimiento de OKRs
- Stock options para roles senior

## Beneficios

- 🏥 Seguro médico privado
- 💻 Presupuesto anual para equipo técnico (2.000€)
- 📚 Suscripción a plataformas de aprendizaje
- 🏋️ Membresía de gimnasio
- 🚗 Parking gratuito
`,
      isHomePage: false, sortOrder: 2,
      organization: { id: org.id }, space: { id: hr.id },
      author: { id: carlos.id }, versionNumber: 1,
    });
    await this.versionRepo.save({ versionNumber: 1, title: 'Beneficios y Compensación', content: benefits.content, page: { id: benefits.id }, author: { id: carlos.id } });

    // Comments
    await this.commentRepo.save({
      content: '¿Deberíamos agregar una sección sobre Docker? Sería útil para los nuevos.', isEdited: false,
      organization: { id: org.id }, page: { id: onboarding.id },
      author: { id: maria.id },
    });
    await this.commentRepo.save({
      content: 'Buena idea, lo preparo para la próxima iteración.', isEdited: false,
      organization: { id: org.id }, page: { id: onboarding.id },
      author: { id: carlos.id },
    });
    await this.commentRepo.save({
      content: '¡Gracias! Me encantó esta guía. Muy clara.', isEdited: false,
      organization: { id: org.id }, page: { id: onboarding.id },
      author: { id: maria.id },
    });
    await this.commentRepo.save({
      content: '¿Actualizamos las URLs después del deploy a producción?', isEdited: false,
      organization: { id: org.id }, page: { id: deployGuide.id },
      author: { id: maria.id },
    });
    await this.commentRepo.save({
      content: 'Sí, actualizaré la tabla de ambientes después del próximo release.', isEdited: false,
      organization: { id: org.id }, page: { id: deployGuide.id },
      author: { id: ana.id },
    });
    await this.commentRepo.save({
      content: '¿Incluimos también los beneficios de formación (cursos, conferencias)?', isEdited: false,
      organization: { id: org.id }, page: { id: benefits.id },
      author: { id: maria.id },
    });
  }
}
