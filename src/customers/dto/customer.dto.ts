import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsDefined,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CustomerDto {
  @IsDefined()
  @IsInt()
  @IsPositive()
  public id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public surname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  public birthdate: string;
}
