import { PartialType } from '@nestjs/mapped-types';
import { PutPostRequestCustomer } from './put-post-request-customer.dto';

export class PatchRequestCustomer extends PartialType(PutPostRequestCustomer) {}
