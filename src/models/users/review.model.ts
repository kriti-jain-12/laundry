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
import {
    ReviewUserType,
} from 'src/utils/enums';

import ServiceRequest from '../services/service.request.model';
import Users from './users.model';


@Table({ tableName: 'tbl_review', underscored: true })
export default class Review extends Model<Review> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
    })
    id: number;

    @Column({ type: DataType.STRING, allowNull: true })
    review: string;

    @Column({ type: DataType.INTEGER })
    rate: number;

    @Column({
        type: DataType.ENUM(...Object.values(ReviewUserType)),
    })
    user_type: ReviewUserType;

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
    users: Users;

    @ForeignKey(() => ServiceRequest)
    @Column({ allowNull: true, type: DataType.INTEGER })
    service_request_id: number;

    @BelongsTo(() => ServiceRequest, { onDelete: 'CASCADE' })
    serviceRequest: ServiceRequest;

}
