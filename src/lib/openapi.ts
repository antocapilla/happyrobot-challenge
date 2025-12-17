export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "HappyRobot API",
    version: "1.0.0",
    description: "API for inbound carrier sales automation system",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
    {
      url: "https://your-api-host.com",
      description: "Production server",
    },
  ],
  tags: [
    { name: "MC Verification", description: "Motor Carrier verification endpoints" },
    { name: "Loads", description: "Load search and listing endpoints" },
    { name: "Pricing", description: "Pricing evaluation endpoints" },
    { name: "Calls", description: "Call management endpoints" },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API key for authentication",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "boolean", example: true },
          error_message: { type: "string", example: "Error description" },
          error_code: { type: "string", nullable: true, example: "ERROR_CODE" },
        },
        required: ["error", "error_message"],
      },
      MCVerificationRequest: {
        type: "object",
        properties: {
          mc_number: {
            type: "string",
            description: "Motor Carrier number (digits only)",
            example: "123456",
          },
        },
        required: ["mc_number"],
      },
      MCVerificationResponse: {
        type: "object",
        properties: {
          verified: { type: "boolean", example: true },
          carrier_name: { type: "string", example: "CARRIER 123456" },
          authority_status: { type: "string", example: "ACTIVE" },
          error: { type: "boolean", example: false },
        },
        required: ["verified", "error"],
      },
      LoadSearchParams: {
        type: "object",
        properties: {
          equipment_type: {
            type: "string",
            description: "Type of equipment needed",
            enum: ["dry_van", "reefer", "flatbed", "step_deck", "double_drop", "lowboy", "other"],
            example: "dry_van",
          },
          origin: {
            type: "string",
            description: "Preferred origin city/state",
            example: "Chicago, IL",
          },
          destination: {
            type: "string",
            description: "Preferred destination city/state",
            example: "Dallas, TX",
          },
        },
      },
      Load: {
        type: "object",
        properties: {
          load_id: { type: "string", example: "LD-1023" },
          origin: { type: "string", example: "Dallas, TX" },
          destination: { type: "string", example: "Atlanta, GA" },
          pickup_datetime: { type: "string", format: "date-time", example: "2025-12-16T09:00:00Z" },
          delivery_datetime: { type: "string", format: "date-time", example: "2025-12-17T17:00:00Z" },
          equipment_type: { type: "string", example: "dry_van" },
          loadboard_rate: { type: "number", example: 2200 },
          notes: { type: "string", nullable: true, example: "FCFS pickup" },
          weight: { type: "number", example: 32000 },
          commodity_type: { type: "string", example: "general freight" },
          num_of_pieces: { type: "number", nullable: true, example: 18 },
          miles: { type: "number", example: 780 },
          dimensions: { type: "string", nullable: true, example: "48ft" },
        },
        required: ["load_id", "origin", "destination", "equipment_type", "loadboard_rate", "miles"],
      },
      LoadsSearchResponse: {
        type: "object",
        properties: {
          loads: {
            type: "array",
            items: { $ref: "#/components/schemas/Load" },
          },
          error: { type: "boolean", example: false },
          error_message: { type: "string", nullable: true },
        },
        required: ["loads", "error"],
      },
      LoadsListResponse: {
        type: "object",
        properties: {
          loads: {
            type: "array",
            items: { $ref: "#/components/schemas/Load" },
          },
          count: { type: "number", example: 150 },
        },
        required: ["loads", "count"],
      },
      PricingEvaluationRequest: {
        type: "object",
        properties: {
          mc_number: { type: "string", example: "123456" },
          load_id: { type: "string", example: "LD-1023" },
          listed_rate: { type: "number", example: 2200 },
          counter_rate: { type: "number", example: 2400 },
          round: { type: "number", minimum: 1, maximum: 3, example: 1 },
        },
        required: ["mc_number", "load_id", "listed_rate", "counter_rate", "round"],
      },
      PricingEvaluationResponse: {
        type: "object",
        properties: {
          accept: { type: "boolean", example: true },
          reason: { type: "string", example: "Counter offer is within acceptable range" },
          error: { type: "boolean", example: false },
        },
        required: ["accept", "error"],
      },
      CallIngestRequest: {
        type: "object",
        properties: {
          call_id: { type: "string", example: "call_001" },
          started_at: { type: "string", format: "date-time", example: "2025-12-15T10:00:00Z" },
          transcript: { type: "string", nullable: true },
          outcome: {
            type: "string",
            enum: ["booked_transfer", "not_verified", "no_load_found", "negotiation_failed", "not_interested", "call_dropped"],
            example: "booked_transfer",
          },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"],
            example: "positive",
          },
          mc_number: { type: "string", nullable: true, example: "123456" },
          selected_load_id: { type: "string", nullable: true, example: "LD-1023" },
          initial_rate: { type: "number", nullable: true, example: 2200 },
          final_rate: { type: "number", nullable: true, example: 2400 },
          negotiation_rounds: { type: "number", nullable: true, example: 2 },
          raw_extracted: { type: "object", nullable: true },
        },
        required: ["call_id", "started_at", "outcome", "sentiment"],
      },
      CallIngestResponse: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
          call_id: { type: "string", example: "call_001" },
        },
        required: ["ok", "call_id"],
      },
      Call: {
        type: "object",
        properties: {
          call_id: { type: "string", example: "call_001" },
          started_at: { type: "string", format: "date-time", example: "2025-12-15T10:00:00Z" },
          transcript: { type: "string", nullable: true },
          outcome: { type: "string", example: "booked_transfer" },
          sentiment: { type: "string", example: "positive" },
          mc_number: { type: "string", nullable: true },
          selected_load_id: { type: "string", nullable: true },
          initial_rate: { type: "number", nullable: true },
          final_rate: { type: "number", nullable: true },
          negotiation_rounds: { type: "number", nullable: true },
        },
      },
      CallsListResponse: {
        type: "object",
        properties: {
          calls: {
            type: "array",
            items: { $ref: "#/components/schemas/Call" },
          },
          count: { type: "number", example: 100 },
          pagination: {
            type: "object",
            properties: {
              page: { type: "number", example: 1 },
              limit: { type: "number", example: 20 },
              total: { type: "number", example: 100 },
              totalPages: { type: "number", example: 5 },
              hasMore: { type: "boolean", example: true },
            },
          },
        },
        required: ["calls", "count", "pagination"],
      },
      CallDetailResponse: {
        type: "object",
        properties: {
          call: { $ref: "#/components/schemas/Call" },
        },
        required: ["call"],
      },
    },
  },
  paths: {
    "/api/verify-mc": {
      post: {
        tags: ["MC Verification"],
        summary: "Verify Motor Carrier number",
        description: "Verifies a Motor Carrier (MC) number using FMCSA data",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MCVerificationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MCVerificationResponse" },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized - Missing or invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/loads/search": {
      get: {
        tags: ["Loads"],
        summary: "Search loads by criteria",
        description: "Searches for available loads matching equipment type, origin, and/or destination",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "equipment_type",
            in: "query",
            description: "Type of equipment needed",
            required: false,
            schema: {
              type: "string",
              enum: ["dry_van", "reefer", "flatbed", "step_deck", "double_drop", "lowboy", "other"],
            },
          },
          {
            name: "origin",
            in: "query",
            description: "Preferred origin city/state",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "destination",
            in: "query",
            description: "Preferred destination city/state",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "List of matching loads",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoadsSearchResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized - Missing or invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/loads/list": {
      get: {
        tags: ["Loads"],
        summary: "List all loads",
        description: "Returns all available loads without authentication",
        responses: {
          "200": {
            description: "List of all loads",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoadsListResponse" },
              },
            },
          },
        },
      },
    },
    "/api/pricing/evaluate": {
      post: {
        tags: ["Pricing"],
        summary: "Evaluate counteroffer",
        description: "Evaluates whether a counteroffer should be accepted based on pricing rules",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PricingEvaluationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Evaluation result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PricingEvaluationResponse" },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized - Missing or invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/calls/ingest": {
      post: {
        tags: ["Calls"],
        summary: "Register a call",
        description: "Saves call data including transcript, outcome, and negotiation details",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CallIngestRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Call registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CallIngestResponse" },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized - Missing or invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/calls/list": {
      get: {
        tags: ["Calls"],
        summary: "List calls with filters",
        description: "Returns a paginated list of calls with optional filters. No authentication required.",
        parameters: [
          {
            name: "outcome",
            in: "query",
            description: "Filter by outcome",
            required: false,
            schema: {
              type: "string",
              enum: ["booked_transfer", "not_verified", "no_load_found", "negotiation_failed", "not_interested", "call_dropped"],
            },
          },
          {
            name: "sentiment",
            in: "query",
            description: "Filter by sentiment",
            required: false,
            schema: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
            },
          },
          {
            name: "dateFrom",
            in: "query",
            description: "Filter calls from this date (ISO 8601)",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "dateTo",
            in: "query",
            description: "Filter calls until this date (ISO 8601)",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "search",
            in: "query",
            description: "Search in call_id, mc_number, or transcript",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "page",
            in: "query",
            description: "Page number (starts at 1)",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page (max 100)",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "List of calls",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CallsListResponse" },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/calls/{id}": {
      get: {
        tags: ["Calls"],
        summary: "Get call details",
        description: "Returns details for a specific call by ID. No authentication required.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Call ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Call details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CallDetailResponse" },
              },
            },
          },
          "404": {
            description: "Call not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
} as const;

