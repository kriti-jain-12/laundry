import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { RequestLoggerMiddleware } from './utils/request-logger.middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  SequelizeTransactionalModule,
  initSequelizeCLS,
} from 'sequelize-transactional-decorator';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './utils/api.key.strategy';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import { StripeModule } from 'nestjs-stripe';
import { ServicesModule } from './modules/services/services.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WSModule } from './modules/ws/ws.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'api-key' }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        initSequelizeCLS();
        const config = configService.get('database');
        return {
          dialect: config.dialect,
          host: config.host,
          port: config.port,
          username: config.user,
          password: config.password,
          database: config.database,
          logging: config.logging,
          synchronize: config.synchronize,
          autoLoadModels: config.autoLoadModels,
          dialectOptions: {
            dateStrings: true,
            typeCast: true,
          },
          timezone: configService.get('timezone'),
          models: [__dirname + '/models/**/*.model.js'],
        };
      },
      inject: [ConfigService],
    }),
    SequelizeTransactionalModule.register(),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: path.join(__dirname, './../logs/'),
          filename: 'apis.log',
          level: 'debug',
        }),
      ],
    }),
    StripeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('stripe_secret'),
          apiVersion: null,
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    ServicesModule,
    ProfileModule,
    AddressesModule,
    WSModule,
  ],
  providers: [ApiKeyStrategy],
})
export class AppModule {
  constructor(private sequelize: Sequelize) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
