import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  stock: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  image: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
