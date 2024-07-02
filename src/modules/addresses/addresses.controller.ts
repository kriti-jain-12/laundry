import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/utils/joi.validation.pipe';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { Request } from 'express';
import { AddressesService } from './addresses.service';
import {
  AddAddressSchema,
  AddAddressDTO,
  GetAddressSchema,
  GetAddressDTO,
  UpdateAddressSchema,
  UpdateAddressDTO,
  DeleteAddressSchema,
  DeleteAddressDTO,
} from './dto/addresses.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(AddAddressSchema))
  async addAddress(
    @Req() request: Request,
    @Body() addAddressDTO: AddAddressDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.addressesService.addAddress(
        addAddressDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetAddressSchema))
  async getAddress(
    @Req() request: Request,
    @Body() getAddressDTO: GetAddressDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.addressesService.getAddress(
        getAddressDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateAddressSchema))
  async updateAddress(
    @Req() request: Request,
    @Body() updateAddressDTO: UpdateAddressDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.addressesService.updateAddress(
        updateAddressDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteAddressSchema))
  async deleteAddress(
    @Req() request: Request,
    @Body() deleteAddressDTO: DeleteAddressDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.addressesService.deleteAddress(
        deleteAddressDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }
}
