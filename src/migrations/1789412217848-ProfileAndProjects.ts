import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfileAndProjects1789412217848 implements MigrationInterface {
    name = 'ProfileAndProjects1789412217848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "full_name" character varying(120) NOT NULL DEFAULT '', "headline" character varying(160), "bio" text, "location" character varying(120), "public_email" character varying(255), "avatar_url" text, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9e432b7df0d182f8d292902d1a2" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile_links" ("id" SERIAL NOT NULL, "kind" character varying(32) NOT NULL, "url" text NOT NULL, "label" character varying(120), "position" integer NOT NULL DEFAULT '0', "profile_id" integer, CONSTRAINT "PK_c32e8b4c7ed79e0b9c61014f7f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "slug" character varying(140) NOT NULL, "title" character varying(140) NOT NULL, "description" text, "started_at" date, "ended_at" date, "published" boolean NOT NULL DEFAULT false, "position" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_projects_user_slug" ON "projects"  ("user_id", "slug") `);
        await queryRunner.query(`CREATE TABLE "project_assets" ("id" SERIAL NOT NULL, "kind" character varying(32) NOT NULL, "url" text NOT NULL, "label" character varying(120), "position" integer NOT NULL DEFAULT '0', "project_id" integer, CONSTRAINT "PK_7b9fd4c5f92d38acb7e270e0cce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "profile_links" ADD CONSTRAINT "FK_91652eb8aa51ec36557c62bfb2b" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_assets" ADD CONSTRAINT "FK_681b21629eba30fa25bada33226" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_assets" DROP CONSTRAINT "FK_681b21629eba30fa25bada33226"`);
        await queryRunner.query(`ALTER TABLE "profile_links" DROP CONSTRAINT "FK_91652eb8aa51ec36557c62bfb2b"`);
        await queryRunner.query(`DROP TABLE "project_assets"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_projects_user_slug"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "profile_links"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
