import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleConfigs } from 'src/config/constants';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ModuleConfigs['addresses'].entities),
    UtilsModule,
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
