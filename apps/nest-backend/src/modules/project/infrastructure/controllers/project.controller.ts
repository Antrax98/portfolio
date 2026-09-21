import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiEnvelope,
  ApiEnvelopeError,
} from '../../../../common/decorators/api-envelope.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import { ProjectService } from '../../application/services/project.service';
import type {
  ProjectNewProps,
  ProjectProps,
  ProjectUpdateProps,
} from '../../domain/interfaces/project.interface';
import {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
} from '../dtos/project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiEnvelope(ProjectDto, { isArray: true })
  listMine(
    @CurrentUser() caller: AuthenticatedCaller,
  ): Promise<ProjectProps[]> {
    return this.projectService.listMine(caller);
  }

  @Post()
  @ApiEnvelope(ProjectDto, { status: HttpStatus.CREATED })
  create(
    @CurrentUser() caller: AuthenticatedCaller,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectProps> {
    return this.projectService.create(
      caller,
      dto as unknown as ProjectNewProps,
    );
  }

  @Patch(':slug')
  @ApiEnvelope(ProjectDto)
  @ApiEnvelopeError(HttpStatus.NOT_FOUND, 'Project not found')
  @ApiEnvelopeError(HttpStatus.FORBIDDEN, 'You cannot modify this project')
  update(
    @CurrentUser() caller: AuthenticatedCaller,
    @Param('slug') slug: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectProps> {
    return this.projectService.update(
      caller,
      slug,
      dto as unknown as ProjectUpdateProps,
    );
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  //ApiEnvelope solo escribe el mensaje en el OpenAPI; el que sale de verdad lo
  //pone el interceptor, y sin esta linea documentaba una cosa y devolvia otra.
  @ResponseMessage('Project deleted')
  @ApiEnvelope(undefined, { message: 'Project deleted' })
  @ApiEnvelopeError(HttpStatus.NOT_FOUND, 'Project not found')
  async remove(
    @CurrentUser() caller: AuthenticatedCaller,
    @Param('slug') slug: string,
  ): Promise<void> {
    await this.projectService.delete(caller, slug);
  }
}
