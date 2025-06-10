import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Role } from 'src/account/domain/role';

const rolesData = [
	{
		name: 'superadmin',
		description: 'Pemilik platform yang mengelola seluruh tenant dan operasional sistem',
		permissions: [
			'users:create',
			'users:read',
			'users:update',
			'users:delete',
			'users:activate',
			'users:deactivate',
			'roles:create',
			'roles:read',
			'roles:update',
			'roles:delete',
			'roles:assign',
			'roles:unassign',
			'tenants:create',
			'tenants:read',
			'tenants:update',
			'tenants:delete',
			'tenants:activate',
			'tenants:deactivate',
			'system:manage_settings',
			'system:view_logs',
			'system:send_announcement',
			'subscription:view',
			'subscription:change_plan',
			'dashboard:view',
			'dashboard:view_notifications',
		],
	},
	{
		name: 'admin_tenant',
		description: 'Admin tenant yang mengelola pengguna, tour, rundown, keuangan, dan penawaran',
		permissions: [
			'users:create',
			'users:read',
			'users:update',
			'users:delete',
			'users:activate',
			'users:deactivate',
			'roles:create',
			'roles:read',
			'roles:update',
			'roles:delete',
			'roles:assign',
			'roles:unassign',
			'tours:create',
			'tours:read',
			'tours:update',
			'tours:delete',
			'rundowns:create',
			'rundowns:read',
			'rundowns:update',
			'rundowns:delete',
			'rundowns:assign_team',
			'budgets:create',
			'budgets:read',
			'budgets:update',
			'budgets:delete',
			'expenses:create',
			'expenses:read',
			'expenses:update',
			'expenses:delete',
			'quotations:create',
			'quotations:read',
			'quotations:update',
			'quotations:delete',
			'quotations:send_to_client',
			'reports:view_summary',
			'reports:view_per_tour',
			'reports:export_pdf',
			'dashboard:view',
			'dashboard:view_financial_status',
			'dashboard:view_notifications',
			'subscription:view',
		],
	},
	{
		name: 'operator',
		description: 'Staf tenant yang menginput dan mengelola data tour, RAB, rundown, dan penawaran',
		permissions: [
			'tours:create',
			'tours:read',
			'tours:update',
			'rundowns:create',
			'rundowns:read',
			'rundowns:update',
			'rundowns:assign_team',
			'budgets:create',
			'budgets:read',
			'budgets:update',
			'quotations:create',
			'quotations:read',
			'quotations:update',
			'dashboard:view',
		],
	},
	{
		name: 'finance',
		description: 'Pengguna keuangan yang menginput pengeluaran dan memantau laporan biaya',
		permissions: [
			'expenses:create',
			'expenses:read',
			'expenses:update',
			'reports:view_summary',
			'reports:export_pdf',
			'dashboard:view_financial_status',
		],
	},
];

async function bootstrap() {
	const appContext = await NestFactory.createApplicationContext(AppModule);
	const dataSource = appContext.get(DataSource);
	const roleRepository = dataSource.getRepository(Role);

	for (const roleData of rolesData) {
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
