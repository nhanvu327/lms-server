import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import Profile from "./Profile";
import { IsNotEmpty, IsEmail, IsNumber, MinLength } from "class-validator";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("varchar", { length: 255 })
  @IsEmail()
  email: string;

  @Column("varchar", { length: 255 })
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @Column("text", { nullable: true })
  tokens?: string;

  @OneToOne(type => Profile, {
    cascade: true
  })
  @JoinColumn()
  profile: Profile;

  @Column("tinyint")
  @IsNotEmpty()
  is_active: number;

  @CreateDateColumn()
  @IsNumber()
  created_at: number;

  @UpdateDateColumn()
  @IsNumber()
  modified_at?: number;
}
