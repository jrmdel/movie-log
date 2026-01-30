import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  const isEnvDev = process.env.NODE_ENV === 'development';

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, // Use URI versioning (/v1/module)
  });

  if (isEnvDev) {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(port);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
