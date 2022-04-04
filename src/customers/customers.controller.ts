import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('customers')
export class CustomersController {
  @Post()
  public create() {
    return 'This should create customer with specified data';
  }

  @Get()
  public findAll() {
    return 'This should be an array with all customers';
  }

  @Get(':id')
  public findeOne() {
    return 'This should be a customer with specified id';
  }

  @Put(':id')
  public update() {
    return 'This should update specified customer with specified data';
  }

  @Delete(':id')
  public remove() {
    return 'This should delete customer with specified id';
  }
}
