import { Component, OnInit } from '@angular/core';
import { Auth, signInWithCustomToken } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  constructor(
    private auth: Auth,
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
}
