import AppError from '@shared/errors/AppError';
import { injectable, inject } from 'tsyringe';
import { ICreateCustomer } from '@modules/customers/domain/models/ICreateCustomer';
import { ICustomersRepository } from '../domain/repositories/ICustomersRepository';
import { ICustomer } from '../domain/models/ICustomer';

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: ICreateCustomer): Promise<ICustomer> {
    const emailExists = await this.customersRepository.findByEmail(email);

    if (emailExists) {
      throw new AppError('Email address already used.');
    }

    const customer = await this.customersRepository.create({
      name,
      email,
    });

    return customer;
  }
}

export default CreateCustomerService;
