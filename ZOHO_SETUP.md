## Step-by-Step Setup Instructions for Zoho Mail with Custom Domain (info@play-app.app)

This guide provides instructions for setting up your production domain (`play-app.app`). You can follow the same process for your testing domain (`play-app.ch`) if you need separate email addresses for it.

To set up Zoho Mail for your custom domain **play-app.app** and create the email address **info@play-app.app**, follow these detailed steps:

### Step 1: Sign Up for Zoho Mail

1. **Visit Zoho Mail**: Go to the [Zoho Mail website](https://www.zoho.com/mail/).
2. **Choose a Plan**: Click on "Pricing" and select the **Free Plan** for up to 5 users.
3. **Sign Up**: Click on "Get Started" under the Free Plan.
4. **Enter Your Details**: Fill in your name, mobile number, and create a password. Click "Sign Up."

### Step 2: Verify Your Domain

1. **Select Domain Option**: After signing up, choose the option to use your own domain.
2. **Enter Your Domain**: Type in **play-app.app** and click "Add."
3. **Verify Domain Ownership**:
   - Zoho will provide a verification method (usually a TXT record).
   - Log in to your domain registrar (where you purchased your domain).
   - Navigate to the DNS settings and add the TXT record provided by Zoho.
   - Save the changes.

4. **Verify in Zoho**: Go back to Zoho Mail and click on "Verify." It may take a few minutes for the changes to propagate.

### Step 3: Create User Accounts

1. **Access User Management**: Once your domain is verified, go to the "Users" section in the Zoho Mail dashboard.
2. **Add User**: Click on "Add User."
3. **Enter User Details**:
   - **Email Address**: Enter **info@play-app.app**.
   - **First Name**: Enter a first name (e.g., "Info").
   - **Last Name**: Enter a last name (optional).
   - **Password**: Set a password for the account.
4. **Save User**: Click "Add User" to create the email account.

### Step 4: Configure MX Records

1. **Access DNS Settings**: Go back to your domain registrar's DNS settings.
2. **Add MX Records**: Zoho will provide a set of MX records to configure. You need to add these records to direct email to Zoho Mail.
   - Typically, you will add records like:
     - `mx.zoho.com` with priority 10
     - `mx2.zoho.com` with priority 20
     - `mx3.zoho.com` with priority 30
3. **Save Changes**: After adding the MX records, save the changes.

### Step 5: Set Up SPF and DKIM Records (Optional but Recommended)

1. **SPF Record**: Add an SPF record to your DNS settings to prevent email spoofing. The record usually looks like:
   ```
   v=spf1 include:zoho.com ~all
   ```
2. **DKIM Record**: In the Zoho Mail dashboard, go to "Email Authentication" and follow the instructions to generate a DKIM record. Add this record to your DNS settings as well.

### Step 6: Access Your Email

1. **Log In**: Go to the [Zoho Mail login page](https://mail.zoho.com) and enter your new email address **info@play-app.app** and the password you set.
2. **Explore Features**: Familiarize yourself with the Zoho Mail interface, including the inbox, settings, and additional features.

### Step 7: Test Your Email

1. **Send a Test Email**: Send an email to and from **info@play-app.app** to ensure everything is working correctly.
2. **Check Spam Settings**: Make sure to check your spam settings and filters to ensure you receive all emails.

### Conclusion

By following these steps, you will have successfully set up Zoho Mail for your custom domain **play-app.app** and created the email address **info@play-app.app**. If you have any questions or need further assistance during the setup process, feel free to ask!