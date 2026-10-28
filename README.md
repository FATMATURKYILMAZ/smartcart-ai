# SmartCart AI

An AI-powered e-commerce application built with Java Spring Boot, PostgreSQL, React, and TypeScript.

> **Project status:** Backend MVP in progress.

## Overview

SmartCart AI is a portfolio project exploring how modern web technologies and AI can improve the e-commerce experience. The project is being developed incrementally, starting with a RESTful backend API and a PostgreSQL database.

## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- Maven

### Database
- PostgreSQL

### Frontend
- React
- TypeScript

*The frontend and AI integration are planned parts of the project and are not yet implemented.*

## Implemented Features

- RESTful API for product management
- Retrieve all products
- Retrieve a product by ID
- Create a product
- Update an existing product
- Delete a product
- PostgreSQL database integration
- Basic Spring Security configuration for local development

## API Endpoints

Base URL: `http://localhost:8081/api/products`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Retrieve all products |
| GET | `/api/products/{id}` | Retrieve a product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

## Getting Started

### Prerequisites

- Java 21
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/FATMATURKYILMAZ/smartcart-ai.git
cd smartcart-ai
```

### 2. Create the database

Create a PostgreSQL database named `smartcart_ai_db`.

### 3. Configure the database password

Set the `DB_PASSWORD` environment variable in your terminal. Replace the placeholder with your local PostgreSQL password.

**PowerShell:**

```powershell
$env:DB_PASSWORD="YOUR_POSTGRES_PASSWORD"
```

The application reads its database connection settings from `application.properties`. Do not commit real passwords or other secrets to GitHub.

### 4. Run the application

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend should be available at:

`http://localhost:8081`

### 5. Test the API

Retrieve the product list:

```http
GET http://localhost:8081/api/products
```

You can use a REST client, such as Postman, to test the other endpoints.

## Security Notes

The current security configuration is intended for local development. Authentication and authorization have not yet been implemented. Do not deploy this configuration to a public production environment without appropriate security changes.

## Roadmap

- [ ] Improve API validation and error handling
- [ ] Add automated backend tests
- [ ] Build the React and TypeScript frontend
- [ ] Integrate an AI-powered product recommendation feature
- [ ] Deploy the application
- [ ] Add screenshots and usage examples

## Learning Goals

This project is also a hands-on learning journey focused on REST API development, database integration, backend architecture, frontend development, and AI integration.

## Author

**Fatma Türkyılmaz**  
Computer Engineer

GitHub: [FATMATURKYILMAZ](https://github.com/FATMATURKYILMAZ)
