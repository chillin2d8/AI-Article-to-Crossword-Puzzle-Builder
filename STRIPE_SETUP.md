# Full Stripe Setup Guide for PLAY

This guide covers all the necessary steps to configure your Stripe account for both **recurring subscriptions** (using the Firebase Extension) and **one-time donations** (using Stripe Payment Links). Complete Part 1 before moving to Part 2.

---

## Part 1: Setting Up Subscription Plans

To implement the subscription plans with Stripe and the official Firebase extension, follow these steps precisely.

### Step 1: Create and Activate Your Stripe Account
1.  **Sign Up**: Go to the [Stripe website](https://dashboard.stripe.com/register) and create a free account.
2.  **Verify Your Email**: Check your email for a verification link and complete the registration process.
3.  **Activate Your Account**: Log in to your Stripe dashboard. You will see a prompt to "Activate your account." Click it and fill in your business details, including your business name, address, and banking information. This is necessary to process live payments.

### Step 2: Create Subscription Products and Pricing
This is the most critical step. The names you use here **must match** what the application code expects.

1.  **Navigate to Products**: In the Stripe dashboard, go to the **Products** section in the top menu.
2.  **Create "Monthly Subscriber"**:
    *   Click **+ Add product**.
    *   **Name**: Enter `Monthly Subscriber` (This must be an exact match).
    *   Under "Pricing," set the amount to **$3.00** and ensure the currency is correct.
    *   The billing period should be **Recurring** and set to **Monthly**.
    *   Click **Save product**.
3.  **Create "Yearly Subscriber"**:
    *   Click **+ Add product** again.
    *   **Name**: Enter `Yearly Subscriber` (This must be an exact match).
    *   Under "Pricing," set the amount to **$30.00**.
    *   The billing period should be **Recurring** and set to **Yearly**.
    *   Click **Save product**.

### Step 3: Get Your Price and Product IDs
After creating the products, you need to get their unique IDs to put into the application's configuration.

1.  Go back to the **Products** section.
2.  Click on the **Monthly Subscriber** product you created.
3.  In the "Pricing" section, find the **API ID** for the price (it looks like `price_...`). Copy this.
4.  In your `config.ts` file, paste this ID as the value for `priceId` under the `Monthly` tier.
5.  Repeat this process for the **Yearly Subscriber** product, copying its price ID into the `priceId` field for the `Yearly` tier in `config.ts`.
6.  For the `productId` fields in `config.ts`, you can find the Product API ID on the main page for each product (it looks like `prod_...`). While the Firebase extension primarily uses the price ID, it's good practice to have both.

### Step 4: Install the Firebase Extension
Now you will connect Stripe to your Firebase project.

1.  Go to your **Firebase Console**.
2.  Select your project.
3.  In the left menu, go to **Extensions** (under the "Build" category).
4.  Click **Explore Extensions**.
5.  Search for and select **"Run Subscriptions with Stripe"**.
6.  Click **Install**. The wizard will guide you through the setup, asking for your Stripe API keys.

### Step 5: Get Your Stripe API Keys
The Firebase Extension will ask for these during installation.

1.  In your Stripe dashboard, go to the **Developers** section (top right).
2.  Click on **API keys**.
3.  You will see your **Publishable key** and **Secret key**.
    *   **Important**: Only use your **Test** keys while you are developing. When you are ready to launch, you will need to come back here and get your **Live** keys.
4.  Copy these keys into the configuration fields when you install the Firebase Extension.

### Step 6: Test Your Integration
1.  **Use Test Mode**: Make sure your Stripe dashboard is in "Test mode" (toggle in the top right).
2.  **Use Stripe's Test Cards**: When you go through the checkout flow in your app, use one of [Stripe's test card numbers](https://stripe.com/docs/testing#cards).
3.  **Verify in Firebase**: After a successful test purchase, check your Firestore database. You should see a `customers` collection, and inside it, a document with a user's `uid`. That document should have a `subscriptions` sub-collection with the active plan.

---

## Part 2: Setting Up a Donation Link (No Code Required)

This section explains how to create a simple link for one-time donations. This method requires no extra code and is managed entirely from your Stripe dashboard.

### Step 1: Create a "Donation" Product
You first need to create a "product" in Stripe that represents the donation.

1.  **Navigate to Products**: In the Stripe dashboard, go to the **Products** section in the top menu.
2.  **Add a New Product**:
    *   Click on **+ Add product**.
    *   **Name**: Give it a clear name, like `Support PLAY Development`.
    *   **Description** (Optional): Add a note like `A one-time donation to support the ongoing development and hosting of the PLAY application.`
3.  **Create a Price**:
    *   Under "Pricing," set the pricing model to **One-time**.
    *   You have two options for the amount:
        *   **Fixed Amount (Recommended)**: Enter a single donation amount (e.g., $5.00). You can create multiple products if you want to offer different tiers (e.g., $5, $10, $20).
        *   **Customer chooses price**: If this option is available on your account, you can use it to let users enter their own amount.
    *   Click **Save product**.

### Step 2: Create the Payment Link
Now, you'll create the actual link for the product you just made.

1.  **Navigate to Payment Links**: In the top menu, go to **Payments > Payment Links**.
2.  **Create a New Link**:
    *   Click on **+ New**.
    *   Choose **Find product** and select the "Support PLAY Development" product you created.
3.  **Configure (Optional)**: On the next page, you can customize the look of your checkout page, add your logo, and configure the confirmation message. The defaults are fine to start.
4.  **Create Link**:
    *   Click the **Create link** button in the top-right corner.

### Step 3: Copy the Payment Link URL
After creating the link, Stripe will show you the final URL.

*   It will look something like this: `https://buy.stripe.com/abc123xyz`
*   Click the **Copy** button to copy this URL to your clipboard.

### Step 4: Add the URL to Your App's Configuration
The final step is to tell the application where to send users who want to donate.

1.  **Open the Code**: In your project, open the `config.ts` file.
2.  **Find the Configuration**: Locate the `APP_CONFIG` object.
3.  **Update the URL**: You will see a line for `DONATION_LINK_URL`. Replace the placeholder URL with the actual Payment Link URL you just copied from Stripe.

    ```typescript
    // Before
    export const APP_CONFIG = {
      //...
      DONATION_LINK_URL: 'https://buy.stripe.com/test_123456789',
    };

    // After (with your real link)
    export const APP_CONFIG = {
      //...
      DONATION_LINK_URL: 'https://buy.stripe.com/abc123xyz',
    };
    ```

4.  **Save the file**.

### Conclusion
Your application is now fully configured for both subscriptions and donations through Stripe.