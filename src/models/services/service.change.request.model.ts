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
import { ChangeRequestStatus } from 'src/utils/enums';
import ServiceRequest from './service.request.model';
import Media from './media.model';

@Table({ tableName: 'tbl_service_change_request', underscored: true })
export default class ServiceChangeRequest extends Model<ServiceChangeRequest> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.ENUM(...Object.values(ChangeRequestStatus)),
    defaultValue: ChangeRequestStatus.PENDING,
  })
  status: ChangeRequestStatus;

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

  @ForeignKey(() => ServiceRequest)
  @Column({ type: DataType.INTEGER })
  service_request_id: number;

  @BelongsTo(() => ServiceRequest, {
    onDelete: 'CASCADE',
    foreignKey: 'service_request_id',
  })
  serviceRequest: ServiceRequest;

  @HasMany(() => Media, 'service_change_request_id')
  media: Media[];
}
