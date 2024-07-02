import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { AddressRemark, DoorType } from 'src/utils/enums';
const Joi = BaseJoi.extend(JoiDate);

export interface GetAddressDTO {
  search: string;
  page: number;
  page_size: number;
}

export const GetAddressSchema = Joi.object({
  search: Joi.string().optional(),
  page: Joi.number().optional(),
  page_size: Joi.number().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface AddAddressDTO {
  remark: AddressRemark;
  line_1: string;
  line_2: string;
  pin_code: string;
  lat: number;
  long: number;
  door: DoorType;
  buzzer_code: string;
  notes: string;
  call_or_text_notify: boolean;
  business_name: string;
  hotel_name: string;
  room_no: string;
  province: string;
}

export const AddAddressSchema = Joi.object({
  remark: Joi.string()
    .valid(...Object.values(AddressRemark))
    .required(),
  line_1: Joi.string().required(),
  line_2: Joi.string().required(),
  pin_code: Joi.string().required(),
  lat: Joi.number().required(),
  long: Joi.number().required(),
  door: Joi.string()
    .valid(...Object.values(DoorType))
    .optional(),
  buzzer_code: Joi.string().optional(),
  notes: Joi.string().optional(),
  call_or_text_notify: Joi.boolean().optional(),
  business_name: Joi.string().optional(),
  hotel_name: Joi.string().optional(),
  room_no: Joi.string().optional(),
  province: Joi.string().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface UpdateAddressDTO {
  id: number;
  remark: AddressRemark;
  line_1: string;
  line_2: string;
  pin_code: string;
  lat: number;
  long: number;
  active: boolean;
  door: DoorType;
  buzzer_code: string;
  notes: string;
  call_or_text_notify: boolean;
  business_name: string;
  hotel_name: string;
  room_no: string;
  province: string;
}

export const UpdateAddressSchema = Joi.object({
  id: Joi.number().required(),
  remark: Joi.string()
    .valid(...Object.values(AddressRemark))
    .optional(),
  line_1: Joi.string().optional(),
  line_2: Joi.string().optional(),
  pin_code: Joi.string().optional(),
  lat: Joi.number().optional(),
  long: Joi.number().optional(),
  active: Joi.boolean().optional(),
  door: Joi.string()
    .valid(...Object.values(DoorType))
    .optional(),
  buzzer_code: Joi.string().optional(),
  notes: Joi.string().optional(),
  call_or_text_notify: Joi.boolean().optional(),
  business_name: Joi.string().optional(),
  hotel_name: Joi.string().optional(),
  room_no: Joi.string().optional(),
  province: Joi.string().optional(),
})
  .or(
    'remark',
    'line_1',
    'line_2',
    'pin_code',
    'lat',
    'long',
    'active',
    'door',
    'buzzer_code',
    'notes',
    'call_or_text_notify',
    'business_name',
    'hotel_name',
    'province'
  )
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export interface DeleteAddressDTO {
  id: number;
}

export const DeleteAddressSchema = Joi.object({
  id: Joi.number().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});
