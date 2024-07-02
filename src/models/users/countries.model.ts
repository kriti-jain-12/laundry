import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  AutoIncrement,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import Users from './users.model';

@Table({ tableName: 'tbl_countries', underscored: false })
export default class Countries extends Model<Countries> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  region: string;

  @Column({ type: DataType.STRING })
  code: string;

  @Column({ type: DataType.STRING })
  dial_code: string;

  @Column({ type: DataType.STRING })
  emoji: string;

  @Column({ type: DataType.STRING })
  image: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at?: any;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at?: any;

  @HasMany(() => Users, 'country_id')
  user: Users[];
}
