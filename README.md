# HappyRobot Challenge - Inbound Carrier Sales

Sistema de automatización para ventas de carga entrantes de transportistas usando la plataforma HappyRobot.

## Estructura del Proyecto

```
app/
  page.tsx                     # Dashboard principal (KPIs + tabla de llamadas)
  calls/[id]/page.tsx          # Detalle de llamada
  api/
    verify-mc/route.ts         # POST - Verificar MC number con FMCSA
    loads/search/route.ts      # POST - Buscar cargas disponibles
    pricing/evaluate/route.ts  # POST - Evaluar contraoferta
    calls/ingest/route.ts      # POST - Guardar resultado de llamada
    calls/list/route.ts        # GET - Listar llamadas (dashboard)
    calls/[id]/route.ts        # GET - Obtener detalle de llamada
lib/
  auth.ts                      # Autenticación por API key
  db.ts                        # Almacenamiento (JSON file)
  loads.ts                     # Lógica de búsqueda de cargas
  pricing.ts                   # Lógica de evaluación de precios
  types.ts                     # Tipos TypeScript compartidos
data/
  loads.json                   # Datos de ejemplo de cargas
  calls.json                   # Almacenamiento de llamadas
```

## Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura tu `API_KEY` en `.env`:
```
API_KEY=tu-clave-secreta-aqui
```

3. Instala dependencias:
```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Construcción

```bash
npm run build
npm start
```

## Docker

### Construir imagen:
```bash
docker build -t happyrobot-challenge .
```

### Ejecutar contenedor:
```bash
docker run -p 3000:3000 -e API_KEY=tu-clave-secreta happyrobot-challenge
```

## API Endpoints

Todos los endpoints requieren autenticación mediante header:
```
Authorization: Bearer <API_KEY>
```

### POST /api/verify-mc
Verifica un número MC usando la API de FMCSA.

**Body:**
```json
{ "mc_number": "123456" }
```

### POST /api/loads/search
Busca cargas disponibles según criterios.

**Body:**
```json
{
  "equipment_type": "dry_van",
  "origin": "Dallas, TX",
  "destination": "Atlanta, GA"
}
```

### POST /api/pricing/evaluate
Evalúa una contraoferta de precio.

**Body:**
```json
{
  "mc_number": "123456",
  "load_id": "LD-1023",
  "listed_rate": 2200,
  "counter_rate": 2400,
  "round": 1
}
```

### POST /api/calls/ingest
Guarda el resultado de una llamada.

**Body:**
```json
{
  "call_id": "call_abc",
  "started_at": "2025-12-15T10:00:00Z",
  "transcript": "...",
  "outcome": "deal_accepted",
  "sentiment": "neutral",
  "extracted": {
    "mc_number": "123456",
    "load_id": "LD-1023",
    "initial_rate": 2200,
    "agreed_rate": 2300,
    "negotiation_rounds": 2
  }
}
```

## Dashboard

El dashboard está disponible en `/` y muestra:
- KPIs: Total de llamadas, deals aceptados, tasa de aceptación, promedio de rondas, delta promedio vs precio listado
- Tabla de llamadas con filtros por outcome y sentiment
- Página de detalle por llamada en `/calls/[id]`
