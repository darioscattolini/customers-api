import { CustomerDto } from './customer.dto';

describe('CustomerDto', () => {
  it('should be defined', () => {
    expect(new CustomerDto()).toBeDefined();
  });
});
