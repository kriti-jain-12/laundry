import { Controller, Get, HttpStatus, Query, UsePipes } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JoiValidationPipe } from 'src/utils/joi.validation.pipe';
import { Response } from '../../utils/response';
import {
  GetCountriesDTO,
  GetCountriesSchema,
  GetTaxDTO,
  GetTaxSchema,
} from './dto/util.dto';

@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('get-countries')
  @UsePipes(new JoiValidationPipe(GetCountriesSchema))
  async getCountries(
    @Query() getCountriesDTO: GetCountriesDTO,
  ): Promise<Response> {
    try {
      const result = await this.utilsService.getCountries(getCountriesDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('get-tax')
  @UsePipes(new JoiValidationPipe(GetTaxSchema))
  async getTax(@Query() getTaxDTO: GetTaxDTO): Promise<Response> {
    try {
      const result = await this.utilsService.getTax(getTaxDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }
}
