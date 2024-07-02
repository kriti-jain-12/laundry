export enum UserType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  LAUNDROMAT = 'LAUNDROMAT',
}

export enum DoorType {
  SIDE_DOOR = 'SIDE_DOOR',
  FRONT_DOOR = 'FRONT_DOOR',
  BASEMENT = 'BASEMENT',
  BACK_DOOR = 'BACK_DOOR',
  ROOM = 'ROOM',
  FRONT_DESK = 'FRONT_DESK',
}

export enum ServiceType {
  LAUNDRY = 'LAUNDRY',
  IRON_ONLY = 'IRON_ONLY',
  DRY_CLEAN = 'DRY_CLEAN',
}

export enum SubServiceType {
  WASH = 'WASH',
  WASH_AND_FOLD = 'WASH_AND_FOLD',
  WASH_FOLD_AND_IRON = 'WASH_FOLD_AND_IRON',
}

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

export enum SSOType {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export enum AddressRemark {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  HOTEL = 'HOTEL',
}

export enum ServiceRequestStatus {
  INIT = 'INIT',
  REQUESTING_DRIVER = 'REQUESTING_DRIVER',
  DRIVER_ACCEPTED = 'DRIVER_ACCEPTED',
  NO_DRIVER = 'NO_DRIVER',
  CONFIRMED = 'CONFIRMED',
  REQUESTING_LAUNDROMAT = 'REQUESTING_LAUNDROMAT',
  LAUNDROMAT_ACCEPTED = 'LAUNDROMAT_ACCEPTED',
  NO_LAUNDROMAT = 'NO_LAUNDROMAT',
  LAUNDROMAT_CHANGE_REQUEST = 'LAUNDROMAT_CHANGE_REQUEST',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  CANCELED = 'CANCELED',
  COMPLETE = 'COMPLETE',
}

export enum DeliveryType {
  SELF = 'SELF',
  DRIVER = 'DRIVER',
}

export enum DeliveryDayTime {
  MORNING_AFTERNOON = 'MORNING-AFTERNOON',
  AFTERNOON_EVENING = 'AFTERNOON-EVENING',
}

export enum SocketEvents {
  //User Events
  SERVICE_REQUEST_DRIVER_ACCEPTED_USER = 'SERVICE_REQUEST_DRIVER_ACCEPTED_USER',
  SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_USER = 'SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_USER',
  NO_DELIVERY_PARTNER_USER = 'NO_DELIVERY_PARTNER_USER',
  NO_LAUNDROMAT_USER = 'NO_LAUNDROMAT_USER',
  SERVICE_CHANGE_REQUEST_CREATED_USER = 'SERVICE_CHANGE_REQUEST_CREATED_USER',
  SERVICE_LAUNDROMAT_CONFIRM_USER = 'SERVICE_LAUNDROMAT_CONFIRM_USER',
  SERVICE_READY_FOR_PICKUP_USER = 'SERVICE_READY_FOR_PICKUP_USER',
  SERVICE_PICKED_UP_USER = 'SERVICE_PICKED_UP_USER',
  SERVICE_DELIVERED_USER = 'SERVICE_DELIVERED_USER',
  SERVICE_DRIVER_CONFIRM_USER = 'SERVICE_DRIVER_CONFIRM_USER',
  //Driver Events
  NEW_REQUEST_DELIVERY_PARTNER = 'NEW_REQUEST_DELIVERY_PARTNER',
  SERVICE_REQUEST_ACCEPTED_DELIVERY_PARTNER = 'SERVICE_REQUEST_ACCEPTED_DELIVERY_PARTNER',
  NO_LAUNDROMAT_DRIVER = 'NO_LAUNDROMAT_DRIVER',
  SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_DRIVER = 'SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_DRIVER',
  //Laundromat Events
  SERVICE_REQUEST_ACCEPTED_LAUNDROMAT = 'SERVICE_REQUEST_ACCEPTED_LAUNDROMAT',
  NEW_REQUEST_LAUNDROMAT = 'NEW_REQUEST_LAUNDROMAT',
  NEW_REQUEST_DIRECT_LAUNDROMAT = 'NEW_REQUEST_DIRECT_LAUNDROMAT',
  SERVICE_CHANGE_REQUEST_UPDATED_LAUNDROMAT = 'SERVICE_CHANGE_REQUEST_UPDATED_LAUNDROMAT',
  SERVICE_DRIVER_CONFIRM_LAUNDROMAT = 'SERVICE_DRIVER_CONFIRM_LAUNDROMAT',
  SERVICE_CHANGE_CONFIRM_USER = 'SERVICE_CHANGE_CONFIRM_USER',
  SERVICE_REQUEST_CANCELLED = 'SERVICE_REQUEST_CANCELLED',
}

export enum ProofOfWork {
  CANADIAN_PASSPORT = 'CANADIAN_PASSPORT',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  CANADIAN_FORCES_ID_CARD = 'CANADIAN_FORCES_ID_CARD',
  CERTIFICATION_OF_INDIAN_STATUS = 'CERTIFICATION_OF_INDIAN_STATUS',
  CITIZENSHIP_CARD = 'CITIZENSHIP_CARD',
  P_RESIDENCY_CARD = 'P_RESIDENCY_CARD',
  SOCIAL_INSURANCE_NUMBER = 'SOCIAL_INSURANCE_NUMBER',
  STUDY_PERMIT = 'STUDY_PERMIT',
  WORK_PERMIT = 'WORK_PERMIT',
}

export enum VehicleType {
  BIKE = 'BIKE',
  CAR = 'CAR',
  OTHER = 'OTHER',
}

export enum ChangeRequestStatus {
  ACCEPTED = 'ACCEPTED',
  REJECT = 'REJECT',
  PENDING = 'PENDING',
}

export enum MediaType {
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  UPDATE_REQUEST = 'UPDATE_REQUEST',
  CONFIRM_PICKUP = 'CONFIRM_PICKUP',
  CONFIRM_DELIVERY = 'CONFIRM_DELIVERY',
  CONFIRM_REQUEST = 'CONFIRM_REQUEST',
}

export enum WalletTransactionType {
  SERVICE_REQUEST = 'SERVICE_REQUEST',
  TIP = 'TIP',
  WITHDRAW = 'WITHDRAW',
}

export enum ReviewUserType {
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  LAUNDROMAT = 'LAUNDROMAT',
}