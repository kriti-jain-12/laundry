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
import Users from './users.model';
import { ServiceType } from 'src/utils/enums';

@Table({ tableName: 'tbl_user_services', underscored: true })
export default class UserService extends Model<UserService> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceType)),
    defaultValue: ServiceType.LAUNDRY,
  })
  service_type: ServiceType;

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
}
