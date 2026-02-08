;; Agent Work Liquidity Pool Contract
;; DeFi primitive for agent work micro-lending
;;
;; Liquidity providers (LPs) deposit STX into pool
;; Agents borrow from pool to pay for sub-tasks
;; Agents repay with profit sharing (10%)
;; LPs earn yield from agent productivity

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-LOAN-NOT-FOUND (err u103))
(define-constant ERR-LOW-REPUTATION (err u104))
(define-constant ERR-ALREADY-BORROWED (err u105))
(define-constant ERR-INVALID-AMOUNT (err u106))

;; Minimum reputation required to borrow
(define-constant MIN-REPUTATION u50)

;; Profit share percentage (10% = u10)
(define-constant PROFIT-SHARE-PERCENT u10)

;; Data Variables
(define-data-var total-liquidity uint u0)
(define-data-var total-borrowed uint u0)
(define-data-var loan-counter uint u0)
(define-data-var total-profit-earned uint u0)

;; Data Maps

;; Liquidity Provider balances
(define-map liquidity-providers
  principal
  {
    balance: uint,
    deposited-at: uint,
    total-earned: uint
  }
)

;; Active loans
(define-map active-loans
  uint ;; loan-id
  {
    borrower: principal,
    amount: uint,
    borrowed-at: uint,
    reputation: uint,
    purpose: (string-ascii 100)
  }
)

;; Agent reputation scores
(define-map agent-reputation
  principal
  {
    score: uint,
    total-loans: uint,
    successful-repayments: uint,
    defaults: uint
  }
)

;; Read-only functions

;; Get total liquidity in pool
(define-read-only (get-total-liquidity)
  (var-get total-liquidity)
)

;; Get total borrowed amount
(define-read-only (get-total-borrowed)
  (var-get total-borrowed)
)

;; Get pool utilization (borrowed / liquidity * 100)
(define-read-only (get-utilization)
  (let ((liquidity (var-get total-liquidity)))
    (if (is-eq liquidity u0)
      u0
      (/ (* (var-get total-borrowed) u100) liquidity)
    )
  )
)

;; Get available liquidity (not currently lent out)
(define-read-only (get-available-liquidity)
  (- (var-get total-liquidity) (var-get total-borrowed))
)

;; Get LP balance
(define-read-only (get-lp-balance (lp principal))
  (default-to
    { balance: u0, deposited-at: u0, total-earned: u0 }
    (map-get? liquidity-providers lp)
  )
)

;; Get loan details
(define-read-only (get-loan (loan-id uint))
  (map-get? active-loans loan-id)
)

;; Get agent reputation
(define-read-only (get-reputation (agent principal))
  (default-to
    { score: u100, total-loans: u0, successful-repayments: u0, defaults: u0 }
    (map-get? agent-reputation agent)
  )
)

;; Calculate APY based on pool performance
;; Simplified: APY = (total-profit / total-liquidity) * 100
(define-read-only (get-apy)
  (let ((liquidity (var-get total-liquidity)))
    (if (is-eq liquidity u0)
      u0
      (/ (* (var-get total-profit-earned) u100) liquidity)
    )
  )
)

;; Public functions

;; Deposit liquidity to pool
(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    ;; Update total liquidity
    (var-set total-liquidity (+ (var-get total-liquidity) amount))

    ;; Update LP balance
    (match (map-get? liquidity-providers tx-sender)
      lp-data
        (map-set liquidity-providers tx-sender
          {
            balance: (+ (get balance lp-data) amount),
            deposited-at: (get deposited-at lp-data),
            total-earned: (get total-earned lp-data)
          }
        )
      ;; First deposit
      (map-set liquidity-providers tx-sender
        {
          balance: amount,
          deposited-at: block-height,
          total-earned: u0
        }
      )
    )

    (ok true)
  )
)

;; Withdraw liquidity from pool
(define-public (withdraw (amount uint))
  (let
    (
      (lp-data (unwrap! (map-get? liquidity-providers tx-sender) ERR-INSUFFICIENT-BALANCE))
      (lp-balance (get balance lp-data))
      (available (get-available-liquidity))
    )

    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount lp-balance) ERR-INSUFFICIENT-BALANCE)
    (asserts! (<= amount available) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Transfer STX from contract to user
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))

    ;; Update total liquidity
    (var-set total-liquidity (- (var-get total-liquidity) amount))

    ;; Update LP balance
    (if (is-eq amount lp-balance)
      ;; Full withdrawal - remove from map
      (map-delete liquidity-providers tx-sender)
      ;; Partial withdrawal - update balance
      (map-set liquidity-providers tx-sender
        {
          balance: (- lp-balance amount),
          deposited-at: (get deposited-at lp-data),
          total-earned: (get total-earned lp-data)
        }
      )
    )

    (ok true)
  )
)

;; Borrow from pool (for agents)
(define-public (borrow (amount uint) (reputation uint) (purpose (string-ascii 100)))
  (let
    (
      (available (get-available-liquidity))
      (loan-id (+ (var-get loan-counter) u1))
    )

    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= reputation MIN-REPUTATION) ERR-LOW-REPUTATION)
    (asserts! (>= available amount) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Transfer STX from contract to borrower
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))

    ;; Update total borrowed
    (var-set total-borrowed (+ (var-get total-borrowed) amount))

    ;; Increment loan counter
    (var-set loan-counter loan-id)

    ;; Create loan record
    (map-set active-loans loan-id
      {
        borrower: tx-sender,
        amount: amount,
        borrowed-at: block-height,
        reputation: reputation,
        purpose: purpose
      }
    )

    ;; Update agent reputation (increment total loans)
    (match (map-get? agent-reputation tx-sender)
      rep-data
        (map-set agent-reputation tx-sender
          {
            score: (get score rep-data),
            total-loans: (+ (get total-loans rep-data) u1),
            successful-repayments: (get successful-repayments rep-data),
            defaults: (get defaults rep-data)
          }
        )
      ;; First loan
      (map-set agent-reputation tx-sender
        {
          score: reputation,
          total-loans: u1,
          successful-repayments: u0,
          defaults: u0
        }
      )
    )

    (ok loan-id)
  )
)

;; Repay loan with profit sharing
(define-public (repay (loan-id uint) (profit uint))
  (let
    (
      (loan (unwrap! (map-get? active-loans loan-id) ERR-LOAN-NOT-FOUND))
      (loan-amount (get amount loan))
      (profit-share (/ (* profit PROFIT-SHARE-PERCENT) u100))
      (repay-amount (+ loan-amount profit-share))
    )

    (asserts! (is-eq (get borrower loan) tx-sender) ERR-NOT-AUTHORIZED)

    ;; Transfer repayment from borrower to contract
    (try! (stx-transfer? repay-amount tx-sender (as-contract tx-sender)))

    ;; Update total borrowed (reduce by loan amount)
    (var-set total-borrowed (- (var-get total-borrowed) loan-amount))

    ;; Update total profit
    (var-set total-profit-earned (+ (var-get total-profit-earned) profit-share))

    ;; Update total liquidity (add profit share)
    (var-set total-liquidity (+ (var-get total-liquidity) profit-share))

    ;; Delete loan record
    (map-delete active-loans loan-id)

    ;; Update agent reputation (successful repayment)
    (match (map-get? agent-reputation tx-sender)
      rep-data
        (let
          (
            (new-successful (+ (get successful-repayments rep-data) u1))
            (total (get total-loans rep-data))
            (new-score (/ (* new-successful u100) total))
          )
          (map-set agent-reputation tx-sender
            {
              score: new-score,
              total-loans: total,
              successful-repayments: new-successful,
              defaults: (get defaults rep-data)
            }
          )
        )
      ;; Should not happen, but handle it
      (ok true)
    )

    (ok true)
  )
)

;; Mark loan as defaulted (can be called by contract owner or after timeout)
(define-public (mark-default (loan-id uint))
  (let
    (
      (loan (unwrap! (map-get? active-loans loan-id) ERR-LOAN-NOT-FOUND))
    )

    ;; Only contract owner can mark defaults for now
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)

    ;; Update agent reputation (default)
    (match (map-get? agent-reputation (get borrower loan))
      rep-data
        (let
          (
            (new-defaults (+ (get defaults rep-data) u1))
            (total (get total-loans rep-data))
            (successful (get successful-repayments rep-data))
            (new-score (if (> total u0)
                        (/ (* successful u100) total)
                        u0))
          )
          (map-set agent-reputation (get borrower loan)
            {
              score: new-score,
              total-loans: total,
              successful-repayments: successful,
              defaults: new-defaults
            }
          )
        )
      ;; Should not happen
      (ok true)
    )

    ;; Delete loan (consider it lost)
    (map-delete active-loans loan-id)

    (ok true)
  )
)

;; Initialize contract
(begin
  (var-set total-liquidity u0)
  (var-set total-borrowed u0)
  (var-set loan-counter u0)
  (var-set total-profit-earned u0)
)
