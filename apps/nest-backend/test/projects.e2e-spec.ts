import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/common/setup-app';
import { ApiResponse } from '../src/common/interfaces/api-response.interface';
import { AuthTokenPort } from '../src/modules/auth/domain/interfaces/authToken.port';
import { ProjectProps } from '../src/modules/project/domain/interfaces/project.interface';

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

//el cuerpo de supertest es any; esto lo devuelve al contrato que el propio
//servidor declara, en vez de inventar una forma paralela para los tests.
const sobre = <T>(res: request.Response): ApiResponse<T> =>
  res.body as ApiResponse<T>;

describe('Projects (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let tokens: AuthTokenPort;
  let token: string;
  let tokenDeOtro: string;

  const http = () => request(app.getHttpServer());

  const crear = (cuerpo: Record<string, unknown>) =>
    http()
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: 'mi-proyecto',
        title: 'Mi proyecto',
        ...cuerpo,
      });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    tokens = app.get(AuthTokenPort);

    //freno de mano: este fichero vacia tablas en cada test. Si la configuracion
    //apuntara a la base de desarrollo, se perderian los datos de verdad.
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
    token = sobre<{ token: string }>(login).data!.token;

    //el segundo usuario se crea por debajo: register solo deja registrarse al
    //primero, porque el portafolio es de una sola persona.
    const filas = await dataSource.query<{ id: number }[]>(
      `INSERT INTO users (username, email) VALUES ('otro', 'otro@correo.com') RETURNING id`,
    );
    tokenDeOtro = await tokens.issue({ userId: filas[0].id });
  });

  describe('sin sesion', () => {
    it('GET /projects responde 401', async () => {
      const res = await http().get('/projects').expect(401);

      expect(sobre(res).message).toBe('Authentication required');
    });

    it('POST /projects responde 401', async () => {
      await http()
        .post('/projects')
        .send({ slug: 'x', title: 'X' })
        .expect(401);
    });
  });

  describe('el ciclo de vida', () => {
    it('POST /projects lo crea y lo devuelve dentro del sobre', async () => {
      const res = await crear({ description: '  Con espacios  ' }).expect(201);
      const cuerpo = sobre<ProjectProps>(res);

      expect(cuerpo.code).toBe(201);
      expect(cuerpo.errors).toBeNull();
      expect(cuerpo.data).toMatchObject({
        slug: 'mi-proyecto',
        title: 'Mi proyecto',
        description: 'Con espacios',
        published: false,
        assets: [],
      });
      expect(cuerpo.data!.id).toEqual(expect.any(Number));
    });

    it('GET /projects lista los del dueño', async () => {
      await crear({}).expect(201);

      const res = await http()
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(sobre<ProjectProps[]>(res).data).toHaveLength(1);
    });

    it('PATCH /projects/:slug cambia lo que le mandas y deja el resto', async () => {
      await crear({}).expect(201);

      const res = await http()
        .patch('/projects/mi-proyecto')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Otro titulo' })
        .expect(200);

      expect(sobre<ProjectProps>(res).data).toMatchObject({
        slug: 'mi-proyecto',
        title: 'Otro titulo',
      });
    });

    it('DELETE /projects/:slug lo borra de verdad', async () => {
      await crear({}).expect(201);

      const res = await http()
        .delete('/projects/mi-proyecto')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(sobre(res).message).toBe('Project deleted');

      const lista = await http()
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(sobre<ProjectProps[]>(lista).data).toHaveLength(0);
    });
  });

  describe('validacion', () => {
    it('rechaza una clave que el DTO no declara', async () => {
      const res = await crear({ admin: true }).expect(400);

      expect(sobre(res).errors).toEqual([
        { field: 'admin', message: 'property admin should not exist' },
      ]);
    });

    it('rechaza un proyecto sin titulo', async () => {
      const res = await http()
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: 'mi-proyecto' })
        .expect(400);

      expect(sobre(res).errors?.map((e) => e.field)).toContain('title');
    });

    it('rechaza un slug que el dominio no acepta', async () => {
      const res = await crear({ slug: 'Mi Proyecto' }).expect(400);

      expect(sobre(res).errors).toEqual([
        {
          field: 'slug',
          message: 'Slug must be lowercase words separated by hyphens',
        },
      ]);
    });
  });

  describe('aislamiento entre usuarios', () => {
    it('el proyecto de otro responde 404 y no 403', async () => {
      await crear({}).expect(201);

      const res = await http()
        .patch('/projects/mi-proyecto')
        .set('Authorization', `Bearer ${tokenDeOtro}`)
        .send({ title: 'Robado' })
        .expect(404);

      expect(sobre(res).code).toBe(404);
    });
  });

  describe('la cara publica', () => {
    it('GET /portfolio/projects/:slug devuelve el publicado sin token', async () => {
      await crear({ published: true }).expect(201);

      const res = await http()
        .get('/portfolio/projects/mi-proyecto')
        .expect(200);

      expect(sobre<ProjectProps>(res).data).toMatchObject({
        slug: 'mi-proyecto',
        published: true,
      });
    });

    it('un borrador responde 404 aunque exista', async () => {
      await crear({ published: false }).expect(201);

      await http().get('/portfolio/projects/mi-proyecto').expect(404);
    });
  });

  describe('persistencia', () => {
    it('guarda los recursos y los devuelve renumerados', async () => {
      const recurso = (url: string) => ({
        kind: 'image',
        url,
        label: '  Foto  ',
        position: 99,
      });

      await crear({
        assets: [
          recurso('https://ejemplo.com/a.png'),
          recurso('https://ejemplo.com/b.png'),
        ],
      }).expect(201);

      const res = await http()
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const [proyecto] = sobre<ProjectProps[]>(res).data!;
      expect(proyecto.assets.map((a) => a.position)).toEqual([0, 1]);
      expect(proyecto.assets.map((a) => a.label)).toEqual(['Foto', 'Foto']);
    });
  });
});
