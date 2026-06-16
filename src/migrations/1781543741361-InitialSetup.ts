import { type MigrationInterface,type QueryRunner } from "typeorm";

export class InitialSetup1781543741361 implements MigrationInterface {
    name = 'InitialSetup1781543741361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("userId" SERIAL NOT NULL, "userName" character varying(150) NOT NULL, "email" character varying NOT NULL, "password" character varying(200) NOT NULL, "role" character varying(100) NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("taskId" SERIAL NOT NULL, "title" character varying(150) NOT NULL, "description" character varying(200) NOT NULL, "status" character varying(100) NOT NULL DEFAULT 'pending', "created_user_id" integer, "assigned_user_id" integer, CONSTRAINT "PK_514623383bc4d768101bcf69462" PRIMARY KEY ("taskId"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_79cd50be0ef50e60005f4ea8cbf" FOREIGN KEY ("created_user_id") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_327d5ce9cd59770b274f8c3579f" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_327d5ce9cd59770b274f8c3579f"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_79cd50be0ef50e60005f4ea8cbf"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
