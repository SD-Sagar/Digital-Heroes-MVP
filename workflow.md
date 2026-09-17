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
