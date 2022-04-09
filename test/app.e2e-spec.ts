import * as request from 'supertest';
import 'jest-extended';
import * as matchers from 'jest-extended/all';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Customer } from './../src/customers/entities/customer.entity';
import { PutPostRequestCustomer } from './../src/customers/dto/put-post-request-customer.dto';
import { PatchRequestCustomer } from './../src/customers/dto/patch-request-customer.dto';
import { classValidatorExceptionFactory } from '../src/utilities/errors/class-validator-exception-factory';
import { ResponseCustomer } from '../src/customers/dto/response-customer.dto';

jest.useFakeTimers();
expect.extend(matchers);

type CustomerProperty = keyof PatchRequestCustomer;

class CustomerFactory {
  public static getAllProps(): CustomerProperty[] {
    return ['name', 'surname', 'email', 'birthdate'];
  }

  public static getRequiredProps(): CustomerProperty[] {
    return ['name', 'surname', 'email', 'birthdate'];
  }

  /**
   * Creates Customer Dto assigning random values to all possible properties
   * @returns Customer Dto
   */
  public static createFullDto(): PutPostRequestCustomer {
    return this.createPartialDto(this.getAllProps()) as PutPostRequestCustomer;
  }

  /**
   * Creates Customer Dto assigning random values to specified properties
   * @param props Specifies properties to be included in Customer dto.
   * @returns Customer Dto
   */
  public static createPartialDto(
    props: CustomerProperty[],
  ): PatchRequestCustomer {
    const dto = new PatchRequestCustomer();

    for (const prop of props) {
      switch (prop) {
        case 'name':
        case 'surname':
          dto[prop] = this.generateRandomString();
          break;
        case 'email':
          dto[prop] = this.generateRandomEmail();
          break;
        case 'birthdate':
          dto[prop] = this.generateRandomBirthdate();
      }
    }

    return dto;
  }

  private static generateRandomBirthdate(): string {
    const year = 1930 + Math.floor(Math.random() * 80);
    const month = Math.ceil(Math.random() * 12);
    const day = Math.ceil(Math.random() * 28);
    const leftPaddedMonth = String(month).padStart(2, '0');
    const leftPaddedDay = String(day).padStart(2, '0');

    return `${year}-${leftPaddedMonth}-${leftPaddedDay}`;
  }

  private static generateRandomEmail(): string {
    return `${this.generateRandomString()}@${this.generateRandomString()}.com`;
  }

  private static generateRandomString(): string {
    return (Math.random() + 1).toString(36).substring(2);
  }
}

/**
 * Generates the specified amount of Customer dtos and saves them directly in
 * database by means of the specified repository, returning saved entities
 * @param repository Customer repository
 * @param amount Amount of customers to be saved
 * @returns Saved customers
 */
const saveCustomers = async (
  repository: Repository<Customer>,
  amount: number,
) => {
  const dtos: PutPostRequestCustomer[] = [];

  for (let i = 0; i < amount; i++) dtos.push(CustomerFactory.createFullDto());

  return await repository.save(dtos);
};

/**
 * Checks if object matches API Customer interface
 * @param object any object
 * @returns boolean
 */
const isCustomer = (object: Record<string, any>): boolean =>
  object.id != undefined &&
  object.name != undefined &&
  object.surname != undefined &&
  object.email != undefined &&
  object.birthdate != undefined &&
  typeof object.id === 'number' &&
  typeof object.name === 'string' &&
  typeof object.surname === 'string' &&
  typeof object.email === 'string' &&
  typeof object.birthdate === 'string';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let customerRepo: Repository<Customer>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          entities: ['src/**/*.entity{.ts,.js}'], // Override ormconfig.js path
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: classValidatorExceptionFactory,
        stopAtFirstError: true,
      }),
    );

    // used to operate directly on database during tests set-up
    customerRepo = moduleFixture.get('CustomerRepository');
    await app.init();
  });

  afterEach(async () => {
    await customerRepo.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ - (App root path)', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('customers/ - Customers endpoint', () => {
    const endpoint = '/customers/';

    describe('/ (GET) - Get list of customers', () => {
      it('responds with header content-type json', async () => {
        const response = await request(app.getHttpServer()).get(endpoint);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('returns empty list if no customer on database', async () => {
        const response = await request(app.getHttpServer()).get(endpoint);

        expect(response.status).toEqual(200);
        expect(response.body).toBeArrayOfSize(0);
      });

      it('returns all customers on database', async () => {
        const customers = await saveCustomers(customerRepo, 2);
        const response = await request(app.getHttpServer()).get(endpoint);

        expect(response.status).toEqual(200);
        expect(response.body).toIncludeSameMembers(customers);
      });

      it('returns customers matching Customer interface', async () => {
        await saveCustomers(customerRepo, 2);
        const response = await request(app.getHttpServer()).get(endpoint);

        expect(response.body).toSatisfyAll(isCustomer);
      });

      it('does not change system state - is idempotent', async () => {
        await saveCustomers(customerRepo, 1);
        const response1 = await request(app.getHttpServer()).get(endpoint);
        const body1 = [...response1.body];
        const response2 = await request(app.getHttpServer()).get(endpoint);
        const body2 = [...response2.body];

        expect(body1).toIncludeSameMembers(body2);
      });
    });

    describe('/ (POST) - Create customer', () => {
      it('responds good request with header content-type json', async () => {
        const customerDto = CustomerFactory.createFullDto();

        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('responds bad request with header content-type json', async () => {
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send({});

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('creates customer from valid data and returns it with id', async () => {
        const customerDto = CustomerFactory.createFullDto();

        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto);

        expect(response.status).toEqual(201);
        expect(response.body).toEqual({
          ...customerDto,
          id: expect.any(Number),
        });
      });

      it('returns customer matching Customer interface', async () => {
        const customerDto = CustomerFactory.createFullDto();

        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto);

        expect(response.body).toSatisfy(isCustomer);
      });

      it('creates customer that can be retrieved with returned id', async () => {
        const customerDto = CustomerFactory.createFullDto();

        const createResponse = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto);

        const getByIdResponse = await request(app.getHttpServer()).get(
          endpoint + createResponse.body.id,
        );

        const getAllResponse = await request(app.getHttpServer()).get(endpoint);

        expect(getByIdResponse.body).toEqual(createResponse.body);
        expect(getAllResponse.body).toContainEqual(createResponse.body);
      });

      it('creates different customers with different ids', async () => {
        const customerDto1 = CustomerFactory.createFullDto();
        const customerDto2 = CustomerFactory.createFullDto();

        const [customer1, customer2] = await Promise.all(
          [customerDto1, customerDto2].map(async (dto) => {
            const response = await request(app.getHttpServer())
              .post(endpoint)
              .send(dto);

            return response.body as ResponseCustomer;
          }),
        );

        expect(customer1.id).not.toEqual(customer2.id);
      });

      it('fails to create different customers with the same email', async () => {
        const customerDto1 = CustomerFactory.createFullDto();
        const customerDto2 = CustomerFactory.createFullDto();
        customerDto2.email = customerDto1.email;

        const response1 = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto1);

        expect(response1.status).toEqual(201);

        const response2 = await request(app.getHttpServer())
          .post(endpoint)
          .send(customerDto2);

        expect(response2.status).toEqual(400);
        expect(response2.body.message).toContain('email');
      });

      it.each([
        {
          isValid: true,
          addresses: [
            'email@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            '"email"@example.com',
            '1234567890@example.com',
            '_______@example.com',
            'email@example.name',
          ],
          result: 'accepts valid',
        },
        {
          isValid: false,
          addresses: [
            'plainaddress',
            '#@%^%#$@#$@#.com',
            '@example.com',
            'Joe Smith <email@example.com>',
            'email.example.com',
            'email@example@example.com',
            '.email@example.com',
            'email.@example.com',
            'email..email@example.com',
            'email@example.com (Joe Smith)',
            'email@example',
            'email@-example.com',
            'email@111.222.333.44444',
            'email@example..com',
            'Abc..123@example.com',
            '“(),:;<>[\\]@example.com',
            'just"not"right@example.com',
            'this\\ is"really"not\\allowed@example.com',
          ],
          result: 'rejects invalid',
        },
      ])('$result email addresses', async ({ isValid, addresses }) => {
        const responses = await Promise.all(
          addresses.map(async (address) => {
            const customerDto = CustomerFactory.createFullDto();
            customerDto.email = address;

            return await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 201);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'email property must contain a valid email',
            );
          });
        }
      });

      it.each([
        {
          isValid: true,
          dates: ['1999-01-30', '2020-02-29', '1970-12-05'],
          result: 'accepts valid YYYY-MM-DD formatted',
        },
        {
          isValid: false,
          dates: [
            '99-01-30',
            '1999-1-30',
            '1999-01-3',
            '1999/01/30',
            '1999-00-00',
            '1999-01-32',
            '1999-02-29',
            '1999-06-31',
          ],
          result: 'rejects invalid or not YYYY-MM-DD formatted',
        },
      ])('$result birthdates', async ({ isValid, dates }) => {
        const responses = await Promise.all(
          dates.map(async (date) => {
            const customerDto = CustomerFactory.createFullDto();
            customerDto.birthdate = date;

            return await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 201);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'birthdate should have a valid date in YYYY-MM-DD format',
            );
          });
        }
      });

      describe('required properties validation', () => {
        let undefinedMessage: (string: CustomerProperty) => string;

        beforeEach(() => {
          undefinedMessage = (prop: CustomerProperty) =>
            prop + ' should not be omitted, undefined or null';
        });

        it('fails for empty object and returns complete message', async () => {
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .send({});
          const expectedMessages = CustomerFactory.getRequiredProps().map(
            (prop) => undefinedMessage(prop),
          );

          expect(response.status).toEqual(400);
          expect(response.body.message).toIncludeSameMembers(expectedMessages);
        });

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is omitted in payload',
          async (omittedProp) => {
            const includedProps = CustomerFactory.getAllProps().filter(
              (prop) => prop !== omittedProp,
            );
            const customerDto = CustomerFactory.createPartialDto(includedProps);
            const response = await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(omittedProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is undefined',
          async (undefinedProp) => {
            const customerDto = CustomerFactory.createFullDto();
            customerDto[undefinedProp] = undefined;

            const response = await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(undefinedProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is null',
          async (nullProp) => {
            const customerDto = CustomerFactory.createFullDto();
            customerDto[nullProp] = undefined;

            const response = await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(nullProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is an empty string',
          async (emptyProp) => {
            const customerDto = CustomerFactory.createFullDto();
            customerDto[emptyProp] = '';

            const response = await request(app.getHttpServer())
              .post(endpoint)
              .send(customerDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              emptyProp + ' should not be an empty string',
            );
          },
        );
      });

      describe('string properties validation', () => {
        it.each([
          'name',
          'surname',
          'email',
          'birthdate',
        ] as CustomerProperty[])(
          'fails if %s is not a string',
          async (nonStringProp) => {
            const nonStringValues = [3, true, { a: 'b' }];

            const customerDtos = nonStringValues.map((value) => {
              const dto = CustomerFactory.createFullDto();
              (dto[nonStringProp] as any) = value;

              return dto;
            });

            const responses = await Promise.all(
              customerDtos.map(async (dto) => {
                const response = await request(app.getHttpServer())
                  .post(endpoint)
                  .send(dto);

                return response;
              }),
            );

            expect(responses).toSatisfyAll(
              (response) => response.status === 400,
            );
            expect(responses).toSatisfyAll((response) =>
              response.body.message[0].includes(
                `${nonStringProp} must be a string`,
              ),
            );
          },
        );
      });
    });

    describe('/:id (GET) - Get single customer by id', () => {
      it('responds 200 request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const response = await request(app.getHttpServer()).get(url);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('responds 404 request with header content-type json', async () => {
        const url = endpoint + '2';
        const response = await request(app.getHttpServer()).get(url);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('returns requested customer if it exists', async () => {
        const customers = await saveCustomers(customerRepo, 3);
        const testedCustomer = customers.pop();
        const url = endpoint + testedCustomer.id;
        const response = await request(app.getHttpServer()).get(url);

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(testedCustomer);
      });

      it('returns customers matching Customer interface', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const response = await request(app.getHttpServer()).get(url);

        expect(response.body).toSatisfy(isCustomer);
      });

      it('does not change system state - is idempotent', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const response1 = await request(app.getHttpServer()).get(url);
        const body1 = { ...response1.body };
        const response2 = await request(app.getHttpServer()).get(url);
        const body2 = { ...response2.body };

        expect(body2).toEqual(body1);
      });

      it('returns 404 not found if customer does not exist', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const searchedId = customer.id + 5;
        const url = endpoint + searchedId;
        const response = await request(app.getHttpServer()).get(url);

        expect(response.status).toEqual(404);
        expect(response.body.message).toContain(
          'Could not find a customer with id: ' + searchedId,
        );
      });
    });

    describe('/:id (PUT) - Replace customer data', () => {
      it('responds good request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const replacementDto = CustomerFactory.createFullDto();
        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('responds bad request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const response = await request(app.getHttpServer()).put(url).send({});

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('responds 404 request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + (customer.id + 5);
        const replacementDto = CustomerFactory.createFullDto();
        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('replaces customer data if valid and returns them with same id', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const replacementDto = CustomerFactory.createFullDto();

        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          ...replacementDto,
          id: customer.id,
        });
      });

      it('returns customer matching Customer interface', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const replacementDto = CustomerFactory.createFullDto();
        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.body).toSatisfy(isCustomer);
      });

      it('is idempotent', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const replacementDto = CustomerFactory.createFullDto();

        const response1 = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);
        const body1 = { ...response1.body };
        const response2 = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);
        const body2 = { ...response2.body };

        expect(body2).toEqual(body1);
      });

      it('returns 404 not found if customer does not exist', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const searchedId = customer.id + 5;
        const url = endpoint + searchedId;
        const replacementDto = CustomerFactory.createFullDto();
        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.status).toEqual(404);
        expect(response.body.message).toContain(
          'Could not find a customer with id: ' + searchedId,
        );
      });

      it('fails to update email used by another customer', async () => {
        const [customer1, customer2] = await saveCustomers(customerRepo, 2);
        const url = endpoint + customer2.id;
        const replacementDto = CustomerFactory.createFullDto();
        replacementDto.email = customer1.email;

        const response = await request(app.getHttpServer())
          .put(url)
          .send(replacementDto);

        expect(response.status).toEqual(400);
        expect(response.body.message).toContain('email');
      });

      it.each([
        {
          isValid: true,
          addresses: [
            'email@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            '"email"@example.com',
            '1234567890@example.com',
            '_______@example.com',
            'email@example.name',
          ],
          result: 'accepts valid',
        },
        {
          isValid: false,
          addresses: [
            'plainaddress',
            '#@%^%#$@#$@#.com',
            '@example.com',
            'Joe Smith <email@example.com>',
            'email.example.com',
            'email@example@example.com',
            '.email@example.com',
            'email.@example.com',
            'email..email@example.com',
            'email@example.com (Joe Smith)',
            'email@example',
            'email@-example.com',
            'email@111.222.333.44444',
            'email@example..com',
            'Abc..123@example.com',
            '“(),:;<>[\\]@example.com',
            'just"not"right@example.com',
            'this\\ is"really"not\\allowed@example.com',
          ],
          result: 'rejects invalid',
        },
      ])('$result email addresses', async ({ isValid, addresses }) => {
        const responses = await Promise.all(
          addresses.map(async (address) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;
            const replacementDto = CustomerFactory.createFullDto();
            replacementDto.email = address;

            return await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 200);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'email property must contain a valid email',
            );
          });
        }
      });

      it.each([
        {
          isValid: true,
          dates: ['1999-01-30', '2020-02-29', '1970-12-05'],
          result: 'accepts valid YYYY-MM-DD formatted',
        },
        {
          isValid: false,
          dates: [
            '99-01-30',
            '1999-1-30',
            '1999-01-3',
            '1999/01/30',
            '1999-00-00',
            '1999-01-32',
            '1999-02-29',
            '1999-06-31',
          ],
          result: 'rejects invalid or not YYYY-MM-DD formatted',
        },
      ])('$result birthdates', async ({ isValid, dates }) => {
        const responses = await Promise.all(
          dates.map(async (date) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;
            const replacementDto = CustomerFactory.createFullDto();
            replacementDto.birthdate = date;

            return await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 200);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'birthdate should have a valid date in YYYY-MM-DD format',
            );
          });
        }
      });

      describe('required properties validation', () => {
        let undefinedMessage: (string: CustomerProperty) => string;

        beforeEach(() => {
          undefinedMessage = (prop: CustomerProperty) =>
            prop + ' should not be omitted, undefined or null';
        });

        it('fails for empty object and returns complete message', async () => {
          const [customer] = await saveCustomers(customerRepo, 1);
          const url = endpoint + customer.id;
          const response = await request(app.getHttpServer()).put(url).send({});

          const expectedMessages = CustomerFactory.getRequiredProps().map(
            (prop) => undefinedMessage(prop),
          );

          expect(response.status).toEqual(400);
          expect(response.body.message).toIncludeSameMembers(expectedMessages);
        });

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is omitted in payload',
          async (omittedProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const includedProps = CustomerFactory.getAllProps().filter(
              (prop) => prop !== omittedProp,
            );
            const replacementDto =
              CustomerFactory.createPartialDto(includedProps);

            const response = await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(omittedProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is undefined',
          async (undefinedProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const replacementDto = CustomerFactory.createFullDto();
            replacementDto[undefinedProp] = undefined;

            const response = await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(undefinedProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is null',
          async (nullProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const replacementDto = CustomerFactory.createFullDto();
            replacementDto[nullProp] = null;

            const response = await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              undefinedMessage(nullProp),
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is an empty string',
          async (emptyProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const replacementDto = CustomerFactory.createFullDto();
            replacementDto[emptyProp] = '';

            const response = await request(app.getHttpServer())
              .put(url)
              .send(replacementDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              emptyProp + ' should not be an empty string',
            );
          },
        );
      });

      describe('string properties validation', () => {
        it.each([
          'name',
          'surname',
          'email',
          'birthdate',
        ] as CustomerProperty[])(
          'fails if %s is not a string',
          async (nonStringProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const nonStringValues = [3, true, { a: 'b' }];
            const replacementDtos = nonStringValues.map((value) => {
              const dto = CustomerFactory.createFullDto();
              (dto[nonStringProp] as any) = value;

              return dto;
            });

            const responses = await Promise.all(
              replacementDtos.map(async (dto) => {
                const response = await request(app.getHttpServer())
                  .put(url)
                  .send(dto);

                return response;
              }),
            );

            expect(responses).toSatisfyAll(
              (response) => response.status === 400,
            );
            expect(responses).toSatisfyAll((response) =>
              response.body.message[0].includes(
                `${nonStringProp} must be a string`,
              ),
            );
          },
        );
      });
    });

    describe('/:id (PATCH) - Partially update customer data', () => {
      it('responds good request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const updateDto = CustomerFactory.createPartialDto(['name']);
        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('responds 404 request with header content-type json', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + (customer.id + 5);
        const updateDto = CustomerFactory.createPartialDto(['name']);
        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('replaces customer data if valid and returns them with same id', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const updateDto = CustomerFactory.createPartialDto(['name']);
        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          ...customer,
          ...updateDto,
          id: customer.id,
        });
      });

      it('returns customer matching Customer interface', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const updateDto = CustomerFactory.createPartialDto(['name']);
        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.body).toSatisfy(isCustomer);
      });

      it('is idempotent', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const updateDto = CustomerFactory.createPartialDto(['name']);

        const response1 = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);
        const body1 = { ...response1.body };
        const response2 = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);
        const body2 = { ...response2.body };

        expect(body2).toEqual(body1);
      });

      it('returns 404 not found if customer does not exist', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const searchedId = customer.id + 5;
        const url = endpoint + searchedId;
        const updateDto = CustomerFactory.createPartialDto(['name']);
        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.status).toEqual(404);
        expect(response.body.message).toContain(
          'Could not find a customer with id: ' + searchedId,
        );
      });

      it('fails to update email used by another customer', async () => {
        const [customer1, customer2] = await saveCustomers(customerRepo, 2);
        const url = endpoint + customer2.id;
        const updateDto = CustomerFactory.createPartialDto(['name']);
        updateDto.email = customer1.email;

        const response = await request(app.getHttpServer())
          .patch(url)
          .send(updateDto);

        expect(response.status).toEqual(400);
        expect(response.body.message).toContain('email');
      });

      it.each([
        {
          isValid: true,
          addresses: [
            'email@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            '"email"@example.com',
            '1234567890@example.com',
            '_______@example.com',
            'email@example.name',
          ],
          result: 'accepts valid',
        },
        {
          isValid: false,
          addresses: [
            'plainaddress',
            '#@%^%#$@#$@#.com',
            '@example.com',
            'Joe Smith <email@example.com>',
            'email.example.com',
            'email@example@example.com',
            '.email@example.com',
            'email.@example.com',
            'email..email@example.com',
            'email@example.com (Joe Smith)',
            'email@example',
            'email@-example.com',
            'email@111.222.333.44444',
            'email@example..com',
            'Abc..123@example.com',
            '“(),:;<>[\\]@example.com',
            'just"not"right@example.com',
            'this\\ is"really"not\\allowed@example.com',
          ],
          result: 'rejects invalid',
        },
      ])('$result email addresses', async ({ isValid, addresses }) => {
        const responses = await Promise.all(
          addresses.map(async (address) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;
            const updateDto = CustomerFactory.createPartialDto(['name']);
            updateDto.email = address;

            return await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 200);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'email property must contain a valid email',
            );
          });
        }
      });

      it.each([
        {
          isValid: true,
          dates: ['1999-01-30', '2020-02-29', '1970-12-05'],
          result: 'accepts valid YYYY-MM-DD formatted',
        },
        {
          isValid: false,
          dates: [
            '99-01-30',
            '1999-1-30',
            '1999-01-3',
            '1999/01/30',
            '1999-00-00',
            '1999-01-32',
            '1999-02-29',
            '1999-06-31',
          ],
          result: 'rejects invalid or not YYYY-MM-DD formatted',
        },
      ])('$result birthdates', async ({ isValid, dates }) => {
        const responses = await Promise.all(
          dates.map(async (date) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;
            const updateDto = CustomerFactory.createPartialDto(['name']);
            updateDto.birthdate = date;

            return await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);
          }),
        );

        if (isValid) {
          expect(responses).toSatisfyAll((response) => response.status === 200);
        } else {
          expect(responses).toSatisfyAll((response) => response.status === 400);
          expect(responses).toSatisfyAll((response) => {
            const message = response.body.message[0];

            return message.includes(
              'birthdate should have a valid date in YYYY-MM-DD format',
            );
          });
        }
      });

      describe('required properties validation', () => {
        it('customer data is not changed if empty dto is sent', async () => {
          const [customer] = await saveCustomers(customerRepo, 1);
          const url = endpoint + customer.id;
          const response = await request(app.getHttpServer())
            .patch(url)
            .send({});

          expect(response.status).toEqual(200);
          expect(response.body).toEqual(customer);
        });

        it.each(CustomerFactory.getRequiredProps())(
          '%s is not changed if omitted in dto',
          async (omittedProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const includedProps = CustomerFactory.getAllProps().filter(
              (prop) => prop !== omittedProp,
            );
            const updateDto = CustomerFactory.createPartialDto(includedProps);

            const response = await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
              ...customer,
              ...updateDto,
              id: customer.id,
            });
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          '%s is not changed if it is included in dto as undefined',
          async (undefinedProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;
            const initialPropValue = customer[undefinedProp];

            const updateDto = CustomerFactory.createFullDto();
            updateDto[undefinedProp] = undefined;

            const response = await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
              ...customer,
              ...updateDto,
              [undefinedProp]: initialPropValue,
              id: customer.id,
            });
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is null',
          async (nullProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const updateDto = CustomerFactory.createFullDto();
            updateDto[nullProp] = null;

            const response = await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);

            expect(response.status).toEqual(400);
            expect(response.body.message).toContain(
              nullProp + ' cannot be null',
            );
          },
        );

        it.each(CustomerFactory.getRequiredProps())(
          'fails if %s is an empty string',
          async (emptyProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const updateDto = CustomerFactory.createFullDto();
            updateDto[emptyProp] = '';

            const response = await request(app.getHttpServer())
              .patch(url)
              .send(updateDto);

            expect(response.status).toEqual(400);
            expect(response.body.message[0]).toContain(
              emptyProp + ' should not be an empty string',
            );
          },
        );
      });

      describe('string properties validation', () => {
        it.each([
          'name',
          'surname',
          'email',
          'birthdate',
        ] as CustomerProperty[])(
          'fails if %s is not a string',
          async (nonStringProp) => {
            const [customer] = await saveCustomers(customerRepo, 1);
            const url = endpoint + customer.id;

            const nonStringValues = [3, true, { a: 'b' }];
            const updateDtos = nonStringValues.map((value) => {
              return { [nonStringProp]: value };
            });

            const responses = await Promise.all(
              updateDtos.map(async (dto) => {
                const response = await request(app.getHttpServer())
                  .patch(url)
                  .send(dto);

                return response;
              }),
            );

            expect(responses).toSatisfyAll(
              (response) => response.status === 400,
            );
            expect(responses).toSatisfyAll((response) =>
              response.body.message[0].includes(
                `${nonStringProp} must be a string`,
              ),
            );
          },
        );
      });
    });

    describe('/:id (DELETE) - Remove customer', () => {
      it('responds 200 request no content-type header', async () => {
        const [customer] = await saveCustomers(customerRepo, 1);
        const url = endpoint + customer.id;
        const response = await request(app.getHttpServer()).delete(url);

        expect(response.headers['content-type']).toBeNil();
      });

      it('responds 404 request with header content-type json', async () => {
        const url = endpoint + '2';
        const response = await request(app.getHttpServer()).delete(url);

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('deletes customer if it exists and returns no content', async () => {
        const customers = await saveCustomers(customerRepo, 3);
        const toBeDeleted = customers.pop();
        const url = endpoint + toBeDeleted.id;
        const response = await request(app.getHttpServer()).delete(url);

        expect(response.status).toEqual(204);
        expect(response.body).toBeEmptyObject();
      });

      it('fails with 404 not found if customer does not exist', async () => {
        const id = 3;
        const url = endpoint + id;
        const response = await request(app.getHttpServer()).delete(url);

        expect(response.status).toEqual(404);
        expect(response.body.message).toContain(
          'Could not find a customer with id: ' + id,
        );
      });

      it('deleted customer cannot be retrieved later', async () => {
        const customers = await saveCustomers(customerRepo, 3);
        const toBeDeleted = customers.pop();
        const url = endpoint + toBeDeleted.id;

        const itExists = await request(app.getHttpServer()).get(url);
        await request(app.getHttpServer()).delete(url);
        const nowItDoesntExist = await request(app.getHttpServer()).get(url);

        expect(itExists.status).toEqual(200);
        expect(nowItDoesntExist.status).toEqual(404);
      });
    });
  });
});

/**
 * FURTHER TESTS TO BE ADDED:
 * - String length validation
 * - Verify idempotence and state through both GET methods
 * - Bad use of routes (e.g. POST /:id)
 */
