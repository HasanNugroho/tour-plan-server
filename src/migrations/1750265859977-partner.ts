import { MigrationInterface, QueryRunner } from "typeorm";

export class Partner1750265859977 implements MigrationInterface {
    name = 'Partner1750265859977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partner_attachment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "partner_id" uuid NOT NULL, "file_id" uuid NOT NULL, "description" text, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2da1c3ec7e041a44bbd9fc4137f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5d795afc29717a5a9d85eb4bcc" ON "partner_attachment" ("partner_id") `);
        await queryRunner.query(`CREATE TYPE "public"."partner_category_enum" AS ENUM('accommodation', 'transportation', 'meals', 'others')`);
        await queryRunner.query(`CREATE TABLE "partner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "name" character varying(255) NOT NULL, "category" "public"."partner_category_enum" NOT NULL, "contact_person" character varying(100), "phone" character varying(50), "address" character varying(255), "email" character varying(100), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f34ff11ddd5459eacbfacd48ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_92319cfac7271a8dae1047256d" ON "partner" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9af6a8bd7cac55b61babc75385" ON "partner" ("name") `);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_2fb3ee9f21816fbb32e4ecce586" FOREIGN KEY ("logo_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner_attachment" ADD CONSTRAINT "FK_5d795afc29717a5a9d85eb4bcc6" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner_attachment" ADD CONSTRAINT "FK_9f1979b89496d7e4dd63c1281a3" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner" ADD CONSTRAINT "FK_92319cfac7271a8dae1047256db" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner" DROP CONSTRAINT "FK_92319cfac7271a8dae1047256db"`);
        await queryRunner.query(`ALTER TABLE "partner_attachment" DROP CONSTRAINT "FK_9f1979b89496d7e4dd63c1281a3"`);
        await queryRunner.query(`ALTER TABLE "partner_attachment" DROP CONSTRAINT "FK_5d795afc29717a5a9d85eb4bcc6"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "FK_2fb3ee9f21816fbb32e4ecce586"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9af6a8bd7cac55b61babc75385"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92319cfac7271a8dae1047256d"`);
        await queryRunner.query(`DROP TABLE "partner"`);
        await queryRunner.query(`DROP TYPE "public"."partner_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d795afc29717a5a9d85eb4bcc"`);
        await queryRunner.query(`DROP TABLE "partner_attachment"`);
    }

}
