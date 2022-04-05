import { OmitType } from '@nestjs/mapped-types';
import { CustomerDto } from './customer.dto';

export class CreateCustomerDto extends OmitType(CustomerDto, ['id'] as const) {}
