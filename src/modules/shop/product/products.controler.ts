import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../dtos';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('id/:id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Patch('id/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Post()
  addProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.addProduct(createProductDto);
  }

  @Get('all')
  getAllProduct() {
    return this.productsService.getAllProduct();
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('category/:category_id')
  getProductsByCategoryId(@Param('category_id') id: string) {
    return this.productsService.getByCategoryId(id);
  }

  @Get('brands')
  getBrands() {
    return this.productsService.getBrands();
  }

  @Get('brand/:brand_name')
  getBrandProducts(@Param('brand_name') brandName: string) {
    return this.productsService.getBrandProducts(brandName);
  }
}
