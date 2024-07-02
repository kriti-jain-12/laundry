import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { DeviceType, ReviewUserType, ServiceType } from 'src/utils/enums';
const Joi = BaseJoi.extend(JoiDate);

export interface UpdateUserLocationDTO {
  lat: number;
  long: number;
  radius: number;
}

export const UpdateUserLocationSchema = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
  radius: Joi.number().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface UpdateProfileDTO {
  country_id: number;
  first_name: string;
  last_name: string;
  device_type: DeviceType;
  email: string;
  phone: string;
  notification_token: string;
  lat: number;
  long: number;
  is_ready_for_request: boolean;
  services: Array<ServiceType>;
}

export const UpdateProfileSchema = Joi.object({
  country_id: Joi.number().when('phone', {
    is: Joi.exist(),
    then: Joi.required().required(),
    otherwise: Joi.forbidden(),
  }),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  device_type: Joi.string()
    .valid(...Object.values(DeviceType))
    .optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  phone: Joi.string().optional(),
  notification_token: Joi.string().optional(),
  lat: Joi.number().optional(),
  long: Joi.number().optional(),
  is_ready_for_request: Joi.boolean().optional(),
  services: Joi.array()
    .items(Joi.string().valid(...Object.values(ServiceType)))
    .min(1)
    .optional(),
})
  .or(
    'first_name',
    'last_name',
    'device_type',
    'email',
    'phone',
    'notification_token',
    'lat',
    'long',
    'services',
    'is_ready_for_request',
  )
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface ChangePasswordDTO {
  old_password: string;
  new_password: string;
}

export const ChangePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface SubmitBackgroundVerificationDTO {
  is_gig_worker: boolean;
}

export const SubmitBackgroundVerificationSchema = Joi.object({
  is_gig_worker: Joi.boolean().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface SetLaundromatLocationDTO {
  lat: number;
  long: number;
  address: string;
}

export const SetLaundromatLocationSchema = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
  address: Joi.string().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface SubmitReviewDTO {
  rate_driver: number;
  review_driver: string;
  rate_laundromat: number;
  review_laundromat: string;
  service_request_id: number;
}

export const SubmitReviewSchema = Joi.object({
  rate_driver: Joi.number().required(),
  review_driver: Joi.string().optional(),
  rate_laundromat: Joi.number().required(),
  review_laundromat: Joi.string().optional(),
  service_request_id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface GetWalletHistoryDTO {
  filter: string;
}

export const GetWalletHistorySchema = Joi.object({
  filter: Joi.string().valid('TODAY', 'WEEKLY').required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});
