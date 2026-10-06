import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {

    private readonly consumer: Consumer;
    private readonly dataStoreUrl = process.env.DATA_STORE_URL;

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

            const response = await fetch(`${this.dataStoreUrl}/engine-temperatures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperature }),
            });

            if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(`${response.status}: ${responseBody}`);
            }

            console.log(`Saved temperature: ${temperature}`);
        }});
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}