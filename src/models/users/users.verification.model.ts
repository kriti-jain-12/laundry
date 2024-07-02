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
import Countries from './countries.model';

@Table({ tableName: 'tbl_verification', underscored: true })
export default class Verification extends Model<Verification> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  phone: string;

  @ForeignKey(() => Countries)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  country_id: number;

  @BelongsTo(() => Countries)
  country: Countries;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.INTEGER,
    field: 'OTP',
  })
  OTP: number;

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
}
