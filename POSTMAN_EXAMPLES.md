# Ejemplos para Postman

## Configuración Inicial

1. **Variable de entorno en Postman:**
   - Crea una variable `base_url` con valor: `http://localhost:3000`
   - Crea una variable `api_key` con valor: `your-secret-api-key-here` (debe coincidir con tu `.env`)

2. **Header común para todos los endpoints (excepto GET calls/list y GET calls/[id]):**
   ```
   Authorization: Bearer {{api_key}}
   ```

---

## 1. POST /api/verify-mc

**URL:** `{{base_url}}/api/verify-mc`

**Method:** POST

**Headers:**
```
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "mc_number": "123456"
}
```

**Ejemplo de respuesta exitosa:**
```json
{
  "verified": true,
  "carrier_name": "CARRIER 123456",
  "authority_status": "ACTIVE",
  "error": false
}
```

---

## 2. POST /api/loads/search

**URL:** `{{base_url}}/api/loads/search`

**Method:** POST

**Headers:**
```
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

**Body (raw JSON) - Búsqueda por equipo:**
```json
{
  "equipment_type": "dry_van"
}
```

**Body (raw JSON) - Búsqueda completa:**
```json
{
  "equipment_type": "dry_van",
  "origin": "Dallas, TX",
  "destination": "Atlanta, GA"
}
```

**Body (raw JSON) - Solo origen:**
```json
{
  "origin": "Chicago, IL"
}
```

**Ejemplo de respuesta exitosa:**
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
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

**Body (raw JSON) - Ronda 1 (aceptar):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2300,
  "round": 1
}
```

**Body (raw JSON) - Ronda 1 (contraoferta):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2800,
  "round": 1
}
```

**Body (raw JSON) - Ronda 2:**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2500,
  "round": 2
}
```

**Body (raw JSON) - Ronda 3 (máximo):**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2600,
  "round": 3
}
```

**Ejemplo de respuesta - Aceptar:**
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

**Ejemplo de respuesta - Contraoferta:**
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
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

**Body (raw JSON) - Deal aceptado:**
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

**Body (raw JSON) - Deal rechazado:**
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

**Body (raw JSON) - Transferido a rep:**
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

**Body (raw JSON) - Sin match:**
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

**Ejemplo de respuesta exitosa:**
```json
{
  "ok": true
}
```

---

## 5. GET /api/calls/list

**URL:** `{{base_url}}/api/calls/list`

**Method:** GET

**Headers:** (No requiere Authorization)

**Query Parameters (opcionales):**
- `outcome`: `deal_accepted`, `deal_rejected`, `no_match`, `carrier_ineligible`, `transfer_to_rep`, `abandoned`
- `sentiment`: `positive`, `neutral`, `negative`
- `dateFrom`: `2025-12-15` (formato ISO)
- `dateTo`: `2025-12-16` (formato ISO)

**Ejemplos de URLs:**
- Sin filtros: `{{base_url}}/api/calls/list`
- Con filtro de outcome: `{{base_url}}/api/calls/list?outcome=deal_accepted`
- Con filtro de sentiment: `{{base_url}}/api/calls/list?sentiment=positive`
- Con múltiples filtros: `{{base_url}}/api/calls/list?outcome=deal_accepted&sentiment=positive`
- Con rango de fechas: `{{base_url}}/api/calls/list?dateFrom=2025-12-15&dateTo=2025-12-16`

**Ejemplo de respuesta exitosa:**
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

**Headers:** (No requiere Authorization)

**Ejemplo de respuesta exitosa:**
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

**Ejemplo de respuesta - No encontrado:**
```json
{
  "error": "Call not found"
}
```

---

## Flujo Completo de Prueba

1. **Crear algunas llamadas de ejemplo:**
   - Ejecuta POST `/api/calls/ingest` con los ejemplos de arriba (call_001, call_002, call_003, call_004)

2. **Ver el dashboard:**
   - Abre `http://localhost:3000` en tu navegador
   - Deberías ver las llamadas en la tabla

3. **Probar búsqueda de cargas:**
   - POST `/api/loads/search` con diferentes criterios

4. **Probar evaluación de precios:**
   - POST `/api/pricing/evaluate` con diferentes rondas y precios

5. **Probar filtros en el dashboard:**
   - GET `/api/calls/list?outcome=deal_accepted`
   - GET `/api/calls/list?sentiment=positive`

6. **Ver detalle de llamada:**
   - GET `/api/calls/call_001`
   - O visita `http://localhost:3000/calls/call_001` en el navegador

---

## Errores Comunes

**401 Unauthorized:**
- Verifica que el header `Authorization: Bearer {{api_key}}` esté presente
- Verifica que el `api_key` coincida con el valor en tu archivo `.env`

**404 Not Found:**
- Verifica que el servidor esté corriendo (`npm run dev`)
- Verifica que la URL sea correcta

**500 Internal Server Error:**
- Revisa los logs del servidor
- Verifica que los archivos JSON en `data/` existan y tengan formato válido

