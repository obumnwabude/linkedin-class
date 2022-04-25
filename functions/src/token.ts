import { admin } from './admin';
import * as functions from 'firebase-functions';

export const token = functions.https.onCall(async (data: { state: string }) => {
  if (!data?.state) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
  }

  let stateSnap;
  try {
    stateSnap = await admin.firestore().doc(`/users/${data.state}`).get();
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }

  if (!stateSnap.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid state');
  } else {
    try {
      await admin.auth().getUser(data.state);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
         const stateData = stateSnap.data();
         if (stateData?.error) {
           const error = stateData?.error;
           await admin.firestore().doc(`/users/${data.state}`).delete();
           throw new functions.https.HttpsError('aborted', error);
         }
      } else {
        throw new functions.https.HttpsError('internal', error.message);
      }
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
