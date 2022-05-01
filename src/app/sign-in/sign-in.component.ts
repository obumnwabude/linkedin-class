import { Component, OnInit } from '@angular/core';
import { Auth, signInWithCustomToken } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { NgModel } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  isLoadingPage = true;
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
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(this.firestore, `/users/${user.uid}`));
          if (snap.exists()) {
            this.hasSetLink = !!snap.data()['profile']['linkedin'];
            if (this.hasSetLink) this.router.navigateByUrl('/');
            else this.isLoadingPage = false;
          } else {
            firstValueFrom(
              this.snackBar
                .open('Critical Error Happened', 'CONTACT DEVELOPERS')
                .onAction()
            ).then(() =>
              window.open(
                'https://api.whatsapp.com/send?phone=2347033777385&text=Hi%20Obum,%20I%27m%20having%20issues%20with%20the%20%22Grow%20your%20LinkedIn%22%20website%0D%0A%0D%0AMy%20name%20is%20',
                '_blank'
              )
            );
          }
        } catch (_) {}
      } else {
        this.isLoadingPage = false;
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
        this.router.navigateByUrl('/');
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
