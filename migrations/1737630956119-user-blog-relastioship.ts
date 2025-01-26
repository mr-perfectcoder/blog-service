import { MigrationInterface, QueryRunner } from "typeorm";

export class UserBlogRelastioship1737630956119 implements MigrationInterface {
    name = 'UserBlogRelastioship1737630956119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "blog" ADD CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" DROP CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "userId" character varying`);
    }

}
