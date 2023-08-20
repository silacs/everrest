import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CartExpectionKeys,
  ExceptionStatusKeys,
  ProductExceptionKeys,
} from 'src/enums';
import { UserPayload } from 'src/interfaces';
import {
  Cart,
  CartDocument,
  Product,
  ProductDocument,
  User,
  UserDocument,
} from 'src/schemas';
import { ExceptionService } from 'src/shared';
import { CartDto } from '../dtos';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private exceptionService: ExceptionService,
  ) {}

  async getCurrentCart(userPayload: UserPayload) {
    const user = await this.userModel.findOne({ _id: userPayload._id });

    if (user && !user.cartID) {
      this.exceptionService.throwError(
        ExceptionStatusKeys.Conflict,
        'User has to create cart first',
        CartExpectionKeys.UserDontHaveCart,
      );
    }

    const cart = await this.cartModel.findOne({ _id: user.cartID });
    return cart;
  }

  async createCartWithProduct(userPayload: UserPayload, body: CartDto) {
    const user = await this.userModel.findOne({ _id: userPayload._id });

    if (user && user.cartID) {
      this.exceptionService.throwError(
        ExceptionStatusKeys.BadRequest,
        'User already created cart, use patch endpoint',
        CartExpectionKeys.UserCartAlreadyExists,
      );
    }

    const product = await this.productModel.findOne({ _id: body.id });

    if (!product) {
      this.exceptionService.throwError(
        ExceptionStatusKeys.NotFound,
        `Product with ${body.id} id not found`,
        ProductExceptionKeys.ProductNotFound,
      );
    }

    const cart = await this.cartModel.create({
      userId: userPayload._id,
      createdAt: new Date().toISOString(),
      total: {
        price: {
          current: product.price.current * body.quanity,
          beforeDiscount: product.price.beforeDiscount * body.quanity,
        },
        quantity: body.quanity,
        products: 1,
      },
      products: [
        {
          quantity: body.quanity,
          pricePerQuantity: product.price.current,
          productId: body.id,
        },
      ],
    });

    user.cartID = cart.id;
    await user.save();

    return cart;
  }
}
