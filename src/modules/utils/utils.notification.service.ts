import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import { SocketEvents } from 'src/utils/enums';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', '..', 'src/utils', 'firebase-admin.json'),
  ),
});

@Injectable()
export class UtilsNotificationService {
  constructor(private readonly configService: ConfigService) {}

  async sendSinglePushNotification(options: {
    title: string;
    body: string;
    token: string;
    event: SocketEvents;
    payload: any;
  }) {
    try {
      console.log(options)
      const result = await firebase.messaging().send({
        notification: { title: options.title, body: options.body },
        token: options.token,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: options.title,
                body: options.body,
              },
              sound: 'default',
              'content-available': 1,
              priority: 10,
            },
          },
        },
        data: {
          event: options.event,
          payload: JSON.stringify(options.payload),
        },
      });console.log(result)
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
