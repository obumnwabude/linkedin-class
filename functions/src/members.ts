import { admin } from './admin';
import * as functions from 'firebase-functions';

export const members = functions.https.onCall(async (_, context) => {
  if (context.auth == null) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Please Sign In First.'
    );
  }

  try {
    return (await admin.firestore().collection('users').get()).docs
      .map((d) => d.data())
      .filter((d) => d.profile)
      .map((m) => {
        delete m.profile.email;
        return m.profile;
      })
      .filter((m) => m.linkedin)
      .sort((a, b) =>
        a.displayName < b.displayName
          ? -1
          : a.displayName > b.displayName
          ? 1
          : 0
      );
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
