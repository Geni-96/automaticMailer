const process = require('process');
const { google } = require('googleapis');
const { Base64 } = require('js-base64');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { auth } = require('google-auth-library');
const port = 4001;

const app = express();
app.use(cors());
app.use(express.json());


const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_ID,
  process.env.GMAIL_SECRET,
  process.env.GMAIL_REDIRECT_URI
);


app.get('/', async (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.compose'],
  });
  
  res.redirect(authUrl);
}
);

app.get('/callback_url', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log(tokens)
    await fetch('http://localhost:3000/token-receiver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });

    res.send('Tokens sent to AI agent. You can close this window now.');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Error retrieving access token');
  }
}
);

app.post('/createDraft', async (req, res) => {
  console.log('inside createDraft')
  console.log(req.body)
  const { tokens, to, from, subject, body } = req.body;
  try {
    if (!tokens) {
      return res.status(401).send('Unauthorized: No tokens found');
    }
    oAuth2Client.setCredentials(tokens);
    const draft = await createDraft(oAuth2Client, to, from, subject, body);
    res.status(200).json(draft);
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).send('Error creating draft');
  }
}
);
app.post('/sendDraft', async (req, res) => {
  const { tokens, draftId } = req.body;
  try {
    if (!tokens) {
      return res.status(401).send('Unauthorized: No tokens found');
    }
    oAuth2Client.setCredentials(tokens);
    const sentDraft = await sendDraft(oAuth2Client, draftId);
    res.status(200).json(sentDraft);
  } catch (error) {
    console.error('Error sending draft:', error);
    res.status(500).send('Error sending draft');
  }
}
);


async function createDraft(auth, to, from, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth });
  console.log(auth,to,from,subject, body)
  const rawMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\r\n');

  const encodedMessage = Base64.encodeURI(rawMessage);

  try {
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    console.log(`Draft ID: ${res.data.id}`);
    return res.data;
  } catch (err) {
    console.error('An error occurred:', err.response?.data || err.message);
    throw new Error('createDraft failed: ' + err.message);
  }
}

async function sendDraft(auth, draftId) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.drafts.send({
      userId: 'me',
      requestBody: {
        id: draftId,
      },
    });

    console.log("Draft sent. Message ID:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("Failed to send draft:", err);
    throw new Error('sendDraft failed: ' + err.message);
  }
}

app.listen(4001, () => {
  console.log('Server is running on port 4001');
});

