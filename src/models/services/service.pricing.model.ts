import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { DeliveryType, ServiceType, SubServiceType } from 'src/utils/enums';

@Table({ tableName: 'tbl_service_pricing', underscored: true })
export default class ServicePricing extends Model<ServicePricing> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

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
    type: DataType.ENUM(...Object.values(DeliveryType)),
  })
  delivery_type: DeliveryType;

  @Column({
    type: DataType.INTEGER,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
  })
  same_day_delivery_fee: number;

  @Column({
    type: DataType.INTEGER,
  })
  separate: number;

  @Column({
    type: DataType.INTEGER,
  })
  scent: number;

  @Column({
    type: DataType.INTEGER,
  })
  bleach: number;

  @Column({
    type: DataType.INTEGER,
  })
  softner: number;

  @Column({
    type: DataType.INTEGER,
  })
  dryer_sheet: number;

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
}
