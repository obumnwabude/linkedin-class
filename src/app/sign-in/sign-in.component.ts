import { Component, OnInit } from '@angular/core';
import { Auth, signInWithCustomToken } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { NgModel } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  hasSetLink = true;

  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private fns: Functions,
    private snackBar: MatSnackBar,
    private ngxLoader: NgxUiLoaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const state = this.route.snapshot.queryParamMap.get('state');
    if (state && this.auth.currentUser == null) {
      try {
        this.ngxLoader.start();
        const token = (await httpsCallable(this.fns, 'token')({ state }))
          .data as string;
        await signInWithCustomToken(this.auth, token);
        setTimeout(() => {
          if (this.auth.currentUser != null) {
            this.snackBar.open(`Welcome, ${this.auth.currentUser.displayName}`);
          }
        });
      } catch (error) {
        this.snackBar.open(error.message);
      } finally {
        this.ngxLoader.stop();
      }
    }
    if (state) this.router.navigateByUrl(this.router.url.split('?')[0]);
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(this.firestore, `/users/${user.uid}`));
          if (snap.exists()) {
            this.hasSetLink = !!snap.data()['profile']['linkedin'];
          }
        } catch (_) {
          /* ignore error */
        }
      }
    });
  }

  async signIn() {
    try {
      this.ngxLoader.start();
      window.location.assign(
        (await httpsCallable(this.fns, 'auth')()).data as string
      );
    } catch (error) {
      this.snackBar.open(error.message);
      this.ngxLoader.stop();
    }
  }

  async submitLink(link: NgModel) {
    if (link.invalid) {
      this.snackBar.open(
        link.hasError('required')
          ? 'Please provide your LinkedIn link'
          : 'Link should start with https://linkedin.com/in/'
      );
    } else if (this.auth.currentUser != null) {
      try {
        this.ngxLoader.start();
        await setDoc(
          doc(this.firestore, `/users/${this.auth.currentUser.uid}`),
          { profile: { linkedin: link.value } },
          { merge: true }
        );
        this.hasSetLink = true;
        this.snackBar.open('Your Link has been recorded');
      } catch (error) {
        this.snackBar.open(error.message);
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.snackBar.open('Please sign in first');
    }
  }
}
