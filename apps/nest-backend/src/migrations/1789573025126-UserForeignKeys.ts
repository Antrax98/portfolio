import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Las tres columnas user_id que apuntan a users no tenian clave foranea.
 *
 * No es un descuido: auth_credentials, profiles y projects se enlazan con una
 * columna plana y no con @ManyToOne, para que sus modulos no tengan que
 * importar UserEntity y quedar acoplados a nivel de infraestructura. TypeORM
 * solo genera la FK cuando hay una relacion declarada, asi que nunca la creo.
 *
 * La restriccion se escribe aqui a mano: la base garantiza la integridad sin
 * que ninguna entidad aprenda de la otra.
 *
 * CUIDADO: migration:generate compara las entidades contra la base y estas tres
 * restricciones no estan en ninguna entidad, asi que puede proponer borrarlas
 * por considerarlas sobrantes. Hay que quitar ese DROP de lo que genere.
 */
export class UserForeignKeys1789573025126 implements MigrationInterface {
  name = 'UserForeignKeys1789573025126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Si hay filas huerfanas, esto falla y es lo que se quiere: son datos que ya
    // no se pueden mostrar, y borrarlos en silencio desde una migracion seria
    // peor que parar y que alguien los mire.
    await queryRunner.query(
      `ALTER TABLE "auth_credentials" ADD CONSTRAINT "FK_auth_credentials_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_profiles_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_credentials" DROP CONSTRAINT "FK_auth_credentials_user"`,
    );
  }
}
