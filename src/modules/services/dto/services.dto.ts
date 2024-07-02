import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
  ChangeRequestStatus,
  DeliveryDayTime,
  DeliveryType,
  ServiceType,
  SubServiceType,
} from 'src/utils/enums';
const Joi = BaseJoi.extend(JoiDate);

export interface GetAvailableServicesDTO {
  lat: number;
  long: number;
}

export const GetAvailableServicesSchema = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface CreateServiceRequestDTO {
  payment_intent_id: string;
  address_id: number;
  weight: number;
  no_of_bag: number;
  scented: boolean;
  unscented: boolean;
  separate: boolean;
  hypoallergenic: boolean;
  warm_water: boolean;
  hard_water: boolean;
  use_own_products: boolean;
  bleach: boolean;
  softner: boolean;
  dryer_sheet: boolean;
  same_day_delivery: boolean;
  drop_outside_door: boolean;
  special_instructions: string;
  delivery_type: DeliveryType;
  service_type: ServiceType;
  pick_up_at: string;
  drop_off_at: string;
  pick_up: DeliveryDayTime;
  drop_off: DeliveryDayTime;
  sub_service_type: SubServiceType;
  amount: number;
  gst_hst: number;
  pst: number;
  same_day_delivery_fee: number;
  delivery_fee: number;
  bleach_fee: number;
  scent_fee: number;
  softner_fee: number;
  dryer_sheet_fee: number;
  separate_fee: number;
}

export const CreateServiceRequestSchema = Joi.object({
  payment_intent_id: Joi.string().required(),
  address_id: Joi.number().required(),
  weight: Joi.number().required(),
  no_of_bag: Joi.number().required(),
  amount: Joi.number().required(),
  same_day_delivery_fee: Joi.number().optional(),
  delivery_fee: Joi.number().optional(),
  bleach_fee: Joi.number().optional(),
  scent_fee: Joi.number().optional(),
  softner_fee: Joi.number().optional(),
  dryer_sheet_fee: Joi.number().optional(),
  separate_fee: Joi.number().optional(),
  gst_hst: Joi.number().required(),
  pst: Joi.number().required(),
  scented: Joi.boolean().optional(),
  unscented: Joi.boolean().optional(),
  separate: Joi.boolean().optional(),
  hypoallergenic: Joi.boolean().optional(),
  warm_water: Joi.boolean().optional(),
  hard_water: Joi.boolean().optional(),
  use_own_products: Joi.boolean().optional(),
  bleach: Joi.boolean().optional(),
  softner: Joi.boolean().optional(),
  dryer_sheet: Joi.boolean().optional(),
  same_day_delivery: Joi.boolean().optional(),
  drop_outside_door: Joi.boolean().optional(),
  special_instructions: Joi.string().optional(),
  delivery_type: Joi.string()
    .valid(...Object.values(DeliveryType))
    .required(),
  service_type: Joi.string()
    .valid(...Object.values(ServiceType))
    .required(),
  pick_up_at: Joi.date().format('YYYY-MM-DD HH:mm:ss'),
  drop_off_at: Joi.date().format('YYYY-MM-DD HH:mm:ss'),
  pick_up: Joi.string()
    .valid(...Object.values(DeliveryDayTime))
    .required(),
  drop_off: Joi.string()
    .valid(...Object.values(DeliveryDayTime))
    .required(),
  sub_service_type: Joi.string()
    .valid(...Object.values(SubServiceType))
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface UpdateServiceRequestDTO {
  id: number;
  weight: number;
  amount: number;
  gst_hst: number;
  pst: number;
  bleach_fee: number;
  scent_fee: number;
  softner_fee: number;
  dryer_sheet_fee: number;
  separate_fee: number;
  same_day_delivery_fee: number;
  delivery_fee: number;
}

export const UpdateServiceRequestSchema = Joi.object({
  id: Joi.number().required(),
  weight: Joi.number().required(),
  amount: Joi.number().required(),
  gst_hst: Joi.number().required(),
  pst: Joi.number().required(),
  bleach_fee: Joi.number().optional(),
  scent_fee: Joi.number().optional(),
  softner_fee: Joi.number().optional(),
  dryer_sheet_fee: Joi.number().optional(),
  separate_fee: Joi.number().optional(),
  same_day_delivery_fee: Joi.number().required(),
  delivery_fee: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface ConfirmServiceRequestDTO {
  id: number;
}

export const ConfirmServiceRequestSchema = Joi.object({
  id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface AcceptServiceRequestDTO {
  id: number;
  are_you_laundromat: boolean;
}

export const AcceptServiceRequestSchema = Joi.object({
  id: Joi.number().required(),
  are_you_laundromat: Joi.boolean().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface RejectServiceRequestDTO {
  id: number;
}

export const RejectServiceRequestSchema = Joi.object({
  id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface GetServiceRequestDetailsDTO {
  id: number;
}

export const GetServiceRequestDetailsSchema = Joi.object({
  id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface AssignRequestToLaundromatDTO {
  laundromat_ids: number[];
  service_request_id: number;
}

export const AssignRequestToLaundromatSchema = Joi.object({
  laundromat_ids: Joi.array().items(Joi.number()).min(1).required(),
  service_request_id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface CreateChangeRequestDTO {
  request_id: number;
  amount: number;
  notes: string;
}

export const CreateChangeRequestSchema = Joi.object({
  request_id: Joi.number().required(),
  amount: Joi.number().required(),
  notes: Joi.string().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface UpdateChangeRequestDTO {
  change_request_id: number;
  // gst_hst: number;
  // pst: number;
  status: ChangeRequestStatus;
}

export const UpdateChangeRequestSchema = Joi.object({
  change_request_id: Joi.number().required(),
  // gst_hst: Joi.number().required(),
  // pst: Joi.number().required(),
  status: Joi.string()
    .valid(...Object.values(ChangeRequestStatus))
    .required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface RepeatOrderDTO {
  service_request_id: number;
}

export const RepeatOrderSchema = Joi.object({
  service_request_id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface GetOrderHistoryDTO {
  filter: string;
  page: number;
  page_size: number;
}

export const GetOrderHistorySchema = Joi.object({
  filter: Joi.string()
    .valid(
      'ON_GOING',
      'COMPLETE',
      'READY_FOR_PICKUP',
      'CANCELED',
      'PICKED_UP',
      'ON_THE_WAY',
    )
    .optional(),
    page: Joi.number().optional(),
    page_size: Joi.number().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface SendTipDTO {
  request_id: number;
  amount: number;
}

export const SendTipSchema = Joi.object({
  request_id: Joi.number().required(),
  amount: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface GetNewServiceRequestDTO {
  page: number;
  page_size: number;
}

export const GetNewServiceRequestSchema = Joi.object({
  page: Joi.number().optional(),
  page_size: Joi.number().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});
