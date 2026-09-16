import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { ApiEnvelope } from '../../../../common/decorators/api-envelope.decorator';
import { CredentialSummaryDto, LoginDto, RegisterDto } from '../dtos/auth.dto';
import { IssuedToken } from '../../domain/interfaces/auth.interface';
import { TokenDto } from '../dtos/auth.dto';
import { Public } from '../decorators/public.decorator';
import { CredentialSummary } from '../../domain/interfaces/credential.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(TokenDto, { status: HttpStatus.OK })
  login(@Body() dto: LoginDto): Promise<IssuedToken> {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  @ApiEnvelope(CredentialSummaryDto, { status: HttpStatus.CREATED })
  register(@Body() dto: RegisterDto): Promise<CredentialSummary> {
    return this.authService.register(dto);
  }
}
