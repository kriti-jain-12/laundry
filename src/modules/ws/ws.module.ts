import { Module } from '@nestjs/common';
import { WSService } from './ws.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleConfigs } from 'src/config/constants';
import { UtilsModule } from '../utils/utils.module';
import { WSGateway } from 'src/modules/ws/ws.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature(ModuleConfigs['ws'].entities),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: '30d',
        },
      }),
      inject: [ConfigService],
    }),
    UtilsModule,
  ],
  providers: [WSService, WSGateway],
})
export class WSModule {}
