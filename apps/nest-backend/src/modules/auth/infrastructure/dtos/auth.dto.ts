import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IssuedToken } from '../../domain/interfaces/auth.interface';
import { CredentialSummary } from '../../domain/interfaces/credential.interface';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginDto {
  /** Correo o nombre de usuario. */
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenDto implements IssuedToken {
  token: string;
}

export class CredentialSummaryDto implements CredentialSummary {
  userId: number;
  createdAt: Date;
}
