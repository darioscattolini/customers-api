import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CustomerDto } from './customer.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post('/')
  public create(@Body() customer: CustomerDto): Promise<CustomerDto> {
    return this.customersService.create(customer);
  }

  @Get('/')
  public findAll(): Promise<CustomerDto[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  public findeOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerDto> {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() customer: CustomerDto,
  ): Promise<CustomerDto> {
    return this.customersService.update(id, customer);
  }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customersService.remove(id);
  }
}
