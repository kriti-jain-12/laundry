import { config } from 'dotenv';
config();
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from '../../utils/response';
import UserService from 'src/models/users/user.services.model';
import Users from 'src/models/users/users.model';
import { UtilsStripeService } from '../utils/utils.stripe.service';
import {
  GetAvailableServicesDTO,
  CreateServiceRequestDTO,
  UpdateServiceRequestDTO,
  ConfirmServiceRequestDTO,
  AcceptServiceRequestDTO,
  RejectServiceRequestDTO,
  GetServiceRequestDetailsDTO,
  AssignRequestToLaundromatDTO,
  CreateChangeRequestDTO,
  UpdateChangeRequestDTO,
  RepeatOrderDTO,
  GetOrderHistoryDTO,
  SendTipDTO,
  GetNewServiceRequestDTO,
} from './dto/services.dto';
import {
  ChangeRequestStatus,
  DeliveryType,
  MediaType,
  ServiceRequestStatus,
  UserType,
  WalletTransactionType,
} from 'src/utils/enums';
import sequelize from 'sequelize';
import * as _ from 'lodash';
import { services as messages } from '../../utils/messages';
import ServiceRequest from 'src/models/services/service.request.model';
import Transactions from 'src/models/transactions/transactions.model';
import { UtilsHelperService } from '../utils/utils.helper.service';
import ServicePricing from 'src/models/services/service.pricing.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import NearByDrivers from 'src/models/services/nearby.drivers.model';
import Addresses from 'src/models/users/user.addresses.model';
import Countries from 'src/models/users/countries.model';
import { Op } from 'sequelize';
import NearByLaundromats from 'src/models/services/nearby.laundromat.model';
import Media from 'src/models/services/media.model';
import { UtilsStorageService } from '../utils/utils.storage.service';
import ServiceChangeRequest from 'src/models/services/service.change.request.model';
import Wallet from 'src/models/transactions/wallet.model';
import Review from 'src/models/users/review.model';
import { UtilsNotificationService } from '../utils/utils.notification.service';

@Injectable()
export class ServicesService {
  constructor(
    private readonly utilsStorageService: UtilsStorageService,
    private readonly utilsStripeService: UtilsStripeService,
    private readonly utilsHelperService: UtilsHelperService,
    private readonly uns: UtilsNotificationService,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(UserService)
    private userServicesModel: typeof UserService,
    @InjectModel(ServiceRequest)
    private serviceRequestModel: typeof ServiceRequest,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(Wallet)
    private walletModel: typeof Wallet,
    @InjectModel(Review)
    private reviewModel: typeof Review,
    @InjectModel(Transactions)
    private transactionsModel: typeof Transactions,
    @InjectModel(ServicePricing)
    private servicePricingModel: typeof ServicePricing,
    @InjectModel(NearByDrivers)
    private nearByDriversModel: typeof NearByDrivers,
    @InjectModel(NearByLaundromats)
    private nearByLaundromatsModel: typeof NearByLaundromats,
    @InjectModel(Addresses)
    private addressesModel: typeof Addresses,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(Media)
    private mediaModel: typeof Media,
    @InjectModel(ServiceChangeRequest)
    private serviceChangeRequestModel: typeof ServiceChangeRequest,
  ) { }

  async getAvailableServices(
    getAvailableServicesDTO: GetAvailableServicesDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { lat, long } = getAvailableServicesDTO;
      const haversine = `(6371 * acos(cos(radians(${lat})) * cos(radians(Users.lat)) * cos(radians(Users.long) - radians(${long})) + sin(radians(${lat})) * sin(radians(Users.lat))))`;
      const laundromats = await this.usersModel.findAll({
        where: {
          active: true,
          user_type: UserType.LAUNDROMAT,
        },
        include: [
          {
            model: this.userServicesModel,
            attributes: ['id', 'service_type'],
          },
        ],
        attributes: [
          'id',
          'first_name',
          'last_name',
          [sequelize.literal(haversine), 'distance'],
        ],
        order: sequelize.col('distance'),
        having: sequelize.literal(`distance <= ${process.env.DISTANCE}`),
      });
      const services = laundromats.map((item) => item.services).flat();
      return {
        data: { services: _.uniqBy(services, 'service_type') },
        message: messages.services_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createServiceRequest(
    serviceRequestDTO: CreateServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const {
        payment_intent_id,
        weight,
        scented,
        unscented,
        separate,
        hypoallergenic,
        warm_water,
        hard_water,
        use_own_products,
        bleach,
        softner,
        dryer_sheet,
        same_day_delivery,
        drop_outside_door,
        special_instructions,
        delivery_type,
        service_type,
        pick_up_at,
        drop_off_at,
        pick_up,
        drop_off,
        sub_service_type,
        amount,
        address_id,
        no_of_bag,
        gst_hst,
        pst,
        same_day_delivery_fee,
        delivery_fee,
        bleach_fee,
        scent_fee,
        softner_fee,
        dryer_sheet_fee,
        separate_fee,
      } = serviceRequestDTO;
      const futureIntent = await this.utilsStripeService.getPaymentIntent({
        payment_intent_id,
      });
      const paymentMethod = await this.utilsStripeService.getPaymentMethod({
        payment_method_id: `${futureIntent.payment_method}`,
      });
      const request = await this.serviceRequestModel.create({
        weight,
        no_of_bag,
        scented,
        unscented,
        separate,
        hypoallergenic,
        warm_water,
        hard_water,
        use_own_products,
        bleach,
        softner,
        dryer_sheet,
        same_day_delivery,
        drop_outside_door,
        special_instructions,
        delivery_type,
        service_type,
        pick_up_at,
        drop_off_at,
        pick_up,
        drop_off,
        user_id,
        sub_service_type,
        address_id,
        amount,
        gst_hst,
        pst,
        same_day_delivery_fee,
        delivery_fee,
        bleach_fee,
        scent_fee,
        softner_fee,
        dryer_sheet_fee,
        separate_fee,
      });
      await this.transactionsModel.create({
        service_request_id: request.id,
        payment_intent_id: futureIntent.id,
        payment_method_id: paymentMethod.id,
        user_id,
        amount,
      });
      this.eventEmitter.emit('service_request.created', {
        user_id,
        id: request.id,
      });
      return {
        data: { request },
        message: messages.services_request_created_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateServiceRequest(
    updateServiceRequestDTO: UpdateServiceRequestDTO,
    user_id: number,
    images: any[],
  ): Promise<Response> {
    try {
      const {
        id,
        weight,
        amount,
        gst_hst,
        pst,
        bleach_fee,
        scent_fee,
        softner_fee,
        dryer_sheet_fee,
        separate_fee,
        same_day_delivery_fee,
        delivery_fee
      } = updateServiceRequestDTO;
      if (!id || !weight || !amount || !gst_hst || !pst || !same_day_delivery_fee || !delivery_fee) {
        throw new BadRequestException(messages.required_fields);
      }

      let request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      if (request.weight != weight) {
        await this.eventEmitter.emit('service_request.confirm_by_user', {
          id: request.id,
          weight,
          amount
        });
      }
      request.update({
        weight,
        amount,
        gst_hst,
        pst,
        bleach_fee,
        scent_fee,
        softner_fee,
        dryer_sheet_fee,
        separate_fee,
        same_day_delivery_fee,
        delivery_fee,
      });
      request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
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
      });

      if (images.length > 0) {
        const mediaPromises = images.map(async (file) => {
          const mediaPath = await this.utilsStorageService.save(file);
          return {
            user_id,
            service_request_id: request.id,
            media_path: mediaPath,
            media_type: MediaType.UPDATE_REQUEST,
          };
        });
        const mediaEntries = await Promise.all(mediaPromises);
        await this.mediaModel.bulkCreate(mediaEntries);
      }

      return {
        data: { request: request.get() },
        message: messages.services_update_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async confirmServiceRequest(
    confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    user_id: number,
    images: any[],
  ): Promise<Response> {
    try {
      const { id } = confirmServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.CONFIRMED,
      });
      if (images && images.length > 0) {
        const mediaPromises = images.map(async (file) => {
          const mediaPath = await this.utilsStorageService.save(file);
          return {
            user_id,
            service_request_id: id,
            media_path: mediaPath,
            media_type: MediaType.CONFIRM_REQUEST,
          };
        });
        const mediaEntries = await Promise.all(mediaPromises);
        await this.mediaModel.bulkCreate(mediaEntries);
      }
      this.eventEmitter.emit('service_request.confirm_by_driver', {
        id: request.id,
      });
      return {
        data: { request: request.get() },
        message: messages.services_confirmed_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async acceptServiceRequest(
    acceptServiceRequestDTO: AcceptServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id, are_you_laundromat } = acceptServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      const findDriver = await this.nearByDriversModel.findOne({
        where: {
          service_request_id: id,
          driver_id: user_id,
        },
      });
      if (!findDriver) {
        throw new BadRequestException(messages.services_already_accepted);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.DRIVER_ACCEPTED,
        driver_id: user_id,
      });
      findDriver.destroy();
      this.eventEmitter.emit('service_request.driver_accepted', {
        user_id,
        id: request.id,
        are_you_laundromat,
      });
      return {
        data: {},
        message: messages.services_accepted_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async rejectServiceRequest(
    rejectServiceRequestDTO: RejectServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = rejectServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      const driver = await this.nearByDriversModel.findOne({
        where: {
          service_request_id: id,
          driver_id: user_id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      driver.destroy();
      const remainingDrivers = await this.nearByDriversModel.findAll({
        where: {
          service_request_id: id,
        },
      });
      if (remainingDrivers.length == 0) {
        this.eventEmitter.emit('service_request.no_driver', {
          id: request.id,
        });
      }
      return {
        data: {},
        message: messages.services_rejected_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getServicePricing(user_id: number): Promise<Response> {
    try {
      const pricing = await this.servicePricingModel.findAll({
        attributes: [
          'id',
          'service_type',
          'sub_service_type',
          'delivery_type',
          'price',
          'same_day_delivery_fee',
          'separate',
          'bleach',
          'softner',
          'dryer_sheet',
          'scent'
        ],
      });
      return {
        data: { pricing },
        message: messages.services_pricing_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getPaymentIntent(user_id: number): Promise<Response> {
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: user_id,
        },
      });
      const paymentIntent =
        await this.utilsStripeService.setupFuturePaymentIntent({
          customer_id: user.stripe_customer_id,
        });
      return {
        data: {
          intent_id: paymentIntent.id,
          intent_client_secret: paymentIntent.client_secret,
          customer_id: user.stripe_customer_id,
        },
        message: messages.payment_intent_created_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getNewServiceRequest(user_id: number, getNewServiceRequestDTO: GetNewServiceRequestDTO): Promise<Response> {
    try {
      let { page, page_size } = getNewServiceRequestDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      const requests = await this.serviceRequestModel.findAndCountAll({
        include: [
          {
            model: this.nearByDriversModel,
            attributes: [],
            where: {
              driver_id: user_id,
            },
          },
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
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
        ],
        attributes: {
          exclude: ['updated_at'],
        },
        order: [['created_at', 'DESC']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: requests.count,
        total_pages: Math.ceil(requests.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };
      return {
        data: { requests: requests.rows, paging },
        message: messages.services_request_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getOngoingServiceRequest(user_id: number, getNewServiceRequestDTO: GetNewServiceRequestDTO): Promise<Response> {
    try {
      let { page, page_size } = getNewServiceRequestDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      const requests = await this.serviceRequestModel.findAndCountAll({
        where: {
          driver_id: user_id,
          service_request_status: {
            [Op.notIn]: [
              ServiceRequestStatus.CANCELED,
              ServiceRequestStatus.COMPLETE,
            ],
          },
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
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
          exclude: ['updated_at'],
        },
        order: [['created_at', 'DESC']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: requests.count,
        total_pages: Math.ceil(requests.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };
      return {
        data: { requests: requests.rows, paging },
        message: messages.services_request_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getServiceRequests(user_id: number, getNewServiceRequestDTO: GetNewServiceRequestDTO): Promise<Response> {
    try {
      let { page, page_size } = getNewServiceRequestDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      const requests = await this.serviceRequestModel.findAndCountAll({
        where: {
          user_id,
        },
        attributes: [
          'id',
          'service_type',
          'sub_service_type',
          'service_request_status',
          'created_at',
          'weight',
          'amount',
        ],
        order: [['created_at', 'DESC']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: requests.count,
        total_pages: Math.ceil(requests.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };
      return {
        data: { requests: requests.rows, paging },
        message: messages.service_requests_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getServiceRequestDetails(
    user_id: number,
    getServiceRequestDetailsDTO: GetServiceRequestDetailsDTO,
  ): Promise<Response> {
    try {
      const { id } = getServiceRequestDetailsDTO;
      const requests = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
          },
          {
            model: this.walletModel,
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
          },
          {
            model: this.reviewModel,
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
      });
      requests.service_change_request?.map((item) => {
        item?.media?.map((item) => {
          item.media_path = item.mediaWithBaseUrl;
        });
      });

      const result = [];

      let images = await this.mediaModel.findAll({
        where: {
          service_request_id: id,
          media_type: {
            [Op.in]: [
              'UPDATE_REQUEST',
              'CONFIRM_PICKUP',
              'CONFIRM_DELIVERY',
              'CONFIRM_REQUEST',
            ],
          },
        },
      });
      images.map((item) => {
        result.push(item)
      });
      const imagePromises = requests.service_change_request?.map(async (item) => {
        if (item.status == 'ACCEPTED') {
          images = await this.mediaModel.findAll({
            where: {
              service_request_id: id,
              service_change_request_id: item.id,
            },
          });
        }
        images.map((item) => {
          result.push(item)
        });

        return images;
      });
      const image = await Promise.all(imagePromises);

      result.map((item) => {
        item.media_path = item.mediaWithBaseUrl;
      });
      const seenIds = new Set();
      const uniqueImages = result.filter(image => {
        if (seenIds.has(image.id)) {
          return false;
        } else {
          seenIds.add(image.id);
          return true;
        }
      });
      
      //console.log(uniqueImages);

      return {
        data: { requests, images: uniqueImages },
        message: messages.service_requests_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async acceptLaundromatServiceRequest(
    acceptServiceRequestDTO: AcceptServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = acceptServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      const findLaundromat = await this.nearByLaundromatsModel.findOne({
        where: {
          service_request_id: id,
          laundromat_id: user_id,
        },
      });
      if (!findLaundromat) {
        throw new BadRequestException(messages.services_already_accepted);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.LAUNDROMAT_ACCEPTED,
        laundromat_id: user_id,
      });
      findLaundromat.destroy();
      this.eventEmitter.emit('service_request.laundromat_accepted', {
        user_id,
        id: request.id,
      });
      return {
        data: {},
        message: messages.services_accepted_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async rejectLaundromatServiceRequest(
    rejectServiceRequestDTO: RejectServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = rejectServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      const laundromat = await this.nearByLaundromatsModel.findOne({
        where: {
          service_request_id: id,
          laundromat_id: user_id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      laundromat.destroy();

      const remainingLaundromat = await this.nearByLaundromatsModel.findAll({
        where: {
          service_request_id: id,
        },
      });
      if (remainingLaundromat.length == 0) {
        this.eventEmitter.emit('service_request.no_laundromat', {
          id: request.id,
        });
      }
      return {
        data: {},
        message: messages.services_rejected_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getNewServiceRequestLaundromat(user_id: number,getNewServiceRequestDTO: GetNewServiceRequestDTO): Promise<Response> {
    try {
      let { page, page_size } = getNewServiceRequestDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      const requests = await this.serviceRequestModel.findAndCountAll({
        include: [
          {
            model: this.nearByLaundromatsModel,
            attributes: [],
            where: {
              laundromat_id: user_id,
            },
          },
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
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
          exclude: ['updated_at'],
        },
        order: [['created_at', 'DESC']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: requests.count,
        total_pages: Math.ceil(requests.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };
      return {
        data: { requests: requests.rows, paging },
        message: messages.services_request_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getOngoingServiceRequestLaundromat(user_id: number, getNewServiceRequestDTO: GetNewServiceRequestDTO): Promise<Response> {
    try {
      let { page, page_size } = getNewServiceRequestDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      const requests = await this.serviceRequestModel.findAndCountAll({
        where: {
          laundromat_id: user_id,
          service_request_status: {
            [Op.notIn]: [
              ServiceRequestStatus.CANCELED,
              ServiceRequestStatus.COMPLETE,
            ],
          },
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
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
          exclude: ['updated_at'],
        },
        order: [['created_at', 'DESC']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: requests.count,
        total_pages: Math.ceil(requests.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };
      return {
        data: { requests: requests.rows, paging },
        message: messages.services_request_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getNearByLaundromat(
    user_id: number,
    getServiceRequestDetailsDTO: GetServiceRequestDetailsDTO,
  ): Promise<Response> {
    try {
      const { id } = getServiceRequestDetailsDTO;

      const serviceRequest = await this.serviceRequestModel.findOne({
        where: {
          id: id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: ['lat', 'long'],
          },
        ],
      });
      if (!serviceRequest) {
        throw new BadRequestException(messages.services_not_found);
      }
      const lat = serviceRequest.address.lat;
      const long = serviceRequest.address.long;

      const haversine = `(6371 * acos(cos(radians(${lat})) * cos(radians(Users.lat)) * cos(radians(Users.long) - radians(${long})) + sin(radians(${lat})) * sin(radians(Users.lat))))`;
      const laundromat = await this.usersModel.findAll({
        where: {
          active: true,
          user_type: UserType.LAUNDROMAT,
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
          'address',
          [sequelize.literal(haversine), 'distance'],
        ],
        order: sequelize.col('distance'),
        having: sequelize.literal(`distance <= ${process.env.DISTANCE}`),
      });
      return {
        data: { laundromat },
        message: messages.laundromat_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async assignRequestToLaundromat(
    assignRequestToLaundromatDTO: AssignRequestToLaundromatDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { laundromat_ids, service_request_id } =
        assignRequestToLaundromatDTO;

      for (let index = 0; index < laundromat_ids.length; index++) {
        const element = laundromat_ids[index];
        const laundromat = await this.usersModel.findOne({
          where: {
            id: element,
            active: true,
            is_ready_for_request: true,
          },
        });
        if (!laundromat) {
          throw new BadRequestException(messages.laundromat_not_found);
        }
      }

      this.eventEmitter.emit('service_request.assign_laundromat', {
        laundromat_ids,
        service_request_id,
      });

      return {
        data: {},
        message: messages.request_send,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createChangeRequest(
    createChangeRequestDTO: CreateChangeRequestDTO,
    user_id: number,
    images: any[],
  ): Promise<Response> {
    try {
      const { request_id, amount, notes } = createChangeRequestDTO;

      const checkExistingRequest = await this.serviceChangeRequestModel.findOne(
        {
          where: {
            service_request_id: request_id,
            status: ChangeRequestStatus.PENDING,
          },
        },
      );

      if (checkExistingRequest) {
        throw new BadRequestException(messages.change_request_exist);
      }

      const request = await this.serviceRequestModel.findOne({
        where: {
          id: request_id,
        },
      });

      const changeRequest = await this.serviceChangeRequestModel.create({
        service_request_id: request_id,
        amount,
        notes,
      });

      if (images && images.length > 0) {
        const mediaPromises = images.map(async (file) => {
          const mediaPath = await this.utilsStorageService.save(file);
          return {
            user_id,
            service_request_id: request_id,
            service_change_request_id: changeRequest.id,
            media_path: mediaPath,
            media_type: MediaType.CHANGE_REQUEST,
          };
        });
        const mediaEntries = await Promise.all(mediaPromises);
        await this.mediaModel.bulkCreate(mediaEntries);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.LAUNDROMAT_CHANGE_REQUEST,
      });
      this.eventEmitter.emit('service_request.change_request_created', {
        user_id,
        id: request.id,
      });

      const result = [];
      result.push(changeRequest);

      const requests = await this.serviceRequestModel.findOne({
        where: {
          id: request_id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
          },
          {
            model: this.walletModel,
            attributes: {
              exclude: ['created_at', 'updated_at'],
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
      });
      requests.service_change_request?.map((item) => {
        item?.media?.map((item) => {
          item.media_path = item.mediaWithBaseUrl;
        });
      });

      return {
        data: { service_change_request: result, requests },
        message: messages.change_request_created,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateChangeRequest(
    updateChangeRequestDTO: UpdateChangeRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { change_request_id, status } = updateChangeRequestDTO;

      const request = await this.serviceChangeRequestModel.findOne({
        where: {
          id: change_request_id,
        },
        attributes: ['id', 'amount', 'notes', 'status', 'service_request_id'],
      });
      const serviceRequest = await this.serviceRequestModel.findOne({
        where: {
          id: request.service_request_id,
        },
      });
      if (request) {
        await request.update({
          status,
        });
      }
      if (status == ChangeRequestStatus.ACCEPTED) {
        await serviceRequest.update({
          additional_amount: serviceRequest.additional_amount + request.amount,
          amount: serviceRequest.amount + request.amount,
        });
      }
      this.eventEmitter.emit('service_request.change_request_updated', {
        status,
        id: request.service_request_id,
      });
      return {
        data: { request: request.get() },
        message: messages.change_request_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async confirmLaundromatServiceRequest(
    confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = confirmServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.IN_PROGRESS,
      });
      this.eventEmitter.emit('service_request.laundromat_confirmed', {
        id,
      });
      return {
        data: { request: request.get() },
        message: messages.services_confirmed_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async readyForPickup(
    confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = confirmServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
        // include: [
        //   {
        //     model: this.addressesModel,
        //     attributes: {
        //       exclude: ['active', 'created_at', 'updated_at', 'user_id'],
        //     },
        //   },
        //   {
        //     model: this.usersModel,
        //     as: 'user',
        //     attributes: [
        //       'id',
        //       'email',
        //       'phone',
        //       'first_name',
        //       'last_name',
        //       'notification_token',
        //       'stripe_customer_id',
        //       'socket_id',
        //       'lat',
        //       'long',
        //     ],
        //     include: [
        //       {
        //         model: this.countriesModel,
        //         attributes: [
        //           'id',
        //           'name',
        //           'dial_code',
        //           'emoji',
        //           'image',
        //           'code',
        //         ],
        //         required: false,
        //       },
        //     ],
        //   },
        //   {
        //     model: this.usersModel,
        //     as: 'driver',
        //     attributes: [
        //       'id',
        //       'email',
        //       'phone',
        //       'first_name',
        //       'last_name',
        //       'notification_token',
        //       'stripe_customer_id',
        //       'socket_id',
        //       'lat',
        //       'long',
        //       'driver_current_lat',
        //       'driver_current_long',
        //     ],
        //     include: [
        //       {
        //         model: this.countriesModel,
        //         attributes: [
        //           'id',
        //           'name',
        //           'dial_code',
        //           'emoji',
        //           'image',
        //           'code',
        //         ],
        //         required: false,
        //       },
        //     ],
        //   },
        //   {
        //     model: this.usersModel,
        //     as: 'laundromat',
        //     attributes: [
        //       'id',
        //       'email',
        //       'phone',
        //       'first_name',
        //       'last_name',
        //       'notification_token',
        //       'stripe_customer_id',
        //       'socket_id',
        //       'lat',
        //       'long',
        //       'address',
        //     ],
        //     include: [
        //       {
        //         model: this.countriesModel,
        //         attributes: [
        //           'id',
        //           'name',
        //           'dial_code',
        //           'emoji',
        //           'image',
        //           'code',
        //         ],
        //         required: false,
        //       },
        //     ],
        //   },
        // ],
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      const transaction = await this.transactionsModel.findOne({
        where: {
          service_request_id: request.id,
        },
      });
      // const paymentIntent = await this.utilsStripeService.createPaymentIntent({
      //   payment_method_id: transaction.payment_method_id,
      //   amount: request.amount,
      //   customer_id: request.user.stripe_customer_id,
      // });
      // transaction.update({
      //   stripe_meta_data: paymentIntent,
      // });

      const totalAmount = request.amount + request.additional_amount;
      if (request.delivery_type == DeliveryType.SELF) {
        const laundromat_cut =
          (totalAmount / 100) *
          Number(process.env.LAUNDROMAT_CUT_WITHOUT_DRIVER);
        const laundromat = await this.usersModel.findOne({
          where: {
            id: request.laundromat_id,
          },
        });
        laundromat.update({
          wallet_amount: laundromat.wallet_amount + laundromat_cut,
        });
        await this.walletModel.create({
          user_id: laundromat.id,
          amount: laundromat_cut,
          service_request_id: request.id,
          transactions_id: transaction.id,
        });
      } else {
        const laundromat_cut =
          (totalAmount / 100) * Number(process.env.LAUNDROMAT_CUT);
        const laundromat = await this.usersModel.findOne({
          where: {
            id: request.laundromat_id,
          },
        });
        laundromat.update({
          wallet_amount: laundromat.wallet_amount + laundromat_cut,
        });
        await this.walletModel.create({
          user_id: laundromat.id,
          amount: laundromat_cut,
          service_request_id: request.id,
          transactions_id: transaction.id,
        });

        const driver_cut = (totalAmount / 100) * Number(process.env.DRIVER_CUT);
        const driver = await this.usersModel.findOne({
          where: {
            id: request.driver_id,
          },
        });
        driver.update({
          wallet_amount: driver.wallet_amount + driver_cut,
        });
        await this.walletModel.create({
          user_id: driver.id,
          amount: driver_cut,
          service_request_id: request.id,
          transactions_id: transaction.id,
        });
      }
      await request.update({
        service_request_status: ServiceRequestStatus.READY_FOR_PICKUP,
      });
      this.eventEmitter.emit('service_request.ready_for_pick_up', {
        id,
      });
      return {
        data: { request: request.get() },
        message: messages.services_confirmed_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getLastOrder(user_id: number): Promise<Response> {
    try {

      const request = await this.serviceRequestModel.findOne({
        where: {
          user_id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
            },
          },
          {
            model: this.walletModel,
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
          },
          {
            model: this.reviewModel,
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
        order: [['created_at', 'desc']],
        limit: 1,
      });
      request.service_change_request?.map((item) => {
        item?.media?.map((item) => {
          item.media_path = item.mediaWithBaseUrl;
        });
      });

      return {
        data: { last_request: request },
        message: messages.service_requests_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async repeatOrder(
    user_id: number,
    repeatOrderDTO: RepeatOrderDTO,
  ): Promise<Response> {
    try {
      const { service_request_id } = repeatOrderDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id: service_request_id,
          user_id,
        },
        include: [
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
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
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      const repeat_request = await this.serviceRequestModel.create({
        weight: request.weight,
        no_of_bag: request.no_of_bag,
        scented: request.scented,
        unscented: request.unscented,
        separate: request.separate,
        hypoallergenic: request.hypoallergenic,
        warm_water: request.warm_water,
        hard_water: request.hard_water,
        use_own_products: request.use_own_products,
        bleach: request.bleach,
        softner: request.softner,
        dryer_sheet: request.dryer_sheet,
        same_day_delivery: request.same_day_delivery,
        drop_outside_door: request.drop_outside_door,
        special_instructions: request.special_instructions,
        delivery_type: request.delivery_type,
        service_type: request.service_type,
        pick_up_at: request.pick_up_at,
        drop_off_at: request.drop_off_at,
        pick_up: request.pick_up,
        drop_off: request.drop_off,
        user_id: request.user_id,
        sub_service_type: request.sub_service_type,
        address_id: request.address_id,
        amount: request.amount,
      });
      this.eventEmitter.emit('service_request.created', {
        user_id,
        id: repeat_request.id,
      });
      return {
        data: { repeat_request: repeat_request.get() },
        message: messages.services_request_created_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async confirmPickUp(
    confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    user_id: number,
    images: any[],
  ): Promise<Response> {
    try {
      const { id } = confirmServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.PICKED_UP,
      });
      this.eventEmitter.emit('service_request.order_picked_up', {
        id,
      });
      if (images.length > 0) {
        const mediaPromises = images.map(async (file) => {
          const mediaPath = await this.utilsStorageService.save(file);
          return {
            user_id,
            service_request_id: request.id,
            media_path: mediaPath,
            media_type: MediaType.CONFIRM_PICKUP,
          };
        });
        const mediaEntries = await Promise.all(mediaPromises);
        await this.mediaModel.bulkCreate(mediaEntries);
      }
      return {
        data: { request: request.get() },
        message: messages.services_picked_up_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async confirmDelivery(
    confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    user_id: number,
    images: any[],
  ): Promise<Response> {
    try {
      const { id } = confirmServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
        },
      });
      if (!request) {
        throw new BadRequestException(messages.services_not_found);
      }
      await request.update({
        service_request_status: ServiceRequestStatus.COMPLETE,
      });
      this.eventEmitter.emit('service_request.order_delivered', {
        id,
      });
      if (images.length > 0) {
        const mediaPromises = images.map(async (file) => {
          const mediaPath = await this.utilsStorageService.save(file);
          return {
            user_id,
            service_request_id: request.id,
            media_path: mediaPath,
            media_type: MediaType.CONFIRM_DELIVERY,
          };
        });
        const mediaEntries = await Promise.all(mediaPromises);
        await this.mediaModel.bulkCreate(mediaEntries);
      }
      return {
        data: { request: request.get() },
        message: messages.services_delivered_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getOrderHistory(
    getOrderHistoryDTO: GetOrderHistoryDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { filter } = getOrderHistoryDTO;
      let { page, page_size } = getOrderHistoryDTO;
      page = page ? Number(page) : 1;
      page_size = page_size ? Number(page_size) : 20;
      let service_request_status, conditions;
      const user = await this.utilsHelperService.getUser(user_id);

      if (filter) {
        if (filter == 'ON_GOING') {
          service_request_status = {
            [Op.in]: [
              'INIT',
              'REQUESTING_DRIVER',
              'DRIVER_ACCEPTED',
              'CONFIRMED',
              'REQUESTING_LAUNDROMAT',
              'LAUNDROMAT_ACCEPTED',
              'LAUNDROMAT_CHANGE_REQUEST',
              'IN_PROGRESS',
            ],
          };
        } else if (filter == 'COMPLETE') {
          service_request_status = {
            [Op.in]: ['COMPLETE'],
          };
        } else if (filter == 'READY_FOR_PICKUP') {
          service_request_status = {
            [Op.in]: ['READY_FOR_PICKUP'],
          };
        } else if (filter == 'CANCELED') {
          service_request_status = {
            [Op.in]: ['CANCELED', 'NO_DRIVER', 'NO_LAUNDROMAT'],
          };
        } else if (filter == 'PICKED_UP') {
          service_request_status = {
            [Op.in]: ['PICKED_UP'],
          };
        } else if (filter == 'ON_THE_WAY') {
          service_request_status = {
            [Op.in]: ['ON_THE_WAY'],
          };
        }
      } else {
        service_request_status = {
          [Op.in]: [
            'INIT',
            'REQUESTING_DRIVER',
            'DRIVER_ACCEPTED',
            'NO_DRIVER',
            'CONFIRMED',
            'REQUESTING_LAUNDROMAT',
            'LAUNDROMAT_ACCEPTED',
            'NO_LAUNDROMAT',
            'LAUNDROMAT_CHANGE_REQUEST',
            'IN_PROGRESS',
            'READY_FOR_PICKUP',
            'PICKED_UP',
            'ON_THE_WAY',
            'CANCELED',
            'COMPLETE',
          ],
        };
      }
      if (user.user_type == UserType.USER) {
        conditions = {
          user_id: user_id,
          service_request_status,
        };
      } else if (user.user_type == UserType.LAUNDROMAT) {
        conditions = {
          laundromat_id: user_id,
          service_request_status,
        };
      } else if (user.user_type == UserType.DELIVERY_PARTNER) {
        conditions = {
          driver_id: user_id,
          service_request_status,
        };
      }

      const request = await this.serviceRequestModel.findAndCountAll({
        where: conditions,
        include: [
          {
            model: this.reviewModel,
            // attributes: {
            //   exclude: ['id', 'review', 'rate', 'user_type'],
            // },
          },
          {
            model: this.addressesModel,
            attributes: {
              exclude: ['active', 'created_at', 'updated_at', 'user_id'],
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
              'address'
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
              'address'
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
        order: [['created_at', 'desc']],
        offset: (page - 1) * page_size,
        limit: page_size,
      });

      const paging = {
        total: request.count,
        total_pages: Math.ceil(request.count / page_size),
        page_size: Number(page_size),
        currentPage: Number(page),
      };

      return {
        data: { request_history: request.rows, paging },
        message: messages.service_requests_fetched_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendTip(sendTipDTO: SendTipDTO, user_id: number): Promise<Response> {
    try {
      const { request_id, amount } = sendTipDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id: request_id,
        },
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
      });
      const user = await this.utilsHelperService.getUser(user_id);
      const driver = await this.utilsHelperService.getUser(request.driver_id);
      const transaction = await this.transactionsModel.findOne({
        where: {
          service_request_id: request.id,
        },
      });
      const payment = await this.utilsStripeService.createPaymentIntent({
        payment_method_id: transaction.payment_method_id,
        amount,
        customer_id: user.stripe_customer_id,
      });

      const tipTransactions = await this.transactionsModel.create({
        payment_intent_id: payment.id,
        transaction_type: WalletTransactionType.TIP,
        payment_method_id: transaction.payment_method_id,
        amount: amount,
        user_id,
        service_request_id: request_id,
      });

      await this.walletModel.create({
        amount,
        type: WalletTransactionType.TIP,
        user_id: request.driver_id,
        service_request_id: request_id,
        transactions_id: tipTransactions.id,
      });
      await driver.update({
        wallet_amount: driver.wallet_amount + amount,
      });
      await request.update({
        tip: amount,
      });

      return {
        data: {},
        message: messages.tip_send_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async rejectServiceRequestByUser(
    rejectServiceRequestDTO: RejectServiceRequestDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { id } = rejectServiceRequestDTO;
      const request = await this.serviceRequestModel.findOne({
        where: {
          id,
          driver_id: null
        },
      });
      if (!request) {
        throw new BadRequestException(messages.service_driver_assign);
      }
      this.eventEmitter.emit('service_request.cancel_by_user', {
        id: request.id,
      });
      return {
        data: {},
        message: messages.services_rejected_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
