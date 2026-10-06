import { Module } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ConsumerService } from '../service/consumer/consumer.service.js';

@Module({
  providers: [
    {
      provide: 'KAFKA',
      useFactory: () => {
        return new Kafka({
          clientId: 'data-consumer',
          brokers: (process.env.KAFKA_BROKERS ?? 'localhost:29092').split(','),
        });
      },
    },
    ConsumerService,
  ],
})
export class KafkaModule {}