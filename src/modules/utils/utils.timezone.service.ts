import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UtilsTimezoneService {
  constructor(private readonly configService: ConfigService) {}

  getDateTime(utc?: boolean): moment.Moment {
    const timezone = this.configService.get('timezone');
    return utc ? moment.utc() : moment.tz(timezone);
  }

  parseTime(date, utc?: boolean): moment.Moment {
    const timezone = this.configService.get('timezone');
    return utc
      ? moment.utc(
          moment(date).format('YYYY-MM-DD HH:mm:ss'),
          'YYYY-MM-DD HH:mm:ss',
          timezone,
        )
      : moment.tz(
          moment(date).format('YYYY-MM-DD HH:mm:ss'),
          'YYYY-MM-DD HH:mm:ss',
          timezone,
        );
  }

  ago(date: Date): string {
    const timezone = this.configService.get('timezone');
    return moment
      .tz(
        moment(date).format('YYYY-MM-DD HH:mm:ss'),
        'YYYY-MM-DD HH:mm:ss',
        timezone,
      )
      .toNow();
  }
}
