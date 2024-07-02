import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { ModuleConfigs } from 'src/config/constants';
import { UtilsSeedersService } from './utils.seeders.service';
import { UtilsStorageService } from './utils.storage.service';
import { UtilsHelperService } from './utils.helper.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailgunModule } from '@nextnm/nestjs-mailgun';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UtilsTimezoneService } from './utils.timezone.service';
import { UtilsStripeService } from './utils.stripe.service';
import { UtilsNotificationService } from './utils.notification.service';

@Module({
  imports: [
    SequelizeModule.forFeature(ModuleConfigs['utils'].entities),
    MailgunModule.forAsyncRoot({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mailgun_api = await configService.get('mailgun_api');
        return {
          username: 'api',
          key: mailgun_api,
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [UtilsController],
  providers: [
    UtilsService,
    UtilsSeedersService,
    UtilsStorageService,
    UtilsHelperService,
    UtilsTimezoneService,
    UtilsStripeService,
    UtilsNotificationService,
  ],
  exports: [
    UtilsService,
    UtilsHelperService,
    UtilsStorageService,
    UtilsTimezoneService,
    UtilsStripeService,
    UtilsNotificationService,
  ],
})
export class UtilsModule {}
