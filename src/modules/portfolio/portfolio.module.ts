import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { PortfolioService } from './application/services/portfolio.service';
import { PortfolioController } from './infrastructure/controllers/portfolio.controller';

@Module({
  imports: [AuthModule, UserModule, ProfileModule, ProjectModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
