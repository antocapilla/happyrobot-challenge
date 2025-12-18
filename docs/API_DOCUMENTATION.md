# API Documentation

This project includes interactive API documentation using Swagger/OpenAPI.

## Accessing the Documentation

Once the dependencies are installed and the server is running, you can access the API documentation at:

**Local:** `http://localhost:3000/api-docs`

The OpenAPI specification is also available as JSON at:

**Local:** `http://localhost:3000/api/openapi.json`

## Installation

To enable the API documentation, install the required dependency:

```bash
bun add swagger-ui-react
```

## Features

- **Interactive API Explorer**: Test endpoints directly from the browser using Swagger UI
- **Complete Schema Documentation**: All request/response schemas are documented
- **Authentication Support**: API key authentication is documented
- **Auto-generated**: The spec is maintained in code and stays in sync with the API
- **Industry Standard**: Swagger UI is the most widely used API documentation tool

## Endpoints Documented

- `POST /api/verify-mc` - Verify Motor Carrier number
- `GET /api/loads/search` - Search loads by criteria
- `GET /api/loads/list` - List all loads
- `POST /api/pricing/evaluate` - Evaluate counteroffer
- `POST /api/calls` - Create a call
- `GET /api/calls` - List calls with filters
- `GET /api/calls/{id}` - Get call details

## Updating the Documentation

The OpenAPI specification is defined in `src/lib/openapi.ts`. To update:

1. Modify the spec in `src/lib/openapi.ts`
2. The changes will automatically reflect in the Swagger UI

