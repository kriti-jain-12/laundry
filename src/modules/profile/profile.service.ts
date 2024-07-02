import {
  UpdateUserLocationDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  SubmitBackgroundVerificationDTO,
  SetLaundromatLocationDTO,
  SubmitReviewDTO,
  GetWalletHistoryDTO,
} from './dto/profile.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from '../../utils/response';
import Users from 'src/models/users/users.model';
import { profile as messages } from '../../utils/messages';
import { UtilsStorageService } from '../utils/utils.storage.service';
import { UtilsHelperService } from '../utils/utils.helper.service';
import UserService from 'src/models/users/user.services.model';
import { DeliveryType, ReviewUserType, UserType } from 'src/utils/enums';
import Wallet from 'src/models/transactions/wallet.model';
import ServiceRequest from 'src/models/services/service.request.model';
import Transactions from 'src/models/transactions/transactions.model';
import Addresses from 'src/models/users/user.addresses.model';
import Review from 'src/models/users/review.model';
import { Op } from 'sequelize';
import * as moment from 'moment-timezone';
@Injectable()
export class ProfileService {
  constructor(
    private readonly utilsStorageService: UtilsStorageService,
    private readonly utilsHelperService: UtilsHelperService,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(UserService)
    private userServiceModel: typeof UserService,
    @InjectModel(Wallet)
    private walletModel: typeof Wallet,
    @InjectModel(ServiceRequest)
    private serviceRequestModel: typeof ServiceRequest,
    @InjectModel(Transactions)
    private transactionsModel: typeof Transactions,
    @InjectModel(Addresses)
    private addressesModel: typeof Addresses,
    @InjectModel(Review)
    private reviewModel: typeof Review,
  ) {}

  async updateProfilePicture(profile: any, user_id: number): Promise<Response> {
    try {
      if (!profile) {
        throw new BadRequestException(messages.profile_is_required);
      }
      const media = await this.utilsStorageService.save(profile);
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      await user.update({
        profile: media,
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.profile_picture_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateUserLocation(
    updateUserLocationDTO: UpdateUserLocationDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { lat, long, radius } = updateUserLocationDTO;
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      await user.update({
        lat,
        long,
        radius,
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.user_location_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateProfile(
    updateProfileDTO: UpdateProfileDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const {
        first_name,
        last_name,
        device_type,
        email,
        phone,
        notification_token,
        lat,
        long,
        country_id,
        services,
        is_ready_for_request,
      } = updateProfileDTO;
      let user = await this.usersModel.findOne({ where: { id: user_id } });

      if (email) {
        const checkEmail = await this.usersModel.count({ where: { email } });
        if (checkEmail > 0) {
          throw new BadRequestException(messages.email_already_used);
        }
      }

      if (phone) {
        const checkPhone = await this.usersModel.count({
          where: { phone, country_id },
        });
        if (checkPhone > 0) {
          throw new BadRequestException(messages.phone_already_used);
        }
      }

      if (services) {
        if (user.user_type == UserType.LAUNDROMAT) {
          await this.userServiceModel.destroy({
            where: {
              user_id: user.id,
            },
          });
          await this.userServiceModel.bulkCreate(
            services.map((item) => {
              return {
                user_id: user.id,
                service_type: item,
              };
            }),
          );
        }
      }

      await user.update({
        first_name,
        last_name,
        device_type,
        email,
        phone,
        notification_token,
        lat,
        long,
        is_ready_for_request,
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.user_profile_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async changePassword(
    changePasswordDTO: ChangePasswordDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { old_password, new_password } = changePasswordDTO;
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      const isMatched = await this.utilsHelperService.comparePassword(
        old_password,
        user.password,
      );
      if (!isMatched) {
        throw new BadRequestException(messages.incorrect_password);
      }
      await user.update({
        password: await this.utilsHelperService.hashPassword(new_password),
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {},
        message: messages.user_password_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getProfile(user_id: number): Promise<Response> {
    try {
      const user = await this.utilsHelperService.getUser(user_id);
      return {
        data: {
          user,
        },
        message: messages.user_profile_fetched,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteAccount(user_id: number): Promise<Response> {
    try {
      const user = await this.usersModel.findOne({ where: { id: user_id } });
      user.destroy();
      return {
        data: {},
        message: messages.user_account_deleted,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async submitBackgroundVerification(
    document: any,
    user_id: number,
    submitBackgroundVerificationDTO: SubmitBackgroundVerificationDTO,
  ): Promise<Response> {
    try {
      const { is_gig_worker } = submitBackgroundVerificationDTO;
      if (!document) {
        throw new BadRequestException(messages.document_is_required);
      }
      const media = await this.utilsStorageService.save(document);
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      await user.update({
        is_already_gig_worker: is_gig_worker,
        gig_worker_media: media,
      });

      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.document_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async setLaundromatLocation(
    setLaundromatLocationDTO: SetLaundromatLocationDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { lat, long, address } = setLaundromatLocationDTO;
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      await user.update({
        lat,
        long,
        address,
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.user_location_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateDriverLiveLocation(
    updateUserLocationDTO: UpdateUserLocationDTO,
    user_id: number,
  ): Promise<Response> {
    try {
      const { lat, long } = updateUserLocationDTO;
      let user = await this.usersModel.findOne({ where: { id: user_id } });
      await user.update({
        driver_current_lat: lat,
        driver_current_long: long,
      });
      user = await this.utilsHelperService.getUser(user.id);
      return {
        data: {
          user,
        },
        message: messages.user_location_updated,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getWalletHistory(
    user_id: number,
    getWalletHistoryDTO: GetWalletHistoryDTO,
  ): Promise<Response> {
    try {
      const user = await this.utilsHelperService.getUser(user_id);
      const { filter } = getWalletHistoryDTO;
      let start, end;
      if (filter == 'TODAY') {
        const date = moment().tz('America/Toronto');
        start = date.clone().startOf('D').toDate();
        end = date.clone().endOf('D').toDate();
      } else if (filter == 'WEEKLY') {
        const date = moment().tz('America/Toronto');
        start = date.clone().subtract(7, 'd').startOf('D').toDate();
        end = date.clone().endOf('D').toDate();
      }
      const wallet = await this.walletModel.findAll({
        where: {
          user_id,
          created_at: {
            [Op.between]: [start, end],
          },
        },
        include: [
          {
            model: this.serviceRequestModel,
            attributes: ['id', 'amount', 'weight', 'created_at'],
            include: [
              {
                model: this.addressesModel,
                attributes: {
                  exclude: ['created_at', 'updated_at'],
                },
              },
            ],
          },
          {
            model: this.transactionsModel,
            attributes: ['id', 'amount', 'transaction_type', 'created_at'],
          },
        ],
        attributes: ['id', 'amount', 'type'],
      });

      let remainingBalance = 0;
      if (user.user_type == UserType.DELIVERY_PARTNER) {
        const pendingOrders = await this.serviceRequestModel.findAll({
          where: {
            driver_id: user_id,
            service_request_status: {
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
            },
          },
        });
        let amount = 0;
        pendingOrders.map((item) => {
          amount =
            item.amount + item.additional_amount - (item.gst_hst - item.pst);
        });
        remainingBalance = (amount / 100) * Number(process.env.DRIVER_CUT);
      } else if (user.user_type == UserType.LAUNDROMAT) {
        const pendingOrders = await this.serviceRequestModel.findAll({
          where: {
            laundromat_id: user_id,
            service_request_status: {
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
            },
          },
        });
        let delivery_amount = 0;
        let self_amount = 0;
        pendingOrders.map((item) => {
          if (item.delivery_type == DeliveryType.SELF) {
            self_amount =
              item.amount + item.additional_amount - (item.gst_hst - item.pst);
          } else {
            delivery_amount =
              item.amount + item.additional_amount - (item.gst_hst - item.pst);
          }
        });
        const selfCut =
          (self_amount / 100) *
          Number(process.env.LAUNDROMAT_CUT_WITHOUT_DRIVER);
        const deliveryCut =
          (delivery_amount / 100) * Number(process.env.LAUNDROMAT_CUT);
        remainingBalance = selfCut + deliveryCut;
      }

      return {
        data: {
          wallet,
          remainingBalance,
        },
        message: messages.user_profile_fetched,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async submitReview(
    user_id: number,
    submitReviewDTO: SubmitReviewDTO,
  ): Promise<Response> {
    try {
      const {
        rate_driver,
        rate_laundromat,
        review_driver,
        review_laundromat,
        service_request_id,
      } = submitReviewDTO;

      let checkDriverReview = await this.reviewModel.findOne({
        where: {
          user_id: user_id,
          service_request_id,
          user_type: ReviewUserType.DELIVERY_PARTNER,
        },
      });
      if (checkDriverReview) {
        checkDriverReview = await checkDriverReview.update({
          rate: rate_driver,
          review: review_driver,
        });
      } else {
        checkDriverReview = await this.reviewModel.create({
          rate: rate_driver,
          review: review_driver,
          user_id: user_id,
          service_request_id,
          user_type: ReviewUserType.DELIVERY_PARTNER,
        });
      }

      let checkLaundromatReview = await this.reviewModel.findOne({
        where: {
          user_id: user_id,
          service_request_id,
          user_type: ReviewUserType.LAUNDROMAT,
        },
      });
      if (checkLaundromatReview) {
        checkLaundromatReview = await checkLaundromatReview.update({
          rate: rate_laundromat,
          review: review_laundromat,
        });
      } else {
        checkLaundromatReview = await this.reviewModel.create({
          rate: rate_laundromat,
          review: review_laundromat,
          user_id: user_id,
          service_request_id,
          user_type: ReviewUserType.LAUNDROMAT,
        });
      }

      return {
        data: {
          laundromat_review: checkLaundromatReview.get(),
          driver_review: checkDriverReview.get(),
        },
        message: messages.review_submit,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
