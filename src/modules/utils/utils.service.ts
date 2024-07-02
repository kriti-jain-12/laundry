import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilsStorageService } from './utils.storage.service';
import { Response } from '../../utils/response';
import Countries from 'src/models/users/countries.model';
import { InjectModel } from '@nestjs/sequelize';
import { GetCountriesDTO, GetTaxDTO } from './dto/util.dto';
import { Op } from 'sequelize';
import { utils as messages } from '../../utils/messages';
import ServiceTax from 'src/models/services/service.tax.model';

@Injectable()
export class UtilsService {
  constructor(
    private readonly utilsStorageService: UtilsStorageService,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(ServiceTax)
    private serviceTaxModel: typeof ServiceTax,
  ) {}

  async getCountries(getCountriesDTO: GetCountriesDTO): Promise<Response> {
    try {
      const { search } = getCountriesDTO;
      let searchConditions = {};
      if (search) {
        searchConditions = {
          [Op.or]: [
            {
              name: { [Op.like]: `%${search}%` },
            },
            {
              code: { [Op.like]: `%${search}%` },
            },
            {
              dial_code: { [Op.like]: `%${search}%` },
            },
          ],
        };
      }

      const countries = await this.countriesModel.findAll({
        where: {
          ...searchConditions,
        },
        attributes: [
          'id',
          'name',
          'region',
          'code',
          'dial_code',
          'emoji',
          'image',
        ],
      });
      return {
        data: {
          countries,
        },
        message: messages.countries_fetched,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getTax(getTaxDTO: GetTaxDTO): Promise<Response> {
    try {
      const { province } = getTaxDTO;
      const tax = await this.serviceTaxModel.findOne({
        where: {
          province,
        },
        attributes: {
          exclude: ['created_at', 'updated_at'],
        },
      });
      return {
        data: {
          tax,
        },
        message: messages.tax_fetched,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
