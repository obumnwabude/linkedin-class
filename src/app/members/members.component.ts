import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { constants } from '../constants';

import { Member } from '../member';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  isLoadingPage = true;
  allMembers: Member[] = [];
  members: Member[] = [];

  set membersPerPage(n: number) {
    localStorage.setItem(constants.LS_MEMBERS_LENGTH, n.toString());
  }
  get membersPerPage() {
    const savedPageSize = localStorage.getItem(constants.LS_MEMBERS_LENGTH);
    return savedPageSize && !Number.isNaN(savedPageSize) ? +savedPageSize : 10;
  }

  constructor(
    private auth: Auth,
    private fns: Functions,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    if (this.auth.currentUser != null) {
      try {
        this.allMembers = (await httpsCallable(this.fns, 'members')({}))
          .data as Member[];
        this.members = this.allMembers.slice(0, this.membersPerPage);
      } catch (error) {
        firstValueFrom(
          this.snackBar.open(error.message, 'REFRESH PAGE').onAction()
        ).then(() => window.location.reload());
      } finally {
        this.isLoadingPage = false;
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }

  pageEvent(e: PageEvent) {
    localStorage.setItem(constants.LS_MEMBERS_LENGTH, e.pageSize.toString());
    this.members = this.allMembers.slice(
      e.pageIndex * e.pageSize,
      (e.pageIndex + 1) * e.pageSize
    );
  }
}
