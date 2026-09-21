import { inspect } from 'node:util';
import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';
import { Password } from './password.value-object';

describe('Password', () => {
  it('acepta una de 8 caracteres o mas', () => {
    expect(Password.create('contrasena').value).toBe('contrasena');
  });

  it('rechaza las de menos de 8 caracteres', () => {
    expect(() => Password.create('corta')).toThrow(DataValidationException);
  });

  it('cuenta bytes y no caracteres para el maximo', () => {
    expect(() => Password.create('a'.repeat(72))).not.toThrow();
    expect(() => Password.create('a'.repeat(73))).toThrow();
    expect(() => Password.create('á'.repeat(37))).toThrow();
  });

  it('senala el campo al que pertenece el error', () => {
    try {
      Password.create('corta');
      fail('deberia haber lanzado');
    } catch (error) {
      expect(error).toBeInstanceOf(DataValidationException);
      expect((error as DataValidationException).errors).toEqual([
        { field: 'password', message: expect.stringContaining('8 characters') },
      ]);
    }
  });

  describe('no se filtra al serializar', () => {
    const password = Password.create('secreto-de-verdad');

    it('ni interpolando', () => {
      expect(`${password}`).not.toContain('secreto');
    });

    it('ni con JSON.stringify', () => {
      expect(JSON.stringify(password)).not.toContain('secreto');
    });

    it('ni inspeccionando el objeto crudo', () => {
      expect(inspect(password)).not.toContain('secreto');
    });

    it('pero sigue accesible por su getter', () => {
      expect(password.value).toBe('secreto-de-verdad');
    });
  });
});
