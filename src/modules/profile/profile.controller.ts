import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/utils/joi.validation.pipe';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UpdateUserLocationSchema,
  UpdateUserLocationDTO,
  UpdateProfileSchema,
  UpdateProfileDTO,
  ChangePasswordSchema,
  ChangePasswordDTO,
  SubmitBackgroundVerificationSchema,
  SubmitBackgroundVerificationDTO,
  SetLaundromatLocationSchema,
  SetLaundromatLocationDTO,
  SubmitReviewSchema,
  SubmitReviewDTO,
  GetWalletHistorySchema,
  GetWalletHistoryDTO,
} from './dto/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch('/update-profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  async updateProfilePicture(
    @Req() request: Request,
    @UploadedFile() profile: any,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.updateProfilePicture(
        profile,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Patch('/update-user-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateUserLocationSchema))
  async updateUserLocation(
    @Req() request: Request,
    @Body() updateUserLocationDTO: UpdateUserLocationDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.updateUserLocation(
        updateUserLocationDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Put('/update-profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateProfileSchema))
  async updateProfile(
    @Req() request: Request,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.updateProfile(
        updateProfileDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.profileService.getProfile(user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(ChangePasswordSchema))
  async changePassword(
    @Req() request: Request,
    @Body() changePasswordDTO: ChangePasswordDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.changePassword(
        changePasswordDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Delete('/delete-account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.profileService.deleteAccount(user.id);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Patch('/submit-background-verification')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(SubmitBackgroundVerificationSchema))
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  async submitBackgroundVerification(
    @Req() request: Request,
    @Body() submitBackgroundVerificationDTO: SubmitBackgroundVerificationDTO,
    @UploadedFile() document: any,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.submitBackgroundVerification(
        document,
        user.id,
        submitBackgroundVerificationDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Patch('/set-laundromat-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(SetLaundromatLocationSchema))
  async setLaundromatLocation(
    @Req() request: Request,
    @Body() setLaundromatLocationDTO: SetLaundromatLocationDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.setLaundromatLocation(
        setLaundromatLocationDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Patch('/update-driver-live-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateUserLocationSchema))
  async updateDriverLiveLocation(
    @Req() request: Request,
    @Body() updateUserLocationDTO: UpdateUserLocationDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.updateDriverLiveLocation(
        updateUserLocationDTO,
        user.id,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('/get-wallet-history')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(GetWalletHistorySchema))
  async getWalletHistory(
    @Req() request: Request,
    @Query() getWalletHistoryDTO: GetWalletHistoryDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.getWalletHistory(
        user.id,
        getWalletHistoryDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/submit-review')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(SubmitReviewSchema))
  async submitReview(
    @Req() request: Request,
    @Body() submitReviewDTO: SubmitReviewDTO,
  ) {
    try {
      const user = request['user'];
      const result = await this.profileService.submitReview(
        user.id,
        submitReviewDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }
}
