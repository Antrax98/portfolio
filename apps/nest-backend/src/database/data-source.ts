import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // Anclados en __dirname y no en el cwd: desde src/database/ resuelven a
  // src/, y desde dist/database/ resuelven a dist/. El mismo archivo sirve
  // para el CLI en desarrollo (ts-node) y para el contenedor, que solo tiene
  // el JS compilado. Con rutas relativas al cwd, en producción no matchean
  // nada y TypeORM reporta "No migrations are pending" sin aplicar ninguna.
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
});
