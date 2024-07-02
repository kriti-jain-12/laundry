import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
  DeviceType,
  ProofOfWork,
  SSOType,
  ServiceType,
  UserType,
  VehicleType,
} from 'src/utils/enums';
const Joi = BaseJoi.extend(JoiDate);

export interface AddressDTO {
  line_1: string;
  line_2: string;
  pin_code: string;
  lat: number;
  long: number;
}

export interface SignUpDTO {
  country_id: number;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  notification_token: string;
  device_type: DeviceType;
  user_type: UserType;
  referred_by: string;
}

export const SignUpSchema = Joi.object({
  country_id: Joi.number().required(),
  phone: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  password: Joi.string().required(),
  notification_token: Joi.string().optional(),
  device_type: Joi.string()
    .valid(...Object.values(DeviceType))
    .required(),
  user_type: Joi.string()
    .valid(...Object.values(UserType))
    .required(),
  referred_by: Joi.string().optional(),
})
  //.or('phone', 'email')
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface SendCodeDTO {
  country_id: number;
  email: string;
  phone: string;
}

export const SendCodeSchema = Joi.object({
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.string().optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
})
  .xor('phone', 'email')
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface VerifyDTO {
  country_id: number;
  email: string;
  phone: string;
  OTP: number;
}

export const VerifySchema = Joi.object({
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.number().optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  OTP: Joi.number().required(),
})
  .xor('phone', 'email')
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface LoginDTO {
  email: string;
  password: string;
  notification_token: string;
  device_type: DeviceType;
  user_type: UserType;
}

export const LoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
  notification_token: Joi.string().optional(),
  user_type: Joi.string()
  .valid(...Object.values(UserType))
  .required(),
  device_type: Joi.string()
    .valid(...Object.values(DeviceType))
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface RequestForgotPasswordDTO {
  country_id: number;
  email: string;
  phone: string;
}

export const RequestForgotPasswordSchema = Joi.object({
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.string().optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
})
  .xor('phone', 'email')
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface VerifyForgotPasswordDTO {
  country_id: number;
  email: string;
  phone: string;
  OTP: number;
}

export const VerifyForgotPasswordSchema = Joi.object({
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.number().optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  OTP: Joi.number().required(),
})
  .xor('phone', 'email')
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export const ResetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface SSOAuthDTO {
  sso_id: string;
  sso_type: SSOType;
  first_name: string;
  last_name: string;
  country_id: number;
  email: string;
  phone: string;
  device_type: DeviceType;
  user_type: UserType;
}

export const SSOAuthSchema = Joi.object({
  sso_id: Joi.string().required(),
  sso_type: Joi.string()
    .valid(...Object.values(SSOType))
    .required(),
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  phone: Joi.string().optional(),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  device_type: Joi.string()
    .valid(...Object.values(DeviceType))
    .required(),
  user_type: Joi.string()
    .valid(...Object.values(UserType))
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface VerifyReferredCodeDTO {
  code: string;
}

export const VerifyReferredCodeSchema = Joi.object({
  code: Joi.string().required(),
})
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });
export interface ServiceProviderSignupDTO {
  country_id: number;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  notification_token: string;
  device_type: DeviceType;
  user_type: UserType;
  services: string;
  proof_of_work: ProofOfWork;
  is_laundromat_driver_both: number;
  vehicle_type: VehicleType;
  GST_number: string;
  organization_name: string;
  have_pet: number;
  have_smoker: number;
  have_dryer_washer: number;
}

export const ServiceProviderSignupSchema = Joi.object({
  country_id: Joi.number().required(),
  phone: Joi.string().optional(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  password: Joi.string().required(),
  notification_token: Joi.string().optional(),
  device_type: Joi.string()
    .valid(...Object.values(DeviceType))
    .required(),
  user_type: Joi.string()
    .valid(...Object.values(UserType))
    .required(),
  services: Joi.string().optional(),
  proof_of_work: Joi.string()
    .valid(...Object.values(ProofOfWork))
    .required(),
  is_laundromat_driver_both: Joi.number().required(),
  vehicle_type: Joi.string()
    .valid(...Object.values(VehicleType))
    .optional(),
  GST_number: Joi.string().optional(),
  organization_name: Joi.string().optional(),
  have_pet: Joi.number().optional(),
  have_smoker: Joi.number().optional(),
  have_dryer_washer: Joi.number().optional(),
}).options({
  abortEarly: false,
  allowUnknown: true,
});
