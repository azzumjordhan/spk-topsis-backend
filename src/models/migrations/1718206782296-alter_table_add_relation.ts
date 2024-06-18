import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAddRelation1718206782296 implements MigrationInterface {
  name = 'AlterTableAddRelation1718206782296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scores" DROP COLUMN "employee_id"`);
    await queryRunner.query(
      `ALTER TABLE "scores" ADD "employee_id" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "scores" DROP COLUMN "criteria_id"`);
    await queryRunner.query(
      `ALTER TABLE "scores" ADD "criteria_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" ADD CONSTRAINT "FK_a19ce10bd7ce4f6ffa7a925cdc5" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" ADD CONSTRAINT "FK_66d0714cec6f2a426bf5666214a" FOREIGN KEY ("criteria_id") REFERENCES "criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scores" DROP CONSTRAINT "FK_66d0714cec6f2a426bf5666214a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" DROP CONSTRAINT "FK_a19ce10bd7ce4f6ffa7a925cdc5"`,
    );
    await queryRunner.query(`ALTER TABLE "scores" DROP COLUMN "criteria_id"`);
    await queryRunner.query(
      `ALTER TABLE "scores" ADD "criteria_id" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "scores" DROP COLUMN "employee_id"`);
    await queryRunner.query(
      `ALTER TABLE "scores" ADD "employee_id" character varying NOT NULL`,
    );
  }
}
