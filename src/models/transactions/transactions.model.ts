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
import Users from '../users/users.model';
import ServiceRequest from '../services/service.request.model';
import Wallet from './wallet.model';
import { WalletTransactionType } from 'src/utils/enums';

@Table({ tableName: 'tbl_transactions', underscored: true })
export default class Transactions extends Model<Transactions> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  payment_intent_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(WalletTransactionType)),
    defaultValue: WalletTransactionType.SERVICE_REQUEST,
  })
  transaction_type: WalletTransactionType;

  @Column({
    type: DataType.STRING,
  })
  payment_method_id: string;

  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  stripe_meta_data: any;

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

  @BelongsTo(() => Users, { onDelete: 'CASCADE' })
  user: Users;

  @ForeignKey(() => ServiceRequest)
  @Column({ type: DataType.INTEGER })
  service_request_id: number;

  @BelongsTo(() => ServiceRequest, { onDelete: 'CASCADE' })
  service: ServiceRequest;

  @HasMany(() => Wallet, 'transactions_id')
  wallet: Wallet[];
}
