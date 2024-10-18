import { Component, effect, inject } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { ImageUploadService } from '../services/image-upload.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { getAuth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedModule],
  template: `
    <hr class="h-px bg-gray-200 border-0" />
    <div class="card mt-3 mb-3">
      <!--/ progress bar here -->
    </div>
    @if (user$ | async; as user) {
      <div class="flex justify-content-center">
        <div class="profile-image">
          <img
            [src]="user?.photoURL ?? '/images/dummy-user.png'"
            alt="user-photo"
            width="120"
            height="120"
          />
          <p-button
            id="in"
            icon="pi pi-pencil"
            severity="success"
            [rounded]="true"
            [raised]="true"
            (onClick)="inputField.click()"
          />
          <input
            #inputField
            type="file"
            hidden="hidden"
            (change)="uploadImage($event, user)"
          />
        </div>
      </div>
      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <div class="formgrid grid">
          <div class="field col">
            <label for="displayName">Display Name</label>
            <input
              pInputText
              type="text"
              class="w-full"
              name="displayName"
              formControlName="displayName"
            />
          </div>
          <div class="field col">
            <label for="email">Email</label>
            <input
              pInputText
              type="text"
              class="w-full"
              name="email"
              formControlName="email"
            />
            <small class="text-gray-400 font-italic ml-1">
              Email cannot be edited.
            </small>
          </div>
          <div class="formgrid grid">
            <div class="field col">
              <label for="firstName">First Name</label>
              <input
                pInputText
                type="text"
                class="w-full"
                name="firstName"
                formControlName="firstName"
              />
            </div>
            <div class="field col">
              <label for="lastName">Last Name</label>
              <input
                pInputText
                type="text"
                class="w-full"
                name="lastName"
                formControlName="lastName"
              />
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col">
              <label for="phone">Phone</label>
              <input
                pInputText
                type="text"
                class="w-full"
                name="phone"
                formControlName="phone"
              />
            </div>
            <div class="field col">
              <label for="role">Role</label>
              <input
                pInputText
                type="text"
                class="w-full"
                name="role"
                formControlName="role"
              />
              <small class="text-gray-400 font-italic ml-1">
                Role cannot be edited.
              </small>
            </div>
          </div>
        </div>
        <div class="field col">
          <div
            class="flex justify-content-center text-green-400 cursor-pointer"
          >
            @if (verify) {
              <i class="pi pi-verified"></i>
              <span class=" ml-2">Verified user.</span>
            } @else if (!verify) {
              <div class="text-orange-500" (click)="sendEmail()">
                <i class="pi pi-send"></i>
                <span class=" ml-2">Click to Verified email.</span>
              </div>
            }
          </div>
        </div>
        <div class="field col -mt-4">
          <label for="address">Address</label>
          <textarea
            rows="3"
            pInputTextarea
            formControlName="address"
            class="w-full"
          ></textarea>
        </div>
        <div class="field col -mt-3">
          <hr class="h-px bg-gray-200 border-0" />
          <div class="flex mt-3">
            <p-button
              label="Cancel"
              severity="secondary"
              styleClass="w-full"
              class="w-full mr-2"
              (onClick)="close()"
            />
            <p-button
              label="Save"
              styleClass="w-full"
              class="w-full"
              (onClick)="saveProfile()"
            />
          </div>
        </div>
      </form>
    }
  `,
  styles: `
    .profile-image > img {
      border-radius: 100%;
      object-fit: cover;
      object-position: center;
    }

    .profile-image {
      position: relative;
    }

    .profile-image > #in {
      position: absolute;
      bottom: 10px;
      left: 80%;
    }

    label {
      color: gray;
      margin-left: 5px;
    }
  `,
  providers: [DynamicDialogConfig, DynamicDialogRef],
})
export class ProfileComponent {
  user$!: Observable<any>;
  disabled: boolean = true;
  verify: boolean | undefined = false;
  role: string | null = null;
  user: any;
  displayName: string | null = null;
  fb = inject(FormBuilder);

  profileForm: FormGroup = this.fb.group({
    uid: this.fb.control('', { nonNullable: true }),
    displayName: new FormControl(''),
    email: new FormControl({ value: '', disabled: this.disabled }),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
    role: new FormControl({ value: '', disabled: this.disabled }),
  });

  constructor(
    private message: MessagesService,
    private imageService: ImageUploadService,
    private authService: AuthService,
    private userService: UserService,
    private dialogData: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) {
    const auth = getAuth();

    effect(() => {
      this.profileForm.patchValue({ ...this.userService.currentUserProfile() });
    });

    this.user$ = this.authService.currentUser$;
    this.verify = auth.currentUser?.emailVerified;
    this.user = this.authService.currentUser();

    console.log(JSON.stringify(this.userService.currentUserProfile(), null, 2));

    /** คือผู้ใช้ใน firebase auth */
    // this.authService.currentUser$.pipe(take(1)).subscribe((user: any) => {
    //   this.profileForm.patchValue({ ...user });
    //   if (user.displayName) {
    //     this.displayName = user.displayName;
    //   }
    // });
    /** ข้อมูลผู้ใช้ใน firestore db */
    // this.authService.userProfile$.pipe(take(1)).subscribe((user: any) => {
    //   if (user) {
    //     this.profileForm.patchValue({
    //       displayName: this.displayName ? this.displayName : user.displayName,
    //       firstName: user.firstName || '',
    //       lastName: user.lastName || '',
    //       phone: user.phone || '',
    //       address: user.address || '',
    //       role: user.role || '',
    //     });
    //     this.role = user.role;
    //   } else {
    //     console.error('Unable to get user profile');
    //   }
    // });
  }

  uploadImage(event: any, user: User) {}

  async saveProfile() {
    const { uid, ...data } = this.profileForm.value;
    console.log(JSON.stringify(data, null, 2));

    if (!uid) return;

    try {
      this.message.showLoading();
      // this.userService.addUser({ uid, ...data });
      // this.message.showSuccess('Profile updated successfully!');
      await this.authService.updateUserProfile({ uid, ...data });
      this.close();
      this.message.hideLoading();
    } catch (e: any) {
      this.message.showError(e?.message);
    } finally {
      this.message.hideLoading();
    }
  }

  close() {
    console.log('dialog closed');
    this.ref.close();
  }

  sendEmail() {}
}
