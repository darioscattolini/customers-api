import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerDto } from './dto/customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  public async create(customer: CreateCustomerDto): Promise<CustomerDto> {
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

  public async update(
    id: number,
    customer: UpdateCustomerDto,
  ): Promise<CustomerDto> {
    await this.repository.update(id, customer);

    return await this.findOne(id);
  }
}
