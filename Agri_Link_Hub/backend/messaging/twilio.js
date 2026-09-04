// backend/messaging/twilio.js
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send SMS using Twilio
 * @param {{to: string, body: string}} params
 * @returns {Promise<object>}
 */
async function sendNotification({ to, body }) {
  if (!to || !body) throw new Error('`to` and `body` are required');
  const msg = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
  console.log('Twilio message sent:', msg.sid);
  return msg;
}

module.exports = { sendNotification };
