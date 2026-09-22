import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/common/setup-app';
import { ApiResponse } from '../src/common/interfaces/api-response.interface';

const TABLAS = [
  'project_assets',
  'projects',
  'profile_links',
  'profiles',
  'auth_credentials',
  'users',
];

const DUENO = {
  username: 'dueno',
  email: 'dueno@correo.com',
  password: 'contrasena-larga',
};

const recurso = (n: number) => ({
  kind: 'image',
  url: `https://ejemplo.com/${n}.png`,
  label: `Foto ${n}`,
  position: n,
});

const enlace = (n: number) => ({
  kind: 'web',
  url: `https://ejemplo.com/${n}`,
  label: `Enlace ${n}`,
  position: n,
});

/**
 * Mandar `links` o `assets` reemplaza la coleccion entera: las filas viejas
 * tienen que desaparecer, no quedarse con la clave foranea a NULL.
 *
 * Esto no es teorico. En la base de produccion aparecieron 14 enlaces y un
 * recurso sueltos, invisibles para la aplicacion porque solo se llega a ellos
 * a traves del perfil o del proyecto, y creciendo con cada edicion.
 *
 * Las entidades declaran `orphanedRowAction: 'delete'`, pero TypeORM 1.1.1 no
 * lo aplica, asi que el borrado lo hace el adaptador a mano. Si alguien quita
 * ese `manager.delete` por creerlo redundante, estos tres tests se ponen rojos.
 */
describe('Reemplazo de colecciones (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;

  const http = () => request(app.getHttpServer());
  const auth = () => `Bearer ${token}`;

  const sueltos = async (): Promise<{ assets: number; links: number }> => {
    const filas = await dataSource.query<{ assets: string; links: string }[]>(`
      select
        (select count(*) from project_assets where project_id is null) as assets,
        (select count(*) from profile_links  where profile_id is null) as links
    `);

    return {
      assets: Number(filas[0].assets),
      links: Number(filas[0].links),
    };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);

    const base = dataSource.options.database;
    if (typeof base !== 'string' || !base.endsWith('_test')) {
      throw new Error(
        `Los e2e borran datos y "${String(base)}" no acaba en _test`,
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      `TRUNCATE ${TABLAS.join(', ')} RESTART IDENTITY CASCADE`,
    );

    await http().post('/auth/register').send(DUENO).expect(201);

    const login = await http()
      .post('/auth/login')
      .send({ identifier: DUENO.username, password: DUENO.password })
      .expect(200);
    token = (login.body as ApiResponse<{ token: string }>).data!.token;
  });

  it('cambiar los recursos de un proyecto borra los anteriores', async () => {
    await http()
      .post('/projects')
      .set('Authorization', auth())
      .send({
        slug: 'mi-proyecto',
        title: 'Mi proyecto',
        assets: [1, 2, 3].map(recurso),
      })
      .expect(201);

    await http()
      .patch('/projects/mi-proyecto')
      .set('Authorization', auth())
      .send({ assets: [recurso(9)] })
      .expect(200);

    const total = await dataSource.query<{ n: string }[]>(
      'select count(*) n from project_assets',
    );

    expect(Number(total[0].n)).toBe(1);
    expect(await sueltos()).toEqual({ assets: 0, links: 0 });
  });

  it('cambiar los enlaces del perfil borra los anteriores', async () => {
    await http()
      .patch('/profile')
      .set('Authorization', auth())
      .send({ links: [1, 2, 3].map(enlace) })
      .expect(200);

    await http()
      .patch('/profile')
      .set('Authorization', auth())
      .send({ links: [enlace(9)] })
      .expect(200);

    const total = await dataSource.query<{ n: string }[]>(
      'select count(*) n from profile_links',
    );

    expect(Number(total[0].n)).toBe(1);
    expect(await sueltos()).toEqual({ assets: 0, links: 0 });
  });

  it('mandar una coleccion vacia la deja vacia de verdad', async () => {
    await http()
      .post('/projects')
      .set('Authorization', auth())
      .send({
        slug: 'mi-proyecto',
        title: 'Mi proyecto',
        assets: [1, 2].map(recurso),
      })
      .expect(201);

    await http()
      .patch('/projects/mi-proyecto')
      .set('Authorization', auth())
      .send({ assets: [] })
      .expect(200);

    const total = await dataSource.query<{ n: string }[]>(
      'select count(*) n from project_assets',
    );

    expect(Number(total[0].n)).toBe(0);
    expect(await sueltos()).toEqual({ assets: 0, links: 0 });
  });
});
