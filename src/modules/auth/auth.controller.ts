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
import { AuthService } from './auth.service';
import { JoiValidationPipe } from '../../utils/joi.validation.pipe';
import { Response } from '../../utils/response';
import {
  SignUpSchema,
  SignUpDTO,
  VerifySchema,
  VerifyDTO,
  SendCodeSchema,
  SendCodeDTO,
  LoginSchema,
  LoginDTO,
  RequestForgotPasswordSchema,
  RequestForgotPasswordDTO,
  VerifyForgotPasswordSchema,
  VerifyForgotPasswordDTO,
  ResetPasswordSchema,
  ResetPasswordDTO,
  SSOAuthSchema,
  SSOAuthDTO,
  VerifyReferredCodeDTO,
  VerifyReferredCodeSchema,
  ServiceProviderSignupSchema,
  ServiceProviderSignupDTO,
} from './dto/auth.dto';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { Request } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { File } from 'multer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @UsePipes(new JoiValidationPipe(SignUpSchema))
  async signUp(@Body() signUpDTO: SignUpDTO) {
    try {
      const result = await this.authService.signUp(signUpDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('sso-auth')
  @UsePipes(new JoiValidationPipe(SSOAuthSchema))
  async ssoAuth(@Body() ssoAuthDTO: SSOAuthDTO) {
    try {
      const result = await this.authService.ssoAuth(ssoAuthDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('verify-code')
  @UsePipes(new JoiValidationPipe(VerifySchema))
  async verifyCode(@Body() verifyDTO: VerifyDTO) {
    try {
      const result = await this.authService.verifyCode(verifyDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('send-code')
  @UsePipes(new JoiValidationPipe(SendCodeSchema))
  async sendCode(@Body() sendCodeDTO: SendCodeDTO) {
    try {
      const result = await this.authService.sendCode(sendCodeDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginSchema))
  async login(@Body() loginDTO: LoginDTO) {
    try {
      const result = await this.authService.login(loginDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request) {
    try {
      const user = request['user'];
      const result = await this.authService.logout(user.id, user.token);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('request-forgot-password')
  @UsePipes(new JoiValidationPipe(RequestForgotPasswordSchema))
  async requestForgotPassword(
    @Body() requestForgotPasswordDTO: RequestForgotPasswordDTO,
  ) {
    try {
      const result = await this.authService.requestForgotPassword(
        requestForgotPasswordDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('verify-forgot-password')
  @UsePipes(new JoiValidationPipe(VerifyForgotPasswordSchema))
  async verifyForgotPassword(
    @Body() verifyForgotPasswordDTO: VerifyForgotPasswordDTO,
  ) {
    try {
      const result = await this.authService.verifyForgotPassword(
        verifyForgotPasswordDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('reset-password')
  @UsePipes(new JoiValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    try {
      const result = await this.authService.resetPassword(resetPasswordDTO);
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Get('verify-referred-code')
  @UsePipes(new JoiValidationPipe(VerifyReferredCodeSchema))
  async verifyReferredCode(
    @Query() verifyReferredCodeDTO: VerifyReferredCodeDTO,
  ) {
    try {
      const result = await this.authService.verifyReferredCode(
        verifyReferredCodeDTO,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }

  @Post('service-provider-sign-up')
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  @UsePipes(new JoiValidationPipe(ServiceProviderSignupSchema))
  async serviceProviderSignUp(
    @Body() serviceProviderSignupDTO: ServiceProviderSignupDTO,
    @UploadedFiles() files: Array<File>,
  ) {
    try {
      const proof_of_work_media = files.find(
        (file) => file.fieldname === 'proof_of_work_media',
      );
      const abstract = files.find((file) => file.fieldname === 'abstract');

      const result = await this.authService.serviceProviderSignUp(
        serviceProviderSignupDTO,
        proof_of_work_media,
        abstract,
      );
      return { ...result, status: HttpStatus.OK };
    } catch (e) {
      return { status: HttpStatus.BAD_REQUEST, message: e.message };
    }
  }
}
