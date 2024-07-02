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
import Users from './users.model';
import { AddressRemark, DoorType } from 'src/utils/enums';
import ServiceRequest from '../services/service.request.model';

@Table({ tableName: 'tbl_addresses', underscored: true })
export default class Addresses extends Model<Addresses> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.ENUM(...Object.values(AddressRemark)),
  })
  remark: AddressRemark;

  @Column({
    type: DataType.ENUM(...Object.values(DoorType)),
    allowNull: true,
  })
  door: DoorType;

  @Column({
    type: DataType.TEXT,
  })
  line_1: string;

  @Column({
    type: DataType.TEXT,
  })
  line_2: string;

  @Column({
    type: DataType.STRING,
  })
  pin_code: string;

  @Column({
    type: DataType.STRING,
  })
  business_name: string;

  @Column({
    type: DataType.STRING,
  })
  hotel_name: string;

  @Column({
    type: DataType.STRING,
  })
  room_no: string;

  @Column({
    type: DataType.STRING,
  })
  province: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  buzzer_code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  call_or_text_notify: boolean;

  @Column({
    type: DataType.DECIMAL(10, 7),
  })
  lat: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
  })
  long: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

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
  @Column({ allowNull: true, type: DataType.INTEGER })
  user_id: number;

  @BelongsTo(() => Users, { onDelete: 'CASCADE' })
  user: Users;

  @HasMany(() => ServiceRequest, 'address_id')
  services: ServiceRequest[];
}
