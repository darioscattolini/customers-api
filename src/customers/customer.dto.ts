import { IsDateString, IsEmail, IsNumber, IsString } from 'class-validator';

export class CustomerDto {
  @IsNumber()
  public id: number;

  @IsString()
  public name: string;

  @IsString()
  public surname: string;

  @IsEmail()
  public email: string;

  @IsDateString()
  public birthday: string;
}
