# Nest JS boilerplate
Typescript backend template with NestJS and PostgreSQL

## [Nestjs-Boilerplate](https://github.com/HasanNugroho/nestjs-boilerplate)
## Getting Started

### Requirements

- Node.js (v18+)
- PostgreSQL
- (Optional) Docker & Docker Compose

### Install & Run

Clone this project:
```shell script
git clone https://github.com/HasanNugroho/nestjs-boilerplate.git
cd nestjs-boilerplate
```

### Manual Installation

Install dependencies
```shell script
npm install
```

Copy environment variables
```shell script
cp .env.example .env
```

Make sure to configure .env with your database and JWT settings before running the app.

#### Run the App

```shell script
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# running on default port 3000
```

App will run on **[http://localhost:3000](http://localhost:3000)**

### Build the App with Docker
```shell script
docker build -t nest-ddd-app .
```

### Run env with Docker

``` shell script
docker-compose up -d
```

### Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### API Documentation

This project uses Swagger. Visit: **[http://localhost:3000/api](http://localhost:3000/api)**

## Structures

``` shell script
src/
├── main.ts
├── app.module.ts
│
├── config/                      # Konfigurasi aplikasi
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── logger.config.ts
│   └── permission.jso           # Template role access
│
├── common/                      # Utilitas & shared resources
│   ├── constant.ts              # Injection tokens & constants
│   ├── decorators/              # Custom decorators (@User, etc)
│   ├── dtos/                    # Global DTOs (pagination, response)
│   ├── enums/                   # Enum global
│   ├── filters/                 # Exception filters
│   └── interfaces/              # Shared interfaces
│
├── account/                     # Bounded context: Account (user, role, auth)
│   ├── domain/                  # Domain layer (entities & interfaces)
│   │   ├── user.ts
│   │   ├── role.ts
│   │   ├── service/
│   │   │   ├── auth.service.interface.ts
│   │   │   ├── user.service.interface.ts
│   │   │   └── role.service.interface.ts
│   │   └── repository/
│   │       ├── user.repository.interface.ts
│   │       └── role.repository.interface.ts
│   │
│   ├── application/             # Application layer (services, use cases)
│   │   ├── service/
│   │   │   ├── user.service.ts
│   │   │   ├── role.service.ts
│   │   │   └── auth.service.ts
│   │   └── guards/
│   │       └── auth.guard.ts
│   │
│   ├── infrastructure/          # Infrastructure layer (persistence, DB)
│   │   └── presistence/
│   │       ├── user.repository.ts
│   │       └── role.repository.ts
│   │
│   ├── presentation/            # Interface layer (controllers)
│   │   ├── dto/
│   │   │   ├── user.dto.ts
│   │   │   ├── role.dto.ts
│   │   ├── role.controller.ts
│   │   └── auth.controller.ts
│   │
│   └── account.module.ts
```

## Credits

- **[NestJS](https://nestjs.com/)** - A framework server-side applications. 
- **[TypeORM](https://typeorm.io/)** - An ORM for TypeScript and JavaScript.
- **[Swagger](https://swagger.io/)** - A tool API documentation.
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database system.
- **[Jest](https://jestjs.io/)** - A testing framework for JavaScript.

## Copyright

2025 © Burhan Nurhasan Nugroho