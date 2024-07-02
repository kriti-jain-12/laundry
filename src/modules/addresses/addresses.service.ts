import {
  AddAddressDTO,
  DeleteAddressDTO,
  GetAddressDTO,
  UpdateAddressDTO,
} from './dto/addresses.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from '../../utils/response';
import Users from 'src/models/users/users.model';
import { addresses as messages } from '../../utils/messages';
import { UtilsStorageService } from '../utils/utils.storage.service';
import { UtilsHelperService } from '../utils/utils.helper.service';
import Addresses from 'src/models/users/user.addresses.model';
import { Op } from 'sequelize';

@Injectable()
export class AddressesService {
  constructor(
    private readonly utilsStorageService: UtilsStorageService,
    private readonly utilsHelperService: UtilsHelperService,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(Addresses)
    private addressesModel: typeof Addresses,
  ) {}

  async getAddress(
    getAddressDTO: GetAddressDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { search } = getAddressDTO;
      let { page, page_size } = getAddressDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      let search_conditions = {};
      if (search) {
        search_conditions = {
          [Op.or]: [
            {
              line_1: {
                [Op.like]: '%' + search + '%',
              },
            },
            {
              line_2: {
                [Op.like]: '%' + search + '%',
              },
            },
            {
              pin_code: {
                [Op.like]: '%' + search + '%',
              },
            },
          ],
        };
      }
      const total_address = await this.addressesModel.count({
        where: {
          [Op.and]: [{ user_id }, search_conditions],
        },
      });
      const addresses = await this.addressesModel.findAll({
        attributes: [
          'id',
          'line_1',
          'line_2',
          'pin_code',
          'remark',
          'active',
          'lat',
          'long',
          'door',
          'buzzer_code',
          'notes',
          'call_or_text_notify',
          'business_name',
          'hotel_name',
          'room_no',
          'created_at',
          'province'
        ],
        where: {
          [Op.and]: [{ user_id }, search_conditions],
          active: true,
        },
        offset: (page - 1) * page_size,
        limit: page_size,
      });
      return {
        data: {
          addresses,
          paging: {
            total: total_address,
            total_pages: Math.ceil(total_address / page_size),
            page_size: Number(page_size),
            currentPage: Number(page),
          },
        },
        message: messages.address_deleted,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addAddress(
    addAddressDTO: AddAddressDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const {
        remark,
        line_1,
        line_2,
        pin_code,
        lat,
        long,
        door,
        buzzer_code,
        notes,
        call_or_text_notify,
        business_name,
        hotel_name,
        room_no,
        province
      } = addAddressDTO;
      const address = await this.addressesModel.create({
        remark,
        line_1,
        line_2,
        pin_code,
        lat,
        long,
        user_id,
        door,
        buzzer_code,
        notes,
        call_or_text_notify,
        business_name,
        hotel_name,
        room_no,
        province
      });
      return {
        data: {
          address,
        },
        message: messages.address_added,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateAddress(
    updateAddressDTO: UpdateAddressDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const {
        id,
        remark,
        line_1,
        line_2,
        pin_code,
        lat,
        long,
        active,
        door,
        buzzer_code,
        notes,
        call_or_text_notify,
        business_name,
        hotel_name,
        room_no,
        province
      } = updateAddressDTO;
      const address = await this.addressesModel.findOne({
        where: { id, user_id },
      });
      if (!address) {
        throw new BadRequestException(messages.address_not_found);
      }
      await address.update({
        remark,
        line_1,
        line_2,
        pin_code,
        lat,
        long,
        door,
        buzzer_code,
        notes,
        call_or_text_notify,
        business_name,
        hotel_name,
        room_no,
        province
      });

      return {
        data: {
          address: await address.get(),
        },
        message: messages.address_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteAddress(
    deleteAddressDTO: DeleteAddressDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = deleteAddressDTO;
      const address = await this.addressesModel.findOne({
        where: { id, user_id },
      });
      if (!address) {
        throw new BadRequestException(messages.address_not_found);
      }
      await address.update({
        active: false,
      });
      return {
        data: {},
        message: messages.address_deleted,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
