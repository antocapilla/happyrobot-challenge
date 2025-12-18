# API Reference

Complete reference for all API endpoints. For interactive documentation, visit `/api-docs` when the server is running.

## Base URL

- **Local**: `http://localhost:3000`
- **Production**: Your deployed URL

## Authentication

Most endpoints require an API key header:

```
X-API-Key: your-api-key-here
```

The `GET /api/loads/list` endpoint is public and doesn't require authentication.

## Endpoints

### Verify MC Number

Verify a carrier's Motor Carrier number with FMCSA.

```
POST /api/verify-mc
```

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "mc_number": "123456"
}
```

**Note:** The `mc_number` must contain only digits (no "MC-" prefix). The API uses FMCSA's demo endpoint, so real MC numbers may not always return data. For testing, you can try:

- `123456` - Example format (may not exist in FMCSA database)
- `789012` - Example format
- Any 6-digit number - The API will attempt to verify it

**Important:** Since the API uses `DEMO_KEY`, actual verification results depend on FMCSA's demo endpoint availability. Invalid or non-existent MC numbers will return appropriate error messages.

**Response:**
```json
{
  "verified": true,
  "isEligible": true,
  "carrier_name": "ACME TRUCKING LLC",
  "dot_number": "987654",
  "authority_status": "ACTIVE",
  "error": false,
  "error_message": null
}
```

**Error Response:**
```json
{
  "error": true,
  "error_message": "MC number not found"
}
```

---

### Search Loads

Search for loads matching specific criteria.

```
GET /api/loads/search
```

**Headers:**
```
X-API-Key: your-api-key
```

**Query Parameters:**
- `equipment_type` (optional) - Equipment type enum
- `origin` (optional) - Origin city/state
- `destination` (optional) - Destination city/state

At least one parameter must be provided.

**Example:**
```
GET /api/loads/search?equipment_type=dry_van&origin=Dallas,%20TX
```

**Response:**
```json
{
  "loads": [
    {
      "load_id": "LD-1023",
      "origin": "Dallas, TX",
      "destination": "Atlanta, GA",
      "pickup_datetime": "2025-12-17T09:00:00-06:00",
      "delivery_datetime": "2025-12-18T17:00:00-05:00",
      "equipment_type": "dry_van",
      "loadboard_rate": 2200,
      "notes": "FCFS at pickup",
      "weight": 42000,
      "commodity_type": "paper",
      "num_of_pieces": 24,
      "miles": 780,
      "dimensions": "48x40 pallets"
    }
  ],
  "error": false,
  "error_message": null
}
```

---

### List All Loads

Get all available loads. This endpoint is public and doesn't require authentication.

```
GET /api/loads/list
```

**Response:**
```json
{
  "loads": [
    {
      "load_id": "LD-1023",
      "origin": "Dallas, TX",
      "destination": "Atlanta, GA",
      "pickup_datetime": "2025-12-17T09:00:00-06:00",
      "delivery_datetime": "2025-12-18T17:00:00-05:00",
      "equipment_type": "dry_van",
      "loadboard_rate": 2200,
      "notes": "FCFS at pickup",
      "weight": 42000,
      "commodity_type": "paper",
      "num_of_pieces": 24,
      "miles": 780,
      "dimensions": "48x40 pallets"
    }
  ]
}
```

---

### Evaluate Pricing

Evaluate a carrier's counteroffer during negotiation.

```
POST /api/pricing/evaluate
```

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2400,
  "round": 1
}
```

**Response:**
```json
{
  "decision": "counter",
  "approved_rate": null,
  "counter_rate": 2300,
  "reason": "Above max acceptable",
  "error": false,
  "error_message": null
}
```

**Decision Values:**
- `accept` - Counteroffer accepted, `approved_rate` contains the accepted rate
- `counter` - System makes a counteroffer, `counter_rate` contains the new offer
- `reject` - Counteroffer rejected, `reason` explains why

**Constraints:**
- `round` must be between 1 and 3 (maximum 3 negotiation rounds)

---

### Create Call

Create a call record after a call completes.

```
POST /api/calls
```

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "call_id": "call_abc",
  "started_at": "2025-12-17T10:05:00Z",
  "transcript": "Full call transcript text...",
  "outcome": "booked_transfer",
  "sentiment": "neutral",
  "mc_number": "123456",
  "selected_load_id": "LD-1023",
  "initial_rate": 2200,
  "final_rate": 2300,
  "negotiation_rounds": 2
}
```

**Required Fields:**
- `started_at` - ISO 8601 datetime string
- `outcome` - Must be a valid CallOutcome enum value
- `sentiment` - Must be a valid CallSentiment enum value

**Optional Fields:**
- `call_id` - Auto-generated if not provided
- `transcript` - Can be null or empty
- `mc_number` - Carrier MC number
- `selected_load_id` - Must reference an existing Load if provided
- `initial_rate` - Starting rate discussed
- `final_rate` - Final agreed rate
- `negotiation_rounds` - Number between 0 and 3

**Response:**
```json
{
  "ok": true,
  "call_id": "call_abc"
}
```

---

### List Calls

Get a list of calls with optional filters.

```
GET /api/calls
```

**Headers:**
```
X-API-Key: your-api-key
```

**Query Parameters:**
- `outcome` (optional) - Filter by call outcome
- `sentiment` (optional) - Filter by call sentiment
- `dateFrom` (optional) - Filter calls from this date (ISO 8601)
- `dateTo` (optional) - Filter calls until this date (ISO 8601)
- `search` (optional) - Search in transcript, MC number, or load ID
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Results per page (default: 20, max: 100)

**Example:**
```
GET /api/calls?outcome=booked_transfer&page=1&limit=10
```

**Response:**
```json
{
  "calls": [
    {
      "id": "clx...",
      "call_id": "call_abc",
      "started_at": "2025-12-17T10:05:00Z",
      "outcome": "booked_transfer",
      "sentiment": "neutral",
      "mc_number": "123456",
      "selected_load_id": "LD-1023",
      "initial_rate": 2200,
      "final_rate": 2300,
      "negotiation_rounds": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Call

Get details of a specific call.

```
GET /api/calls/{id}
```

**Headers:**
```
X-API-Key: your-api-key
```

**Path Parameters:**
- `id` - Call ID (internal ID, not call_id)

**Response:**
```json
{
  "id": "clx...",
  "call_id": "call_abc",
  "started_at": "2025-12-17T10:05:00Z",
  "transcript": "Full call transcript text...",
  "outcome": "booked_transfer",
  "sentiment": "neutral",
  "mc_number": "123456",
  "selected_load_id": "LD-1023",
  "initial_rate": 2200,
  "final_rate": 2300,
  "negotiation_rounds": 2,
  "selected_load": {
    "load_id": "LD-1023",
    "origin": "Dallas, TX",
    "destination": "Atlanta, GA",
    "equipment_type": "dry_van",
    "loadboard_rate": 2200
  },
  "createdAt": "2025-12-17T10:10:00Z",
  "updatedAt": "2025-12-17T10:10:00Z"
}
```

**Error Response (404):**
```json
{
  "error": true,
  "error_message": "Call not found"
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": true,
  "error_message": "Description of what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not found
- `500` - Internal server error

## Rate Limits

Currently no rate limits are enforced. This may change in the future.

## Interactive Documentation

For interactive API testing and exploration, visit `/api-docs` when the server is running. The OpenAPI specification is available at `/api/openapi.json`.

