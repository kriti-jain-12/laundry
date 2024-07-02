import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleConfigs } from 'src/config/constants';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ModuleConfigs['profile'].entities),
    UtilsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
