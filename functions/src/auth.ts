import { admin } from './admin';
import * as functions from 'firebase-functions';

export const auth = functions.https.onCall(async (_, context) => {
  const origin = context.rawRequest.headers.origin;
  const redirect = `${origin}/callback`;
  try {
    const state = (
      await admin.firestore().collection('users').add({
        origin,
        redirect,
        startedSignInAt: admin.firestore.FieldValue.serverTimestamp()
      })
    ).id;
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      functions.config().auth.client_id
    }&redirect_uri=${redirect}&state=${state}&scope=r_liteprofile%20r_emailaddress`;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
