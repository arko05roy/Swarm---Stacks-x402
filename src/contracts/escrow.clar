;; Swarm Escrow Contract
;; Holds payments until task completion

;; Data maps
(define-map escrow-payments
  { task-id: (string-ascii 64) }
  {
    amount: uint,
    payer: principal,
    recipient: principal,
    locked: bool,
    created-at: uint
  }
)

;; Contract owner (deployer)
(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PAYMENT-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-RELEASED (err u102))
(define-constant ERR-INSUFFICIENT-FUNDS (err u103))

;; Lock payment in escrow
(define-public (lock-payment (amount uint) (task-id (string-ascii 64)) (recipient principal))
  (let
    (
      (payer tx-sender)
    )
    ;; Transfer STX from payer to contract
    (try! (stx-transfer? amount payer (as-contract tx-sender)))

    ;; Store escrow data
    (ok (map-set escrow-payments
      { task-id: task-id }
      {
        amount: amount,
        payer: payer,
        recipient: recipient,
        locked: true,
        created-at: block-height
      }
    ))
  )
)

;; Release payment to recipient (payer or contract owner can release)
(define-public (release-payment (task-id (string-ascii 64)))
  (let
    (
      (payment-data (unwrap! (map-get? escrow-payments { task-id: task-id }) ERR-PAYMENT-NOT-FOUND))
      (amount (get amount payment-data))
      (payer (get payer payment-data))
      (recipient (get recipient payment-data))
      (locked (get locked payment-data))
    )
    ;; Verify caller is the payer OR contract owner (for automated releases)
    (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender CONTRACT-OWNER)) ERR-NOT-AUTHORIZED)

    ;; Verify payment is still locked
    (asserts! locked ERR-ALREADY-RELEASED)

    ;; Transfer STX from contract to recipient
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))

    ;; Mark as released
    (ok (map-set escrow-payments
      { task-id: task-id }
      (merge payment-data { locked: false })
    ))
  )
)

;; Refund payment to payer (if task fails)
(define-public (refund-payment (task-id (string-ascii 64)))
  (let
    (
      (payment-data (unwrap! (map-get? escrow-payments { task-id: task-id }) ERR-PAYMENT-NOT-FOUND))
      (amount (get amount payment-data))
      (payer (get payer payment-data))
      (locked (get locked payment-data))
    )
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender payer) ERR-NOT-AUTHORIZED)

    ;; Verify payment is still locked
    (asserts! locked ERR-ALREADY-RELEASED)

    ;; Transfer STX from contract back to payer
    (try! (as-contract (stx-transfer? amount tx-sender payer)))

    ;; Mark as released
    (ok (map-set escrow-payments
      { task-id: task-id }
      (merge payment-data { locked: false })
    ))
  )
)

;; Read-only: Get escrow status
(define-read-only (get-escrow-status (task-id (string-ascii 64)))
  (map-get? escrow-payments { task-id: task-id })
)
