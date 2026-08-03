import type{ MigrationInterface, QueryRunner } from "typeorm";

export class StatucColumnUpdate1784272583715 implements MigrationInterface {
    name = 'StatucColumnUpdate1784272583715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'TO DO'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    }

}
