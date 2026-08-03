import type{ MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDueDateType1784035216990 implements MigrationInterface {
    name = 'ChangeDueDateType1784035216990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "dueDate"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "dueDate" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "dueDate"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

}
