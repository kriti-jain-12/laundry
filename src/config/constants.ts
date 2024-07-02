import { ServiceType } from './../utils/enums';
import Users from 'src/models/users/users.model';
import Countries from 'src/models/users/countries.model';
import Verification from 'src/models/users/users.verification.model';
import Addresses from 'src/models/users/user.addresses.model';
import UserService from 'src/models/users/user.services.model';
import ServiceRequest from 'src/models/services/service.request.model';
import Transactions from 'src/models/transactions/transactions.model';
import Sessions from 'src/models/users/users.session.model';
import ServicePricing from 'src/models/services/service.pricing.model';
import NearByDrivers from 'src/models/services/nearby.drivers.model';
import NearByLaundromats from 'src/models/services/nearby.laundromat.model';
import Media from 'src/models/services/media.model';
import Wallet from 'src/models/transactions/wallet.model';
import ServiceChangeRequest from 'src/models/services/service.change.request.model';
import Review from 'src/models/users/review.model';
import ServiceTax from 'src/models/services/service.tax.model';

export const ModuleConfigs = {
  auth: {
    entities: [
      Users,
      Verification,
      Addresses,
      UserService,
      Countries,
      Sessions,
    ],
  },
  utils: {
    entities: [
      Users,
      Countries,
      Addresses,
      UserService,
      Sessions,
      ServicePricing,
      ServiceTax,
    ],
  },
  users: {
    entities: [Users],
  },

  profile: {
    entities: [
      Users,
      UserService,
      ServiceRequest,
      Transactions,
      Addresses,
      Wallet,
      Review,
    ],
  },
  services: {
    entities: [
      Users,
      UserService,
      ServiceRequest,
      Transactions,
      ServicePricing,
      NearByDrivers,
      Addresses,
      Countries,
      NearByLaundromats,
      Media,
      ServiceChangeRequest,
      Wallet,
      Review,
    ],
  },
  addresses: {
    entities: [Users, Addresses],
  },
  ws: {
    entities: [
      Users,
      Addresses,
      ServiceRequest,
      Transactions,
      Countries,
      NearByDrivers,
      NearByLaundromats,
      Media,
      ServiceChangeRequest,
      Review,
    ],
  },
};
