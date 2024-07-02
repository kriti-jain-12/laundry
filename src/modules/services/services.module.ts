import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleConfigs } from 'src/config/constants';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ModuleConfigs['services'].entities),
    UtilsModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
