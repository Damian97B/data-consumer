import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {

    private readonly consumer: Consumer;

    constructor(@Inject('KAFKA') kafka: Kafka) {
        this.consumer = kafka.consumer({ groupId: 'data-consumer' });
    }

    async onModuleInit() {
        await this.consumer.connect();

        await this.consumer.subscribe({
            topic: 'engine-temperature',
            fromBeginning: true,
        });

        await this.consumer.run({ eachMessage: async ({ topic, partition, message }) => {
            const temperature = message.value?.toString();

            if (Number(temperature)) {
                console.log(`temp: ${temperature}`);
            }
            
            console.log({
                topic,
                partition,
                offset: message.offset,
                temperature,
                timestamp: message.headers?.TIMESTAMP?.toString(),
            });
        }});
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}