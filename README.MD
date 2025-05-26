### Gmail Draft Manager
This module provides a simple interface to authenticate with Gmail and manage email drafts. It supports:

#### Authenticating a user's Gmail account.

Creating email drafts.

#### Sending drafts.

### Features
- OAuth2 authentication with Gmail

- Create and edit email drafts

- Send saved drafts

### Installation
npm install gmail-draft-manager

#### Setup
Before using this module, ensure you have:

- A Google Cloud project with Gmail API enabled.

- OAuth 2.0 credentials (Client ID and Client Secret).

- Redirect URI configured for your environment.

#### Usage

```
const GmailDraftManager = require('gmail-draft-manager');

const manager = new GmailDraftManager({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_REDIRECT_URI',
});

// Step 1: Generate auth URL and authenticate
const authUrl = manager.generateAuthUrl();
console.log('Authorize this app by visiting:', authUrl);

// After getting the code from the redirect URI
await manager.authenticate('AUTHORIZATION_CODE');

// Step 2: Create a draft
const draftId = await manager.createDraft({
  to: 'recipient@example.com',
  subject: 'Hello from Gmail API',
  body: 'This is a draft email created with the Gmail API!',
});

// Step 3: Send the draft
await manager.sendDraft(draftId);

console.log('Email sent successfully!');

```

#### API
generateAuthUrl()   
Generates the Google OAuth URL. The user must visit this URL to authenticate.   

authenticate(code: string)   
Exchanges the OAuth code for access and refresh tokens.   

createDraft({ to, subject, body })   
Creates a draft email.   

to (string): Recipient's email address   

subject (string): Email subject   

body (string): Plain text body   

Returns the draftId.   

sendDraft(draftId: string)   
Sends the specified draft.   