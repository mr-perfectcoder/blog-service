import { MigrationInterface, QueryRunner } from "typeorm";

export class BlogImage1737632148603 implements MigrationInterface {
    name = 'BlogImage1737632148603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "image"`);
    }

}
