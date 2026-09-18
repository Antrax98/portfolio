import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiEnvelope,
  ApiEnvelopeError,
} from '../../../../common/decorators/api-envelope.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { PortfolioService } from '../../application/services/portfolio.service';
import type { PortfolioProps } from '../../domain/interfaces/portfolio.interface';
import { PortfolioDto } from '../dtos/portfolio.dto';
import { PageQueryDto } from '../../../../common/dtos/page-query.dto';

@ApiTags('portfolio')
@Public()
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiEnvelope(PortfolioDto)
  @ApiEnvelopeError(HttpStatus.NOT_FOUND, 'No portfolio has been set up yet')
  find(@Query() query: PageQueryDto): Promise<PortfolioProps> {
    return this.portfolioService.findPortfolio(query);
  }
}
