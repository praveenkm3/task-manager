import { PrimaryGeneratedColumn, Column, Entity, BaseEntity } from "typeorm";

@Entity({ name: "users" })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId!: number;

  @Column({ type: "varchar", length: 150,nullable:false })
  userName!: string;

  @Column({ type: "varchar", unique: true,nullable:false })
  email!: string;

  @Column({ type: "varchar", length: 200,nullable:false })
  password!: string;

  @Column({type:"varchar",default:"user",length:100})
  role!:string;

  @Column({type:"boolean",default:true})
  isActive!:boolean;
}
