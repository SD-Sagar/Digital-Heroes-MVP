# Digital Heroes Complete Workflow

This document explains the overarching logic, mechanics, and terminology used in the Digital Heroes application.

## 1. New Random vs Algorithmic Draws
Currently, the Admin can create two types of draws: **Random** or **Algorithmic**.
- **Random:** A standard lottery draw. 5 numbers are picked purely by chance (via `Math.random()`).
- **Algorithmic (Conceptual):** A more advanced draw where the system's algorithm picks numbers based on historic score distributions, preventing too many people from winning or ensuring a guaranteed winner. *(Note: Currently, both just generate random numbers in the code, but the label is for future algorithmic implementations).*

## 2. Your Contribution (10% of Subscription)
When a user subscribes, they pay **$15/month**.
When they select a charity, they choose a "Contribution Percentage", e.g., **10%**.
- **How it works:** This does *not* mean the user pays extra. It means 10% of their existing $15 subscription fee (**$1.50**) is strictly earmarked for that specific charity.
- The Admin's "Charity Impact" metric tracks the sum of all these specific, user-allocated earmarks.

## 3. The Match Boxes (3, 4, and 5 Matches)
When the Admin clicks **Run Simulation**, the system compares every user's *5 most recent golf scores* against the *5 drawn numbers*.
- **5 Match (Jackpot):** The user matched all 5 numbers perfectly. They take the largest slice of the Prize Pool (e.g., 40%).
- **4 Match:** The user matched 4 out of 5 numbers. They share the medium slice (35%).
- **3 Match:** The user matched 3 out of 5 numbers. They share the smallest slice (25%).

These boxes in the Admin UI allow you to see *exactly* how many people won each tier, and how much money they will get, **before** you actually publish the draw.

## 4. Rollovers (When No One Wins)
Because the draw numbers are generated independently, it is statistically possible that a week passes where **no one matches 5 numbers**.
- **What happens to the money?** If a tier (e.g., the 5-Match Jackpot) has zero winners, the money allocated to that tier does not vanish. It is preserved and officially **rolls over** into the `new_jackpot` for the *next* draw.
- This creates massive excitement. Just like a real lottery, if no one wins the jackpot this week, next week's prize pool will be significantly larger, driving more users to practice and log their scores!

## 4. End-to-End Complete Scenario

### Step 1: User Onboarding
1. A user signs up and pays $15 for a Monthly Subscription.
2. They browse the **Charities** catalog and select "Ocean Cleanup", setting their contribution to 20% ($3/month goes to the Ocean).
3. They play golf and log their Stableford points on the dashboard (e.g., 34, 42, 12, 18, 29).

### Step 2: Draw Orchestration (Admin)
1. The Admin clicks **New Random Draw**. A draft draw is created.
2. The Admin clicks **Run Simulation**. 
   - The engine picks 5 numbers (e.g., 34, 42, 12, 5, 9).
   - The system sees the user matched three numbers (34, 42, 12).
   - The simulation shows: **3 Match: 1 winner**.
3. The Admin is satisfied with the results and clicks **Publish to Users**.
4. The system updates the draw status to published and officially inserts the user into the `Winners` table.

### Step 3: Fulfillment
1. The user logs in, checks the **My Winnings** tab, and sees they won $5.25 for matching 3 numbers!
2. The user uploads their ID to prove they are legitimate.
3. The Admin goes to the **Winners & Payouts** tab.
4. The Admin reviews the ID and clicks **Approve Identity**.
5. The Admin wires the $5.25 via bank transfer, then clicks **Mark Dispensed**.
6. The platform's **Total Paid** metric increases by $5.25.




# Digital Heroes: Core Workflow & Mechanics

This document outlines the exact flow of data, money, and mechanics within the Digital Heroes platform. Use this as your "source of truth" when presenting the platform's logic to stakeholders.

## 1. The Core Loop (User Journey)
1. **Subscribe**: A user pays a monthly subscription (e.g., $15/month). 
2. **Earmark Charity**: During signup, the user selects a partnered charity. A strict 10% of their subscription is routed to this charity's cumulative impact fund.
3. **Log Scores**: After playing a real-life round of golf, the user logs their Stableford score (ranging from 1 to 45).
4. **The "Ticket"**: The database strictly maintains a rolling window of the user's **Latest 5 Scores**. This array of 5 numbers acts as their "Lottery Ticket" for all active draws.

## 2. The Draw Engines (Admin Orchestration)
The platform features two distinct calculation engines to generate the weekly winning numbers.

- **Random Engine**: Generates 5 purely random numbers between 1 and 45. This mimics a traditional, highly volatile lottery system.
- **Algorithmic Engine (Premium)**: Rather than pure luck, this engine analyzes real-world Professional Golf (PGA) performance curves to generate a sequence of numbers that represents an "optimal" professional round. It is mathematically designed to reward users whose scores align with professional performance distributions, blending luck with skill-based gamification.

## 3. The Lifecycle of a Draw
Every draw goes through a strict 3-stage pipeline to ensure administrative oversight and financial security.

### Stage 1: Draft
The Admin creates a new draw and selects the engine (Random or Algorithmic). No numbers are generated yet.

### Stage 2: Simulation
The Admin clicks "Run Simulation".
1. The engine fires and generates the 5 Winning Numbers.
2. The system scans the entire database of active users and compares the winning numbers against every user's current "Latest 5 Scores".
3. The system calculates exactly how many users matched 5, 4, or 3 numbers.
4. **The Prize Pool**: The pool is sized dynamically based on the total number of active subscribers.
5. The system forecasts the payouts but **does not** credit any user accounts. This allows the Admin to audit the financial liability before going live.

### Stage 3: Published (Fulfillment)
The Admin clicks "Publish to Users".
1. The system locks the draw.
2. It performs one final, precise recalculation of all matches to ensure 100% accuracy (in case users updated their scores during the simulation window).
3. The system slices the Prize Pool and inserts permanent rows into the `winners` database table for every user who achieved 3, 4, or 5 matches.
4. Users instantly see their winnings appear on their dashboard under "My Participations".

## 4. Prize Pool Slicing & Economics
The total prize pool is distributed as follows:
- **40%** reserved for 5-Match Winners (The Jackpot)
- **35%** reserved for 4-Match Winners
- **25%** reserved for 3-Match Winners

*Note: If there are multiple winners in a tier, that tier's cash allocation is split evenly among them.*

## 5. Fulfillment & Verification
Winning users are credited with a "Pending" payout status. The Admin receives a notification in the "Fulfillment" dashboard. 
- The Admin reviews the user's identity proof (anti-fraud measure).
- The Admin clicks "Approve", officially verifying the user.
- The Admin processes the bank transfer/payment out-of-band and clicks "Mark Dispensed" to close the lifecycle.

