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
  HasOne,
} from 'sequelize-typescript';
import {
  DeliveryDayTime,
  DeliveryType,
  ServiceRequestStatus,
  ServiceType,
  SubServiceType,
} from 'src/utils/enums';
import Users from '../users/users.model';
import Addresses from '../users/user.addresses.model';
import Transactions from '../transactions/transactions.model';
import NearByDrivers from './nearby.drivers.model';
import NearByLaundromats from './nearby.laundromat.model';
import Media from './media.model';
import Wallet from '../transactions/wallet.model';
import Review from '../users/review.model';
import ServiceChangeRequest from './service.change.request.model';

@Table({ tableName: 'tbl_service_request', underscored: true })
export default class ServiceRequest extends Model<ServiceRequest> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  weight: number;

  @Column({
    type: DataType.INTEGER,
  })
  no_of_bag: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  amount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  same_day_delivery_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  delivery_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  bleach_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  scent_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  softner_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  dryer_sheet_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  separate_fee: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  tip: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  gst_hst: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  pst: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  additional_amount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  scented: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  unscented: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  separate: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  hypoallergenic: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  warm_water: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  hard_water: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  use_own_products: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  bleach: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  softner: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  dryer_sheet: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  same_day_delivery: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  drop_outside_door: boolean;

  @Column({
    type: DataType.TEXT,
  })
  special_instructions: string;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryType)),
  })
  delivery_type: DeliveryType;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceType)),
  })
  service_type: ServiceType;

  @Column({
    allowNull: true,
    type: DataType.ENUM(...Object.values(SubServiceType)),
  })
  sub_service_type: SubServiceType;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceRequestStatus)),
    defaultValue: ServiceRequestStatus.INIT,
  })
  service_request_status: ServiceRequestStatus;

  @Column({
    type: DataType.DATE,
  })
  pick_up_at: string;

  @Column({
    type: DataType.DATE,
  })
  drop_off_at: string;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryDayTime)),
  })
  pick_up: DeliveryDayTime;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryDayTime)),
  })
  drop_off: DeliveryDayTime;

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

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @BelongsTo(() => Users, { onDelete: 'CASCADE', foreignKey: 'user_id' })
  user: Users;

  @ForeignKey(() => Users)
  @Column({ allowNull: true, type: DataType.INTEGER })
  driver_id: number;

  @BelongsTo(() => Users, {
    onDelete: 'CASCADE',
    as: 'driver',
    foreignKey: 'driver_id',
  })
  driver: Users;

  @ForeignKey(() => Users)
  @Column({ allowNull: true, type: DataType.INTEGER })
  laundromat_id: number;

  @BelongsTo(() => Users, {
    onDelete: 'CASCADE',
    as: 'laundromat',
    foreignKey: 'laundromat_id',
  })
  laundromat: Users;

  @ForeignKey(() => Addresses)
  @Column({ allowNull: true, type: DataType.INTEGER })
  address_id: number;

  @BelongsTo(() => Addresses, { onDelete: 'CASCADE' })
  address: Addresses;

  @HasOne(() => Transactions, 'service_request_id')
  transactions: Transactions;

  @HasMany(() => NearByDrivers, 'service_request_id')
  nearby_drivers: NearByDrivers;

  @HasMany(() => NearByLaundromats, 'service_request_id')
  nearby_laundromats: NearByLaundromats;

  @HasMany(() => Media, 'service_request_id')
  serviceRequest: Media[];

  @HasMany(() => ServiceChangeRequest, 'service_request_id')
  service_change_request: ServiceChangeRequest[];

  @HasMany(() => Wallet, 'service_request_id')
  wallet: Wallet[];

  @HasMany(() => Review, 'service_request_id')
  review: Review[];
}
