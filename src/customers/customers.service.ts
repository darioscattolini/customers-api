import { Injectable } from '@nestjs/common';
import { CustomerDto } from './customer.dto';

@Injectable()
export class CustomersService {
  private customers: CustomerDto[] = [];

  public create(customer: CustomerDto): CustomerDto {
    const id = this.customers.length;
    customer.id = id;
    this.customers.push(customer);

    return customer;
  }

  public findAll(): CustomerDto[] {
    return this.customers.slice();
  }

  public findOne(id: number): CustomerDto {
    return this.customers.find((customer) => customer.id === id);
  }

  public remove(id: number): void {
    const index = this.customers.findIndex((customer) => customer.id === id);
    this.customers.splice(index, 1);
  }

  public update(id: number, customer: CustomerDto): CustomerDto {
    const index = this.customers.findIndex((customer) => customer.id === id);

    customer = {
      ...customer,
      id,
    };

    this.customers[index] = customer;

    return customer;
  }
}
