import { ChangeRequestStatus } from 'src/utils/enums';

export interface ServiceRequestCreateEventDTO {
  id: number;
  user_id: number;
}

export interface ServiceRequestNoDriverEventDTO {
  id: number;
}

export interface ServiceRequestAcceptedEventDTO {
  id: number;
  user_id: number;
  are_you_laundromat: boolean;
}

export interface ServiceRequestAssignLaundromatEventDTO {
  laundromat_ids: number[];
  service_request_id: number;
}

export interface ChangeRequestCreatedEventDTO {
  id: number;
  user_id: number;
}
export interface ChangeRequestUpdateEventDTO {
  id: number;
  status: ChangeRequestStatus;
}

export interface ServiceRequestUpdateEventDTO {
  id: number;
}

export interface ChangeRequestConfirmByUserEventDTO {
  id: number;
  weight: number;
  amount: number;
}
