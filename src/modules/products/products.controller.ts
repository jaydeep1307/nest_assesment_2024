import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  PRODUCT_CREATED,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_UPDATED,
} from 'src/common/constants/response-message.constants';
import { Public } from 'src/common/decorators/auth.decorator';
import { AuthExceptions, CustomError } from 'src/common/exceptions';
import { successResponse } from 'src/common/responses/success.helper';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiBearerAuth()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint to create a new product
  @Post('createProduct')
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract user ID from request
    const userId = req['user']['_id'];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Create the new product and return success response
    const newProduct = await this.productsService.create(
      createProductDto,
      userId,
    );
    return res
      .status(HttpStatus.CREATED)
      .json(successResponse(PRODUCT_CREATED, newProduct, HttpStatus.CREATED));
  }

  // Endpoint to get all products
  @Public()
  @Get('getAllProducts')
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(
    @Res() res: Response,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    // Retrieve all products based on pagination and search query
    const allProducts = await this.productsService.findAll(page, limit, search);
    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_LIST, allProducts, HttpStatus.OK));
  }

  // Endpoint to get details of a specific product
  @Public()
  @Get('productDetails/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    // Find details of the product with the given ID
    const product = await this.productsService.findOne(id);

    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_DETAIL, product, HttpStatus.OK));
  }

  // Endpoint to update details of a product
  @Patch('updateProduct/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract user ID from request
    const userId = req['user']['_id'];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Update the product and return success response
    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
      userId,
    );

    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_UPDATED, updatedProduct, HttpStatus.OK));
  }

  // Endpoint to delete a product
  @Delete('deleteProduct/:id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract user ID from request
    const userId = req['user']['_id'];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Remove the product and return success response
    await this.productsService.remove(id, userId);
    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_DELETE, {}, HttpStatus.OK));
  }
}
