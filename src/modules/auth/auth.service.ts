import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from '../../utils/response';
import { JwtService } from '@nestjs/jwt';
import { UtilsHelperService } from '../utils/utils.helper.service';
import { InjectModel } from '@nestjs/sequelize';
import Users from 'src/models/users/users.model';
import { auth as messages } from '../../utils/messages';
import { Op } from 'sequelize';
import Verification from 'src/models/users/users.verification.model';
import {
  SignUpDTO,
  SendCodeDTO,
  VerifyDTO,
  LoginDTO,
  RequestForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  ResetPasswordDTO,
  SSOAuthDTO,
  VerifyReferredCodeDTO,
  ServiceProviderSignupDTO,
} from './dto/auth.dto';
import { UtilsTimezoneService } from '../utils/utils.timezone.service';
import { UtilsStripeService } from '../utils/utils.stripe.service';
import Countries from 'src/models/users/countries.model';
import UserService from 'src/models/users/user.services.model';
import Sessions from 'src/models/users/users.session.model';
import { ServiceType, UserType } from 'src/utils/enums';
import { UtilsStorageService } from '../utils/utils.storage.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly utilsHelperService: UtilsHelperService,
    private readonly utilsStorageService: UtilsStorageService,
    private readonly utilsTimezoneService: UtilsTimezoneService,
    private readonly utilsStripeService: UtilsStripeService,
    private readonly jwtService: JwtService,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(UserService)
    private userServiceModel: typeof UserService,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(Verification)
    private verificationModel: typeof Verification,
    @InjectModel(Sessions)
    private sessionsModel: typeof Sessions,
  ) {}

  async signUp(signUpDTO: SignUpDTO): Promise<Response> {
    try {
      const {
        country_id,
        phone,
        first_name,
        last_name,
        email,
        password,
        notification_token,
        device_type,
        user_type,
        referred_by,
      } = signUpDTO;

      const country = await this.countriesModel.findOne({
        where: { id: country_id },
      });

      let user = await this.userModel.findOne({
        where: {
          email,
          country_id,
          phone,
          user_type,
        },
        include: ['country'],
      });
      if (user) {
        if (user.is_verified) {
          throw new BadRequestException(messages.user_already_exist);
        } else {
          return {
            data: {
              user: {
                id: user.id,
                country_id: user.country_id,
                country_code: user?.country?.dial_code ?? null,
                phone: user.phone,
                email: user.email,
                is_verified: user.is_verified,
              },
            },
            message: messages.user_already_in_progress,
          };
        }
      }

      const referralCode = await this.generateReferralCode(
        first_name,
        last_name,
      );

      const customer = await this.utilsStripeService.createCustomer({
        name: `${first_name} ${last_name}`,
        email,
        phone: `${country.dial_code}${phone}`,
      });
      user = await this.userModel.create({
        country_id,
        phone,
        first_name,
        last_name,
        email,
        notification_token,
        device_type,
        password: await this.utilsHelperService.hashPassword(password),
        stripe_customer_id: customer.id,
        user_type,
        referral_code: referralCode,
        referred_by,
      });
      user = await this.utilsHelperService.getUser(user.id);
      const OTP = Math.floor(100000 + Math.random() * 900000);
      await this.verificationModel.create({
        email,
        phone,
        country_id: country_id,
        OTP,
      });
      return {
        data: {
          user,
          OTP,
        },
        message: messages.sign_up_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async serviceProviderSignUp(
    serviceProviderSignupDTO: ServiceProviderSignupDTO,
    proof_of_work_media: any,
    abstract: any,
  ): Promise<Response> {
    try {
      const {
        country_id,
        phone,
        first_name,
        last_name,
        email,
        password,
        notification_token,
        device_type,
        user_type,
        services,
        proof_of_work,
        is_laundromat_driver_both,
        vehicle_type,
        GST_number,
        organization_name,
        have_pet,
        have_smoker,
        have_dryer_washer,
      } = serviceProviderSignupDTO;

      if (!proof_of_work_media) {
        throw new BadRequestException(messages.upload_proof_of_work);
      }

      if (user_type == UserType.DELIVERY_PARTNER) {
        if (!abstract) {
          throw new BadRequestException(messages.upload_abstract);
        }
      }

      const country = await this.countriesModel.findOne({
        where: { id: country_id },
      });

      let user = await this.userModel.findOne({
        where: {
          [Op.or]: [
            {
              email,
            },
            phone
              ? {
                  country_id,
                  phone,
                }
              : {},
          ],
          user_type,
        },
        include: ['country'],
      });
      if (user) {
        if (user.is_verified) {
          throw new BadRequestException(messages.user_already_exist);
        } else {
          return {
            data: {
              user: {
                id: user.id,
                country_id: user.country_id,
                country_code: user?.country?.dial_code ?? null,
                phone: user.phone,
                email: user.email,
                is_verified: user.is_verified,
              },
            },
            message: messages.user_already_in_progress,
          };
        }
      }

      const proof_media = await this.utilsStorageService.save(
        proof_of_work_media,
      );
      let abstract_media;

      if (abstract) {
        abstract_media = await this.utilsStorageService.save(abstract);
      }

      if (is_laundromat_driver_both == 1) {
        if (!services) {
          throw new BadRequestException(messages.no_services_selected);
        }
        if (user_type == UserType.LAUNDROMAT) {
          const laundromat = await this.utilsStripeService.createCustomer({
            name: `${first_name} ${last_name} ${user_type}`,
            email,
            phone: phone ? `${country.dial_code}${phone}` : '',
          });
          const driver = await this.utilsStripeService.createCustomer({
            name: `${first_name} ${last_name} ${UserType.DELIVERY_PARTNER}`,
            email,
            phone: phone ? `${country.dial_code}${phone}` : '',
          });
          user = await this.userModel.create({
            country_id,
            phone,
            first_name,
            last_name,
            email,
            notification_token,
            device_type,
            password: await this.utilsHelperService.hashPassword(password),
            stripe_customer_id: laundromat.id,
            user_type,
            proof_of_work,
            is_laundromat_driver_both:
              is_laundromat_driver_both == 1 ? true : false,
            GST_number,
            organization_name,
            have_pet: have_pet == 1 ? true : false,
            have_smoker: have_smoker == 1 ? true : false,
            have_dryer_washer: have_dryer_washer == 1 ? true : false,
            proof_of_work_media: proof_media,
            abstract_media,
          });
          const s = services.split(',');
          await this.userServiceModel.bulkCreate(
            s.map((item) => {
              return {
                user_id: user.id,
                service_type: ServiceType[item],
              };
            }),
          );
          await this.userModel.create({
            country_id,
            phone,
            first_name,
            last_name,
            email,
            device_type,
            password: await this.utilsHelperService.hashPassword(password),
            stripe_customer_id: driver.id,
            user_type: UserType.DELIVERY_PARTNER,
            proof_of_work,
            is_laundromat_driver_both:
              is_laundromat_driver_both == 1 ? true : false,
            vehicle_type,
            proof_of_work_media: proof_media,
            abstract_media,
          });
        } else if (user_type == UserType.DELIVERY_PARTNER) {
          const driver = await this.utilsStripeService.createCustomer({
            name: `${first_name} ${last_name} ${user_type}`,
            email,
            phone: phone ? `${country.dial_code}${phone}` : '',
          });
          const laundromat = await this.utilsStripeService.createCustomer({
            name: `${first_name} ${last_name} ${UserType.LAUNDROMAT}`,
            email,
            phone: phone ? `${country.dial_code}${phone}` : '',
          });
          user = await this.userModel.create({
            country_id,
            phone,
            first_name,
            last_name,
            email,
            notification_token,
            device_type,
            password: await this.utilsHelperService.hashPassword(password),
            stripe_customer_id: driver.id,
            user_type,
            proof_of_work,
            is_laundromat_driver_both:
              is_laundromat_driver_both == 1 ? true : false,
            vehicle_type,
            proof_of_work_media: proof_media,
            abstract_media,
          });
          const l = await this.userModel.create({
            country_id,
            phone,
            first_name,
            last_name,
            email,
            device_type,
            password: await this.utilsHelperService.hashPassword(password),
            stripe_customer_id: laundromat.id,
            user_type: UserType.LAUNDROMAT,
            proof_of_work,
            is_laundromat_driver_both:
              is_laundromat_driver_both == 1 ? true : false,
            GST_number,
            organization_name,
            have_pet: have_pet == 1 ? true : false,
            have_smoker: have_smoker == 1 ? true : false,
            have_dryer_washer: have_dryer_washer == 1 ? true : false,
            proof_of_work_media: proof_media,
            abstract_media,
          });
          const s = services.split(',');
          await this.userServiceModel.bulkCreate(
            s.map((item) => {
              return {
                user_id: l.id,
                service_type: ServiceType[item],
              };
            }),
          );
        }
      } else {
        const customer = await this.utilsStripeService.createCustomer({
          name: `${first_name} ${last_name}`,
          email,
          phone: phone ? `${country.dial_code}${phone}` : '',
        });
        user = await this.userModel.create({
          country_id,
          phone,
          first_name,
          last_name,
          email,
          notification_token,
          device_type,
          password: await this.utilsHelperService.hashPassword(password),
          stripe_customer_id: customer.id,
          user_type,
          proof_of_work,
          is_laundromat_driver_both:
            is_laundromat_driver_both == 1 ? true : false,
          vehicle_type,
          GST_number,
          organization_name,
          have_pet: have_pet == 1 ? true : false,
          have_smoker: have_smoker == 1 ? true : false,
          have_dryer_washer: have_dryer_washer == 1 ? true : false,
          proof_of_work_media: proof_media,
          abstract_media,
        });
        if (services) {
          const s = services.split(',');
          await this.userServiceModel.bulkCreate(
            s.map((item) => {
              return {
                user_id: user.id,
                service_type: ServiceType[item],
              };
            }),
          );
        }
      }
      user = await this.utilsHelperService.getUser(user.id);
      const OTP = Math.floor(100000 + Math.random() * 900000);
      await this.verificationModel.create({
        email,
        phone,
        country_id: country_id,
        OTP,
      });
      return {
        data: {
          user,
          OTP,
        },
        message: messages.sign_up_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async ssoAuth(ssoAuthDTO: SSOAuthDTO): Promise<Response> {
    try {
      const {
        sso_id,
        sso_type,
        first_name,
        last_name,
        country_id,
        email,
        phone,
        device_type,
        user_type,
      } = ssoAuthDTO;

      let country;

      if (country_id) {
        country = await this.countriesModel.findOne({
          where: { id: country_id },
        });
      }
      let user = await this.userModel.findOne({
        where: {
          sso_id,
          user_type,
        },
      });
      if (user) {
        user = await this.utilsHelperService.getUser(user.id);
      } else {
        const customer = await this.utilsStripeService.createCustomer({
          name: `${first_name} ${last_name}`,
          email: email || '',
          phone: phone ? `${country.dial_code}${phone}` : '',
        });
        user = await this.userModel.create({
          sso_id,
          sso_type,
          country_id,
          phone,
          first_name,
          last_name,
          email,
          device_type,
          stripe_customer_id: customer.id,
          user_type,
        });
        user = await this.utilsHelperService.getUser(user.id);
      }
      const token = this.jwtService.sign({ id: user.id });
      await this.sessionsModel.create({
        token,
        user_id: user.id,
      });

      return {
        data: {
          user,
          token,
        },
        message: messages.sso_auth_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendCode(verificationDTO: SendCodeDTO): Promise<Response> {
    try {
      const { country_id, phone, email } = verificationDTO;
      const date = this.utilsTimezoneService.getDateTime();
      const user = await this.userModel.findOne({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
        },
      });
      if (!user) {
        throw new BadRequestException();
      }
      const checkAttempts = await this.verificationModel.findAll({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
          created_at: {
            [Op.between]: [
              date.clone().subtract(2, 'hours').format(),
              date.format(),
            ],
          },
        },
      });
      if (checkAttempts.length >= 8) {
        throw new BadRequestException(messages.max_attempts_reach);
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      await this.verificationModel.create(
        email
          ? {
              email,
              OTP,
            }
          : {
              phone,
              country_id: country_id,
              OTP,
            },
      );
      return {
        data: {
          OTP,
        },
        message: messages.otp_sent,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async verifyCode(verifyDTO: VerifyDTO): Promise<Response> {
    try {
      const { country_id, phone, OTP, email } = verifyDTO;

      const verification = await this.verificationModel.findOne({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
        },
        order: [['id', 'desc']],
      });

      if (!verification) {
        throw new BadRequestException(messages.invalid_verification_code);
      }
      const date = this.utilsTimezoneService
        .getDateTime(true)
        .subtract('15', 'minutes');
      const createdAt = this.utilsTimezoneService.parseTime(
        verification.created_at.toString(),
      );

      if (verification.OTP == OTP) {
        if (createdAt.isBefore(date)) {
          throw new BadRequestException(messages.verification_code_expired);
        }
        const checkUser = await this.userModel.findOne({
          where: {
            [Op.or]: email ? [{ email }] : [{ phone, country_id }],
          },
        });
        await checkUser.update({ is_verified: true });

        if (checkUser.is_laundromat_driver_both) {
          const user_type =
            checkUser.user_type == UserType.LAUNDROMAT
              ? UserType.DELIVERY_PARTNER
              : UserType.LAUNDROMAT;

          const findSecondUser = await this.userModel.findOne({
            where: {
              email: checkUser.email,
              country_id: checkUser.country_id,
              phone: checkUser.phone,
              user_type,
            },
          });
          if (findSecondUser) {
            await findSecondUser.update({ is_verified: true });
          }
        }
        const user = await this.utilsHelperService.getUser(checkUser.id);
        const token = this.jwtService.sign({ id: user.id });
        await this.sessionsModel.create({
          token,
          user_id: user.id,
        });
        return {
          data: {
            user,
            token,
          },
          message: messages.verification_code_verified,
        };
      } else {
        throw new BadRequestException(messages.invalid_verification_code);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async login(loginDTO: LoginDTO): Promise<Response> {
    try {
      const { email, password, notification_token, device_type, user_type } =
        loginDTO;

      const user = await this.userModel.findOne({
        where: {
          email,
          user_type,
        },
      });

      if (!user) {
        throw new BadRequestException(messages.user_not_exist);
      }

      if (
        await this.utilsHelperService.comparePassword(password, user.password)
      ) {
        await user.update({
          notification_token,
          device_type,
        });
        user.save();
        const token = this.jwtService.sign({ id: user.id });
        await this.sessionsModel.create({
          token,
          user_id: user.id,
        });
        return {
          data: {
            user: await this.utilsHelperService.getUser(user.id),
            token,
          },
          message: messages.login_successfully,
        };
      } else {
        throw new BadRequestException(messages.invalid_email_or_password);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async logout(user_id: number, token: string): Promise<Response> {
    try {
      const user = await this.userModel.findOne({ where: { id: user_id } });
      const session = await this.sessionsModel.findOne({ where: { token } });
      await user.update({
        notification_token: null,
        socket_id: null,
      });
      session.destroy();
      return {
        data: {},
        message: messages.logout_successfully,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async requestForgotPassword(
    requestForgotPasswordDTO: RequestForgotPasswordDTO,
  ): Promise<Response> {
    try {
      const { country_id, phone, email } = requestForgotPasswordDTO;
      const date = this.utilsTimezoneService.getDateTime();
      const user = await this.userModel.findOne({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
        },
      });

      if (!user) {
        throw new BadRequestException(messages.user_not_exist);
      }

      const checkAttempts = await this.verificationModel.findAll({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
          created_at: {
            [Op.between]: [
              date.clone().subtract(2, 'hours').format(),
              date.format(),
            ],
          },
        },
      });

      if (checkAttempts.length >= 8) {
        throw new BadRequestException(messages.max_attempts_reach);
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      await this.verificationModel.create(
        email
          ? {
              email,
              OTP,
            }
          : {
              phone,
              country_id: country_id,
              OTP,
            },
      );

      return {
        data: {
          OTP,
        },
        message: messages.otp_sent,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async verifyForgotPassword(
    verifyForgotPasswordDTO: VerifyForgotPasswordDTO,
  ): Promise<Response> {
    try {
      const { country_id, phone, OTP, email } = verifyForgotPasswordDTO;

      const verification = await this.verificationModel.findOne({
        where: {
          [Op.or]: email ? [{ email }] : [{ phone, country_id }],
        },
        order: [['id', 'desc']],
      });

      if (!verification) {
        throw new BadRequestException(messages.invalid_verification_code);
      }

      const date = this.utilsTimezoneService
        .getDateTime(true)
        .subtract('15', 'minutes');

      const createdAt = this.utilsTimezoneService.parseTime(
        verification.created_at.toString(),
      );

      if (verification.OTP == OTP) {
        if (createdAt.isBefore(date)) {
          throw new BadRequestException(messages.verification_code_expired);
        }
        const checkUser = await this.userModel.findOne({
          where: {
            [Op.or]: email ? [{ email }] : [{ phone, country_id }],
          },
        });
        const token = await this.utilsHelperService.encryptData({
          id: checkUser.id,
          timestamp: await this.utilsTimezoneService
            .getDateTime()
            .format('YYYY-MM-DD HH:mm:ss'),
        });
        return {
          data: {
            token,
          },
          message: messages.verification_code_verified,
        };
      } else {
        throw new BadRequestException(messages.invalid_verification_code);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<Response> {
    try {
      const { token, password } = resetPasswordDTO;
      let user_id, timestamp: moment.Moment;
      try {
        const user = await this.utilsHelperService.decryptData(token);
        user_id = user.id;
        timestamp = await this.utilsTimezoneService.parseTime(user.timestamp);
      } catch (e) {
        throw new BadRequestException(messages.invalid_password_token);
      }

      const date = this.utilsTimezoneService
        .getDateTime(true)
        .subtract('15', 'minutes');

      if (timestamp.isBefore(date)) {
        throw new BadRequestException(messages.token_expired);
      }

      const user = await this.utilsHelperService.getUser(user_id);

      if (!user) {
        throw new BadRequestException(messages.user_not_exist);
      }

      await this.userModel.update(
        {
          password: await this.utilsHelperService.hashPassword(password),
        },
        {
          where: {
            id: user_id,
          },
        },
      );
      return {
        data: {},
        message: messages.reset_password_success,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async verifyReferredCode(
    verifyReferredCodeDTO: VerifyReferredCodeDTO,
  ): Promise<Response> {
    const { code } = verifyReferredCodeDTO;
    try {
      const reffered_user = await this.userModel.findOne({
        where: {
          referral_code: code,
          suspended: false,
          active: true,
        },
      });
      if (!reffered_user) {
        throw new BadRequestException(messages.reffered_code_not_found);
      }
      return {
        data: {},
        message: messages.reffered_code_valid,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async generateReferralCode(firstName, lastName) {
    const initials = (firstName[0] + lastName[0]).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const referralCode = initials + randomNumber;
    return referralCode;
  }
}
