import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PRODUCT_NOT_FOUND } from 'src/common/constants/response-message.constants';
import { AuthExceptions, TypeExceptions } from 'src/common/exceptions';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModal: Model<ProductDocument>,
  ) {}

  // Method to create a new product
  async create(createProductDto: CreateProductDto, userId: string) {
    const { name, price, category, stock, image } = createProductDto;

    // Ensure the product was not created by the current user
    const isProjectAlreadyExists = await this.productModal.findOne({
      name,
      category,
      createdBy: userId,
    });
    if (isProjectAlreadyExists)
      throw AuthExceptions.ForbiddenException(
        `You can't create same product twice`,
      );

    // Create and return the new product
    const product = await this.productModal.create({
      name,
      price,
      category,
      stock,
      image,
      createdBy: userId,
    });

    return product;
  }

  // Method to find all products with pagination and search
  async findAll(page: number, limit: number, search: string) {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await this.productModal
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.productModal.countDocuments(query);

    const productsPayload = {
      allProducts: products,
      total_records: total,
    };

    return productsPayload;
  }

  // Method to find details of a specific product
  async findOne(productId: string) {
    const product = await this.productModal.findById(productId);
    if (!product) throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);
    return product;
  }

  // Method to update details of a product
  async update(
    productId: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ) {
    // Ensure the product was created by the current user
    const product = await this.productModal.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product)
      throw AuthExceptions.ForbiddenException(
        'You are not allowed to update this product',
      );

    // Update the product
    const updatedProduct = await this.productModal.findByIdAndUpdate(
      productId,
      { $set: updateProductDto },
      { new: true },
    );

    if (!updatedProduct)
      throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);

    return updatedProduct;
  }

  // Method to delete a product
  async remove(productId: string, userId: string) {
    // Ensure the product was created by the current user
    const product = await this.productModal.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product)
      throw AuthExceptions.ForbiddenException(
        'You are not allowed to delete this product',
      );

    // Delete the product
    const deletedProduct = await this.productModal.findByIdAndDelete(productId);

    if (!deletedProduct)
      throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);
  }
}
