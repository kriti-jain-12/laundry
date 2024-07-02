import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export interface GetCountriesDTO {
  search: string;
}

export const GetCountriesSchema = Joi.object({
  search: Joi.string().optional(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface GetTaxDTO {
  province: string;
}

export const GetTaxSchema = Joi.object({
  province: Joi.string().required(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

export interface ContactsDTO {
  name: string;
  email?: string;
  country_code: string;
  phone: string;
  tags?: string;
  notes?: string;
}
