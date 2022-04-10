import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ResponseCustomer } from './dto/response-customer.dto';
import { PatchRequestCustomer } from './dto/patch-request-customer.dto';
import { PutPostRequestCustomer } from './dto/put-post-request-customer.dto';
import { NotUniqueInterceptor } from '../utilities/errors/not-unique.interceptor';
import { NullInterceptor } from '../utilities/errors/null.interceptor';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}
  /*
  @Post('/')
  @Header('Content-Type', 'application/json')
  @UseInterceptors(NotUniqueInterceptor)
  public create(
    @Body() customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.create(customerData);
  }
  */
  @Get('/')
  @Header('Content-Type', 'application/json')
  public findAll(): Promise<ResponseCustomer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  public findeOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCustomer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Header('Content-Type', 'application/json')
  @UseInterceptors(NotUniqueInterceptor, NullInterceptor)
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: PatchRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.update(id, customerData);
  }

  @Put(':id')
  @Header('Content-Type', 'application/json')
  @UseInterceptors(NotUniqueInterceptor)
  public replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: PutPostRequestCustomer,
  ): Promise<ResponseCustomer> {
    return this.customersService.replace(id, customerData);
  }

  @Delete(':id')
  @Header('Content-Type', 'application/json')
  @HttpCode(204)
  public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customersService.remove(id);
  }
}
