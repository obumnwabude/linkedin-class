import { admin } from './admin';
import * as functions from 'firebase-functions';

export const token = functions.https.onCall(async (data: { state: string }) => {
  if (!data?.state) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
  }

  try {
    await admin.auth().getUser(data.state);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
    } else {
      throw new functions.https.HttpsError('internal', error.message);
    }
  }

  let token;
  try {
    token = admin.auth().createCustomToken(data.state);
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
  return token;
});
