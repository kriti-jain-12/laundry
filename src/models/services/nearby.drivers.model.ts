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
} from 'sequelize-typescript';
import Users from '../users/users.model';
import ServiceRequest from './service.request.model';

@Table({ tableName: 'tbl_nearby_driver', underscored: true })
export default class NearByDrivers extends Model<NearByDrivers> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

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
  driver_id: number;

  @BelongsTo(() => Users, { onDelete: 'CASCADE' })
  driver: Users;

  @ForeignKey(() => ServiceRequest)
  @Column({ type: DataType.INTEGER })
  service_request_id: number;

  @BelongsTo(() => ServiceRequest, { onDelete: 'CASCADE' })
  service_request: ServiceRequest;
}
