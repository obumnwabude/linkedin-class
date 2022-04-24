import { admin } from './admin';
import * as functions from 'firebase-functions';

export const garbage = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async () => {
    const batch = admin.firestore().batch();
    const abandoned = await admin
      .firestore()
      .collection('users')
      .where('startedSignInAt', '>=', admin.firestore.Timestamp.now())
      .get();
    abandoned.forEach((a) => batch.delete(a.ref));
    batch.commit();
  });
