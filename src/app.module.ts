import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { KafkaModule } from './kafka/kafka.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
