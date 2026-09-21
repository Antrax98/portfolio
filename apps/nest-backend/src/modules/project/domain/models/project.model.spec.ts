import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';
import { ForbiddenException } from '../../../../common/exceptions/forbidden.exception';
import { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import {
  ProjectAssetProps,
  ProjectProps,
} from '../interfaces/project.interface';
import { Project } from './project.model';

const FECHA = new Date('2026-01-01T00:00:00Z');

const USER_ID = 1;

const base: ProjectProps = {
  id: 1,
  userId: USER_ID,
  slug: 'test',
  title: 'test',
  description: 'test',
  startedAt: FECHA,
  endedAt: FECHA,
  published: true,
  position: 1,
  assets: [],
  createdAt: FECHA,
  updatedAt: FECHA,
};

const baseAuthCaller: AuthenticatedCaller = {
  userId: USER_ID,
};

//un recurso valido del que partir: si el recurso de prueba estuviera mal
//formado, el test del maximo de 20 se pondria en verde por el error del kind o
//de la url, no por el que dice estar probando.
const recurso = (
  cambios: Partial<ProjectAssetProps> = {},
): ProjectAssetProps => ({
  kind: 'image',
  url: 'https://ejemplo.com/foto.png',
  label: null,
  position: 0,
  ...cambios,
});

//devuelve los campos que fallaron, en el orden en que el dominio los acumulo.
//Si la llamada no lanza, devuelve [] y la comparacion falla diciendo que se
//esperaban errores y no hubo ninguno.
const camposConError = (llamada: () => unknown): (string | undefined)[] => {
  try {
    llamada();
  } catch (error) {
    expect(error).toBeInstanceOf(DataValidationException);
    return ((error as DataValidationException).errors ?? []).map(
      (detalle) => detalle.field,
    );
  }

  return [];
};

describe('Project.validate', () => {
  describe('normaliza', () => {
    it('recorta el slug y lo pasa a minusculas', () => {
      expect(Project.validate({ slug: ' Test ' })).toStrictEqual({
        slug: 'test',
      });
    });

    it('recorta el titulo', () => {
      expect(Project.validate({ title: ' test ' })).toStrictEqual({
        title: 'test',
      });
    });

    it('recorta la descripcion', () => {
      expect(Project.validate({ description: ' Test ' })).toStrictEqual({
        description: 'Test',
      });
    });

    it('convierte los saltos de linea de Windows en saltos normales', () => {
      expect(Project.validate({ description: 'uno\r\ndos' })).toStrictEqual({
        description: 'uno\ndos',
      });
    });

    it('guarda una descripcion vacia como null', () => {
      expect(Project.validate({ description: '   ' })).toStrictEqual({
        description: null,
      });
    });

    it('renumera los recursos por su orden en el array', () => {
      const validado = Project.validate({
        assets: [recurso({ position: 99 }), recurso({ position: 99 })],
      });

      expect(validado.assets?.map((asset) => asset.position)).toEqual([0, 1]);
    });

    it('recorta la etiqueta de un recurso y la vacia la guarda como null', () => {
      const validado = Project.validate({
        assets: [recurso({ label: '  Foto  ' }), recurso({ label: '   ' })],
      });

      expect(validado.assets?.map((asset) => asset.label)).toEqual([
        'Foto',
        null,
      ]);
    });

    it('acepta exactamente 20 recursos', () => {
      const assets = Array.from({ length: 20 }, () => recurso());

      expect(Project.validate({ assets }).assets).toHaveLength(20);
    });
  });

  describe('rechaza', () => {
    it('un slug con espacios', () => {
      expect(camposConError(() => Project.validate({ slug: 'te st' }))).toEqual(
        ['slug'],
      );
    });

    it('un slug con caracteres que no son letras ni numeros', () => {
      expect(() => Project.validate({ slug: 'mi_proyecto' })).toThrow(
        DataValidationException,
      );
    });

    //regresion: con el toLowerCase encadenado fuera de normalize, un slug en
    //blanco se confundia con un slug no enviado y salia intacto y sin recortar.
    it('un slug vacio o solo con espacios', () => {
      expect(camposConError(() => Project.validate({ slug: '' }))).toEqual([
        'slug',
      ]);
      expect(camposConError(() => Project.validate({ slug: '   ' }))).toEqual([
        'slug',
      ]);
    });

    it('un titulo vacio', () => {
      expect(() => Project.validate({ title: '' })).toThrow(
        DataValidationException,
      );
    });

    it('un slug de mas de 140 caracteres', () => {
      expect(() => Project.validate({ slug: 'z'.repeat(200) })).toThrow(
        DataValidationException,
      );
    });

    it('un titulo de mas de 140 caracteres', () => {
      expect(() => Project.validate({ title: 'z'.repeat(200) })).toThrow(
        DataValidationException,
      );
    });

    it('una descripcion de mas de 10000 caracteres', () => {
      expect(() =>
        Project.validate({ description: 'z'.repeat(10_001) }),
      ).toThrow(DataValidationException);
    });

    it('una fecha de fin anterior a la de inicio', () => {
      expect(
        camposConError(() =>
          Project.validate({
            startedAt: new Date('2026-06-01T00:00:00Z'),
            endedAt: new Date('2026-01-01T00:00:00Z'),
          }),
        ),
      ).toEqual(['endedAt']);
    });

    it('mas de 20 recursos', () => {
      const assets = Array.from({ length: 21 }, () => recurso());

      expect(camposConError(() => Project.validate({ assets }))).toEqual([
        'assets',
      ]);
    });

    it('un recurso con un tipo desconocido', () => {
      expect(
        camposConError(() =>
          Project.validate({ assets: [recurso({ kind: 'gif' })] }),
        ),
      ).toEqual(['assets[0].kind']);
    });

    it('un recurso con una url que no es http, https ni mailto', () => {
      expect(
        camposConError(() =>
          Project.validate({
            assets: [recurso({ url: 'javascript:alert(1)' })],
          }),
        ),
      ).toEqual(['assets[0].url']);
    });
  });

  describe('deja en paz lo que no le mandas', () => {
    it('un campo ausente sigue ausente en la salida', () => {
      const validado = Project.validate({ title: 'Solo el titulo' });

      expect(validado).toStrictEqual({ title: 'Solo el titulo' });
      expect(validado.slug).toBeUndefined();
    });

    it('sin assets, no toca los assets', () => {
      expect(Project.validate({ title: 'test' }).assets).toBeUndefined();
    });

    it('acepta una fecha de fin sin fecha de inicio', () => {
      expect(Project.validate({ endedAt: FECHA })).toStrictEqual({
        endedAt: FECHA,
      });
    });

    it('acepta que las dos fechas sean la misma', () => {
      expect(() =>
        Project.validate({ startedAt: FECHA, endedAt: FECHA }),
      ).not.toThrow();
    });

    it('no toca published ni position', () => {
      expect(Project.validate({ published: false, position: 3 })).toStrictEqual(
        {
          published: false,
          position: 3,
        },
      );
    });
  });

  it('acumula los errores de varios campos a la vez', () => {
    expect(
      camposConError(() =>
        Project.validate({
          slug: 'te st',
          title: '',
          assets: [recurso({ kind: 'gif', url: 'javascript:alert(1)' })],
        }),
      ),
    ).toEqual(['slug', 'title', 'assets[0].kind', 'assets[0].url']);
  });
});

describe('Project.assertOwnedBy', () => {
  it('no lanza si el proyecto es del que llama', () => {
    expect(() => Project.assertOwnedBy(base, baseAuthCaller)).not.toThrow();
  });

  it('lanza ForbiddenException si es de otro', () => {
    expect(() =>
      Project.assertOwnedBy({ ...base, userId: USER_ID + 1 }, baseAuthCaller),
    ).toThrow(ForbiddenException);
  });
});
