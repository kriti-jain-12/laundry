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
import { MediaType } from 'src/utils/enums';
import ServiceChangeRequest from './service.change.request.model';

@Table({ tableName: 'tbl_media', underscored: true })
export default class Media extends Model<Media> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  media_path: string;

  @Column({
    type: DataType.ENUM(...Object.values(MediaType)),
  })
  media_type: MediaType;

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

  @ForeignKey(() => ServiceRequest)
  @Column({ type: DataType.INTEGER })
  service_request_id: number;

  @BelongsTo(() => ServiceRequest, {
    onDelete: 'CASCADE',
    foreignKey: 'service_request_id',
  })
  serviceRequest: ServiceRequest;

  @ForeignKey(() => ServiceChangeRequest)
  @Column({ type: DataType.INTEGER, allowNull: true })
  service_change_request_id: number;

  @BelongsTo(() => ServiceChangeRequest, {
    onDelete: 'CASCADE',
    foreignKey: 'service_change_request_id',
  })
  serviceChangeRequest: ServiceChangeRequest;

  get mediaWithBaseUrl(): string {
    const baseUrl = 'https://api.laundryonappserver.com/uploads/';
    return this.media_path ? baseUrl + this.media_path : this.media_path;
  }
}
