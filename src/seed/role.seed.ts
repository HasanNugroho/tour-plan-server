import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Role } from 'src/account/domain/role';
import * as rolesData from 'src/config/default-roles.json';

async function bootstrap() {
	const appContext = await NestFactory.createApplicationContext(AppModule);
	const dataSource = appContext.get(DataSource);
	const roleRepository = dataSource.getRepository(Role);

	for (const roleData of rolesData.roles) {
		const exists = await roleRepository.findOneBy({ name: roleData.name });
		if (!exists) {
			const role = roleRepository.create({
				name: roleData.name,
				description: roleData.description,
				permissions: roleData.permissions,
				tenantId: null,
			});
			await roleRepository.save(role);
			console.log(`Seeded role: ${roleData.name}`);
		} else {
			console.log(`Role ${roleData.name} already exists, skipping.`);
		}
	}

	await appContext.close();
	process.exit(0);
}

bootstrap();
