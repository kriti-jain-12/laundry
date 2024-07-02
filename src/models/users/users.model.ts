import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import {
  DeviceType,
  ProofOfWork,
  SSOType,
  UserType,
  VehicleType,
} from 'src/utils/enums';
import Countries from './countries.model';
import Addresses from './user.addresses.model';
import UserService from './user.services.model';
import ServiceRequest from '../services/service.request.model';
import Sessions from './users.session.model';
import Transactions from '../transactions/transactions.model';
import Media from '../services/media.model';
import Wallet from '../transactions/wallet.model';
import Review from './review.model';

@Table({ tableName: 'tbl_users', underscored: true })
export default class Users extends Model<Users> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  sso_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(SSOType)),
    allowNull: true,
  })
  sso_type: SSOType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  username: string;

  @Column({
    type: DataType.STRING,
  })
  first_name: string;

  @Column({
    type: DataType.STRING,
  })
  last_name: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserType)),
    defaultValue: UserType.USER,
  })
  user_type: UserType;

  @Column({
    type: DataType.ENUM(...Object.values(DeviceType)),
    defaultValue: DeviceType.ANDROID,
  })
  device_type: DeviceType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.TEXT,
  })
  profile: string;

  @Column({
    type: DataType.TEXT,
  })
  password: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  suspended: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notification_token: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  stripe_customer_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  socket_id: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  wallet_amount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_verified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_ready_for_request: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_already_gig_worker: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_laundromat_driver_both: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  is_admin_verified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  is_background_verified: boolean;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  lat: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  long: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  driver_current_lat: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  driver_current_long: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(VehicleType)),
    allowNull: true,
  })
  vehicle_type: VehicleType;

  @Column({
    type: DataType.ENUM(...Object.values(ProofOfWork)),
    allowNull: true,
  })
  proof_of_work: ProofOfWork;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  proof_of_work_media: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  abstract_media: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  gig_worker_media: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  GST_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  organization_name: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  have_dryer_washer: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  have_smoker: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  have_pet: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  radius: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  referral_code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  referred_by: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  created_at?: any;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
  })
  updated_at?: any;

  @ForeignKey(() => Countries)
  @Column({ allowNull: true, type: DataType.INTEGER })
  country_id: number;

  @BelongsTo(() => Countries, { onDelete: 'CASCADE' })
  country: Countries;

  @HasMany(() => Addresses, 'user_id')
  addresses: Addresses[];

  @HasMany(() => UserService, 'user_id')
  services: UserService[];

  @HasMany(() => ServiceRequest, 'user_id')
  userRequests: ServiceRequest[];

  @HasMany(() => ServiceRequest, 'driver_id')
  driverRequests: ServiceRequest[];

  @HasMany(() => ServiceRequest, 'laundromat_id')
  laundromatRequests: ServiceRequest[];

  @HasMany(() => Sessions, 'user_id')
  sessions: Sessions[];

  @Column({
    type: DataType.VIRTUAL,
    allowNull: true,
  })
  distance: number;

  @HasMany(() => Transactions, 'user_id')
  transactions: Transactions[];

  get profileWithBaseUrl(): string {
    const baseUrl = 'https://api.laundryonappserver.com/uploads/';
    return this.profile ? baseUrl + this.profile : this.profile;
  }

  @HasMany(() => Media, 'user_id')
  media: Media[];

  @HasMany(() => Wallet, 'user_id')
  wallet: Wallet[];

  @HasMany(() => Review, 'user_id')
  review: Review[];
}
