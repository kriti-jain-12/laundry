import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Users from 'src/models/users/users.model';
import { UtilsStripeService } from '../utils/utils.stripe.service';
import { ServiceRequestStatus, UserType } from 'src/utils/enums';
import sequelize from 'sequelize';
import * as _ from 'lodash';
import ServiceRequest from 'src/models/services/service.request.model';
import Addresses from 'src/models/users/user.addresses.model';
import Transactions from 'src/models/transactions/transactions.model';
import { Op } from 'sequelize';
import Countries from 'src/models/users/countries.model';
import NearByDrivers from 'src/models/services/nearby.drivers.model';
import NearByLaundromats from 'src/models/services/nearby.laundromat.model';
import ServiceChangeRequest from 'src/models/services/service.change.request.model';
import Media from 'src/models/services/media.model';
import Review from 'src/models/users/review.model';

@Injectable()
export class WSService {
  constructor(
    private readonly utilsStripeService: UtilsStripeService,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(Review)
    private reviewModel: typeof Review,
    @InjectModel(Media)
    private mediaModel: typeof Media,
    @InjectModel(ServiceRequest)
    private serviceRequestModel: typeof ServiceRequest,
    @InjectModel(Addresses)
    private addressesModel: typeof Addresses,
    @InjectModel(ServiceChangeRequest)
    private serviceChangeRequestModel: typeof ServiceChangeRequest,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(NearByDrivers)
    private nearByDriversModel: typeof NearByDrivers,
    @InjectModel(NearByLaundromats)
    private nearByLaundromatsModel: typeof NearByLaundromats,
  ) {}

  async clientConnected(user_id: number, socket_id: string) {
    try {
      console.log(
        `Socket Connected UserID ${user_id}`,
        `Socket ID ${socket_id}`,
      );
      const user = await this.usersModel.findOne({ where: { id: user_id } });
      if (user) {
        await user.update({
          socket_id,
        });
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async clientDisconnect(user_id: number) {
    try {
      console.log(`Socket Disconnected UserID ${user_id}`);
      const user = await this.usersModel.findOne({ where: { id: user_id } });
      if (user) {
        await user.update({
          socket_id: null,
        });
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getRequest(request_id: number) {
    try {
      return await this.serviceRequestModel.findOne({
        where: { id: request_id },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
          },
          {
            model: this.reviewModel,
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
          },
          {
            model: this.serviceChangeRequestModel,
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
            include: [
              {
                model: this.mediaModel,
                attributes: {
                  exclude: [
                    'created_at',
                    'updated_at',
                    'user_id',
                    'service_request_id',
                    'service_change_request_id',
                  ],
                },
              },
            ],
          },
          {
            model: this.usersModel,
            as: 'user',
            attributes: [
              'id',
              'email',
              'phone',
              'first_name',
              'last_name',
              'notification_token',
              'stripe_customer_id',
              'socket_id',
              'lat',
              'long',
            ],
            include: [
              {
                model: this.countriesModel,
                attributes: [
                  'id',
                  'name',
                  'dial_code',
                  'emoji',
                  'image',
                  'code',
                ],
                required: false,
              },
            ],
          },
          {
            model: this.usersModel,
            as: 'driver',
            attributes: [
              'id',
              'email',
              'phone',
              'first_name',
              'last_name',
              'notification_token',
              'stripe_customer_id',
              'socket_id',
              'lat',
              'long',
              'driver_current_lat',
              'driver_current_long',
            ],
            include: [
              {
                model: this.countriesModel,
                attributes: [
                  'id',
                  'name',
                  'dial_code',
                  'emoji',
                  'image',
                  'code',
                ],
                required: false,
              },
            ],
          },
          {
            model: this.usersModel,
            as: 'laundromat',
            attributes: [
              'id',
              'email',
              'phone',
              'first_name',
              'last_name',
              'notification_token',
              'stripe_customer_id',
              'socket_id',
              'lat',
              'long',
              'address',
            ],
            include: [
              {
                model: this.countriesModel,
                attributes: [
                  'id',
                  'name',
                  'dial_code',
                  'emoji',
                  'image',
                  'code',
                ],
                required: false,
              },
            ],
          },
        ],
        attributes: {
          exclude: ['updated_at', 'created_at'],
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findDriver(lat: number, long: number) {
    try {
      const haversine = `(6371 * acos(cos(radians(${lat})) * cos(radians(Users.lat)) * cos(radians(Users.long) - radians(${long})) + sin(radians(${lat})) * sin(radians(Users.lat))))`;
      return await this.usersModel.findAll({
        where: {
          active: true,
          user_type: UserType.DELIVERY_PARTNER,
          is_ready_for_request: true,
        },
        include: ['country'],
        attributes: [
          'id',
          'first_name',
          'last_name',
          'user_type',
          'socket_id',
          'email',
          'phone',
          [sequelize.literal(haversine), 'distance'],
        ],
        order: sequelize.col('distance'),
        having: sequelize.literal(`distance <= ${process.env.DISTANCE}`),
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addNearByDriver(request_id: number, drivers: Array<number>) {
    try {
      return await this.nearByDriversModel.bulkCreate(
        drivers.map((item) => {
          return {
            service_request_id: request_id,
            driver_id: item,
          };
        }),
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateRequestStatus(request_id: number, status: ServiceRequestStatus) {
    try {
      return await this.serviceRequestModel.update(
        {
          service_request_status: status,
        },
        { where: { id: request_id } },
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getNearByDriver(request_id: number) {
    try {
      return await this.nearByDriversModel.findAll({
        where: {
          service_request_id: request_id,
        },
        include: ['driver'],
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addSelfAsLaundromat(user_id: number, request_id: number) {
    try {
      const request = await this.serviceRequestModel.findOne({
        where: { id: request_id },
      });
      const driver = await this.usersModel.findOne({
        where: {
          id: user_id,
        },
      });
      const laundromat = await this.usersModel.findOne({
        where: {
          country_id: driver.country_id,
          phone: driver.phone,
          email: driver.email,
          user_type: UserType.LAUNDROMAT,
        },
      });
      if (laundromat) {
        request.update({
          laundromat_id: laundromat.id,
          service_request_status: ServiceRequestStatus.LAUNDROMAT_ACCEPTED,
        });
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getNearByLaundromat(request_id: number) {
    try {
      return await this.nearByLaundromatsModel.findAll({
        where: {
          service_request_id: request_id,
        },
        include: ['laundromat'],
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findLaundromat(lat: number, long: number) {
    try {
      const haversine = `(6371 * acos(cos(radians(${lat})) * cos(radians(Users.lat)) * cos(radians(Users.long) - radians(${long})) + sin(radians(${lat})) * sin(radians(Users.lat))))`;
      return await this.usersModel.findAll({
        where: {
          active: true,
          user_type: UserType.LAUNDROMAT,
        },
        include: ['country'],
        attributes: [
          'id',
          'first_name',
          'last_name',
          'user_type',
          'socket_id',
          'email',
          'phone',
          [sequelize.literal(haversine), 'distance'],
        ],
        order: sequelize.col('distance'),
        having: sequelize.literal(`distance <= ${process.env.DISTANCE}`),
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getLaundromatById(ids: number[]) {
    try {
      return await this.usersModel.findAll({
        where: {
          active: true,
          user_type: UserType.LAUNDROMAT,
          is_ready_for_request: true,
          id: {
            [Op.in]: ids,
          },
        },
        include: ['country'],
        attributes: [
          'id',
          'first_name',
          'last_name',
          'user_type',
          'socket_id',
          'email',
          'phone',
          'notification_token'
        ],
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addNearByLaundromat(request_id: number, drivers: Array<number>) {
    try {
      return await this.nearByLaundromatsModel.bulkCreate(
        drivers.map((item) => {
          return {
            service_request_id: request_id,
            laundromat_id: item,
          };
        }),
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
