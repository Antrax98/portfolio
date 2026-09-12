import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { ApiEnvelope } from '../../../../common/decorators/api-envelope.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(undefined, { status: HttpStatus.OK })
  login() {
    return this.authService.login();
  }

  @Post('register')
  @ApiEnvelope(undefined, { status: HttpStatus.CREATED })
  register() {
    return this.authService.register();
  }
}
