# Recognition protocol v1

Endpoint `/ws/v1/recognition`. Use WebSocket text frames containing a single JSON object. The maximum incoming message size is 4,096 UTF-8 bytes. All envelopes require `type`, integer `schema_version: 1` and an RFC 3339 timezone-aware `timestamp` from the sender's wall clock. The server emits UTC. These timestamps are informational and cannot establish ordering across clocks. The client should use WSS from an HTTPS page.

| Message | Direction | Additional fields | Phase 1 behaviour |
| --- | --- | --- | --- |
| `hello` | Client → server | None | Required within five seconds after connection |
| `ready` | Server → client | `recognition: "unavailable"` | Confirms transport handshake |
| `ping` | Client → server | `request_id`, UUID | Accepted after handshake |
| `pong` | Server → client | Matching `request_id` | Correlates response with client ping |
| `error` | Server → client | `code` | Reports safe failure code |

Pydantic models are in `backend/app/schemas/recognition.py`, with corresponding TypeScript interfaces in `frontend/src/types/contracts.ts`.

`invalid_message` covers malformed JSON, unknown schema, unsupported types, invalid fields and binary messages. `unexpected_message` covers out-of-order messages. During handshake these errors close the socket with 1008, as does `handshake_timeout`. After handshake validation errors allow recovery. Oversized messages close with 1009. The server closes idle sessions after 45 seconds with 1008. An unapproved browser origin is rejected before acceptance. Connections from non-browser clients can omit Origin. The browser check uses a five-second end-to-end deadline and closes after one exchange. There is no session resumption. Future persistent clients should send ping before the idle deadline and reconnect with bounded backoff.

## Reserved message design

| Type | Direction | Proposed payload |
| --- | --- | --- |
| `feature_metadata` | Client → server | Sequence, monotonic capture offset, dimensions, feature schema ID, landmark masks, mirror flag |
| `capture_status` | Client → server | Capture state, availability and a bounded reason code |
| `recognition_result` | Server → client | Sequence range, model ID, feature schema ID, class ID and calibrated confidence |
| `recognition_unknown` | Server → client | Sequence range and rejection reason, without a predicted label |
| `diagnostic` | Server → authorized client | Bounded counters and processing duration |

Capture offsets are relative to the session and based on a monotonic client clock. Rejection and capture quality are distinct states. Confidence is a candidate model score after calibration. Future frame references carry metadata only by default. Payload transport, retention, gating and backpressure require design and measurement before adoption. These reserved types are rejected by Phase 1.
