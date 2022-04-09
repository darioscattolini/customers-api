import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { ResponseCustomer } from './dto/response-customer.dto';
import { PutPostRequestCustomer } from './dto/put-post-request-customer.dto';
import { PatchRequestCustomer } from './dto/patch-request-customer.dto';
import { UniqueConstraintException } from '../utilities/errors/unique-constraint.exception';
import { NotNullConstraintException } from '../utilities/errors/not-null-constraint.exception';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  public async create(
    customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    try {
      return await this.repository.save(customerData);
    } catch (error) {
      this.interceptDatabaseError(error, customerData);
    }
  }

  public async findAll(): Promise<ResponseCustomer[]> {
    return await this.repository.find();
  }

  public async findOne(id: number): Promise<ResponseCustomer> {
    const customer = await this.findOneOrFail(id);

    return customer;
  }

  public async remove(id: number): Promise<void> {
    await this.findOneOrFail(id);
    await this.repository.delete(id);
  }

  public async replace(
    id: number,
    customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    const customer = await this.findOneOrFail(id);

    try {
      return await this.repository.save({ ...customer, ...customerData });
    } catch (error) {
      this.interceptDatabaseError(error, customerData);
    }
  }

  public async update(
    id: number,
    customerData: PatchRequestCustomer,
  ): Promise<ResponseCustomer> {
    const customer = await this.findOneOrFail(id);

    try {
      return await this.repository.save({ ...customer, ...customerData });
    } catch (error) {
      this.interceptDatabaseError(error, customerData);
    }
  }

  /**
   * Looks for customer with provided id in database. Throws error if it is not
   * found, with customized message.
   * @param id id of searched customer
   * @returns found customer
   */
  private async findOneOrFail(id: number): Promise<Customer> {
    try {
      return await this.repository.findOneOrFail(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        const message = 'Could not find a customer with id: ' + id;
        throw new NotFoundException(message);
      }
    }
  }

  /**
   * Checks errors thrown by TypeORM and maps them to custom exceptions
   * that can be easily handled by further interceptors. This is currently too
   * tightly coupled to chosen database implementation, as TypeORM provides no
   * common interface for errors arising from validations performed on database.
   * Error messages come directly from database engine, and therefore vary
   * depending on the chosen database.
   *
   * @param error error received from TypeORM
   * @param customerData data from which error arises
   */
  private interceptDatabaseError(
    error: any,
    customerData: PatchRequestCustomer,
  ): void {
    const message = error.driverError.message as string;
    const [entity, field] = message.split(': ')[1].split('.');
    const value = customerData[field];

    if (message.includes('UNIQUE constraint failed')) {
      throw new UniqueConstraintException(entity, field, value);
    } else if (message.includes('NOT NULL constraint failed')) {
      throw new NotNullConstraintException(field);
    } else {
      throw error;
    }
  }
}
