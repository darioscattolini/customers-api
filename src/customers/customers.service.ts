import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerDto } from './customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  public async create(customer: CustomerDto): Promise<CustomerDto> {
    return await this.repository.save(customer);
  }

  public async findAll(): Promise<CustomerDto[]> {
    return await this.repository.find();
  }

  public async findOne(id: number): Promise<CustomerDto> {
    return await this.repository.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  public async update(id: number, customer: CustomerDto): Promise<CustomerDto> {
    return await this.repository.save({ ...customer, id });
  }
}
