import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { SeedService } from './seed.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  await seedService.seed();
  console.log('Seed completed successfully!');
  await app.close();
  process.exit(0);
}
bootstrap().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
