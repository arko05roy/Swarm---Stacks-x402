;; Agent Work Liquidity Pool Contract
;; DeFi primitive for agent work micro-lending
;;
;; LPs deposit STX -> Agents borrow -> Agents repay with 10% profit share -> LPs earn yield

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-LOAN-NOT-FOUND (err u103))
(define-constant ERR-LOW-REPUTATION (err u104))
(define-constant ERR-INVALID-AMOUNT (err u106))
(define-constant MIN-REPUTATION u50)
(define-constant PROFIT-SHARE-PERCENT u10)

;; Data Variables
(define-data-var total-liquidity uint u0)
(define-data-var total-borrowed uint u0)
(define-data-var loan-counter uint u0)
(define-data-var total-profit-earned uint u0)

;; LP balances
(define-map liquidity-providers
  principal
  { balance: uint, deposited-at: uint, total-earned: uint }
)

;; Active loans
(define-map active-loans
  uint
  { borrower: principal, amount: uint, borrowed-at: uint, reputation: uint, purpose: (string-ascii 100) }
)

;; Agent reputation
(define-map agent-reputation
  principal
  { score: uint, total-loans: uint, successful-repayments: uint, defaults: uint }
)

;; Read-only functions

(define-read-only (get-total-liquidity)
  (var-get total-liquidity)
)

(define-read-only (get-total-borrowed)
  (var-get total-borrowed)
)

(define-read-only (get-available-liquidity)
  (- (var-get total-liquidity) (var-get total-borrowed))
)

(define-read-only (get-utilization)
  (let ((liquidity (var-get total-liquidity)))
    (if (is-eq liquidity u0)
      u0
      (/ (* (var-get total-borrowed) u100) liquidity)
    )
  )
)

(define-read-only (get-lp-balance (lp principal))
  (default-to
    { balance: u0, deposited-at: u0, total-earned: u0 }
    (map-get? liquidity-providers lp)
  )
)

(define-read-only (get-loan (loan-id uint))
  (map-get? active-loans loan-id)
)

(define-read-only (get-reputation (agent principal))
  (default-to
    { score: u100, total-loans: u0, successful-repayments: u0, defaults: u0 }
    (map-get? agent-reputation agent)
  )
)

(define-read-only (get-apy)
  (let ((liquidity (var-get total-liquidity)))
    (if (is-eq liquidity u0)
      u0
      (/ (* (var-get total-profit-earned) u100) liquidity)
    )
  )
)

(define-read-only (get-pool-stats)
  {
    total-liquidity: (var-get total-liquidity),
    total-borrowed: (var-get total-borrowed),
    available: (- (var-get total-liquidity) (var-get total-borrowed)),
    loan-count: (var-get loan-counter),
    total-profit: (var-get total-profit-earned),
    apy: (get-apy)
  }
)

;; Public functions

;; Deposit STX to pool
(define-public (deposit (amount uint))
  (let ((depositor tx-sender))
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    ;; Transfer from depositor to contract
    (try! (stx-transfer? amount depositor (as-contract tx-sender)))
    ;; Update pool
    (var-set total-liquidity (+ (var-get total-liquidity) amount))
    ;; Update LP record
    (match (map-get? liquidity-providers depositor)
      lp-data
        (map-set liquidity-providers depositor
          { balance: (+ (get balance lp-data) amount), deposited-at: (get deposited-at lp-data), total-earned: (get total-earned lp-data) }
        )
      (map-set liquidity-providers depositor
        { balance: amount, deposited-at: block-height, total-earned: u0 }
      )
    )
    (ok true)
  )
)

;; Withdraw STX from pool
(define-public (withdraw (amount uint))
  (let
    (
      (withdrawer tx-sender)
      (lp-data (unwrap! (map-get? liquidity-providers withdrawer) ERR-INSUFFICIENT-BALANCE))
      (lp-balance (get balance lp-data))
      (available (- (var-get total-liquidity) (var-get total-borrowed)))
    )
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount lp-balance) ERR-INSUFFICIENT-BALANCE)
    (asserts! (<= amount available) ERR-INSUFFICIENT-LIQUIDITY)
    ;; Transfer from contract to withdrawer
    (try! (as-contract (stx-transfer? amount tx-sender withdrawer)))
    ;; Update pool
    (var-set total-liquidity (- (var-get total-liquidity) amount))
    ;; Update LP record
    (if (is-eq amount lp-balance)
      (map-delete liquidity-providers withdrawer)
      (map-set liquidity-providers withdrawer
        { balance: (- lp-balance amount), deposited-at: (get deposited-at lp-data), total-earned: (get total-earned lp-data) }
      )
    )
    (ok true)
  )
)

;; Borrow from pool (for agents)
(define-public (borrow (amount uint) (reputation uint) (purpose (string-ascii 100)))
  (let
    (
      (borrower tx-sender)
      (available (- (var-get total-liquidity) (var-get total-borrowed)))
      (loan-id (+ (var-get loan-counter) u1))
    )
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= reputation MIN-REPUTATION) ERR-LOW-REPUTATION)
    (asserts! (>= available amount) ERR-INSUFFICIENT-LIQUIDITY)
    ;; Transfer from contract to borrower
    (try! (as-contract (stx-transfer? amount tx-sender borrower)))
    ;; Update state
    (var-set total-borrowed (+ (var-get total-borrowed) amount))
    (var-set loan-counter loan-id)
    ;; Create loan record
    (map-set active-loans loan-id
      { borrower: borrower, amount: amount, borrowed-at: block-height, reputation: reputation, purpose: purpose }
    )
    ;; Update reputation record
    (match (map-get? agent-reputation borrower)
      rep-data
        (map-set agent-reputation borrower
          { score: (get score rep-data), total-loans: (+ (get total-loans rep-data) u1), successful-repayments: (get successful-repayments rep-data), defaults: (get defaults rep-data) }
        )
      (map-set agent-reputation borrower
        { score: reputation, total-loans: u1, successful-repayments: u0, defaults: u0 }
      )
    )
    (ok loan-id)
  )
)

;; Repay loan with profit sharing (10%)
(define-public (repay (loan-id uint) (profit uint))
  (let
    (
      (repayer tx-sender)
      (loan (unwrap! (map-get? active-loans loan-id) ERR-LOAN-NOT-FOUND))
      (loan-amount (get amount loan))
      (profit-share (/ (* profit PROFIT-SHARE-PERCENT) u100))
      (repay-amount (+ loan-amount profit-share))
    )
    (asserts! (is-eq (get borrower loan) repayer) ERR-NOT-AUTHORIZED)
    ;; Transfer repayment from borrower to contract
    (try! (stx-transfer? repay-amount repayer (as-contract tx-sender)))
    ;; Update state
    (var-set total-borrowed (- (var-get total-borrowed) loan-amount))
    (var-set total-profit-earned (+ (var-get total-profit-earned) profit-share))
    (var-set total-liquidity (+ (var-get total-liquidity) profit-share))
    ;; Delete loan
    (map-delete active-loans loan-id)
    ;; Update reputation
    (match (map-get? agent-reputation repayer)
      rep-data
        (let
          (
            (new-successful (+ (get successful-repayments rep-data) u1))
            (total (get total-loans rep-data))
          )
          (map-set agent-reputation repayer
            { score: (/ (* new-successful u100) total), total-loans: total, successful-repayments: new-successful, defaults: (get defaults rep-data) }
          )
        )
      true
    )
    (ok true)
  )
)

;; Mark loan as defaulted (owner only)
(define-public (mark-default (loan-id uint))
  (let
    (
      (loan (unwrap! (map-get? active-loans loan-id) ERR-LOAN-NOT-FOUND))
      (defaulter (get borrower loan))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    ;; Update reputation
    (match (map-get? agent-reputation defaulter)
      rep-data
        (let
          (
            (new-defaults (+ (get defaults rep-data) u1))
            (total (get total-loans rep-data))
            (successful (get successful-repayments rep-data))
          )
          (map-set agent-reputation defaulter
            { score: (if (> total u0) (/ (* successful u100) total) u0), total-loans: total, successful-repayments: successful, defaults: new-defaults }
          )
        )
      true
    )
    (map-delete active-loans loan-id)
    (ok true)
  )
)
