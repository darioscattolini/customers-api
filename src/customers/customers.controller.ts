import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ResponseCustomer } from './dto/response-customer.dto';
import { PatchRequestCustomer } from './dto/patch-request-customer.dto';
import { PutPostRequestCustomer } from './dto/put-post-request-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post('/')
  public create(
    @Body() customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.create(customerData);
  }

  @Get('/')
  public findAll(): Promise<ResponseCustomer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  public findeOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCustomer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: PatchRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.update(id, customerData);
  }

  @Put(':id')
  public replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.update(id, customerData);
  }

  @Delete(':id')
  @HttpCode(204)
  public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customersService.remove(id);
  }
}
