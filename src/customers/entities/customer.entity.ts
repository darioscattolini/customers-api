import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsDateString,
  IsDefined,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  @IsDefined()
  @IsInt()
  @IsPositive()
  public id: number;

  @Column({
    length: 50,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  public name: string;

  @Column({
    length: 50,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public surname: string;

  @Column({
    length: 254,
    nullable: false,
    unique: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  @IsEmail()
  public email: string;

  @Column({
    length: 10,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  public birthdate: string;
}
