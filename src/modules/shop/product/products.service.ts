import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from 'src/schemas';
import { CreateProductDto, UpdateProductDto } from '../dtos';
import { ExceptionService } from 'src/shared';
import { ExceptionKeys } from 'src/enums';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private exceptionService: ExceptionService,
  ) {}

  addProduct(product: CreateProductDto): Promise<Product> {
    return this.productModel.create({
      ...product,
    });
  }

  // TODO: Implement middleware or way to check id | we have to use mongoose.isValidObjectId
  async getProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      this.exceptionService.throwError(ExceptionKeys.NotFound);
    }
    return product;
  }

  // TODO: Implement middleware or way to check id | we have to use mongoose.isValidObjectId
  async updateProduct(id: string, body: UpdateProductDto): Promise<Product> {
    const product = await this.productModel.findOneAndUpdate({ _id: id }, body);
    if (!product) {
      this.exceptionService.throwError(ExceptionKeys.NotFound);
    }
    return product;
  }

  getAllProduct(): Promise<Product[]> {
    return this.productModel.find({});
  }

  async getAllProductsDetailed() {
    const product = await this.getAllProduct();
    return {
      product,
      count: product.length,
    };
  }

  async getCategories(): Promise<string[]> {
    const products = await this.getAllProduct();
    const category = [];
    products.forEach((product) => {
      if (!category.includes(product.category.name.toLowerCase())) {
        category.push(product.category.name.toLowerCase());
      }
    });
    return category;
  }

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    const products = await this.productModel.find({
      category: { id: categoryId },
    });

    return products;
  }

  async getBrands(): Promise<string[]> {
    const products = await this.getAllProduct();
    const brands = [];
    products.forEach((product) => {
      if (!brands.includes(product.brand.toLowerCase())) {
        brands.push(product.brand.toLowerCase());
      }
    });
    return brands;
  }

  async getBrandProducts(brandName: string): Promise<Product[]> {
    const products = await this.getAllProduct();
    const brands = products.filter(
      (product) => product.brand.toLowerCase() === brandName.toLowerCase(),
    );
    return brands;
  }

  deleteAllProduct() {
    return this.productModel.deleteMany({});
  }
}
