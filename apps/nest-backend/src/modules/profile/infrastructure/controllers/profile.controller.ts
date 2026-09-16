import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import { ProfileService } from '../../application/services/profile.service';
import type { ProfileProps } from '../../domain/interfaces/profile.interface';
import { ProfileDto, UpdateProfileDto } from '../dtos/profile.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiEnvelope(ProfileDto)
  findMine(@CurrentUser() caller: AuthenticatedCaller): Promise<ProfileProps> {
    return this.profileService.findMine(caller.userId);
  }

  @Patch()
  @ApiEnvelope(ProfileDto)
  updateMine(
    @CurrentUser() caller: AuthenticatedCaller,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileProps> {
    return this.profileService.updateMine(caller.userId, dto);
  }
}
