# Inbound Carrier Sales Workflow — Complete Specification

> **Goal**: Automate inbound carrier calls for load booking. Authenticate carriers via FMCSA (MC), match loads, negotiate pricing (max 3 rounds), transfer to sales rep on agreement, then classify outcome/sentiment and extract structured data.

---

## 1. Workflow Overview

**Workflow Name:** `inbound_carrier_sales`

**Use Case:** Inbound carrier load booking & negotiation automation

**Environment:** Development (for challenge demo)

**High-Level Flow:**
1. Trigger: Inbound web call
2. Agent: Handle conversation (authentication → load search & decision → negotiation if needed → transfer)
3. Post-call: Classify outcome, classify sentiment, extract structured data
4. Webhook: POST results to backend metrics API

---

## 2. Trigger Configuration

**Node Name:** `trigger_inbound_web_call`

**Type:** Web Call (Inbound Call trigger)

**Event:** Incoming web call

**Description:**
Starts workflow execution when a carrier initiates a web call through the HappyRobot platform.

**Configuration:**
- No phone number purchase required (web call trigger only)
- Test by triggering a web call, then click "Fetch records" to lock output schema

**Output Variables:**
- `call_id` (string)
- `caller_phone` (string, may be blank for web calls)
- `started_at` (datetime)

---

## 3. Inbound Voice Agent

**Node Name:** `agent_inbound_carrier_sales`

**Type:** Inbound Agent

**Model:** GPT-4o or GPT-4 Turbo (as available)

**Description:**
The inbound agent handles the entire conversation flow. It starts with Module A (Authentication) and routes through modules based on conditions. Each module has its own prompt with consistent structure.

**Flow:**
Trigger → Module A (Authentication) → Module B (Load Search & Decision) → [Module C (Negotiation) if needed]

**Module Routing:**
- Module A → Module B (if verified)
- Module B → Module C (if negotiate), accept_load tool (if accept - transfers directly to sales rep), or end_call (if decline/no loads)
- Module C → accept_load tool (if accept - transfers directly to sales rep) or end_call (if reject/no agreement/reach 3 rounds)

---

## 4. Agent Modules & Routing

### 4.1 Module A — Authentication

**Module Name:** `mod_auth`

**Initial Message:**
```
Hi, thanks for calling Acme Logistics. Before we talk about loads, can I get your MC number?
```

**Module Prompt:**
```
# Context

You are the Inbound Carrier Sales Assistant for Acme Logistics.
You are handling the authentication phase of an inbound carrier call.
Your tone is professional, calm, and efficient.

Today is <today_friendly>.
Your name is <agent_name>.

# Goal

Collect a valid MC number, verify carrier eligibility via FMCSA, and handle all outcomes including retries and ineligible carriers.

# Outline

1. Ask for the MC number and extract it as mc_number.
2. If the MC number is unclear or invalid:
   - Ask the caller to repeat it clearly.
   - Retry up to 3 times.
   - If still invalid after 3 attempts:
     - Set outcome = not_verified.
     - Call end_call to end the call politely.
3. Call verify_mc_number(mc_number).
4. If error == true:
   - Apologize briefly: "I'm having trouble verifying that MC number."
   - Ask the caller to confirm the MC number once (digit by digit).
   - Call verify_mc_number(mc_number) one more time.
   - If it still errors:
     - Set outcome = not_verified.
     - Call end_call to end the call politely.
5. If verified == false:
   - Briefly explain: "I'm sorry, but I'm not able to proceed with load booking for this MC number."
   - Set outcome = not_verified.
   - Call end_call to end the call politely.
6. If verified == true:
   - Proceed to the next module (Load Search).

Do not discuss loads in this module.
Keep responses short and factual.

# Style

Keep responses short (1–2 sentences).
Speak naturally and clearly.
Use contractions and natural pauses when appropriate.
Never speak in bullet points or lists—form full sentences.
Ask one question at a time.

# Bot Pronunciation

- Pronounce MC numbers clearly and slowly, digit by digit
- Read addresses naturally: "St" as "Street", "Ave" as "Avenue"
- Expand state abbreviations: "CA" becomes "California"

# Parameters

<agent_name>: @agent_name
<today_friendly>: @now_friendly
```

**Tools Used:** 
- `verify_mc_number` (with retry logic)
- `end_call` (for terminal outcomes: no MC, ineligible, verification error)

**Condition After Tool:** `cond_mc_verified` (only routes to Module B if verified == true)

---

### 4.2 Tool — verify_mc_number

**Node Name:** `tool_verify_mc_number`

**Type:** Webhook Tool

**Method:** POST

**URL:** `https://<your-api-host>/api/verify-mc`

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Description:**
Verifies a carrier MC number via FMCSA API and returns eligibility status. This tool checks if the carrier is authorized to operate and eligible to book loads.

**Message:**
- **Type:** AI - Let the agent generate the message
- **Description:** "Let the carrier know you're verifying their MC number. Keep it brief and professional."

**Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `mc_number` | string | Yes | Motor Carrier number to verify (digits only) | `"123456"` |

**Request Body:**
```json
{
  "mc_number": "@mc_number"
}
```

**Expected Response Schema:**

Success case:
```json
{
  "verified": true,
  "carrier_name": "ABC Trucking LLC",
  "authority_status": "AUTHORIZED",
  "error": false
}
```

Not verified case:
```json
{
  "verified": false,
  "carrier_name": "CARRIER 123456",
  "authority_status": "ACTIVE",
  "error": false
}
```

Note: `carrier_name` and `authority_status` may be `null` or `undefined` if FMCSA API doesn't return carrier data.

**Output Variables:**
- `verified` (boolean, required): **Primary field for eligibility** - true only if operatingStatus === "AUTHORIZED". This is the field to use for routing decisions.
- `carrier_name` (string, optional): Registered carrier name from FMCSA (may be null/undefined). Informational only.
- `authority_status` (string, optional): Raw authority status from FMCSA (e.g., "AUTHORIZED", "ACTIVE", may be null/undefined). **Informational only** - use `verified` for eligibility decisions.
- `error` (boolean, required): Always `false` in current implementation (errors are handled gracefully)
- `error_message` (string, optional): Not currently used, always undefined

**Note:** Only `verified` is needed for workflow routing. `authority_status` and `carrier_name` are provided for informational purposes but are not used in condition logic.

---

### 4.3 Condition — MC Verification Gate

**Node Name:** `cond_mc_verified`

**Key Name:** `mc_verified_gate`

**Type:** Condition

**Description:**
Routes workflow based on MC verification result. Only routes to Module B if verified successfully.

**Output Fields Referenced:**
- `tool_verify_mc_number.verified`

**Rules (evaluated in order):**
1. IF `tool_verify_mc_number.verified == true` → **Module B** (Load Search)
2. ELSE → Stay in **Module A** (module handles ineligible/error cases with end_call)

**Fallback:**
Stay in **Module A** (module handles terminal outcomes)

**Note:** Module A handles all error and ineligible cases internally using `end_call`. This condition only checks for successful verification to proceed to load search.

---

### 4.4 Module B — Load Search & Decision

**Module Name:** `mod_load_search_decision`

**Initial Message:**
```
Great, you're verified. What equipment are you running today?
```

**Module Prompt:**
```
# Context

You are the Inbound Carrier Sales Assistant for Acme Logistics.
The carrier has been verified and is eligible to book loads.
Your tone is professional, calm, and efficient.

Today is <today_friendly>.
Your name is <agent_name>.

# Goal

Search for loads, present them to the carrier, and handle their response (accept, negotiate, or decline).

# Outline

1. Ask for and extract equipment_type (preferred, but not strictly required).
2. Optionally ask for origin and destination preferences.
3. Call search_loads with the collected preferences:
   - equipment_type (optional, but recommended)
   - origin (optional)
   - destination (optional)
   
   Note: At least one parameter must be provided. If equipment_type is not available, use origin or destination.
4. If search_loads returns error == true:
   - Apologize briefly: "I'm having trouble searching for loads right now."
   - Retry search_loads once.
   - If it still errors:
     - Set outcome = no_load_found.
     - Call end_call to end the call politely.
5. If no loads are returned (loads array is empty):
   - Inform the carrier no loads are available matching their criteria.
   - Set outcome = no_load_found.
   - Call end_call to end the call politely.
6. If loads are found:
   - Select the best available load (prioritize by pickup date, rate, or match quality).
   - Extract load details: load_id, origin, destination, pickup_datetime, delivery_datetime, miles, weight, commodity_type, loadboard_rate.
   - Present ONE load clearly with key details in full sentences:
     * Origin and destination
     * Pickup date and time
     * Delivery date and time
     * Miles
     * Weight and commodity
     * Rate
   - Ask if they accept the rate or have a counter offer.
7. Parse carrier response and route accordingly:
   - If accept (carrier accepts the rate as-is):
     - **MUST call accept_load** (transfer tool) with load_id, rate, and mc_number.
     - This will transfer the call directly to a sales rep.
   - If negotiate (carrier wants to discuss rate or provides a counteroffer):
     - Extract counter_rate from carrier's response.
     - Set negotiation_round = 1.
     - **MUST call evaluate_counter_offer** (round 1) with:
       * load_id
       * mc_number
       * listed_rate (loadboard_rate from the load)
       * counter_rate (carrier's initial counteroffer)
       * round = 1
     - If evaluate_counter_offer returns error == true:
       * Apologize briefly and retry once.
       * If it still errors, call end_call with outcome = negotiation_failed.
     - Follow the tool's decision:
       * If decision == "accept": Set outcome = booked_transfer, call accept_load (transfers to sales rep)
       * If decision == "counter": Present the new counter_rate, route to **Module C (Negotiation)** for remaining rounds
       * If decision == "reject": Set outcome = negotiation_failed, call end_call
   - If decline (carrier rejects without negotiating):
     - Ask once if they have a rate in mind.
     - If still declined:
       - Set outcome = not_interested.
       - **MUST call end_call** to end the call politely.

**Important:** You must call accept_load if carrier accepts, or call evaluate_counter_offer if they want to negotiate (round 1), then route to Module C if needed. Do not proceed without calling the appropriate tool.

# Style

Keep responses short (1–2 sentences).
Speak naturally and clearly.
Use contractions and natural pauses when appropriate.
Never speak in bullet points or lists—form full sentences.
Clear, neutral, efficient. Avoid unnecessary details.

# Bot Pronunciation

- Read addresses naturally: "St" as "Street", "Ave" as "Avenue"
- Pronounce numbers clearly and slowly, digit by digit for rates, zip codes, MC numbers
- Say dates conversationally: "twenty fourth October twenty twenty four"
- Read times as "seven A M" or "eight oh six P M"
- Expand state abbreviations: "CA" becomes "California"

# Example Call Flow

Assistant: "Great, you're verified. What equipment are you running today?"
Carrier: "I have a dry van."
Assistant: "Perfect. Do you have a preferred lane or are you open to anything?"
Carrier: "I'm looking for something from Chicago to Dallas."
Assistant: "I have a load for you. It's going from Chicago, Illinois to Dallas, Texas. Pickup is tomorrow at 8 A M, delivery is the next day by 5 P M. It's 925 miles, 42,000 pounds of general freight. The rate is one thousand two hundred fifty dollars. Does that work for you, or do you have a different rate in mind?"
Carrier: "That works for me."
Assistant: "Perfect. Let me confirm this load and connect you with a broker to finalize."

# Parameters

<agent_name>: @agent_name
<today_friendly>: @now_friendly
```

**Tools Used:**
- `search_loads` (with error handling and retry)
- `accept_load` (when carrier accepts directly - transfers to sales rep)
- `evaluate_counter_offer` (when carrier wants to negotiate - round 1)
- `end_call` (for terminal outcomes: no loads, search error, declined)

**Conditions:**
- `cond_loads_found` (after search_loads)
- `cond_carrier_response` (after presenting load)

---

### 4.5 Tool — search_loads

**Node Name:** `tool_search_loads`

**Type:** Webhook Tool

**Method:** GET

**URL:** `https://<your-api-host>/api/loads/search`

**Headers:**
```
x-api-key: <API_KEY>
```

**Description:**
Searches the load database for available loads matching carrier equipment and lane preferences. Returns a list of matching loads that the carrier can book.

**Message:**
- **Type:** AI - Let the agent generate the message
- **Description:** "Let the carrier know you're searching for loads matching their criteria. Keep it brief."

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `equipment_type` | string | No | Type of equipment needed. Valid values only: `dry_van`, `reefer`, `flatbed`, `step_deck`, `double_drop`, `lowboy`, `other` | `dry_van` |
| `origin` | string | No | Preferred origin city/state | `Chicago, IL` |
| `destination` | string | No | Preferred destination city/state | `Dallas, TX` |

**Note:** At least one query parameter (equipment_type, origin, or destination) must be provided. The API will return an error if all are missing.

**Example Request URL:**
```
https://<your-api-host>/api/loads/search?equipment_type=dry_van&origin=Chicago, IL&destination=Dallas, TX
```

**Expected Response Schema:**
```json
{
  "loads": [
    {
      "load_id": "LD-12345",
      "origin": "Chicago, IL",
      "destination": "Dallas, TX",
      "pickup_datetime": "2024-10-25T08:00:00Z",
      "delivery_datetime": "2024-10-26T17:00:00Z",
      "equipment_type": "dry_van",
      "loadboard_rate": 1250.00,
      "weight": 42000,
      "commodity_type": "General Freight",
      "miles": 925,
      "dimensions": "53' x 102\" x 110\"",
      "num_of_pieces": 24,
      "notes": "Liftgate required"
    }
  ],
  "error": false
}
```

**Output Variables:**
- `loads` (array): Array of matching load objects
- `error` (boolean, optional): Whether an error occurred

---

### 4.6 Condition — Loads Found Gate

**Node Name:** `cond_loads_found`

**Key Name:** `loads_found_gate`

**Type:** Condition

**Description:**
Routes workflow based on load search results. Only routes away from Module B if there's an error or no loads.

**Output Fields Referenced:**
- `tool_search_loads.loads`
- `tool_search_loads.error`

**Rules (evaluated in order):**
1. IF `tool_search_loads.error == true` → Stay in **Module B** (module handles retry and error)
2. ELSE IF `length(tool_search_loads.loads) == 0` → Stay in **Module B** (module handles no loads with end_call)
3. ELSE → Stay in **Module B** (module presents load and handles carrier response)

**Fallback:**
Stay in **Module B** (module handles all cases internally)

**Note:** Module B handles all outcomes internally. This condition is mainly for logging/monitoring. The module will present loads and route based on carrier response using accept_load, negotiate_load, or end_call.

---

### 4.7 Tool — accept_load

**Node Name:** `tool_accept_load`

**Type:** Transfer Tool (HappyRobot platform function)

**Description:**
Transfers the call directly to a human sales representative when the carrier accepts a load. This tool confirms the acceptance and hands off the call to finalize the booking.

**Message:**
- **Type:** Fixed
- **Message:** "Perfect. Let me confirm this load and connect you with a broker to finalize the details. Hold on one moment."

**Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `reason` | string | No | Brief context summary for the sales rep (load_id, rate, mc_number) | `"Load LD-12345, rate $1250, MC 123456"` |

**Configuration:**
- **On hold music:** Acoustic (or preferred setting)

**Expected Behavior:**
- Call is transferred directly to a human broker
- Context summary (reason parameter) is provided to the broker
- Used in: Module B (direct acceptance), Module C (after negotiation agreement)

**Note:** This is the same tool used in Module C when negotiation reaches an agreement. It transfers the call immediately without needing Module D.

---


### 4.8 Module C — Negotiation (Remaining Rounds)

**Module Name:** `mod_negotiation`

**Initial Message:**
```
I can do [counter_rate from evaluate_counter_offer]. How does that sound?
```

**Module Prompt:**
```
# Context

You are the Inbound Carrier Sales Assistant for Acme Logistics.
The carrier has expressed interest in a load and negotiation has started.
Round 1 was already evaluated in Module B using evaluate_counter_offer.
You are now handling the remaining negotiation rounds.
Your tone is professional, calm, and efficient.

Today is <today_friendly>.
Your name is <agent_name>.

# Goal

Continue negotiation for the remaining rounds (rounds 2 and 3, maximum <max_negotiation_rounds> total). Track rounds carefully - if you reach the maximum rounds without agreement, you must end the call.

# Outline

1. Track negotiation_round starting at 2 (round 1 was already handled in Module B). Maximum <max_negotiation_rounds> rounds total.
2. Parse each carrier response as: accept | reject | counter
3. If accept:
   - Set final_rate = current_rate (or agreed rate from previous evaluate_counter_offer).
   - Set outcome = booked_transfer.
   - **MUST call accept_load** (transfer tool) with reason parameter containing load_id, rate, and mc_number.
   - This transfers the call directly to a sales rep - negotiation is complete.
4. If reject without counter:
   - Ask once if the carrier has a rate in mind.
   - If still rejected:
     - Set outcome = negotiation_failed.
     - **MUST call end_call**.
5. If counter:
   - Extract counter_rate from the carrier's response.
   - Increment negotiation_round.
   - Check if negotiation_round >= <max_negotiation_rounds>:
     * If yes: You have reached the maximum rounds. Present final offer and call end_call if refused.
     * If no: Continue to step 6.
6. **MUST call evaluate_counter_offer** with:
   - load_id
   - mc_number
   - listed_rate (from the selected load)
   - counter_rate
   - round (current negotiation_round, 2 to <max_negotiation_rounds>)
7. If evaluate_counter_offer returns error == true:
   - Apologize briefly and retry once.
   - If it still errors, call end_call with outcome = negotiation_failed.
8. Follow the tool's decision strictly:
   - If decision == "accept": Set outcome = booked_transfer, **MUST call accept_load** (transfers to sales rep)
   - If decision == "counter": Present the new counter_rate from the tool, stay in Module C
   - If decision == "reject": Set outcome = negotiation_failed, **MUST call end_call**

Never invent pricing. Always rely on evaluate_counter_offer tool.
You MUST call accept_load, end_call, or evaluate_counter_offer - do not proceed without calling a tool.

# Parameters

<agent_name>: @agent_name
<today_friendly>: @now_friendly
<max_negotiation_rounds>: @max_negotiation_rounds (environment variable, default: 3)

# Style

Keep responses short (1–2 sentences).
Speak naturally and clearly.
Use contractions and natural pauses when appropriate.
Never speak in bullet points or lists—form full sentences.
Firm but respectful. Calm and business-focused.

# Bot Pronunciation

- Pronounce numbers clearly and slowly, digit by digit for rates
- Read addresses naturally: "St" as "Street", "Ave" as "Avenue"
- Expand state abbreviations: "CA" becomes "California"

# Example Call Flow

Assistant: "The rate is one thousand two hundred fifty dollars. Does that work for you?"
Carrier: "That's a bit low. I need at least thirteen hundred."
Assistant: "Let me check on that. [Calls evaluate_counter_offer] I can do twelve seventy five. How does that sound?"
Carrier: "Yeah, that works."
Assistant: "Perfect. Let me confirm this load and connect you with a broker to finalize."

# Parameters

<agent_name>: @agent_name
<today_friendly>: @now_friendly
```

**Tools Used:**
- `evaluate_counter_offer` (for rounds 2 and 3 - calls API and returns pricing decision)
- `accept_load` (when deal is reached - transfers directly to sales rep)
- `end_call` (when reaching max rounds without agreement, or on rejection/errors)

**Note:** Round 1 is handled in Module B. This module handles rounds 2 through <max_negotiation_rounds>.

**Conditions:**
- `cond_offer_decision` (after evaluate_counter_offer)
- `cond_negotiation_round_limit` (check round count)

---

### 4.8 Tool — evaluate_counter_offer

**Node Name:** `tool_evaluate_counter_offer`

**Type:** Webhook Tool

**Method:** POST

**URL:** `https://<your-api-host>/api/pricing/evaluate`

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Description:**
Evaluates a carrier counteroffer against pricing rules and margins, returning a deterministic decision (accept, counter, or reject). This tool determines if the carrier's proposed rate is acceptable based on business rules.

**Message:**
- **Type:** AI - Let the agent generate the message
- **Description:** "Let the carrier know you're checking on their rate. Keep it brief, like 'Let me check on that rate for you.'"

**Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `load_id` | string | Yes | Load identifier | `"LD-12345"` |
| `mc_number` | string | Yes | Carrier MC number | `"123456"` |
| `listed_rate` | number | Yes | Original listed rate for the load | `1250.00` |
| `counter_rate` | number | Yes | Counteroffer rate from carrier | `1300.00` |
| `round` | number | Yes | Current negotiation round. Valid values only: `1`, `2`, `3` | `1` |

**Request Body:**
```json
{
  "load_id": "@selected_load_id",
  "mc_number": "@mc_number",
  "listed_rate": "@loadboard_rate",
  "counter_rate": "@counter_rate",
  "round": "@negotiation_round"
}
```

**Expected Response Schema:**
```json
{
  "decision": "accept",
  "approved_rate": 1275.00,
  "counter_rate": null,
  "reason": "Counter offer is within acceptable range",
  "error": false,
  "max_rounds": 3
}
```

**Decision Values:**
- `"accept"`: Counteroffer is acceptable
- `"counter"`: System proposes a different rate
- `"reject"`: Counteroffer is too high/low, no agreement possible

**Output Variables:**
- `decision` (string): "accept" | "counter" | "reject"
- `approved_rate` (number | null): Final approved rate (if accept), null otherwise
- `counter_rate` (number | null): System counteroffer (if decision is counter), null otherwise
- `reason` (string): Explanation of the decision
- `error` (boolean): Whether an error occurred
- `max_rounds` (number): Maximum negotiation rounds allowed (always 3)

---

### 4.9 Condition — Offer Decision Gate

**Node Name:** `cond_offer_decision`

**Key Name:** `offer_decision_gate`

**Type:** Condition

**Description:**
Routes workflow based on pricing evaluation decision.

**Output Fields Referenced:**
- `tool_evaluate_counter_offer.decision`

**Rules (evaluated in order):**
1. IF `decision == "accept"` → Stay in **Module C** (module calls accept_load to transfer to sales rep)
2. IF `decision == "counter"` → Stay in **Module C** (present new rate, increment round)
3. IF `decision == "reject"` → Stay in **Module C** (module calls end_call with outcome = negotiation_failed)

**Fallback:**
Stay in **Module C** and ask for clarification once

---

### 4.10 Condition — Negotiation Round Limit

**Node Name:** `cond_negotiation_round_limit`

**Key Name:** `negotiation_round_gate`

**Type:** Condition

**Description:**
Enforces maximum 3 negotiation rounds.

**Output Fields Referenced:**
- `negotiation_round` (variable tracked in agent)

**Rules (evaluated in order):**
1. IF `negotiation_round < 3` → Continue negotiation in **Module C**
2. ELSE → Present final offer, then end call if rejected

**Fallback:**
Continue negotiation

---


### 4.9 Tool — evaluate_counter_offer

**Node Name:** `tool_evaluate_counter_offer`

**Type:** Webhook Tool

**Method:** POST

**URL:** `https://<your-api-host>/api/pricing/evaluate`

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Description:**
Evaluates a carrier counteroffer against pricing rules and margins, returning a deterministic decision (accept, counter, or reject). This tool calls the API and returns a pricing decision with the approved rate or counteroffer rate.

**Message:**
- **Type:** AI - Let the agent generate the message
- **Description:** "Let the carrier know you're checking on their rate. Keep it brief, like 'Let me check on that rate for you.'"

**Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `load_id` | string | Yes | Load identifier | `"LD-12345"` |
| `mc_number` | string | Yes | Carrier MC number | `"123456"` |
| `listed_rate` | number | Yes | Original listed rate for the load | `1250.00` |
| `counter_rate` | number | Yes | Counteroffer rate from carrier | `1300.00` |
| `round` | number | Yes | Current negotiation round. Valid values only: `1`, `2`, `3` | `1` |

**Request Body:**
```json
{
  "load_id": "@selected_load_id",
  "mc_number": "@mc_number",
  "listed_rate": "@loadboard_rate",
  "counter_rate": "@counter_rate",
  "round": "@negotiation_round"
}
```

**Expected Response Schema:**
```json
{
  "decision": "accept",
  "approved_rate": 1275.00,
  "counter_rate": null,
  "reason": "Counter offer is within acceptable range",
  "error": false,
  "max_rounds": 3
}
```

**Decision Values:**
- `"accept"`: Counteroffer is acceptable
- `"counter"`: System proposes a different rate
- `"reject"`: Counteroffer is too high/low, no agreement possible

**Output Variables:**
- `decision` (string): "accept" | "counter" | "reject"
- `approved_rate` (number | null): Final approved rate (if accept), null otherwise
- `counter_rate` (number | null): System counteroffer (if decision is counter), null otherwise
- `reason` (string): Explanation of the decision
- `error` (boolean): Whether an error occurred
- `max_rounds` (number): Maximum negotiation rounds allowed (always 3)

---

### 4.10 Condition — Offer Decision Gate

**Node Name:** `cond_offer_decision`

**Key Name:** `offer_decision_gate`

**Type:** Condition

**Description:**
Routes workflow based on pricing evaluation decision. Module C handles all outcomes internally.

**Output Fields Referenced:**
- `tool_evaluate_counter_offer.decision`

**Rules (evaluated in order):**
1. IF `decision == "accept"` → Stay in **Module C** (module calls accept_load to transfer to sales rep)
2. IF `decision == "counter"` → Stay in **Module C** (present new rate, increment round)
3. IF `decision == "reject"` → Stay in **Module C** (module calls end_call with outcome = negotiation_failed)

**Fallback:**
Stay in **Module C** (module handles all cases internally)

---

### 4.11 Condition — Negotiation Round Limit

**Node Name:** `cond_negotiation_round_limit`

**Key Name:** `negotiation_round_gate`

**Type:** Condition

**Description:**
Enforces maximum 3 negotiation rounds. Module C handles this internally.

**Output Fields Referenced:**
- `negotiation_round` (variable tracked in agent)

**Rules (evaluated in order):**
1. IF `negotiation_round < 3` → Continue negotiation in **Module C**
2. ELSE → Stay in **Module C** (module calls end_call with outcome = negotiation_failed)

**Fallback:**
Continue negotiation

---

### 4.12 Tool — end_call

**Node Name:** `tool_end_call`

**Type:** End Call Tool (HappyRobot platform function)

**Description:**
Ends the live call gracefully when a terminal outcome is reached. This tool terminates the call after politely explaining why the call cannot continue (no MC provided, carrier not eligible, no loads available, negotiation failed, etc.).

**Message:**
- **Type:** AI - Let the agent generate the message
- **Description:** "End the call politely with a brief explanation. Thank them for calling and wish them well. Keep it professional and concise (1-2 sentences)."

**Parameters:**
- None (this tool does not accept parameters)

**Expected Behavior:**
- Call is terminated (hang up)
- Used in: Module A (no MC/ineligible/verification error), Module B (no loads), Module C (no agreement/rejected)

---

## 5. Post-Call Automation

After the agent completes, run classification and extraction on the transcript.

---

### 5.1 Call Outcome Classification

**Node Name:** `ai_classify_outcome`

**Type:** AI → Classify

**Input:**
- `@agent_inbound_carrier_sales.transcript`

**Prompt:**
```
You are classifying the outcome of an inbound carrier sales call.

Based on the full call transcript, determine the single most accurate outcome of the call.

Choose the outcome that best represents how the call ended.
Do not guess or invent information.

If the call resulted in a successful agreement and transfer to a sales rep, classify it as booked_transfer.
If the carrier was not verified or MC verification failed, classify it as not_verified.
If no loads were available, classify it as no_load_found.
If negotiation failed after pricing discussion, classify it as negotiation_failed.
If the carrier declined without negotiating, classify it as not_interested.
If the call ended unexpectedly or was disconnected, classify it as call_dropped.
```

**Tags (allowed values - must match CallOutcome enum in database):**
- `booked_transfer`: Deal accepted and transferred to sales rep
- `not_verified`: MC verification failed or carrier not eligible
- `no_load_found`: No loads available matching carrier criteria
- `negotiation_failed`: Negotiation reached max rounds without agreement
- `not_interested`: Carrier declined without negotiating
- `call_dropped`: Call ended unexpectedly or disconnected

**Note:** Use these exact enum values throughout the workflow. Do not use internal values - always use the CallOutcome enum values directly.

**Output Variable:**
- `tag` (string): Selected outcome tag

---

### 5.2 Sentiment Classification

**Node Name:** `ai_classify_sentiment`

**Type:** AI → Classify

**Input:**
- `@agent_inbound_carrier_sales.transcript`

**Prompt:**
```
You are classifying the overall sentiment of the carrier during an inbound sales call.

Evaluate the tone, language, and responses of the carrier across the entire conversation.

Choose the sentiment that best reflects the carrier's overall attitude.
Do not overthink individual moments—classify the dominant sentiment.

Consider:
- Positive: Friendly, cooperative, engaged, satisfied
- Neutral: Professional, matter-of-fact, neither positive nor negative
- Negative: Frustrated, uncooperative, hostile, dissatisfied
```

**Tags (allowed values):**
- `positive`
- `neutral`
- `negative`

**Output Variable:**
- `tag` (string): Selected sentiment tag

---

### 5.3 Offer Data Extraction

**Node Name:** `ai_extract_offer_data`

**Type:** AI → Extract

**Input:**
- `@agent_inbound_carrier_sales.transcript`

**Prompt:**
```
Extract structured data from this inbound carrier sales call transcript.

Extract the following fields if mentioned in the conversation:
- mc_number: Motor Carrier number
- carrier_name: Name of the carrier company (if mentioned)
- load_id: Load identifier that was discussed
- origin: Pickup location
- destination: Delivery location
- equipment_type: Type of equipment (dry_van, reefer, flatbed, etc.)
- initial_rate: Initial rate presented to carrier
- counter_rate_last: Last counteroffer from carrier (if any)
- agreed_rate: Final agreed rate (if deal was reached)
- negotiation_rounds: Number of negotiation rounds (0-3)
- outcome: Call outcome (booked_transfer, not_verified, no_load_found, negotiation_failed, not_interested, call_dropped)

If a field is not mentioned or cannot be determined, set it to null.
Do not invent or guess values.
```

**Parameters to Extract:**
- `mc_number` (string, nullable)
- `carrier_name` (string, nullable)
- `load_id` (string, nullable)
- `origin` (string, nullable)
- `destination` (string, nullable)
- `equipment_type` (string, nullable)
- `initial_rate` (number, nullable)
- `counter_rate_last` (number, nullable)
- `agreed_rate` (number, nullable)
- `negotiation_rounds` (number, nullable)
- `outcome` (string, nullable)

**Output Variable:**
- `extracted` (object): JSON object with all extracted fields

---

### 5.4 POST Results to Backend

**Node Name:** `webhook_post_call_result`

**Type:** Webhook → POST

**Method:** POST

**URL:** `https://<your-api-host>/api/calls`

**Headers:**
```
x-api-key: <API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "call_id": "@trigger_inbound_web_call.call_id",
  "started_at": "@trigger_inbound_web_call.started_at",
  "transcript": "@agent_inbound_carrier_sales.transcript",
  "outcome": "@ai_classify_outcome.tag",
  "sentiment": "@ai_classify_sentiment.tag",
  "mc_number": "@ai_extract_offer_data.extracted.mc_number",
  "selected_load_id": "@ai_extract_offer_data.extracted.load_id",
  "initial_rate": "@ai_extract_offer_data.extracted.initial_rate",
  "final_rate": "@ai_extract_offer_data.extracted.agreed_rate",
  "negotiation_rounds": "@ai_extract_offer_data.extracted.negotiation_rounds"
}
```

**Note:** All fields except `started_at`, `outcome`, and `sentiment` are optional. If `call_id` is not provided, a unique ID will be generated automatically by the server.

**Description:**
Sends call results to backend API for metrics dashboard and storage.

**Expected Response:**
- Status: 200 OK
- Body: `{ "success": true, "call_id": "..." }`

---

## 6. Tool Summary Reference

| Tool Name | Inputs | Outputs | Used In |
|-----------|--------|---------|---------|
| `verify_mc_number` | `mc_number` | `verified`, `carrier_name`, `authority_status`, `error`, `error_message?` | Module A |
| `search_loads` | `equipment_type?`, `origin?`, `destination?` | `loads[]`, `error` | Module B |
| `accept_load` | `reason?` | (none - transfers call) | Module B, Module C |
| `evaluate_counter_offer` | `load_id`, `mc_number`, `listed_rate`, `counter_rate`, `round` | `decision`, `approved_rate?`, `counter_rate?`, `reason`, `error`, `max_rounds` | Module B (round 1), Module C (rounds 2+) |
| `end_call` | (none) | (none) | Modules A, B, C |

---

## 7. Condition Nodes Summary

| Condition Name | Key Name | Referenced Fields | Routes To |
|----------------|----------|-------------------|-----------|
| `cond_mc_verified` | `mc_verified_gate` | `tool_verify_mc_number.verified` | Module B (verified) or stay in Module A (handles ineligible/error) |
| `cond_loads_found` | `loads_found_gate` | `tool_search_loads.loads`, `error` | Stay in Module B (module handles all cases internally) |
| `cond_carrier_response` | `carrier_response_gate` | Carrier response parsing | Module C (if evaluate_counter_offer decision == "counter"), accept_load (if accept), end_call (if reject/decline) |
| `cond_offer_decision` | `offer_decision_gate` | `tool_evaluate_counter_offer.decision` | Stay in Module C (module handles all cases internally) |
| `cond_negotiation_round_limit` | `negotiation_round_gate` | `negotiation_round` | Stay in Module C (module handles internally - calls end_call if >= 3) |

---

## 8. Variable Flow

**From Trigger:**
- `call_id`
- `caller_phone`
- `started_at`

**From Agent (tracked variables):**
- `mc_number`
- `equipment_type`
- `origin`
- `destination`
- `selected_load_id`
- `negotiation_round`
- `counter_rate`
- `final_rate`
- `outcome`

**From Tools:**
- `tool_verify_mc_number.*`
- `tool_search_loads.*`
- `tool_accept_load.*`
- `tool_evaluate_counter_offer.*`

**From Post-Call AI:**
- `ai_classify_outcome.tag`
- `ai_classify_sentiment.tag`
- `ai_extract_offer_data.extracted`

---

## 9. Demo Script

**For Interview Presentation:**

1. **Trigger web call** (interviewer acts as carrier)
2. **Agent asks for MC** → Provide MC number
3. **Tool verifies** → Condition routes to Module B (Load Search & Decision)
4. **Answer equipment/lane** → Agent searches loads using `search_loads`
5. **Agent pitches load** → Present load details
6. **Carrier response:**
   - **Option A (Accept):** Agent calls `accept_load` → Transfers directly to sales rep
   - **Option B (Negotiate):** Routes to Module C (Negotiation) directly
   - **Option C (Decline):** Agent calls `end_call`
7. **If negotiating:** Module C handles up to 3 rounds using `evaluate_counter_offer`:
   - Each round calls `evaluate_counter_offer` API
   - If decision == "accept" → calls `accept_load` → transfers to sales rep
   - If decision == "counter" → presents new rate, continues negotiation
   - If decision == "reject" or round >= 3 → calls `end_call`
8. **Agreement** → `accept_load` → Transfers directly to sales rep (or end call for demo)
9. **Show run results:**
   - Transcript
   - Classified outcome
   - Classified sentiment
   - Extracted structured data
   - Dashboard metrics

---

## 10. Testing Checklist

- [ ] Trigger node tested (fetch records)
- [ ] Agent node tested (initial message works)
- [ ] All tools tested individually
- [ ] All conditions tested with different inputs
- [ ] Post-call classification tested
- [ ] Post-call extraction tested
- [ ] Webhook POST tested
- [ ] End-to-end call flow tested
- [ ] Error handling tested (invalid MC, no loads, API errors)
- [ ] Negotiation round limit enforced

---

## 11. Notes for Reliability

- **Always test each node** so variables become available with predictable schemas
- **Use conditions** for gates (verification, negotiation outcomes, round limits)
- **Keep prompts concise** per module; tools available should match the phase
- **Track negotiation_round** in agent variables, increment after each counter
- **Never invent data**—always rely on tools for verification, search, and pricing
- **Handle errors gracefully**—retry once, then escalate or end call politely

---

## 12. Platform Configuration Notes

- **Voice:** Select appropriate voice (professional, clear)
- **Language:** English (US)
- **Model:** GPT-4o or GPT-4 Turbo
- **Temperature:** 0.7 (balanced creativity/consistency)
- **Max Duration:** Set appropriate limit (e.g., 10 minutes)
- **Navigate Phone Trees:** No (not applicable for inbound web calls)

---

**End of Specification**

