import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./User.js";
enum Priority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}
@Entity({ name: "tasks" })
export class Tasks extends BaseEntity {
  @PrimaryGeneratedColumn()
  taskId!: number;

  @Column({ type: "varchar", length: 150, nullable: false })
  title!: string;

  @Column({ type: "varchar", length: 200, nullable: false })
  description!: string;

  @Column({ type: "varchar", length: 100, default: "pending" })
  status!: string;

  @ManyToOne(() => Users, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "created_user_id" })
  createdUser!: Users;

  @ManyToOne(
    () => Users,
    { onDelete: "SET NULL", nullable: true },
    { lazy: true },
  )
  @JoinColumn({ name: "assigned_user_id" })
  assignedUser!: Users;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dueDate!: Date;

  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority!: Priority;
}
