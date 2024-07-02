import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { WSService } from './ws.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ServiceRequestAssignLaundromatEventDTO,
  ServiceRequestAcceptedEventDTO,
  ServiceRequestCreateEventDTO,
  ServiceRequestNoDriverEventDTO,
  ChangeRequestCreatedEventDTO,
  ChangeRequestUpdateEventDTO,
  ServiceRequestUpdateEventDTO,
  ChangeRequestConfirmByUserEventDTO,
} from './dto/ws.dto';
import {
  ChangeRequestStatus,
  DeliveryType,
  ServiceRequestStatus,
  SocketEvents,
} from 'src/utils/enums';
import { UtilsNotificationService } from '../utils/utils.notification.service';

@WebSocketGateway({ namespace: 'websocket' })
export class WSGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly wsService: WSService,
    private readonly uns: UtilsNotificationService,
  ) { }

  private connectedClients = new Map<string, Socket>();

  @WebSocketServer() io: Server;

  afterInit(server: Server) {
    server.use(this.SocketAuthMiddleWare());
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log('Client Connected', client.id);
    const socketId = client.id;
    this.connectedClients.set(socketId, client);
    await this.wsService.clientConnected(client['user_id'], client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
    const socketId = client.id;
    this.connectedClients.delete(socketId);
    await this.wsService.clientDisconnect(client['user_id']);
  }

  SocketAuthMiddleWare = (): SocketIOMiddleWare => {
    return async (client, next) => {
      try {
        const { authorization } = client.handshake.headers;
        if (!authorization) {
          next(new UnauthorizedException());
        }
        const header = authorization.split(' ');
        const token = header[1] ?? undefined;
        if (!token) {
          next(new UnauthorizedException());
        }
        const valid = await this.jwtService.verify(
          token,
          this.configService.get('jwt.secret'),
        );
        if (valid) {
          client['user_id'] = valid.id;
          next();
        } else {
          next(new UnauthorizedException());
        }
      } catch (err) {
        next(err);
      }
    };
  };

  @OnEvent('service_request.created')
  async handleServiceRequestCreatedEvent(
    payload: ServiceRequestCreateEventDTO,
  ) {
    try {
      const serviceRequest = await this.wsService.getRequest(payload.id);

      if (serviceRequest.delivery_type == DeliveryType.DRIVER) {
        const findDriver = await this.wsService.findDriver(
          serviceRequest.address.lat,
          serviceRequest.address.long,
        );
        if (findDriver.length > 0) {
          this.wsService.updateRequestStatus(
            payload.id,
            ServiceRequestStatus.REQUESTING_DRIVER,
          );
          await this.wsService.addNearByDriver(
            serviceRequest.id,
            findDriver.map((item) => item.id),
          );
          for (let i = 0; i < findDriver.length; i++) {
            const element = findDriver[i];
            await this.sendEventOrNotification({
              socket_id: element.socket_id,
              payload: serviceRequest,
              event: SocketEvents.NEW_REQUEST_DELIVERY_PARTNER,
              notification_token: element.notification_token,
              notification: {
                title: 'New Service Request',
                body: 'New service request',
              },
            });
          }
        } else {
          this.wsService.updateRequestStatus(
            payload.id,
            ServiceRequestStatus.NO_DRIVER,
          );
          await this.sendEventOrNotification({
            socket_id: serviceRequest.user.socket_id,
            payload: serviceRequest,
            event: SocketEvents.NO_DELIVERY_PARTNER_USER,
            notification_token: serviceRequest.user.notification_token,
            notification: {
              title: 'Service Request',
              body: 'No Delivery Partner Found',
            },
          });
        }
      } else {
        const findLaundromat = await this.wsService.findLaundromat(
          serviceRequest.address.lat,
          serviceRequest.address.long,
        );
        if (findLaundromat.length > 0) {
          this.wsService.updateRequestStatus(
            payload.id,
            ServiceRequestStatus.REQUESTING_LAUNDROMAT,
          );
          await this.wsService.addNearByLaundromat(
            serviceRequest.id,
            findLaundromat.map((item) => item.id),
          );
          for (let i = 0; i < findLaundromat.length; i++) {
            const element = findLaundromat[i];
            await this.sendEventOrNotification({
              socket_id: element.socket_id,
              payload: serviceRequest,
              event: SocketEvents.NEW_REQUEST_LAUNDROMAT,
              notification_token: serviceRequest.laundromat.notification_token,
              notification: {
                title: 'New Service Request',
                body: 'New service request',
              },
            });
          }
        } else {
          this.wsService.updateRequestStatus(
            payload.id,
            ServiceRequestStatus.NO_LAUNDROMAT,
          );
          await this.sendEventOrNotification({
            socket_id: serviceRequest.user.socket_id,
            payload: serviceRequest,
            event: SocketEvents.NO_LAUNDROMAT_USER,
            notification_token: serviceRequest.user.notification_token,
            notification: {
              title: 'Service Request',
              body: 'No Laundromat Found',
            },
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.no_driver')
  async handleServiceRequestNoDriverEvent(
    payload: ServiceRequestNoDriverEventDTO,
  ) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      this.wsService.updateRequestStatus(
        payload.id,
        ServiceRequestStatus.NO_DRIVER,
      );
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.NO_DELIVERY_PARTNER_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Service Request',
          body: 'No Delivery Partner Found',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.driver_accepted')
  async handleServiceRequestAcceptedEvent(
    payload: ServiceRequestAcceptedEventDTO,
  ) {
    try {
      const { id, user_id, are_you_laundromat } = payload;
      let serviceRequest = await this.wsService.getRequest(id);

      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_REQUEST_DRIVER_ACCEPTED_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Driver Accepted Service Request',
          body: 'Driver Accepted Service Request',
        },
      });

      const drivers = await this.wsService.getNearByDriver(id);
      for (let i = 0; i < drivers.length; i++) {
        const element = drivers[i];
        await this.sendEventOrNotification({
          socket_id: element.driver.socket_id,
          payload: serviceRequest,
          event: SocketEvents.SERVICE_REQUEST_ACCEPTED_DELIVERY_PARTNER,
          notification_token: element.driver.notification_token,
          notification: {
            title: 'Service Request Accepted',
            body: 'Service Request Accepted',
          },
        });
        element.destroy();
      }
      if (are_you_laundromat) {
        await this.wsService.addSelfAsLaundromat(user_id, id);
        serviceRequest = await this.wsService.getRequest(id);
        if (serviceRequest.laundromat) {
          await this.sendEventOrNotification({
            socket_id: serviceRequest.laundromat.socket_id,
            payload: serviceRequest,
            event: SocketEvents.NEW_REQUEST_DIRECT_LAUNDROMAT,
            notification_token: serviceRequest.laundromat.notification_token,
            notification: {
              title: 'New Service Request Direct',
              body: 'New Laundromat Request Direct',
            },
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.no_laundromat')
  async handleServiceRequestNoLaundromatEvent(
    payload: ServiceRequestNoDriverEventDTO,
  ) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      this.wsService.updateRequestStatus(
        payload.id,
        ServiceRequestStatus.NO_LAUNDROMAT,
      );

      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.NO_LAUNDROMAT_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Service Request',
          body: 'No Laundromat Found',
        },
      });

      if (serviceRequest.driver) {
        await this.sendEventOrNotification({
          socket_id: serviceRequest.driver.socket_id,
          payload: serviceRequest,
          event: SocketEvents.NO_LAUNDROMAT_DRIVER,
          notification_token: serviceRequest.driver.notification_token,
          notification: {
            title: 'Service Request',
            body: 'No Laundromat Found',
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.laundromat_accepted')
  async handleServiceRequestLaundromatAcceptedEvent(
    payload: ServiceRequestAcceptedEventDTO,
  ) {
    try {
      const { id, user_id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);

      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Laundromat Accepted Service Request',
          body: 'Laundromat Accepted Service Request',
        },
      });

      if (serviceRequest.driver) {
        await this.sendEventOrNotification({
          socket_id: serviceRequest.driver.socket_id,
          payload: serviceRequest,
          event: SocketEvents.SERVICE_REQUEST_LAUNDROMAT_ACCEPTED_DRIVER,
          notification_token: serviceRequest.driver.notification_token,
          notification: {
            title: 'Laundromat Accepted Service Request',
            body: 'Laundromat Accepted Service Request',
          },
        });
      }

      const laundromat = await this.wsService.getNearByLaundromat(id);
      for (let i = 0; i < laundromat.length; i++) {
        const element = laundromat[i];

        await this.sendEventOrNotification({
          socket_id: element.laundromat.socket_id,
          payload: serviceRequest,
          event: SocketEvents.SERVICE_REQUEST_ACCEPTED_LAUNDROMAT,
          notification_token: element.laundromat.notification_token,
          notification: {
            title: 'Service Request Accepted',
            body: 'Service Request Accepted',
          },
        });
        element.destroy();
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.assign_laundromat')
  async handleServiceRequestAssignLaundromatEvent(
    payload: ServiceRequestAssignLaundromatEventDTO,
  ) {
    try {
      const { laundromat_ids, service_request_id } = payload;
      let serviceRequest = await this.wsService.getRequest(
        service_request_id,
      );

      const findLaundromat = await this.wsService.getLaundromatById(
        laundromat_ids,
      );
      if (findLaundromat.length > 0) {
        await this.wsService.updateRequestStatus(
          service_request_id,
          ServiceRequestStatus.REQUESTING_LAUNDROMAT,
        );
        await this.wsService.addNearByLaundromat(
          serviceRequest.id,
          findLaundromat.map((item) => item.id),
        );
        serviceRequest = await this.wsService.getRequest(
          service_request_id,
        );
        console.log(serviceRequest)
        for (let i = 0; i < findLaundromat.length; i++) {
          const element = findLaundromat[i];
          await this.sendEventOrNotification({
            socket_id: element.socket_id,
            payload: serviceRequest,
            event: SocketEvents.NEW_REQUEST_LAUNDROMAT,
            notification_token: element.notification_token,
            notification: {
              title: 'New Service Request',
              body: 'New service request',
            },
          });
        }
      } else {
        this.wsService.updateRequestStatus(
          service_request_id,
          ServiceRequestStatus.NO_LAUNDROMAT,
        );

        await this.sendEventOrNotification({
          socket_id: serviceRequest.user.socket_id,
          payload: serviceRequest,
          event: SocketEvents.NO_LAUNDROMAT_USER,
          notification_token: serviceRequest.user.notification_token,
          notification: {
            title: 'Service Request',
            body: 'No Laundromat Found',
          },
        });

        await this.sendEventOrNotification({
          socket_id: serviceRequest.driver.socket_id,
          payload: serviceRequest,
          event: SocketEvents.NO_LAUNDROMAT_DRIVER,
          notification_token: serviceRequest.driver.notification_token,
          notification: {
            title: 'Service Request',
            body: 'No Laundromat Found',
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.change_request_created')
  async handleChangeRequestCreatedEvent(payload: ChangeRequestCreatedEventDTO) {
    try {
      const { id, user_id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_CHANGE_REQUEST_CREATED_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'New Service Change Request',
          body: 'New service Change request',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.change_request_updated')
  async handleChangeRequestUpdateEvent(payload: ChangeRequestUpdateEventDTO) {
    try {
      const { id, status } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.laundromat.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_CHANGE_REQUEST_UPDATED_LAUNDROMAT,
        notification_token: serviceRequest.laundromat.notification_token,
        notification: {
          title: 'Change Request Updated',
          body: 'Change request Updated',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.laundromat_confirmed')
  async handleLaundromatConfirmEvent(payload: ServiceRequestUpdateEventDTO) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_LAUNDROMAT_CONFIRM_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Laundromat Confirm Order',
          body: 'Laundromat Confirm Order',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.ready_for_pick_up')
  async handleReadyForPickUpEvent(payload: ServiceRequestUpdateEventDTO) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_READY_FOR_PICKUP_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Order Ready For Pick Up',
          body: 'Order Ready For Pick Up',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.order_picked_up')
  async handlePickedUpEvent(payload: ServiceRequestUpdateEventDTO) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_PICKED_UP_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Order Picked Up',
          body: 'Order Picked Up',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.order_delivered')
  async handleDeliveredEvent(payload: ServiceRequestUpdateEventDTO) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_DELIVERED_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Order Delivered Successfully.',
          body: 'Order Delivered Successfully.',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.confirm_by_driver')
  async handleServiceRequestConfirmByDriverEvent(
    payload: ServiceRequestNoDriverEventDTO,
  ) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);

      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: serviceRequest,
        event: SocketEvents.SERVICE_DRIVER_CONFIRM_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Service Request',
          body: 'Confirm Request By Driver',
        },
      });

      if (serviceRequest.laundromat) {
        await this.sendEventOrNotification({
          socket_id: serviceRequest.laundromat.socket_id,
          payload: serviceRequest,
          event: SocketEvents.SERVICE_DRIVER_CONFIRM_LAUNDROMAT,
          notification_token: serviceRequest.laundromat.notification_token,
          notification: {
            title: 'Service Request',
            body: 'Confirm Request By Driver',
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.confirm_by_user')
  async handleRequestConfirmByUser(payload: ChangeRequestConfirmByUserEventDTO) {
    try {
      const { id, weight, amount } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.sendEventOrNotification({
        socket_id: serviceRequest.user.socket_id,
        payload: { weight: weight, amount: amount },
        event: SocketEvents.SERVICE_CHANGE_CONFIRM_USER,
        notification_token: serviceRequest.user.notification_token,
        notification: {
          title: 'Your service request is updated',
          body: `Your updated weight ${weight} and amount ${amount} `,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent('service_request.cancel_by_user')
  async handleCancelRequestByUser(payload: ServiceRequestUpdateEventDTO) {
    try {
      const { id } = payload;
      const serviceRequest = await this.wsService.getRequest(id);
      await this.wsService.updateRequestStatus(
        payload.id,
        ServiceRequestStatus.CANCELED,
      );
      const drivers = await this.wsService.getNearByDriver(id);
      for (let i = 0; i < drivers.length; i++) {
        const element = drivers[i];
        await this.sendEventOrNotification({
          socket_id: element.driver.socket_id,
          payload: serviceRequest,
          event: SocketEvents.SERVICE_REQUEST_CANCELLED,
          notification_token: element.driver.notification_token,
          notification: {
            title: 'Service Request Cancelled',
            body: 'Service Request Cancelled',
          },
        });
        element.destroy();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendEventOrNotification(options: {
    socket_id: string;
    notification_token: string;
    payload: any;
    event: SocketEvents;
    notification: {
      title: string;
      body: string;
    };
  }) {
    try {
      const { socket_id, notification_token, payload, event, notification } =
        options;
      const socketClient = await this.connectedClients.get(socket_id);
      if (socketClient) {
        socketClient.emit(event, {
          payload,
          event,
        });
      } else {
        if (notification_token) {
          try {
            await this.uns.sendSinglePushNotification({
              title: notification.title,
              body: notification.body,
              token: notification_token,
              payload,
              event,
            });
          } catch (e) {
            console.log('NOTIFICATION ERROR ', e.message);
          }
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};
