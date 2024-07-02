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

@Table({ tableName: 'tbl_service_tax', underscored: true })
export default class ServiceTax extends Model<ServiceTax> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  province: string;

  @Column({
    type: DataType.DOUBLE,
  })
  gst_hst: number;

  @Column({
    type: DataType.DOUBLE,
  })
  pst: number;

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
