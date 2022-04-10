import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { classValidatorExceptionFactory } from './utilities/errors/class-validator-exception-factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: classValidatorExceptionFactory,
      stopAtFirstError: true,
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
