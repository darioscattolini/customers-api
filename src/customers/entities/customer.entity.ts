import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsValidDate } from '../../utilities/errors/is-valid-date.validator';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  @IsPositive()
  @IsInt()
  @IsDefined()
  public id: number;

  @Column({
    length: 50,
    nullable: false,
  })
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  public name: string;

  @Column({
    length: 50,
    nullable: false,
  })
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public surname: string;

  @Column({
    length: 254,
    nullable: false,
    unique: true,
  })
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public email: string;

  @Column({
    length: 10,
    nullable: false,
  })
  @IsValidDate()
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public birthdate: string;
}
