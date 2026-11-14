import { EXTENSION_PREREQUISITES } from './extension-data.mjs';
// Explicit 66-ID candidate graph; existing first 63 identities preserved.
export const PREREQUISITE_RULE_DATA = [
  {
    "id": "first-steps",
    "requires": [],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "coin-math",
    "requires": [
      "first-steps"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "greeting",
    "requires": [
      "first-steps"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "safe-buy",
    "requires": [
      "coin-math"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "backpack",
    "requires": [
      "first-steps"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "shells",
    "requires": [
      "backpack",
      "coin-math"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "catalog",
    "requires": [
      "greeting",
      "backpack"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "discount",
    "requires": [
      "coin-math",
      "safe-buy"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "select-items",
    "requires": [
      "shells",
      "catalog",
      "discount"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "invalid-input",
    "requires": [
      "discount",
      "greeting"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "ledger",
    "requires": [
      "catalog",
      "invalid-input"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "stock-class",
    "requires": [
      "discount",
      "catalog"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "generator",
    "requires": [
      "shells",
      "discount"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "test-case",
    "requires": [
      "discount",
      "invalid-input"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "tool-router",
    "requires": [
      "catalog",
      "discount"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "permission",
    "requires": [
      "tool-router",
      "safe-buy"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "dedupe",
    "requires": [
      "permission",
      "shells"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "retrieval",
    "requires": [
      "greeting",
      "shells",
      "discount"
    ],
    "source": "access-v1 legacy foundations"
  },
  {
    "id": "harbor-rations",
    "requires": [
      "coin-math",
      "discount"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "harbor-labels",
    "requires": [
      "harbor-rations",
      "greeting"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "harbor-fare",
    "requires": [
      "harbor-labels",
      "safe-buy"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "harbor-route",
    "requires": [
      "harbor-fare",
      "shells"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "harbor-quantity",
    "requires": [
      "harbor-route",
      "invalid-input"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "harbor-manifest",
    "requires": [
      "harbor-quantity",
      "select-items"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-stock",
    "requires": [
      "harbor-manifest",
      "catalog"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-receipts",
    "requires": [
      "market-stock"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-intersection",
    "requires": [
      "market-receipts"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-ranking",
    "requires": [
      "market-intersection"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-copy",
    "requires": [
      "market-ranking"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "market-checkout",
    "requires": [
      "market-copy"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-defaults",
    "requires": [
      "market-checkout",
      "discount"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-closure",
    "requires": [
      "workshop-defaults"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-composition",
    "requires": [
      "workshop-closure"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-wallet",
    "requires": [
      "workshop-composition",
      "stock-class"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-iterable",
    "requires": [
      "workshop-wallet",
      "generator"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "workshop-result",
    "requires": [
      "workshop-iterable",
      "test-case"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-json",
    "requires": [
      "workshop-result",
      "ledger"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-regex",
    "requires": [
      "archive-json"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-counter",
    "requires": [
      "archive-regex"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-queue",
    "requires": [
      "archive-counter"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-median",
    "requires": [
      "archive-queue"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "archive-distance",
    "requires": [
      "archive-median"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-test-cases",
    "requires": [
      "archive-distance",
      "test-case"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-binary",
    "requires": [
      "observatory-test-cases"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-prefix",
    "requires": [
      "observatory-binary"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-cache",
    "requires": [
      "observatory-prefix"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-replay",
    "requires": [
      "observatory-cache"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "observatory-diagnose",
    "requires": [
      "observatory-replay"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-schema",
    "requires": [
      "observatory-diagnose",
      "tool-router"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-permission",
    "requires": [
      "beacon-schema",
      "permission"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-idempotency",
    "requires": [
      "beacon-permission",
      "dedupe"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-retrieval",
    "requires": [
      "beacon-idempotency",
      "retrieval"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-evaluation",
    "requires": [
      "beacon-retrieval",
      "test-case"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "beacon-budget",
    "requires": [
      "beacon-evaluation"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-lifecycle",
    "requires": [
      "workshop-result",
      "workshop-iterable",
      "engineering-cleanup"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-cache",
    "requires": [
      "workshop-closure",
      "workshop-defaults",
      "basics-decorators"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-shipment",
    "requires": [
      "workshop-wallet",
      "market-copy"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-provider",
    "requires": [
      "protocol-shipment",
      "workshop-composition"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-stream",
    "requires": [
      "protocol-lifecycle",
      "archive-json"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "protocol-pipeline",
    "requires": [
      "protocol-stream",
      "protocol-lifecycle"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "lifecycle-multi-resource",
    "requires": [
      "protocol-lifecycle"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "lifecycle-async-stream",
    "requires": [
      "protocol-stream",
      "lifecycle-multi-resource",
      "async-cancel-and-join"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "lifecycle-bounded-map",
    "requires": [
      "lifecycle-async-stream"
    ],
    "source": "fixed lesson metadata plus explicit access-v1 foundational bridges"
  },
  {
    "id": "async-await-relay",
    "requires": [
      "workshop-composition",
      "invalid-input"
    ],
    "source": "foundations-v0.1 explicit prerequisite proposal; no learning inferred"
  },
  {
    "id": "async-event-handshake",
    "requires": [
      "async-await-relay"
    ],
    "source": "foundations-v0.1 explicit prerequisite proposal; no learning inferred"
  },
  {
    "id": "async-cancel-and-join",
    "requires": [
      "async-event-handshake",
      "protocol-lifecycle"
    ],
    "source": "foundations-v0.1 explicit prerequisite proposal; no learning inferred"
  },
  ...EXTENSION_PREREQUISITES,
];
