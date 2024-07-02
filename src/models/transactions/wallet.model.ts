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
import ServiceRequest from '../services/service.request.model';
import Transactions from './transactions.model';
import { WalletTransactionType } from 'src/utils/enums';

@Table({ tableName: 'tbl_wallet', underscored: true })
export default class Wallet extends Model<Wallet> {
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
    type: DataType.ENUM(...Object.values(WalletTransactionType)),
    defaultValue: WalletTransactionType.SERVICE_REQUEST,
  })
  type: WalletTransactionType;

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

  @ForeignKey(() => Transactions)
  @Column({ type: DataType.INTEGER })
  transactions_id: number;

  @BelongsTo(() => Transactions, { onDelete: 'CASCADE' })
  transactions: Transactions;
}
