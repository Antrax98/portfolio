import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Portada de la tarjeta del carrusel, guardada en el proyecto y no como un
 * recurso de la galeria: una URL directa que el cliente usa para la miniatura.
 *
 * Comparte patron con `profiles.avatar_url`: columna `text` nullable sin
 * longitud fija, porque la URL la valida el dominio (http/https) y no el
 * esquema.
 */
export class ProjectCoverUrl1790899643449 implements MigrationInterface {
  name = 'ProjectCoverUrl1790899643449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" ADD "cover_url" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "cover_url"`);
  }
}