import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from './shared/shared.module';
import { take } from 'rxjs';
import { MessagesService } from './services/messages.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from './services/user.service';
import { UserProfileComponent } from './auth/user-profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  template: `
    <p-toast />
    <p-toolbar styleClass="bg-gray-900 shadow-2 p-2 m-1">
      <ng-template pTemplate="start">
        <img
          src="https://primefaces.org/cdn/primeng/images/primeng.svg"
          alt="logo"
        />
      </ng-template>
      <ng-template pTemplate="center">
        <div class="flex flex-wrap align-items-center gap-3">
          <button
            class="p-link inline-flex justify-content-center align-items-center text-white h-3rem w-3rem border-circle hover:bg-white-alpha-10 transition-all transition-duration-200"
          >
            <i class="pi pi-home text-2xl"></i>
          </button>
          <button
            class="p-link inline-flex justify-content-center align-items-center text-white h-3rem w-3rem border-circle hover:bg-white-alpha-10 transition-all transition-duration-200"
          >
            <i class="pi pi-user text-2xl"></i>
          </button>
          <button
            class="p-link inline-flex justify-content-center align-items-center text-white h-3rem w-3rem border-circle hover:bg-white-alpha-10 transition-all transition-duration-200"
          >
            <i class="pi pi-search text-2xl"></i>
          </button>
        </div>
      </ng-template>
      <ng-template pTemplate="end">
        @if (currentUser()) {
          <div class="flex align-items-center gap-2">
            <p-avatar [image]="photo" shape="circle" />
            <span
              class="font-bold text-gray-400 cursor-pointer hover:text-cyan-400"
              (click)="menu.toggle($event)"
            >
              {{ currentUser()?.displayName || currentUser()?.email }}
              <i class="pi pi-angle-down"></i>
            </span>
            <p-tieredMenu #menu [model]="items" [popup]="true" />
          </div>
        } @else {
          @if (!hide) {
            <p-button
              (onClick)="hide = !hide"
              routerLink="/login"
              severity="secondary"
              label="Login"
              icon="pi pi-sign-in"
            />
          }
        }
      </ng-template>
    </p-toolbar>
    <div class="container">
      <router-outlet />
    </div>
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner
          styleClass="w-6rem h-6rem"
          strokeWidth="4"
          fill="var(--surface-ground)"
          animationDuration=".5s"
        />
      </div>
    }
  `,
  styles: [``],
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  message = inject(MessagesService);
  currentUser = this.userService.currentUserProfile;
  items: MenuItem[] | undefined;
  ref: DynamicDialogRef | undefined;
  photo!: string;
  hide: boolean = false;
  user$: any;

  loading = this.message.loading;

  constructor(
    private config: PrimeNGConfig,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.translateService.setDefaultLang('th');
    this.translateService.use('th');
    this.translateService
      .get('th')
      .pipe(take(1))
      .subscribe((result) => this.config.setTranslation(result));

    this.items = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.openDialog(),
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
    this.authService.currentUser$.subscribe((res) => {
      this.photo = res?.photoURL ? res?.photoURL : '/images/dummy-user.png';
    });
  }

  openDialog() {
    this.ref = this.dialogService.open(UserProfileComponent, {
      data: '',
      header: 'User Profile',
      width: '520px',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '70vw',
        '640px': '75vw',
        '390px': '80vw',
      },
    });
  }

  async logout() {
    await this.authService
      .logout()
      .then(() => this.router.navigate(['/login']));
  }
}
