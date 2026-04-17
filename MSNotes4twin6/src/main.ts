import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { applySpringCloudEnv } from './config-server.bootstrap';
import { AppModule } from './app.module';
import { startEurekaClient } from './eureka/register-eureka';
import { chefEnseignantNotesMiddleware } from './middleware/chef-enseignant.middleware';

async function bootstrap() {
  await applySpringCloudEnv('MSNotes4twin6');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['X-Enseignant-Role'],
  });
  app.use(chefEnseignantNotesMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 8088;
  await app.listen(port);

  if (process.env.SKIP_EUREKA !== '1' && process.env.SKIP_EUREKA !== 'true') {
    startEurekaClient({
      appName: 'MSNotes4twin6',
      port,
    });
  }
}

bootstrap();
