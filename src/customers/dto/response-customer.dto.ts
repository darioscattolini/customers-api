import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsDefined,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsValidDate } from '../../utilities/errors/is-valid-date.validator';

export class ResponseCustomer {
  @IsPositive()
  @IsInt()
  @IsDefined()
  public id: number;

  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  public name: string;

  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public surname: string;

  @MaxLength(254)
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public email: string;

  @IsValidDate()
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  public birthdate: string;
}
