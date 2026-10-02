import { Test } from '@nestjs/testing';
import { DataValidationException } from '../../../../common/exceptions/data-validation.exception';
import { ForbiddenException } from '../../../../common/exceptions/forbidden.exception';
import { ResourceNotFoundException } from '../../../../common/exceptions/resource-not-found.exception';
import { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import {
  ProjectNewProps,
  ProjectProps,
  ProjectUpdateProps,
} from '../../domain/interfaces/project.interface';
import { ProjectQueryPort } from '../../domain/interfaces/projectQuery.port';
import { ProjectRepositoryPort } from '../../domain/interfaces/projectRepository.port';
import { ProjectService } from './project.service';

/**
 * Los dobles se tipan contra el puerto, no a pelo: si mañana el puerto cambia
 * de firma, este fichero deja de compilar en vez de dar tests verdes que niegan
 * el contrato real.
 */
const query: jest.Mocked<ProjectQueryPort> = {
  //findById y findPublishedByUserId no los usa ProjectService, pero el fake
  //cumple el puerto entero: si solo implementara lo que usa, un cambio en el
  //contrato pasaria desapercibido hasta el proximo servicio.
  findPublishedByUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  findBySlug: jest.fn(),
  findById: jest.fn(),
};

const repo: jest.Mocked<ProjectRepositoryPort> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const USER_ID = 7;

const FECHA = new Date('2026-01-01T00:00:00Z');

const caller: AuthenticatedCaller = { userId: USER_ID };

const proyecto = (cambios: Partial<ProjectProps> = {}): ProjectProps => ({
  id: 1,
  userId: USER_ID,
  slug: 'mi-proyecto',
  title: 'Mi proyecto',
  description: null,
  coverUrl: null,
  startedAt: null,
  endedAt: null,
  published: false,
  position: 0,
  assets: [],
  createdAt: FECHA,
  updatedAt: FECHA,
  ...cambios,
});

//create no recibe id ni fechas: los pone el almacen. El resto es igual que
//ProjectProps, asi que este helper comparte el espiritu de `nuevo()` del
//dominio: un proyecto valido del que partir.
const nuevo = (cambios: Partial<ProjectNewProps> = {}): ProjectNewProps => ({
  slug: 'mi-proyecto',
  title: 'Mi proyecto',
  ...cambios,
});

const cambios = (
  parciales: Partial<ProjectUpdateProps> = {},
): ProjectUpdateProps => ({ ...parciales });

async function crearServicio(): Promise<ProjectService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ProjectService,
      { provide: ProjectQueryPort, useValue: query },
      { provide: ProjectRepositoryPort, useValue: repo },
    ],
  }).compile();

  return moduleRef.get(ProjectService);
}

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    //resetAllMocks (no clearAllMocks): tambien borra implementaciones, asi un
    //mockResolvedValueOnce que no se consuma no se filtra al proximo test.
    jest.resetAllMocks();

    query.findBySlug.mockResolvedValue(proyecto());
    query.findAllByUserId.mockResolvedValue([proyecto()]);
    repo.create.mockResolvedValue(proyecto());
    repo.update.mockResolvedValue(proyecto());
    repo.delete.mockResolvedValue(undefined);

    service = await crearServicio();
  });

  describe('listMine', () => {
    it('pide al puerto los proyectos de ese usuario y devuelve los suyos', async () => {
      const suyos = [proyecto({ id: 5 })];
      query.findAllByUserId.mockResolvedValue(suyos);

      const resultado = await service.listMine(caller);

      expect(query.findAllByUserId).toHaveBeenCalledWith(USER_ID);
      expect(resultado).toBe(suyos);
    });
  });

  describe('create', () => {
    it('valida antes de escribir: con un slug invalido no toca el puerto', async () => {
      await expect(
        service.create(caller, nuevo({ slug: 'con espacios' })),
      ).rejects.toThrow(DataValidationException);

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('escribe con el id del caller y el proyecto ya normalizado', async () => {
      const devuelto = proyecto();
      repo.create.mockResolvedValue(devuelto);

      const resultado = await service.create(
        caller,
        nuevo({ slug: '  Mi-Proyecto  ', title: '  Mi proyecto  ' }),
      );

      expect(repo.create).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({ slug: 'mi-proyecto', title: 'Mi proyecto' }),
      );
      //El servicio no compone ni recompone la respuesta: reenvia tal cual lo
      //que le devolvio el puerto.
      expect(resultado).toBe(devuelto);
    });
  });

  describe('update', () => {
    it('busca por slug y por dueno, no solo por slug', async () => {
      await service.update(caller, 'mi-proyecto', cambios({ title: 'X' }));

      expect(query.findBySlug).toHaveBeenCalledWith(USER_ID, 'mi-proyecto');
    });

    it('si el proyecto no existe, 404 y no escribe nada', async () => {
      query.findBySlug.mockResolvedValue(null);

      await expect(
        service.update(caller, 'no-existe', cambios({ title: 'X' })),
      ).rejects.toThrow(ResourceNotFoundException);

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('escribe por id, no por slug', async () => {
      query.findBySlug.mockResolvedValue(proyecto({ id: 42 }));

      await service.update(caller, 'mi-proyecto', cambios({ title: 'Otro' }));

      expect(repo.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ title: 'Otro' }),
      );
    });

    it('valida los cambios antes de escribir', async () => {
      await expect(
        service.update(
          caller,
          'mi-proyecto',
          cambios({ slug: 'con espacios' }),
        ),
      ).rejects.toThrow(DataValidationException);

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('busca antes de validar: un slug inexistente da 404 aunque los cambios sean invalidos', async () => {
      query.findBySlug.mockResolvedValue(null);

      await expect(
        service.update(caller, 'no-existe', cambios({ slug: 'con espacios' })),
      ).rejects.toThrow(ResourceNotFoundException);

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('si el puerto devolviera un proyecto de otro, se niega con 403', async () => {
      //El adaptador real ya filtra por dueno en findBySlug, asi que por HTTP el
      //proyecto ajeno nunca llega a existir (404, como fija el e2e). Este test
      //pinza la ultima linea del servicio: que no confia ciegamente en que el
      //puerto le haya dado algo que le corresponde.
      query.findBySlug.mockResolvedValue(proyecto({ userId: USER_ID + 1 }));

      await expect(
        service.update(caller, 'mi-proyecto', cambios({ title: 'Robado' })),
      ).rejects.toThrow(ForbiddenException);

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('borra por id y no actualiza nada', async () => {
      query.findBySlug.mockResolvedValue(proyecto({ id: 42 }));

      await service.delete(caller, 'mi-proyecto');

      expect(repo.delete).toHaveBeenCalledWith(42);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('si el proyecto no existe, 404 y no borra nada', async () => {
      query.findBySlug.mockResolvedValue(null);

      await expect(service.delete(caller, 'no-existe')).rejects.toThrow(
        ResourceNotFoundException,
      );

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
