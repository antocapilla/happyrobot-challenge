# Postman Examples

## Initial Setup

1. **Environment variable in Postman:**
   - Create a `base_url` variable with value: `http://localhost:3000`
   - Create an `api_key` variable with value: `your-secret-api-key-here` (must match your `.env`)

2. **Common header for all endpoints (except GET calls/list and GET calls/[id]):**
   ```
   x-api-key: {{api_key}}
   ```

---

## 1. POST /api/verify-mc

**URL:** `{{base_url}}/api/verify-mc`

**Method:** POST

**Headers:**
```
x-api-key: {{api_key}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "mc_number": "123456"
}
```

**Example successful response:**
```json
{
  "verified": true,
  "carrier_name": "CARRIER 123456",
  "authority_status": "ACTIVE",
  "error": false
}
```

---

## 2. GET /api/loads/search

**URL:** `{{base_url}}/api/loads/search`

**Method:** GET

**Headers:**
```
x-api-key: {{api_key}}
```

**Query Parameters - Search by equipment:**
```
?equipment_type=dry_van
```

**Query Parameters - Complete search:**
```
?equipment_type=dry_van&origin=Dallas, TX&destination=Atlanta, GA
```

**Query Parameters - Origin only:**
```
?origin=Chicago, IL
```

**Example successful response:**
```json
{
  "loads": [
    {
      "load_id": "LD-1023",
      "origin": "Dallas, TX",
      "destination": "Atlanta, GA",
      "pickup_datetime": "2025-12-16T09:00:00Z",
      "delivery_datetime": "2025-12-17T17:00:00Z",
      "equipment_type": "dry_van",
      "loadboard_rate": 2200,
      "notes": "FCFS pickup",
      "weight": 32000,
      "commodity_type": "general freight",
      "num_of_pieces": 18,
      "miles": 780,
      "dimensions": "48ft"
    }
  ],
  "error": false,
  "error_message": null
}
```

---

## 3. POST /api/pricing/evaluate

**URL:** `{{base_url}}/api/pricing/evaluate`

**Method:** POST

**Headers:**
```
x-api-key: {{api_key}}
Content-Type: application/json
```

**Body (raw JSON) - Round 1 (accept):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2300,
  "round": 1
}
```

**Body (raw JSON) - Round 1 (counteroffer):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2800,
  "round": 1
}
```

**Body (raw JSON) - Round 2:**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2500,
  "round": 2
}
```

**Body (raw JSON) - Round 3 (maximum):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2600,
  "round": 3
}
```

**Example response - Accept:**
```json
{
  "decision": "accept",
  "approved_rate": 2300,
  "counter_rate": null,
  "reason": "Counter offer is within acceptable range",
  "error": false,
  "max_rounds": 3
}
```

**Example response - Counteroffer:**
```json
{
  "decision": "counter",
  "approved_rate": null,
  "counter_rate": 2464,
  "reason": "Counter offer exceeds maximum acceptable rate. Offering 2464",
  "error": false,
  "max_rounds": 3
}
```

---

## 4. POST /api/calls/ingest

**URL:** `{{base_url}}/api/calls/ingest`

**Method:** POST

**Headers:**
```
x-api-key: {{api_key}}
Content-Type: application/json
```

**Body (raw JSON) - Deal accepted:**
```json
{
  "call_id": "call_001",
  "started_at": "2025-12-15T10:00:00Z",
  "transcript": "Agent: Hello, thank you for calling. Can I get your MC number? Carrier: Yes, it's 123456. Agent: Thank you. Let me verify that for you... Verified! I have a load from Dallas, TX to Atlanta, GA. The listed rate is $2,200. Are you interested? Carrier: Yes, but can we do $2,300? Agent: That works for us. Deal accepted!",
  "outcome": "deal_accepted",
  "sentiment": "positive",
  "extracted": {
    "mc_number": "123456",
    "load_id": "LD-1023",
    "initial_rate": 2200,
    "agreed_rate": 2300,
    "negotiation_rounds": 1
  }
}
```

**Body (raw JSON) - Deal rejected:**
```json
{
  "call_id": "call_002",
  "started_at": "2025-12-15T11:00:00Z",
  "transcript": "Agent: Hello, thank you for calling. Can I get your MC number? Carrier: 789012. Agent: I'm sorry, but your MC number is not eligible. Thank you for calling.",
  "outcome": "carrier_ineligible",
  "sentiment": "neutral",
  "extracted": {
    "mc_number": "789012",
    "load_id": null,
    "initial_rate": null,
    "agreed_rate": null,
    "negotiation_rounds": 0
  }
}
```

**Body (raw JSON) - Transferred to rep:**
```json
{
  "call_id": "call_003",
  "started_at": "2025-12-15T12:00:00Z",
  "transcript": "Agent: Hello, thank you for calling. Can I get your MC number? Carrier: 456789. Agent: Verified! I have a load available. After 3 rounds of negotiation, let me transfer you to a sales representative who can help you further.",
  "outcome": "transfer_to_rep",
  "sentiment": "neutral",
  "extracted": {
    "mc_number": "456789",
    "load_id": "LD-1024",
    "initial_rate": 3500,
    "agreed_rate": null,
    "negotiation_rounds": 3
  }
}
```

**Body (raw JSON) - No match:**
```json
{
  "call_id": "call_004",
  "started_at": "2025-12-15T13:00:00Z",
  "transcript": "Agent: Hello, thank you for calling. Can I get your MC number? Carrier: 111222. Agent: Verified! I'm sorry, but I don't have any loads matching your equipment type at this time. Please call back later.",
  "outcome": "no_match",
  "sentiment": "neutral",
  "extracted": {
    "mc_number": "111222",
    "load_id": null,
    "initial_rate": null,
    "agreed_rate": null,
    "negotiation_rounds": 0
  }
}
```

**Example successful response:**
```json
{
  "ok": true
}
```

---

## 5. GET /api/calls/list

**URL:** `{{base_url}}/api/calls/list`

**Method:** GET

**Headers:** (No Authorization required)

**Query Parameters (optional):**
- `outcome`: `deal_accepted`, `deal_rejected`, `no_match`, `carrier_ineligible`, `transfer_to_rep`, `abandoned`
- `sentiment`: `positive`, `neutral`, `negative`
- `dateFrom`: `2025-12-15` (ISO format)
- `dateTo`: `2025-12-16` (ISO format)

**Example URLs:**
- No filters: `{{base_url}}/api/calls/list`
- With outcome filter: `{{base_url}}/api/calls/list?outcome=deal_accepted`
- With sentiment filter: `{{base_url}}/api/calls/list?sentiment=positive`
- With multiple filters: `{{base_url}}/api/calls/list?outcome=deal_accepted&sentiment=positive`
- With date range: `{{base_url}}/api/calls/list?dateFrom=2025-12-15&dateTo=2025-12-16`

**Example successful response:**
```json
{
  "calls": [
    {
      "call_id": "call_001",
      "started_at": "2025-12-15T10:00:00Z",
      "transcript": "...",
      "outcome": "deal_accepted",
      "sentiment": "positive",
      "extracted": {
        "mc_number": "123456",
        "load_id": "LD-1023",
        "initial_rate": 2200,
        "agreed_rate": 2300,
        "negotiation_rounds": 1
      }
    }
  ]
}
```

---

## 6. GET /api/calls/[id]

**URL:** `{{base_url}}/api/calls/call_001`

**Method:** GET

**Headers:** (No Authorization required)

**Example successful response:**
```json
{
  "call": {
    "call_id": "call_001",
    "started_at": "2025-12-15T10:00:00Z",
    "transcript": "Agent: Hello, thank you for calling...",
    "outcome": "deal_accepted",
    "sentiment": "positive",
    "extracted": {
      "mc_number": "123456",
      "load_id": "LD-1023",
      "initial_rate": 2200,
      "agreed_rate": 2300,
      "negotiation_rounds": 1
    }
  }
}
```

**Example response - Not found:**
```json
{
  "error": "Call not found"
}
```

---

## Complete Test Flow

1. **Create some example calls:**
   - Execute POST `/api/calls/ingest` with the examples above (call_001, call_002, call_003, call_004)

2. **View the dashboard:**
   - Open `http://localhost:3000` in your browser
   - You should see the calls in the table

3. **Test load search:**
   - GET `/api/loads/search?equipment_type=dry_van&origin=Dallas, TX` with different criteria

4. **Test price evaluation:**
   - POST `/api/pricing/evaluate` with different rounds and prices

5. **Test filters on dashboard:**
   - GET `/api/calls/list?outcome=deal_accepted`
   - GET `/api/calls/list?sentiment=positive`

6. **View call details:**
   - GET `/api/calls/call_001`
   - Or visit `http://localhost:3000/calls/call_001` in the browser

---

## Common Errors

**401 Unauthorized:**
- Verify that the `x-api-key: {{api_key}}` header is present
- Verify that the `api_key` matches the value in your `.env` file

**404 Not Found:**
- Verify that the server is running (`npm run dev`)
- Verify that the URL is correct

**500 Internal Server Error:**
- Check server logs
- Verify that JSON files in `data/` exist and have valid format
