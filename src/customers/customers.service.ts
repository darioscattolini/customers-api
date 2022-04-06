import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { ResponseCustomer } from './dto/response-customer.dto';
import { PutPostRequestCustomer } from './dto/put-post-request-customer.dto';
import { PatchRequestCustomer } from './dto/patch-request-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  public async create(
    customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    return await this.repository.save(customerData);
  }

  public async findAll(): Promise<ResponseCustomer[]> {
    return await this.repository.find();
  }

  public async findOne(id: number): Promise<ResponseCustomer> {
    const customer = await this.findCustomerOrThrowException(id);

    return customer;
  }

  public async remove(id: number): Promise<void> {
    await this.findCustomerOrThrowException(id);
    await this.repository.delete(id);
  }

  public async replace(
    id: number,
    customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    const customer = await this.findCustomerOrThrowException(id);

    return await this.repository.save({ ...customer, ...customerData });
  }

  public async update(
    id: number,
    customerData: PatchRequestCustomer,
  ): Promise<ResponseCustomer> {
    const customer = await this.findCustomerOrThrowException(id);

    return await this.repository.save({ ...customer, ...customerData });
  }

  private async findCustomerOrThrowException(id: number): Promise<Customer> {
    const customer = await this.repository.findOne(id);

    if (!customer) {
      throw new HttpException(
        `Customer with identifier ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return customer;
  }
}
