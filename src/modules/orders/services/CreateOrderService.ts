import CustomersRepository from '@modules/customers/infra/typeorm/repositories/CustomersRepository';
import ProductsRepository from '@modules/products/infra/typeorm/Repositories/ProductsRepository';
import AppError from '@shared/errors/AppError';
import { getCustomRepository } from 'typeorm';
import Order from '../infra/typeorm/entities/Order';
import OrdersRepository from '../infra/typeorm/repositories/OrdersRepository';

interface IProduct {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

class CreateOrderService {
  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository);
    const customersRepository = getCustomRepository(CustomersRepository);
    const productsRepository = getCustomRepository(ProductsRepository);

    const customerExists = await customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Customer not found');
    }

    const existsProducts = await productsRepository.findAllById(products);

    if (!existsProducts.length) {
      throw new AppError('Could not find any products with the given ids');
    }

    const existentProductsIds = existsProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.product_id),
    );

    if (checkInexistentProducts.length) {
      throw new AppError(
        `Could not find product ${checkInexistentProducts[0].product_id}`,
      );
    }

    const quantityAvailableProducts = products.filter(
      product =>
        existsProducts.filter(
          existentProduct => existentProduct.id === product.product_id,
        )[0].quantity < product.quantity,
    );

    if (quantityAvailableProducts.length) {
      throw new AppError(
        `The quantity ${quantityAvailableProducts[0].quantity} is not available for ${quantityAvailableProducts[0].product_id}`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.product_id,
      quantity: product.quantity,
      price: existsProducts.filter(p => p.id === product.product_id)[0].price,
    }));

    const order = await ordersRepository.createOrder({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const updatedProductQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existsProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await productsRepository.save(updatedProductQuantity);

    await ordersRepository.save(order);

    return order;
  }
}

export default CreateOrderService;
