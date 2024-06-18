import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableCriteria1716926340559 implements MigrationInterface {
  name = 'CreateTableCriteria1716926340559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "criteria" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "criteria_name" character varying NOT NULL, "weight" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_91cd5f7ff7be5ade9bca5b98cfb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "criteria"`);
  }
}
