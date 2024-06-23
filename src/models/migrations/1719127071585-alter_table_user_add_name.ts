import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableUserAddName1719127071585 implements MigrationInterface {
  name = 'AlterTableUserAddName1719127071585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "name" character varying NOT NULL DEFAULT '-'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
  }
}
