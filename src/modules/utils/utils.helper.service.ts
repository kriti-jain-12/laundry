import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import Users from '../../models/users/users.model';
import { InjectModel } from '@nestjs/sequelize';
import * as CryptoJS from 'crypto-js';
import { EmailOptions, MailgunService } from '@nextnm/nestjs-mailgun';
import Countries from 'src/models/users/countries.model';
import Addresses from 'src/models/users/user.addresses.model';
import UserService from 'src/models/users/user.services.model';
import Sessions from 'src/models/users/users.session.model';

@Injectable()
export class UtilsHelperService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(UserService)
    private userServiceModel: typeof UserService,
    @InjectModel(Addresses)
    private addressesModel: typeof Addresses,
    @InjectModel(Countries)
    private countriesModel: typeof Countries,
    @InjectModel(Sessions)
    private sessionsModel: typeof Sessions,
    private readonly mailgunService: MailgunService,
  ) {}

  async hashPassword(password) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  async getUser(id: number) {
    const user = await this.usersModel.findOne({
      where: { id },
      attributes: {
        exclude: ['created_at', 'updated_at', 'password'],
      },
      include: [
        {
          model: this.countriesModel,
          attributes: ['id', 'name', 'dial_code', 'emoji', 'image', 'code'],
          required: false,
        },
        {
          model: this.addressesModel,
          attributes: ['id', 'line_1', 'line_2', 'pin_code', 'lat', 'long'],
        },
        {
          model: this.userServiceModel,
          required: false,
          attributes: ['id', 'service_type'],
        },
      ],
    });
    user.profile = user.profileWithBaseUrl;
    return user;
  }

  async getSession(token: string) {
    const session = await this.sessionsModel.findOne({
      where: { token },
    });
    return session;
  }

  encryptData(text: any): string {
    const key = this.configService.get<string>('encryptionKey');
    return text
      ? encodeURIComponent(
          CryptoJS.AES.encrypt(JSON.stringify(text), key).toString(),
        )
      : null;
  }

  decryptData(ciphertext: string): any {
    const key = this.configService.get<string>('encryptionKey');
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(ciphertext), key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  async sendEmailNotification(
    to: string,
    subject: string,
    template: string,
    data: any,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const domain = await this.configService.get('mailgun_domain');
        const options: EmailOptions = {
          from: ` <info@${domain}>`,
          to,
          subject,
          template,
          't:variables': JSON.stringify(data),
        };
        const result = await this.mailgunService.createEmail(domain, options);
        console.log(result);
        resolve({});
      } catch (e) {
        console.log(e);
        resolve({});
      }
    });
  }
}
