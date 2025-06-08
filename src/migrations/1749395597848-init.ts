import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1749395597848 implements MigrationInterface {
    name = 'Init1749395597848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tenants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "code" character varying NOT NULL,
                "description" text,
                "address" text,
                "contact_info" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_3021c18db2b363ae9324c826c5a" UNIQUE ("code"),
                CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3021c18db2b363ae9324c826c5" ON "tenants" ("code")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1ebff6b4e641024e7e656b2673" ON "tenants" ("is_active")
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "permissions" jsonb NOT NULL,
                "tenantId" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c954ae3b1156e075ccd4e9ce3e" ON "roles" ("tenantId")
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tenantId" uuid,
                "fullname" character varying NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password_hash" text NOT NULL,
                "role_id" uuid NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a3ffb1c0c8416b9fc6f907b743" ON "users" ("id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c58f7e88c286e5e3478960a998" ON "users" ("tenantId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a2cecd1a3531c0b041e29ba46e" ON "users" ("role_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "roles"
            ADD CONSTRAINT "FK_c954ae3b1156e075ccd4e9ce3e6" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"
        `);
        await queryRunner.query(`
            ALTER TABLE "roles" DROP CONSTRAINT "FK_c954ae3b1156e075ccd4e9ce3e6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a2cecd1a3531c0b041e29ba46e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c58f7e88c286e5e3478960a998"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a3ffb1c0c8416b9fc6f907b743"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c954ae3b1156e075ccd4e9ce3e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1ebff6b4e641024e7e656b2673"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3021c18db2b363ae9324c826c5"
        `);
        await queryRunner.query(`
            DROP TABLE "tenants"
        `);
    }

}
