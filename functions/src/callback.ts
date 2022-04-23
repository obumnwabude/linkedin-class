import { admin } from './admin';
import fetch from 'node-fetch';
import * as functions from 'firebase-functions';

export const callback = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  try {
    if (!req.query.state) {
      res.status(403).json({ message: 'Invalid state' });
      return;
    }
    if (!req.query.code) {
      res.status(403).json({ message: 'Invalid code' });
      return;
    }

    const stateSnap = await db.doc(`/users/${req.query.state}`).get();

    if (!stateSnap.exists) {
      res.status(403).json({ message: 'Invalid state' });
      return;
    }

    const origin = stateSnap.data()?.origin;

    const linkedin = await (
      await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: req.query.code as string,
          redirect_uri: stateSnap.data()?.redirect,
          client_id: functions.config().auth.client_id,
          client_secret: functions.config().auth.client_secret
        })
      })
    ).json();
    linkedin.signInTime = admin.firestore.FieldValue.serverTimestamp();

    const linkedinUser = await (
      await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${linkedin.access_token}` }
      })
    ).json();
    const displayName = `${linkedinUser.localizedFirstName} ${linkedinUser.localizedLastName}`;
    linkedin.id = linkedinUser.id;

    const email = (
      await (
        await fetch(
          'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
          {
            headers: { Authorization: `Bearer ${linkedin.access_token}` }
          }
        )
      ).json()
    )?.elements?.[0]?.['handle~']?.emailAddress;

    const imgObjs = (
      await (
        await fetch(
          'https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))',
          {
            headers: { Authorization: `Bearer ${linkedin.access_token}` }
          }
        )
      ).json()
    )?.profilePicture?.['displayImage~']?.elements;

    let photoURL = null;
    if (imgObjs && imgObjs.length > 0) {
      const imgUrls = imgObjs.map((im: any) => im.identifiers[0].identifier);
      const size400 = imgUrls.filter((im: string) => /400_400/.test(im));
      photoURL = size400.length > 0 ? size400[0] : imgUrls[0];
    }

    const matchedIdsSnap = await db
      .collectionGroup('auth')
      .where('id', '==', linkedin.id)
      .get();

    let state;
    const profile = { email, photoURL, displayName };
    const isOldUser = matchedIdsSnap.size > 0;
    if (isOldUser) {
      state = matchedIdsSnap.docs.at(0)?.ref.path.split('/')[1] as string;
      await db.doc(`/users/${req.query.state}`).delete();
      await admin.auth().updateUser(state, profile);
    } else {
      state = req.query.state as string;
      await admin.auth().createUser({ uid: state, ...profile });
    }

    await db.doc(`/users/${state}`).set(profile, { merge: isOldUser });
    await db
      .doc(`/users/${state}/auth/linkedin`)
      .set(linkedin, { merge: true });

    res.redirect(`${origin}/?state=${state}`);
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
