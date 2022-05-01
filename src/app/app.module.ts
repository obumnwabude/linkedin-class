import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService
} from '@angular/fire/analytics';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo
} from '@angular/fire/auth-guard';
import {
  connectFirestoreEmulator,
  provideFirestore,
  getFirestore
} from '@angular/fire/firestore';
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator
} from '@angular/fire/functions';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginatorIntl,
  MatPaginatorModule
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Route, RouterModule } from '@angular/router';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { CountdownComponent } from './countdown.component';
import { MembersComponent } from './members/members.component';

const routes: Route[] = [
  {
    path: '',
    component: MembersComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo('/sign-in') }
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: () => redirectLoggedInTo('/') }
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    CountdownComponent,
    MembersComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    NgxUiLoaderModule,
    NgxUiLoaderRouterModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    ...(environment.production ? [provideAnalytics(() => getAnalytics())] : []),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (!environment.production) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    RouterModule.forRoot(routes)
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: '5000', verticalPosition: 'top' }
    },
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const mpi = new MatPaginatorIntl();
        mpi.itemsPerPageLabel = 'Members Per Page';
        return mpi;
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
