import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

const server = express();

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { cors: true });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API documentation for Blog management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initialize the app for serverless or local environments
  await app.init();

  // For local development, start the server on a specific port
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }
};

// Bootstrap the app for local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export the server for serverless environments (e.g., Vercel)
export default server;
