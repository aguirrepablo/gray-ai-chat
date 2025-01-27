import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer } from './schemas/customer.schema'; // Adjust import path as needed
import { ChannelType } from './enums/channel-type.enum';

@Injectable()
export class CustomerService {
    private readonly logger = new Logger(CustomerService.name);

    constructor(
        @InjectModel(Customer.name) private customerModel: Model<Customer>
    ) { }

    async findOrCreateCustomer(
        externalId: string,
        channel: ChannelType
    ): Promise<Customer> {
        try {
            // Find customer by both externalId AND channel
            let customer = await this.customerModel.findOne({
                externalId,
                channel: channel
            });

            // If customer doesn't exist, create a new one
            if (!customer) {
                customer = new this.customerModel({
                    externalId,
                    channel: channel
                });

                await customer.save();
            }

            return customer;
        } catch (error) {
            // Handle potential duplicate key errors
            if (error.code === 11000) {
                return this.customerModel.findOne({
                    externalId,
                    channel: channel
                });
            }
            throw error;
        }
    }

    async updateCurrentConversation(
        customerId: Types.ObjectId,
        conversationId: Types.ObjectId,
    ): Promise<Customer | null> {
        try {
            return await this.customerModel.findByIdAndUpdate(
                customerId,
                { currentConversation: conversationId },
                { new: true } // Return the updated document
            );
        } catch (error) {
            this.logger.error(
                `Failed to update current conversation for customer ${customerId}`,
                error.stack
            );
            throw new Error(`Could not update current conversation: ${error.message}`);
        }
    }
}