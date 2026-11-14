import type { EndpointDoc, EndpointGroup } from './types';

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: 'executions',
    category: 'executions',
    title: 'Executions',
    authBadge: 'Tenant API key',
    endpoints: [
      {
        id: 'create-execution',
        category: 'executions',
        title: 'Create an execution',
        method: 'POST',
        path: '/api/v1/agents/:id/execute',
        auth: 'Tenant API key · X-Arbiter-Key',
        authType: 'api-key',
        description: `Starts a durable execution of a published agent against a single input payload. The request synchronously waits up to <code class="text-xs bg-[#222222] px-1.5 py-0.5 rounded text-white border border-[#333333]">wait_s</code> seconds for the reliability gate to evaluate confidence.\n\nIf the decision clears the agent's calibrated threshold &tau; within that window, you get <code class="text-xs bg-[#222222] px-1.5 py-0.5 rounded text-emerald-400 font-mono">200 OK</code> with the committed decision and executed tool calls. If confidence falls below &tau; or violates guardrails, you receive <code class="text-xs bg-[#222222] px-1.5 py-0.5 rounded text-amber-400 font-mono">202 Accepted</code> with status: <code class="text-xs text-white">"pending_review"</code> and an escalation case ID.`,
        hasWarning: false,
        params: [
          {
            name: 'id',
            req: 'required',
            type: 'UUID (path)',
            desc: 'The unique UUID of the registered agent to execute.',
          },
          {
            name: 'input',
            req: 'required',
            type: 'object',
            desc: "Input payload matching the published agent's JSON schema.",
          },
          {
            name: 'idempotency_key',
            req: 'optional',
            type: 'string',
            desc: 'Deduplication key. Replays within 24h return the existing execution instead of spawning duplicate workflows.',
          },
          {
            name: 'callback_url',
            req: 'optional',
            type: 'string',
            desc: 'HTTPS webhook URL that receives the signed final outcome when human review completes.',
          },
          {
            name: 'wait_s',
            req: 'optional',
            type: 'integer',
            desc: 'Seconds to hold the HTTP connection open (0-30). Set to 0 for instant async dispatch.',
            defaultVal: '10',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'decided',
            color: 'emerald',
            text: 'The decision cleared the reliability gate (&ge; &tau;) and was automatically committed. Tool calls have already executed.',
            body: JSON.stringify(
              {
                id: 'exe_7hk2q9',
                object: 'execution',
                status: 'decided',
                agent_id: 'a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d',
                version: '1.2.0',
                decision: {
                  decision: 'refund',
                  amount: 1240.5,
                  rationale: 'Duplicate charge verified from merchant logs within same billing minute',
                },
                reliability: {
                  confidence: 0.94,
                  threshold: 0.85,
                  gate: 'passed',
                  uncertainty_set: ['refund'],
                },
                tool_calls: [
                  {
                    tool: 'payments.refund',
                    status: 'executed',
                    output: { refund_id: 'ref_8820' },
                  },
                ],
                audit_record_id: 'aud_9f02a3b1',
              },
              null,
              2
            ),
          },
          {
            code: '202',
            label: 'pending_review',
            color: 'amber',
            text: 'The decision fell below &tau; or triggered a high-risk policy rule. It is frozen in the human reviewer queue.',
            body: JSON.stringify(
              {
                id: 'exe_9pk1m4',
                object: 'execution',
                status: 'pending_review',
                agent_id: 'a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d',
                escalation: {
                  case_id: '41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7',
                  reason: 'below_threshold',
                  confidence: 0.62,
                  threshold: 0.85,
                  queue: 'finance-escalations',
                  created_at: '2026-11-15T00:15:00Z',
                },
              },
              null,
              2
            ),
          },
          {
            code: '400',
            label: 'invalid_request',
            color: 'red',
            text: 'The request body failed schema validation against the registered agent schema.',
            body: JSON.stringify(
              {
                error: {
                  code: 'VALIDATION_FAILED',
                  message: "Field 'input.amount' must be a positive number",
                  param: 'input.amount',
                },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/agents/a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d/execute" \\
  -H "X-Arbiter-Key: $ARBITER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "transaction_id": "tx_9921",
      "amount": 1240.5,
      "currency": "USD",
      "merchant_id": "m_5521",
      "cardholder_note": "Charged twice for one order"
    },
    "idempotency_key": "refund-check-tx_9921",
    "wait_s": 10
  }'`,
          go: `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "http://localhost:8000/api/v1/agents/a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d/execute"
	payload := []byte(\`{
		"input": {
			"transaction_id": "tx_9921",
			"amount": 1240.5,
			"currency": "USD"
		},
		"idempotency_key": "refund-check-tx_9921",
		"wait_s": 10
	}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("X-Arbiter-Key", "arda_live_sec_99120412")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\\n%s\\n", resp.StatusCode, string(body))
}`,
          python: `import os
import requests

url = "http://localhost:8000/api/v1/agents/a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d/execute"
headers = {
    "X-Arbiter-Key": os.getenv("ARBITER_API_KEY", "arda_live_sec_99120412"),
    "Content-Type": "application/json"
}
payload = {
    "input": {
        "transaction_id": "tx_9921",
        "amount": 1240.5,
        "currency": "USD"
    },
    "idempotency_key": "refund-check-tx_9921",
    "wait_s": 10
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(response.json())`,
          typescript: `const url = 'http://localhost:8000/api/v1/agents/a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d/execute';

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'X-Arbiter-Key': process.env.ARBITER_API_KEY ?? 'arda_live_sec_99120412',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: {
      transaction_id: 'tx_9921',
      amount: 1240.5,
      currency: 'USD',
    },
    idempotency_key: 'refund-check-tx_9921',
    wait_s: 10,
  }),
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);`,
        },
        tryItConfig: {
          defaultMethod: 'POST',
          defaultPathParams: { id: 'a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d' },
          defaultBody: JSON.stringify(
            {
              input: {
                transaction_id: 'tx_9921',
                amount: 1240.5,
                currency: 'USD',
                merchant_id: 'm_5521',
                cardholder_note: 'Charged twice for one order',
              },
              idempotency_key: 'refund-check-tx_9921',
              wait_s: 10,
            },
            null,
            2
          ),
        },
      },
      {
        id: 'evaluate-gate',
        category: 'executions',
        title: 'Evaluate reliability gate',
        method: 'POST',
        path: '/api/v1/reliability/gate',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Directly invokes the ARDA Reliability Gate without executing agent workflows. Evaluates model probabilities against conformal prediction sets, calculates non-conformity scores, and determines whether the output satisfies calibrated threshold &tau;.`,
        hasWarning: false,
        params: [
          {
            name: 'agent_id',
            req: 'required',
            type: 'UUID',
            desc: 'The agent against whose calibration profile the prediction is scored.',
          },
          {
            name: 'candidate_output',
            req: 'required',
            type: 'object',
            desc: 'The proposed decision and confidence score emitted by the LLM.',
          },
          {
            name: 'context',
            req: 'optional',
            type: 'object',
            desc: 'Feature vector or input context used for local KNN similarity lookup.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'evaluated',
            color: 'emerald',
            text: 'Reliability Gate computation completed successfully.',
            body: JSON.stringify(
              {
                gate: 'passed',
                calibrated_confidence: 0.912,
                threshold: 0.85,
                conformal_set_size: 1,
                p_value: 0.042,
                escalation_required: false,
              },
              null,
              2
            ),
          },
          {
            code: '422',
            label: 'uncalibrated',
            color: 'red',
            text: 'The requested agent does not have sufficient seed evaluation examples to construct a valid calibration curve.',
            body: JSON.stringify(
              {
                error: {
                  code: 'UNCALIBRATED_AGENT',
                  message: 'Agent requires at least 25 human-reviewed examples before conformal gating is active.',
                },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/reliability/gate" \\
  -H "Authorization: Bearer $ARDA_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d",
    "candidate_output": {
      "decision": "refund",
      "raw_confidence": 0.88
    }
  }'`,
          go: `package main

import (
	"bytes"
	"fmt"
	"net/http"
)

func main() {
	payload := []byte(\`{
		"agent_id": "a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d",
		"candidate_output": {
			"decision": "refund",
			"raw_confidence": 0.88
		}
	}\`)
	req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/reliability/gate", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer $ARDA_JWT")
	resp, _ := http.DefaultClient.Do(req)
	fmt.Println("Gate status:", resp.StatusCode)
}`,
          python: `import requests

res = requests.post(
    "http://localhost:8000/api/v1/reliability/gate",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    json={
        "agent_id": "a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d",
        "candidate_output": {"decision": "refund", "raw_confidence": 0.88}
    }
)
print(res.json())`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/reliability/gate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent_id: 'a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d',
    candidate_output: { decision: 'refund', raw_confidence: 0.88 },
  }),
});
const data = await res.json();`,
        },
      },
      {
        id: 'retrieve-run',
        category: 'executions',
        title: 'Retrieve an execution',
        method: 'GET',
        path: '/api/v1/runs/:id',
        auth: 'Tenant API key · X-Arbiter-Key',
        authType: 'api-key',
        description: `Returns the complete telemetry record for an agent execution, including model reasoning, intermediate tool invocations, Temporal workflow status, and the cryptographic hash chain link.`,
        params: [
          {
            name: 'id',
            req: 'required',
            type: 'string (path)',
            desc: 'The unique execution ID (e.g. exe_7hk2q9 or Temporal workflow ID).',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'success',
            color: 'emerald',
            text: 'Execution found and returned.',
            body: JSON.stringify(
              {
                id: 'exe_7hk2q9',
                status: 'completed',
                agent_name: 'refund-processor',
                version: '1.2.0',
                duration_ms: 1840,
                cost_usd: 0.0034,
                decision: { outcome: 'approved', amount: 1240.5 },
                reliability: { confidence: 0.94, gate: 'passed' },
                created_at: '2026-11-15T00:10:00Z',
              },
              null,
              2
            ),
          },
          {
            code: '404',
            label: 'not_found',
            color: 'red',
            text: 'No execution with the requested ID exists in this tenant.',
            body: JSON.stringify(
              {
                error: { code: 'NOT_FOUND', message: 'Execution exe_7hk2q9 was not found' },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/runs/exe_7hk2q9" \\
  -H "X-Arbiter-Key: $ARBITER_API_KEY"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/runs/exe_7hk2q9", nil)
req.Header.Set("X-Arbiter-Key", "arda_live_sec_99120412")
resp, _ := http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/runs/exe_7hk2q9",
    headers={"X-Arbiter-Key": "$ARBITER_API_KEY"}
)
print(res.json())`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/runs/exe_7hk2q9', {
  headers: { 'X-Arbiter-Key': apiKey }
});
const run = await res.json();`,
        },
      },
    ],
  },
  {
    id: 'agents',
    category: 'agents',
    title: 'Agents',
    authBadge: 'Bearer JWT',
    endpoints: [
      {
        id: 'register-agent',
        category: 'agents',
        title: 'Register an agent',
        method: 'POST',
        path: '/api/v1/agents',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Registers a new autonomous agent as an initial draft version <code class="text-white bg-[#222222] px-1.5 py-0.5 rounded font-mono">1.0.0</code>. Draft versions cannot be directly executed in production until seed examples are evaluated and the version is explicitly published.\n\nAll tools referenced in the agent configuration must already exist in the tenant tool registry. Guardrails configured here are strictly enforced by the ARDA API Gateway on every tool call and cannot be bypassed by model prompting.`,
        hasWarning: true,
        warningCallout: {
          title: 'New agents escalate most cases at first',
          message:
            'Until an agent has sufficient human-reviewed examples in the reliability buffer, the conformal predictor defaults to safe escalation to prevent uncalibrated hallucination.',
        },
        params: [
          {
            name: 'name',
            req: 'required',
            type: 'string',
            desc: 'Unique lowercase slug for this tenant (e.g. fraud-review or dispute-handler).',
          },
          {
            name: 'description',
            req: 'optional',
            type: 'string',
            desc: 'Human-readable summary of agent business function.',
          },
          {
            name: 'prompt',
            req: 'required',
            type: 'string',
            desc: 'System instructions defining agent behavior and operating boundary.',
          },
          {
            name: 'input_schema',
            req: 'required',
            type: 'object (JSON Schema)',
            desc: 'JSON Schema that strictly validates payload inputs on execution calls.',
          },
          {
            name: 'output_schema',
            req: 'required',
            type: 'object (JSON Schema)',
            desc: 'JSON Schema that all proposed decisions must conform to before evaluation.',
          },
          {
            name: 'tools',
            req: 'optional',
            type: 'array<string>',
            desc: 'List of registered tool names granted to this agent version.',
          },
          {
            name: 'reliability_threshold',
            req: 'optional',
            type: 'number (0.0-1.0)',
            desc: 'Calibrated confidence threshold &tau; required for automatic commit.',
            defaultVal: '0.85',
          },
        ],
        responses: [
          {
            code: '201',
            label: 'created',
            color: 'emerald',
            text: 'The agent was successfully registered as a draft version.',
            body: JSON.stringify(
              {
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                name: 'fraud-review',
                tenant_id: 'tenant_acme_core',
                status: 'draft',
                latest_version: '1.0.0',
                tools: ['payments.refund', 'ledger.read'],
                reliability_threshold: 0.85,
                created_at: '2026-11-15T00:15:00Z',
              },
              null,
              2
            ),
          },
          {
            code: '409',
            label: 'name_taken',
            color: 'red',
            text: 'An agent with this name already exists in this tenant organization.',
            body: JSON.stringify(
              {
                error: {
                  code: 'CONFLICT',
                  message: "Agent with name 'fraud-review' already exists",
                },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/agents" \\
  -H "Authorization: Bearer $ARDA_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "fraud-review",
    "description": "Reviews flagged card transactions",
    "prompt": "You are a financial risk agent reviewing credit card transactions...",
    "input_schema": {
      "type": "object",
      "required": ["transaction_id", "amount"]
    },
    "output_schema": {
      "type": "object",
      "required": ["decision"]
    },
    "tools": ["payments.refund", "ledger.read"],
    "reliability_threshold": 0.85
  }'`,
          go: `package main

import (
	"bytes"
	"net/http"
)

func main() {
	payload := []byte(\`{
		"name": "fraud-review",
		"prompt": "You are a financial risk agent...",
		"input_schema": {"type": "object", "required": ["transaction_id"]},
		"output_schema": {"type": "object", "required": ["decision"]},
		"reliability_threshold": 0.85
	}\`)
	req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/agents", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer $ARDA_JWT")
	req.Header.Set("Content-Type", "application/json")
	http.DefaultClient.Do(req)
}`,
          python: `import requests

res = requests.post(
    "http://localhost:8000/api/v1/agents",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    json={
        "name": "fraud-review",
        "prompt": "You are a financial risk agent...",
        "input_schema": {"type": "object", "required": ["transaction_id"]},
        "output_schema": {"type": "object", "required": ["decision"]},
        "reliability_threshold": 0.85
    }
)
print(res.status_code, res.json())`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'fraud-review',
    prompt: 'You are a financial risk agent...',
    input_schema: { type: 'object', required: ['transaction_id'] },
    output_schema: { type: 'object', required: ['decision'] },
    reliability_threshold: 0.85,
  }),
});
const created = await res.json();`,
        },
      },
      {
        id: 'list-agents',
        category: 'agents',
        title: 'List agents',
        method: 'GET',
        path: '/api/v1/agents',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Returns all registered agents for the authenticated tenant, including their active published version, calibration status, and assigned review queue.`,
        params: [],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'List of agents retrieved successfully.',
            body: JSON.stringify(
              {
                agents: [
                  {
                    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    name: 'fraud-review',
                    status: 'published',
                    published_version: '1.2.0',
                    review_queue: 'fraud-l2',
                    reliability_threshold: 0.85,
                  },
                ],
                total: 1,
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/agents" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/agents", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
resp, _ := http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/agents",
    headers={"Authorization": "Bearer $ARDA_JWT"}
)
print(res.json())`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/agents', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const data = await res.json();`,
        },
      },
      {
        id: 'publish-version',
        category: 'agents',
        title: 'Publish an agent version',
        method: 'POST',
        path: '/api/v1/agents/:id/versions/:versionId/publish',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Transitions a draft agent version to <code class="text-white font-mono">published</code>, atomically making it the live production version for executions that do not specify an explicit version pin.`,
        params: [
          {
            name: 'id',
            req: 'required',
            type: 'UUID (path)',
            desc: 'Agent unique ID.',
          },
          {
            name: 'versionId',
            req: 'required',
            type: 'UUID (path)',
            desc: 'Version ID to promote to production.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'published',
            color: 'emerald',
            text: 'Version promoted to production successfully.',
            body: JSON.stringify(
              {
                agent_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                version_id: '7b129a01-3891-4231-9012-384729104829',
                version_number: '1.2.0',
                status: 'published',
                published_at: '2026-11-15T00:20:00Z',
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/agents/3fa85f64-5717-4562-b3fc-2c963f66afa6/versions/7b129a01-3891-4231-9012-384729104829/publish" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/agents/3fa85f64-5717-4562-b3fc-2c963f66afa6/versions/7b129a01-3891-4231-9012-384729104829/publish", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.post(
    "http://localhost:8000/api/v1/agents/3fa85f64-5717-4562-b3fc-2c963f66afa6/versions/7b129a01-3891-4231-9012-384729104829/publish",
    headers={"Authorization": "Bearer $ARDA_JWT"}
)`,
          typescript: `await fetch('http://localhost:8000/api/v1/agents/3fa85f64-5717-4562-b3fc-2c963f66afa6/versions/7b129a01-3891-4231-9012-384729104829/publish', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
});`,
        },
      },
    ],
  },
  {
    id: 'reviews',
    category: 'reviews',
    title: 'Reviews',
    authBadge: 'Bearer JWT',
    endpoints: [
      {
        id: 'list-reviews',
        category: 'reviews',
        title: 'List review cases',
        method: 'GET',
        path: '/api/v1/reviews',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Returns escalated review cases matching filter criteria. Cases represent decisions that fell below reliability threshold &tau;, hit guardrail constraints, or were flagged for randomized audit calibration.`,
        params: [
          {
            name: 'status',
            req: 'optional',
            type: 'string',
            desc: 'Filter by case status: pending, resolved, rejected.',
            defaultVal: 'pending',
          },
          {
            name: 'agent_id',
            req: 'optional',
            type: 'UUID',
            desc: 'Filter escalations by originating agent ID.',
          },
          {
            name: 'limit',
            req: 'optional',
            type: 'integer',
            desc: 'Pagination limit (1-100).',
            defaultVal: '20',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Review queue cases returned.',
            body: JSON.stringify(
              {
                cases: [
                  {
                    id: '41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7',
                    execution_id: 'exe_9pk1m4',
                    agent_name: 'fraud-review',
                    status: 'pending',
                    escalation_reasons: ['LOW_CONFIDENCE', 'HIGH_VALUE_THRESHOLD'],
                    confidence: 0.62,
                    threshold: 0.85,
                    created_at: '2026-11-15T00:15:00Z',
                  },
                ],
                total: 1,
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/reviews?status=pending" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/reviews?status=pending", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/reviews",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    params={"status": "pending"}
)
print(res.json())`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/reviews?status=pending', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const cases = await res.json();`,
        },
      },
      {
        id: 'retrieve-review',
        category: 'reviews',
        title: 'Retrieve a review case',
        method: 'GET',
        path: '/api/v1/reviews/:id',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Fetches frozen evidence for a specific escalated case, including the exact prompt, candidate tool calls, similarity neighbors from the reliability vector store, and audit trail hash.`,
        params: [
          {
            name: 'id',
            req: 'required',
            type: 'UUID (path)',
            desc: 'Review case unique UUID.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Review case details retrieved.',
            body: JSON.stringify(
              {
                id: '41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7',
                execution_id: 'exe_9pk1m4',
                agent_name: 'fraud-review',
                frozen_evidence: {
                  input: { transaction_id: 'tx_9921', amount: 1240.5 },
                  proposed_decision: 'refund',
                  confidence: 0.62,
                  threshold: 0.85,
                  reasoning: 'Cardholder claims double billing but merchant timestamps show 4 hours apart',
                  neighbors: [
                    { id: 'case_2290', similarity: 0.94, human_outcome: 'rejected' },
                  ],
                },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7",
    headers={"Authorization": "Bearer $ARDA_JWT"}
)`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
      {
        id: 'resolve-review',
        category: 'reviews',
        title: 'Resolve a review case',
        method: 'POST',
        path: '/api/v1/reviews/:id/resolve',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Submits an authoritative human decision (Approve, Reject, or Override). This action commits the final outcome to Temporal, triggers pending tool executions if approved, records an immutable audit receipt with reviewer signature, and feeds back into the calibration buffer.`,
        params: [
          {
            name: 'id',
            req: 'required',
            type: 'UUID (path)',
            desc: 'Review case ID to resolve.',
          },
          {
            name: 'action',
            req: 'required',
            type: 'enum (approve | reject | override)',
            desc: 'The human decision verdict.',
          },
          {
            name: 'reason',
            req: 'required',
            type: 'string',
            desc: 'Mandatory rationale justifying the human reviewer judgment.',
          },
          {
            name: 'override_decision',
            req: 'optional',
            type: 'object',
            desc: 'Required if action is override. Contains replacement decision attributes.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'resolved',
            color: 'emerald',
            text: 'Case resolved successfully and execution unblocked.',
            body: JSON.stringify(
              {
                case_id: '41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7',
                status: 'resolved',
                verdict: 'approved',
                resolved_by: 'reviewer@acme.com',
                audit_record_id: 'aud_41029481',
                resolved_at: '2026-11-15T00:22:00Z',
              },
              null,
              2
            ),
          },
          {
            code: '409',
            label: 'already_resolved',
            color: 'red',
            text: 'Conflict: This case has already been resolved by another reviewer.',
            body: JSON.stringify(
              {
                error: {
                  code: 'CONFLICT',
                  message: 'Case was resolved at 2026-11-15T00:21:40Z by admin@acme.com',
                },
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7/resolve" \\
  -H "Authorization: Bearer $ARDA_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "approve",
    "reason": "Merchant transaction confirmed as legitimate duplicate order"
  }'`,
          go: `package main

import (
	"bytes"
	"net/http"
)

func main() {
	payload := []byte(\`{
		"action": "approve",
		"reason": "Verified through merchant statement"
	}\`)
	req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7/resolve", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer $ARDA_JWT")
	req.Header.Set("Content-Type", "application/json")
	http.DefaultClient.Do(req)
}`,
          python: `import requests

res = requests.post(
    "http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7/resolve",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    json={
        "action": "approve",
        "reason": "Verified merchant logs confirm single shipment"
    }
)
print(res.json())`,
          typescript: `await fetch('http://localhost:8000/api/v1/reviews/41a0e192-3d7f-4f81-a901-b2c3d4e5f6a7/resolve', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'approve',
    reason: 'Verified merchant logs confirm duplicate transaction',
  }),
});`,
        },
      },
    ],
  },
  {
    id: 'tools',
    category: 'tools',
    title: 'Tools & Gateway',
    authBadge: 'Bearer JWT',
    endpoints: [
      {
        id: 'list-tools',
        category: 'tools',
        title: 'List tools',
        method: 'GET',
        path: '/api/v1/tools',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Returns all registered tools available to agents within the tenant. Tools are executed exclusively through the ARDA Tool Gateway to prevent unauthorized secret leakage.`,
        params: [],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Registered tools returned.',
            body: JSON.stringify(
              {
                tools: [
                  {
                    id: 'tool_9921',
                    name: 'payments.refund',
                    side_effects: 'irreversible',
                    enabled: true,
                    rate_limit_per_min: 60,
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/tools" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/tools", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/tools",
    headers={"Authorization": "Bearer $ARDA_JWT"}
)`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/tools', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
      {
        id: 'register-tool',
        category: 'tools',
        title: 'Register a tool',
        method: 'POST',
        path: '/api/v1/tools',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Registers an external HTTP or Model Context Protocol (MCP) tool. The gateway invokes <code class="text-white bg-[#222222] px-1.5 py-0.5 rounded font-mono">endpoint_url</code> on the agent's behalf; LLMs never receive direct backend credentials.`,
        params: [
          {
            name: 'name',
            req: 'required',
            type: 'string',
            desc: 'Dotted tool identifier (e.g. payments.refund or crm.update_ticket).',
          },
          {
            name: 'endpoint_url',
            req: 'required',
            type: 'string',
            desc: 'HTTPS target endpoint invoked by the gateway.',
          },
          {
            name: 'input_schema',
            req: 'required',
            type: 'object (JSON Schema)',
            desc: 'JSON Schema validating tool arguments.',
          },
          {
            name: 'side_effects',
            req: 'required',
            type: 'enum (none | reversible | irreversible)',
            desc: 'Side-effect severity determining retry semantics and mandatory human gating.',
          },
        ],
        responses: [
          {
            code: '201',
            label: 'created',
            color: 'emerald',
            text: 'Tool registered successfully.',
            body: JSON.stringify(
              {
                id: 'tool_9921',
                name: 'payments.refund',
                side_effects: 'irreversible',
                created_at: '2026-11-15T00:25:00Z',
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/tools" \\
  -H "Authorization: Bearer $ARDA_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "payments.refund",
    "endpoint_url": "https://internal.acme-corp.com/refund",
    "input_schema": {
      "type": "object",
      "required": ["transaction_id", "amount"]
    },
    "side_effects": "irreversible"
  }'`,
          go: `package main

import (
	"bytes"
	"net/http"
)

func main() {
	payload := []byte(\`{
		"name": "payments.refund",
		"endpoint_url": "https://internal.acme-corp.com/refund",
		"side_effects": "irreversible"
	}\`)
	req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/tools", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer $ARDA_JWT")
	http.DefaultClient.Do(req)
}`,
          python: `res = requests.post(
    "http://localhost:8000/api/v1/tools",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    json={
        "name": "payments.refund",
        "endpoint_url": "https://internal.acme-corp.com/refund",
        "side_effects": "irreversible"
    }
)`,
          typescript: `await fetch('http://localhost:8000/api/v1/tools', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'payments.refund',
    endpoint_url: 'https://internal.acme-corp.com/refund',
    side_effects: 'irreversible',
  }),
});`,
        },
      },
      {
        id: 'audit-tools',
        category: 'tools',
        title: 'Audit tool invocations',
        method: 'GET',
        path: '/api/v1/tools/audit',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Returns an immutable, SHA-256 hash-chained sequence of tool invocations and human-review resolutions. Each event contains its own cryptographic payload hash and points to the previous event hash for mathematical tamper detection.`,
        params: [
          {
            name: 'limit',
            req: 'optional',
            type: 'integer',
            desc: 'Number of audit events to return (default 50).',
            defaultVal: '50',
          },
          {
            name: 'cursor',
            req: 'optional',
            type: 'string',
            desc: 'Pagination cursor for hash-chain traversal.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Cryptographic audit sequence returned.',
            body: JSON.stringify(
              {
                events: [
                  {
                    id: 'aud_9f02a3b1',
                    sequence: 481,
                    timestamp: '2026-11-15T00:26:00Z',
                    event_type: 'TOOL_INVOCATION',
                    agent_id: 'a8b1c2d3',
                    tool_name: 'payments.refund',
                    prev_hash: '9a84f3c011e4b882',
                    payload_hash: '3f042e88102b489a',
                    chain_hash: 'd6e81249b01f37e1',
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/tools/audit?limit=25" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/tools/audit?limit=25", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get(
    "http://localhost:8000/api/v1/tools/audit",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    params={"limit": 25}
)`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/tools/audit?limit=25', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
    ],
  },
  {
    id: 'credentials',
    category: 'credentials',
    title: 'Credentials & Vault',
    authBadge: 'Bearer JWT',
    endpoints: [
      {
        id: 'list-credentials',
        category: 'credentials',
        title: 'List credentials',
        method: 'GET',
        path: '/api/v1/credentials',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Lists Bring-Your-Own-Key (BYOK) credential profiles stored securely in HashiCorp Vault KV v2. Secrets are masked and never returned in plaintext.`,
        params: [],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Credentials list returned with masked keys.',
            body: JSON.stringify(
              {
                credentials: [
                  {
                    id: 'cred_openai_prod',
                    provider: 'openai',
                    label: 'OpenAI Enterprise Key',
                    last_verified: '2026-11-14T22:00:00Z',
                    status: 'active',
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/credentials" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/credentials", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get("http://localhost:8000/api/v1/credentials", headers={"Authorization": "Bearer $ARDA_JWT"})`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/credentials', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
      {
        id: 'create-credential',
        category: 'credentials',
        title: 'Create credential',
        method: 'POST',
        path: '/api/v1/credentials',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Encrypts and persists an LLM provider API key in HashiCorp Vault. Only tenant administrators can manage credentials.`,
        params: [
          {
            name: 'provider',
            req: 'required',
            type: 'string',
            desc: 'Provider identifier (e.g. openai, anthropic, google, openrouter).',
          },
          {
            name: 'api_key',
            req: 'required',
            type: 'string (secret)',
            desc: 'Plaintext secret API key to be encrypted into Vault.',
          },
          {
            name: 'label',
            req: 'optional',
            type: 'string',
            desc: 'User-friendly name for this credential.',
          },
        ],
        responses: [
          {
            code: '201',
            label: 'stored',
            color: 'emerald',
            text: 'Key safely encrypted into Vault.',
            body: JSON.stringify(
              {
                id: 'cred_openai_prod',
                provider: 'openai',
                status: 'stored',
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X POST "http://localhost:8000/api/v1/credentials" \\
  -H "Authorization: Bearer $ARDA_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "anthropic",
    "api_key": "sk-ant-api03-...",
    "label": "Production Claude 3.5 Sonnet"
  }'`,
          go: `req, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/credentials", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.post(
    "http://localhost:8000/api/v1/credentials",
    headers={"Authorization": "Bearer $ARDA_JWT"},
    json={"provider": "anthropic", "api_key": "sk-ant-api03-..."}
)`,
          typescript: `await fetch('http://localhost:8000/api/v1/credentials', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ provider: 'anthropic', api_key: 'sk-...' }),
});`,
        },
      },
    ],
  },
  {
    id: 'tenants',
    category: 'tenants',
    title: 'Tenants & Membership',
    authBadge: 'Bearer JWT',
    endpoints: [
      {
        id: 'get-me',
        category: 'tenants',
        title: 'Get current user',
        method: 'GET',
        path: '/api/v1/auth/me',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Returns the identity, tenant binding, and role permissions of the currently authenticated token subject.`,
        params: [],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'User profile returned.',
            body: JSON.stringify(
              {
                id: 'usr_9281a',
                email: 'admin@acme.com',
                name: 'Dev Admin',
                role: 'company_admin',
                tenant_id: 'tenant_acme_core',
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/auth/me" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/auth/me", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get("http://localhost:8000/api/v1/auth/me", headers={"Authorization": "Bearer $ARDA_JWT"})`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/auth/me', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
      {
        id: 'list-members',
        category: 'tenants',
        title: 'List tenant members',
        method: 'GET',
        path: '/api/v1/tenants/:tenantId/members',
        auth: 'Bearer JWT · Authorization',
        authType: 'bearer-jwt',
        description: `Lists all registered members, reviewers, and developers belonging to the specified tenant organization.`,
        params: [
          {
            name: 'tenantId',
            req: 'required',
            type: 'UUID (path)',
            desc: 'Tenant UUID.',
          },
        ],
        responses: [
          {
            code: '200',
            label: 'ok',
            color: 'emerald',
            text: 'Members list returned.',
            body: JSON.stringify(
              {
                members: [
                  {
                    id: 'usr_812',
                    email: 'reviewer@acme.com',
                    name: 'Alex Reviewer',
                    role: 'reviewer',
                    joined_at: '2026-10-01T12:00:00Z',
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
        snippets: {
          curl: `curl -X GET "http://localhost:8000/api/v1/tenants/tenant_acme_core/members" \\
  -H "Authorization: Bearer $ARDA_JWT"`,
          go: `req, _ := http.NewRequest("GET", "http://localhost:8000/api/v1/tenants/tenant_acme_core/members", nil)
req.Header.Set("Authorization", "Bearer $ARDA_JWT")
http.DefaultClient.Do(req)`,
          python: `res = requests.get("http://localhost:8000/api/v1/tenants/tenant_acme_core/members", headers={"Authorization": "Bearer $ARDA_JWT"})`,
          typescript: `const res = await fetch('http://localhost:8000/api/v1/tenants/tenant_acme_core/members', {
  headers: { 'Authorization': 'Bearer ' + token }
});`,
        },
      },
    ],
  },
];

// Helper to look up an endpoint by ID
export function getEndpointById(id: string): EndpointDoc | undefined {
  for (const group of ENDPOINT_GROUPS) {
    const found = group.endpoints.find((ep) => ep.id === id);
    if (found) return found;
  }
  return undefined;
}

// Flattened list for navigation
export const ALL_ENDPOINTS: EndpointDoc[] = ENDPOINT_GROUPS.flatMap((g) => g.endpoints);
