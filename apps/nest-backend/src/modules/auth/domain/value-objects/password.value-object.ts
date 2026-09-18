import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';

const MIN_LENGTH = 8; // caracteres
const MAX_LENGTH = 72; //en bytes, lo pide bycrypt
//el campo del formulario al que pertenece el error. Sin esto el mensaje llega
//solo en 'message' y el cliente no puede pintarlo debajo de su input, que es
//justo donde se agradece en una contrasena.
const FIELD = 'password';

export class Password {
  private constructor(private readonly plain: string) {}

  static create(plain: string): Password {
    if (typeof plain !== 'string' || plain.length < MIN_LENGTH) {
      Password.fail(`Password must be at least ${MIN_LENGTH} characters long`);
    }

    if (Buffer.byteLength(plain, 'utf8') > MAX_LENGTH) {
      Password.fail(`Password cannot be longer than ${MAX_LENGTH} bytes`);
    }
    return new Password(plain);
  }

  //el mensaje va dos veces: suelto para quien solo lee 'message', y dentro de
  //errors[] con su campo para quien reparte los errores por input
  private static fail(message: string): never {
    throw new DataValidationException(message, [{ field: FIELD, message }]);
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
    return '[redacted]';
  }
}
