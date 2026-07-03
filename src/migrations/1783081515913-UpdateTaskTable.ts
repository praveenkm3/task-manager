import type{ MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskTable1783081515913 implements MigrationInterface {
    name = 'UpdateTaskTable1783081515913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('High', 'Medium', 'Low')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'Medium'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "dueDate"`);
    }

}
