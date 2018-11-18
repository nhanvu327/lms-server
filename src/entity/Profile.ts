import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity } from "typeorm";
import { IsNotEmpty, IsEmail, IsNumber } from "class-validator";

@Entity()
class Profile {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 100
  })
  @IsNotEmpty()
  name: string;

  @Column("varchar", { length: 255 })
  @IsEmail()
  email: string;

  @Column("varchar", { length: 20 })
  @IsNotEmpty()
  phone: string;

  @Column("tinyint")
  @IsNotEmpty()
  role: number;

  @CreateDateColumn()
  @IsNumber()
  created_at: number;

  @UpdateDateColumn()
  @IsNumber()
  modified_at?: number;
}

export default Profile;
