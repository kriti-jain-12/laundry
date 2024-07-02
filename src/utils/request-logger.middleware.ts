import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject('winston')
    private readonly winstonLogger: Logger,
  ) {}

  private logger = new Logger('Request');

  use(req: Request, res: Response, next: () => void) {
    const { baseUrl, method, body, headers, query } = req;
    this.logger.log(`Request: ${method} ${baseUrl}`);
    this.logger.log(`Request Body: ${JSON.stringify(body)}`);
    res.on('finish', () => {
      const { statusCode } = res;
      this.winstonLogger.debug(
        '-----------------------REQUEST START------------------------',
      );
      this.winstonLogger.debug(`URL : ${baseUrl}`);
      this.winstonLogger.debug(`METHOD : ${method}`);
      this.winstonLogger.debug(`API-KEY : ${headers['api-key']}`);
      this.winstonLogger.debug(`TOKEN : ${headers['authorization']}`);
      this.winstonLogger.debug(
        `REQUEST BODY : ${
          method == 'GET' ? JSON.stringify(query) : JSON.stringify(body)
        }`,
      );
      this.winstonLogger.debug(`RESPONSE_CODE : ${statusCode}`);

      this.winstonLogger.debug(
        '-----------------------REQUEST END------------------------',
      );
      this.logger.log(`Response: ${statusCode}`);
    });
    next();
  }
}
