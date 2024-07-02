import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UtilsHelperService } from '../utils/utils.helper.service';
import { InjectModel } from '@nestjs/sequelize';
import { Transactional } from 'sequelize-transactional-decorator';
import {
  DeliveryType,
  ServiceType,
  SubServiceType,
  UserType,
} from 'src/utils/enums';
import Users from 'src/models/users/users.model';
import Countries from 'src/models/users/countries.model';
import * as countries from '../../utils/countries.json';
import ServicePricing from 'src/models/services/service.pricing.model';
import ServiceTax from 'src/models/services/service.tax.model';

@Injectable()
export class UtilsSeedersService implements OnApplicationBootstrap {
  constructor(
    private readonly utilsHelperService: UtilsHelperService,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(ServiceTax)
    private serviceTaxModel: typeof ServiceTax,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(ServicePricing)
    private servicePricingModel: typeof ServicePricing,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCountries();
    await this.seedPricing();
    await this.seedTax();
  }

  @Transactional()
  async seedAdmin() {
    const count = await this.userModel.findAll({
      where: {
        user_type: UserType.ADMIN,
      },
    });
    if (count.length == 0) {
      await this.userModel.create({
        first_name: 'Super',
        last_name: 'Admin',
        user_type: UserType.ADMIN,
        email: 'super@app.com',
        password: await this.utilsHelperService.hashPassword(
          `5v4TQQonS5cE4('Q479}/I`,
        ),
      });
    }
  }

  @Transactional()
  async seedCountries(): Promise<void> {
    const count = await this.countriesModel.count();
    if (count == 0) {
      await this.countriesModel.bulkCreate(countries);
    }
  }

  @Transactional()
  async seedPricing(): Promise<void> {
    const pricing = [
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH,
        delivery_type: DeliveryType.SELF,
        price: 130,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH,
        delivery_type: DeliveryType.DRIVER,
        price: 155,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH_AND_FOLD,
        delivery_type: DeliveryType.SELF,
        price: 175,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH_AND_FOLD,
        delivery_type: DeliveryType.DRIVER,
        price: 200,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH_FOLD_AND_IRON,
        delivery_type: DeliveryType.SELF,
        price: 280,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
      {
        service_type: ServiceType.LAUNDRY,
        sub_service_type: SubServiceType.WASH_FOLD_AND_IRON,
        delivery_type: DeliveryType.DRIVER,
        price: 320,
        same_day_delivery_fee: 1000,
        separate: 9,
        bleach: 9,
        softner: 9,
        dryer_sheet: 9,
      },
    ];
    const count = await this.servicePricingModel.count();
    if (count == 0) {
      await this.servicePricingModel.bulkCreate(pricing);
    }
  }

  @Transactional()
  async seedTax(): Promise<void> {
    const taxs = [
      {
        province: 'Alberta',
        gst_hst: 5,
        pst: 0,
      },
      {
        province: 'British Columbia',
        gst_hst: 5,
        pst: 7,
      },
      {
        province: 'Manitoba',
        gst_hst: 5,
        pst: 7,
      },
      {
        province: 'New Brunswick',
        gst_hst: 15,
        pst: 0,
      },
      {
        province: 'Newfoundland and Labrador',
        gst_hst: 15,
        pst: 0,
      },
      {
        province: 'Northwest Territories',
        gst_hst: 5,
        pst: 0,
      },
      {
        province: 'Nova Scotia',
        gst_hst: 15,
        pst: 0,
      },
      {
        province: 'Nunavut',
        gst_hst: 5,
        pst: 0,
      },
      {
        province: 'Ontario',
        gst_hst: 13,
        pst: 0,
      },
      {
        province: 'Prince Edward Island',
        gst_hst: 15,
        pst: 0,
      },
      {
        province: 'Quebec',
        gst_hst: 5,
        pst: 9.97,
      },
      {
        province: 'Saskatchewan',
        gst_hst: 5,
        pst: 6,
      },
      {
        province: 'Yukon',
        gst_hst: 5,
        pst: 0,
      },
    ];
    const count = await this.serviceTaxModel.count();
    if (count == 0) {
      await this.serviceTaxModel.bulkCreate(taxs);
    }
  }
}
