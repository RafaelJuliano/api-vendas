import { EntityRepository, In, Repository } from 'typeorm';
import Product from '../entities/Product';

interface IFindProducts {
  product_id: string;
}

@EntityRepository(Product)
class ProductRepository extends Repository<Product> {
  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(product => product.product_id);

    const existsProducts = await this.find({
      where: {
        id: In(productsIds),
      },
    });

    return existsProducts;
  }
}

export default ProductRepository;
