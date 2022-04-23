import { admin } from './admin';
import * as functions from 'firebase-functions';

export const token = functions.https.onCall(async (data: { state: string }) => {
  if (!data?.state) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
  }

  try {
    const stateSnap = await admin.firestore().doc(`/users/${data.state}`).get();
    if (!stateSnap.exists) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
    } else {
      const stateData = stateSnap.data();
      if (stateData?.error) {
        const error = stateData?.error;
        await admin.firestore().doc(`/users/${data.state}`).delete();
        throw new functions.https.HttpsError('aborted', error);
      }
    }
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }

  let token;
  try {
    token = admin.auth().createCustomToken(data.state);
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
  return token;
});
