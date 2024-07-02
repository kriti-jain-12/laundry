import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import Users from './users.model';

@Table({ tableName: 'tbl_sessions', underscored: true })
export default class Sessions extends Model<Sessions> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
  })
  token: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  created_at?: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
  })
  updated_at?: Date;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @BelongsTo(() => Users, { onDelete: 'CASCADE' })
  user: Users;
}
