import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/utils/joi.validation.pipe';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { Request } from 'express';
import { ServicesService } from './services.service';
import {
  GetAvailableServicesSchema,
  GetAvailableServicesDTO,
  CreateServiceRequestSchema,
  CreateServiceRequestDTO,
  UpdateServiceRequestSchema,
  UpdateServiceRequestDTO,
  ConfirmServiceRequestSchema,
  ConfirmServiceRequestDTO,
  AcceptServiceRequestDTO,
  AcceptServiceRequestSchema,
  RejectServiceRequestDTO,
  RejectServiceRequestSchema,
  GetServiceRequestDetailsSchema,
  GetServiceRequestDetailsDTO,
  AssignRequestToLaundromatSchema,
  AssignRequestToLaundromatDTO,
  CreateChangeRequestDTO,
  CreateChangeRequestSchema,
  UpdateChangeRequestDTO,
  UpdateChangeRequestSchema,
  RepeatOrderDTO,
  RepeatOrderSchema,
  GetOrderHistoryDTO,
  GetOrderHistorySchema,
  SendTipSchema,
  SendTipDTO,
  GetNewServiceRequestSchema,
  GetNewServiceRequestDTO,
} from './dto/services.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Get('/get-available-services')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetAvailableServicesSchema))
  async getAvailableServices(
    @Req() request: Request,
    @Query() getAvailableServicesDTO: GetAvailableServicesDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getAvailableServices(
        getAvailableServicesDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/create-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateServiceRequestSchema))
  async createServiceRequest(
    @Req() request: Request,
    @Body() createServiceRequestDTO: CreateServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.createServiceRequest(
        createServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-service-pricing')
  @UseGuards(JwtAuthGuard)
  async getServicePricing(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getServicePricing(user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-payment-intent')
  @UseGuards(JwtAuthGuard)
  async getPaymentIntent(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getPaymentIntent(user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/update-service-request')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  //@UsePipes(new JoiValidationPipe(UpdateServiceRequestSchema))
  async updateServiceRequest(
    @Req() request: Request,
    @Body() updateServiceRequestDTO: UpdateServiceRequestDTO,
    @UploadedFiles() images?: Array<any>,
  ) {
    try {
      console.log(updateServiceRequestDTO)
      const imageFiles = images || [];
      const user = request['user'];
      const result = await this.servicesService.updateServiceRequest(
        updateServiceRequestDTO,
        user.id,
        imageFiles,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/confirm-service-request')
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new JoiValidationPipe(ConfirmServiceRequestSchema))
  @UseInterceptors(FilesInterceptor('images'))
  async confirmServiceRequest(
    @Req() request: Request,
    @Body() confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    @UploadedFiles() images?: Array<any>,
  ) {
    try {
      const user = request['user'];
      const imageFiles = images || [];
      const result = await this.servicesService.confirmServiceRequest(
        confirmServiceRequestDTO,
        user.id,
        imageFiles
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/accept-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(AcceptServiceRequestSchema))
  async acceptServiceRequest(
    @Req() request: Request,
    @Body() acceptServiceRequestDTO: AcceptServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.acceptServiceRequest(
        acceptServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/reject-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(RejectServiceRequestSchema))
  async rejectServiceRequest(
    @Req() request: Request,
    @Body() rejectServiceRequestDTO: RejectServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.rejectServiceRequest(
        rejectServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-new-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetNewServiceRequestSchema))
  async getNewServiceRequest(@Req() request: Request, @Query() getNewServiceRequestDTO: GetNewServiceRequestDTO,) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getNewServiceRequest(user.id, getNewServiceRequestDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-ongoing-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetNewServiceRequestSchema))
  async getOngoingServiceRequest(@Req() request: Request, @Query() getNewServiceRequestDTO: GetNewServiceRequestDTO) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getOngoingServiceRequest(
        user.id,
        getNewServiceRequestDTO
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-service-requests')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetNewServiceRequestSchema))
  async getServiceRequests(@Req() request: Request, @Query() getNewServiceRequestDTO: GetNewServiceRequestDTO) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getServiceRequests(user.id, getNewServiceRequestDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-service-request-details')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetServiceRequestDetailsSchema))
  async getServiceRequestDetails(
    @Req() request: Request,
    @Query() getServiceRequestDetailsDTO: GetServiceRequestDetailsDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getServiceRequestDetails(
        user.id,
        getServiceRequestDetailsDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/accept-laundromat-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(AcceptServiceRequestSchema))
  async acceptLaundromatServiceRequest(
    @Req() request: Request,
    @Body() acceptServiceRequestDTO: AcceptServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.acceptLaundromatServiceRequest(
        acceptServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/reject-laundromat-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(RejectServiceRequestSchema))
  async rejectLaundromatServiceRequest(
    @Req() request: Request,
    @Body() rejectServiceRequestDTO: RejectServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.rejectLaundromatServiceRequest(
        rejectServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-new-service-request-laundromat')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetNewServiceRequestSchema))
  async getNewServiceRequestLaundromat(@Req() request: Request, @Query() getNewServiceRequestDTO: GetNewServiceRequestDTO) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getNewServiceRequestLaundromat(
        user.id,
        getNewServiceRequestDTO
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-ongoing-service-request-laundromat')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetNewServiceRequestSchema))
  async getOngoingServiceRequestLaundromat(@Req() request: Request, @Query() getNewServiceRequestDTO: GetNewServiceRequestDTO) {
    try {
      const user = request['user'];
      const result =
        await this.servicesService.getOngoingServiceRequestLaundromat(user.id, getNewServiceRequestDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-near-by-laundromat')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetServiceRequestDetailsSchema))
  async getNearByLaundromat(
    @Req() request: Request,
    @Query() getServiceRequestDetailsDTO: GetServiceRequestDetailsDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getNearByLaundromat(
        user.id,
        getServiceRequestDetailsDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/assign-request-to-laundromat')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(AssignRequestToLaundromatSchema))
  async assignRequestToLaundromat(
    @Req() request: Request,
    @Body() assignRequestToLaundromatDTO: AssignRequestToLaundromatDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.assignRequestToLaundromat(
        assignRequestToLaundromatDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/confirm-laundromat-service-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(ConfirmServiceRequestSchema))
  async confirmLaundromatServiceRequest(
    @Req() request: Request,
    @Body() confirmServiceRequestDTO: ConfirmServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.confirmLaundromatServiceRequest(
        confirmServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/ready-for-pickup')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(ConfirmServiceRequestSchema))
  async readyForPickup(
    @Req() request: Request,
    @Body() confirmServiceRequestDTO: ConfirmServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.readyForPickup(
        confirmServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/create-change-request')
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new JoiValidationPipe(CreateChangeRequestSchema))
  @UseInterceptors(FilesInterceptor('images'))
  async createChangeRequest(
    @Req() request: Request,
    @Body() createChangeRequestDTO: CreateChangeRequestDTO,
    @UploadedFiles() images: Array<any>,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.createChangeRequest(
        createChangeRequestDTO,
        user.id,
        images,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/update-change-request')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateChangeRequestSchema))
  async updateChangeRequest(
    @Req() request: Request,
    @Body() updateChangeRequestDTO: UpdateChangeRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.updateChangeRequest(
        updateChangeRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-last-order')
  @UseGuards(JwtAuthGuard)
  async getLastOrder(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getLastOrder(user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/repeat-order')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(RepeatOrderSchema))
  async repeatOrder(
    @Req() request: Request,
    @Body() repeatOrderDTO: RepeatOrderDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.repeatOrder(
        user.id,
        repeatOrderDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/confirm-delivery')
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new JoiValidationPipe(ConfirmServiceRequestSchema))
  @UseInterceptors(FilesInterceptor('images'))
  async confirmDelivery(
    @Req() request: Request,
    @Body() confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    @UploadedFiles() images?: Array<any>,
  ) {
    try {
      const imageFiles = images || [];
      const user = request['user'];
      const result = await this.servicesService.confirmDelivery(
        confirmServiceRequestDTO,
        user.id,
        imageFiles,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/confirm-pick-up')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  //@UsePipes(new JoiValidationPipe(ConfirmServiceRequestSchema))
  async confirmPickUp(
    @Req() request: Request,
    @Body() confirmServiceRequestDTO: ConfirmServiceRequestDTO,
    @UploadedFiles() images?: Array<any>,
  ) {
    try {
      const imageFiles = images || [];
      const user = request['user'];
      const result = await this.servicesService.confirmPickUp(
        confirmServiceRequestDTO,
        user.id,
        imageFiles,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-order-history')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetOrderHistorySchema))
  async getOrderHistory(
    @Req() request: Request,
    @Query() getOrderHistoryDTO: GetOrderHistoryDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.getOrderHistory(
        getOrderHistoryDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/send-tip')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(SendTipSchema))
  async sendTip(@Req() request: Request, @Body() sendTipDTO: SendTipDTO) {
    try {
      const user = request['user'];
      const result = await this.servicesService.sendTip(sendTipDTO, user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/reject-service-request-by-user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(RejectServiceRequestSchema))
  async rejectServiceRequestByUser(
    @Req() request: Request,
    @Body() rejectServiceRequestDTO: RejectServiceRequestDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.servicesService.rejectServiceRequestByUser(
        rejectServiceRequestDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }
}
