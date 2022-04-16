import AppError from '@shared/errors/AppError';
import { getCustomRepository } from 'typeorm';
import Product from '../infra/typeorm/entities/Product';
import ProductRepository from '../infra/typeorm/Repositories/ProductsRepository';
import RedisCache from '@shared/cache/RedisCache';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

class CreateProductService {
  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const productsRepository = getCustomRepository(ProductRepository);
    const productExists = await productsRepository.findByName(name);
    //const redisCache = new RedisCache();

    if (productExists) {
      throw new AppError('Product already exists');
    }

    const product = productsRepository.create({
      name,
      price,
      quantity,
    });

    await RedisCache.invalidate('api-vendas-PRODUCT_LIST');

    await productsRepository.save(product);

    return product;
  }
}

export default CreateProductService;
