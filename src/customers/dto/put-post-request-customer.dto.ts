import { OmitType } from '@nestjs/mapped-types';
import { ResponseCustomer } from './response-customer.dto';

export class PutPostRequestCustomer extends OmitType(ResponseCustomer, [
  'id',
] as const) {}
