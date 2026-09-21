import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';
import { UserNewProps, UserProps } from '../interfaces/user.interface';
import { User } from './user.model';

const FECHA = new Date('2026-01-01T00:00:00Z');

const props = (cambios: Partial<UserProps> = {}): UserProps => ({
  id: 7,
  username: 'test',
  email: 'test@correo.com',
  createdAt: FECHA,
  updatedAt: FECHA,
  ...cambios,
});

//createNew no recibe id ni fechas: los pone el propio modelo.
const nuevos = (cambios: Partial<UserNewProps> = {}): UserNewProps => ({
  username: 'test',
  email: 'test@correo.com',
  ...cambios,
});

describe('User.create', () => {
  describe('normaliza', () => {
    it('el correo a minusculas y sin espacios alrededor', () => {
      const user = User.create(props({ email: '  Test@Correo.COM  ' }));

      expect(user.toProps().email).toBe('test@correo.com');
    });

    it('el nombre de usuario igual que el correo', () => {
      const user = User.create(props({ username: '  Test  ' }));

      expect(user.toProps().username).toBe('test');
    });
  });

  describe('rechaza', () => {
    it('un nombre de usuario con espacios', () => {
      expect(() => User.create(props({ username: 'Jym Raynor' }))).toThrow(
        DataValidationException,
      );
    });

    it('un nombre de usuario que empieza por guion', () => {
      expect(() => User.create(props({ username: '-raynor' }))).toThrow(
        DataValidationException,
      );
    });

    it('un nombre de usuario vacio', () => {
      expect(() => User.create(props({ username: '   ' }))).toThrow(
        DataValidationException,
      );
    });

    it('un correo sin arroba', () => {
      expect(() => User.create(props({ email: 'no-es-un-correo' }))).toThrow(
        DataValidationException,
      );
    });
  });

  it('acumula los errores de los dos campos en una sola excepcion', () => {
    try {
      User.create(props({ username: 'con espacios', email: 'sin-arroba' }));
      fail('deberia haber lanzado');
    } catch (error) {
      expect(error).toBeInstanceOf(DataValidationException);
      expect((error as DataValidationException).errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'username' }),
          expect.objectContaining({ field: 'email' }),
        ]),
      );
      expect((error as DataValidationException).errors).toHaveLength(2);
    }
  });

  it('conserva el id y las fechas que recibe', () => {
    const user = User.create(props());

    expect(user.toProps()).toMatchObject({
      id: 7,
      createdAt: FECHA,
      updatedAt: FECHA,
    });
  });
});

describe('User.createNew', () => {
  //createNew llama a new Date(): sin congelar el reloj, la fecha que produce
  //nunca seria comparable con una constante.
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(FECHA);
  });

  //obligatorio: los timers falsos son globales y se quedarian puestos para los
  //tests que vengan despues, en este fichero y en los siguientes.
  afterEach(() => {
    jest.useRealTimers();
  });

  it('deja el id en 0 porque lo asigna la base de datos', () => {
    expect(User.createNew(nuevos()).toProps().id).toBe(0);
  });

  it('pone la hora actual en createdAt y en updatedAt', () => {
    expect(User.createNew(nuevos()).toProps()).toMatchObject({
      createdAt: FECHA,
      updatedAt: FECHA,
    });
  });

  it('normaliza igual que create', () => {
    const user = User.createNew(
      nuevos({ username: '  Test  ', email: '  Test@Correo.COM  ' }),
    );

    expect(user.toProps()).toMatchObject({
      username: 'test',
      email: 'test@correo.com',
    });
  });

  it('rechaza los mismos datos que create', () => {
    expect(() => User.createNew(nuevos({ username: 'Jym Raynor' }))).toThrow(
      DataValidationException,
    );
  });
});

describe('User.toPersistence', () => {
  it('devuelve solo el nombre de usuario y el correo', () => {
    expect(User.create(props()).toPersistence()).toStrictEqual({
      username: 'test',
      email: 'test@correo.com',
    });
  });

  it('devuelve los valores normalizados, no los que recibio', () => {
    const user = User.create(
      props({ username: '  Test  ', email: '  Test@Correo.COM  ' }),
    );

    expect(user.toPersistence()).toStrictEqual({
      username: 'test',
      email: 'test@correo.com',
    });
  });
});

describe('User.toProps', () => {
  it('devuelve los cinco campos', () => {
    expect(User.create(props()).toProps()).toStrictEqual(props());
  });

  it('devuelve un objeto nuevo, no el que recibio', () => {
    const originales = props();

    expect(User.create(originales).toProps()).not.toBe(originales);
  });
});
