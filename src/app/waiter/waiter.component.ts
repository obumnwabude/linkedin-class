import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.scss']
})
export class WaiterComponent implements OnInit {
  sharing: any = {
    facebook: false,
    linkedin: false,
    copy: false,
    twitter: false,
    whatsapp: false
  };
  platforms = ['linkedin', 'whatsapp', 'twitter', 'facebook', 'copy'];
  headings: any = {
    linkedin: 'Post on LinkedIn',
    whatsapp: 'Share to your Whatsapp status and in five groups.',
    twitter: 'Tweet',
    facebook: 'Post to Facebook',
    copy: 'Copy Link'
  };
  urls: any = {
    linkedin: `https://obum.me/linkedin-class`,
    whatsapp: `Get Jobs. Gain Followers. Grow an audience.\n\nLearn these and more in the upcoming _"Grow your LinkedIn"_ *FREE* Whatsapp class by Obum.\n\nJoin now by registering at https://obum.me/linkedin-class`,
    twitter: `Get Jobs. Gain Followers. Grow an audience.\n\nLearn these and more in the upcoming "Grow your LinkedIn" FREE Whatsapp class by @obumnwabude.\n\nJoin now by registering at https://obum.me/linkedin-class`,
    facebook: 'https://obum.me/linkedin-class',
    copy: 'https://obum.me/linkedin-class'
  };

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      if (this.auth.currentUser) {
        const snap = await getDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`)
        );
        if (snap.exists()) this.sharing = snap.data()['sharing'];
      }
    } catch (_) {}
  }

  async saveSharing(platform: string) {
    this.sharing[platform] = true;
    try {
      if (this.auth.currentUser) {
        await setDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`),
          { sharing: this.sharing },
          { merge: true }
        );
      }
    } catch (_) {}
  }

  joinClass() {
    const { facebook, copy, linkedin, twitter, whatsapp } = this.sharing;
    if (
      linkedin &&
      (facebook ? 1 : 0) +
      (copy ? 1 : 0) +
      (twitter ? 1 : 0) +
      (whatsapp ? 1 : 0) >
      1
    ) {
      window.open('https://wa.me/message/FBCQ6AEPFNACJ1', '_blank');
    } else {
      this.snackBar.open(
        'Please first post to LinkedIn and to at least two social platforms'
      );
    }
  }
}
