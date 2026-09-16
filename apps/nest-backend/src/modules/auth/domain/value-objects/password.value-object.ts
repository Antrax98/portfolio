import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';

const MIN_LENGTH = 8; // caracteres
const MAX_LENGTH = 72; //en bytes, lo pide bycrypt

export class Password {
  private constructor(private readonly plain: string) {}

  static create(plain: string): Password {
    if (typeof plain !== 'string' || plain.length < MIN_LENGTH) {
      throw new DataValidationException(
        `Password must be at least ${MIN_LENGTH} characters long`,
      );
    }

    if (Buffer.byteLength(plain, 'utf8') > MAX_LENGTH) {
      throw new DataValidationException(
        `Password cannot be longer than ${MAX_LENGTH} bytes`,
      );
    }
    return new Password(plain);
  }

  get value(): string {
    return this.plain;
  }

  toString(): string {
    return '[REDACTED]';
  }

  toJSON(): string {
    return '[REDACTED]';
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    // (5)
    return '[redacted]';
  }
}
