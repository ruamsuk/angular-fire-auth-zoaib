import { Component, effect } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessagesService } from '../services/messages.service';
import { User } from '../models/profile-user.model';
import { ImageUploadService } from '../services/image-upload.service';

@Component({
  selector: 'app-user-profile',
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
            [src]="user?.photoURL || '/images/dummy-user.png'"
            alt="user-photo"
            width="130"
            height="130"
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
        <div class="formgrid grid mt-2">
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
            <!--<small class="text-gray-400 font-italic ml-1">
              Email cannot be edited.
            </small>-->
          </div>
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
            <!--<small class="text-gray-400 font-italic ml-1">
              Role cannot be edited.
            </small>-->
          </div>
        </div>
        <div class="field col">
          <div class="flex justify-content-center cursor-pointer">
            @if (user.emailVerified) {
              <span class="text-green-400">
                <i class="pi pi-verified"></i>
                Verified user.
              </span>
            } @else if (!user.emailVerified) {
              <span class="text-orange-400 ml-2" (click)="sendEmail()">
                <i class="pi pi-send"></i>
                Click to Verified email.
              </span>
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
    form input,
    textarea {
      font-family: 'Sarabun', sans-serif !important;
    }

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
      font-family: 'Sarabun', sans-serif !important;
      color: gray;
      margin-left: 5px;
    }
  `,
})
export class UserProfileComponent {
  user$!: Observable<any>;
  profileForm: FormGroup;
  currentUser: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private imageService: ImageUploadService,
    private message: MessagesService,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      uid: this.fb.control('', { nonNullable: true }),
      displayName: new FormControl(''),
      // email: new FormControl({ value: '', disabled: true }),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      phone: new FormControl(''),
      address: new FormControl(''),
      // role: new FormControl({ value: '', disabled: true }),
      role: new FormControl(''),
    });

    effect(() => {
      this.profileForm.patchValue({ ...this.userService.currentUserProfile() });
    });
    this.user$ = this.authService.currentUser$;
    this.currentUser = this.userService.currentUserProfile;
  }

  close() {
    this.ref.close();
  }

  async saveProfile() {
    const { uid, ...data } = this.profileForm.value;

    if (!uid) return;

    try {
      this.message.showLoading();
      this.userService.addUser({ uid, ...data });
      await this.authService.updateUserProfile({ uid, ...data });
      this.message.showSuccess('Profile updated successfully!');
      this.close();
      this.message.hideLoading();
    } catch (e: any) {
      this.message.showError(e?.message);
    } finally {
      this.message.hideLoading();
    }
  }

  async uploadImage(event: any, user: User) {
    const file = event.target.files[0];
    const currentUserId = this.currentUser()?.uid;

    if (!file || !currentUserId) return;

    try {
      this.message.showLoading();
      const photoURL = await this.userService.uploadProfilePhoto(
        file,
        `images/profiles/${currentUserId}`,
      );
      await this.userService.updateUser({
        uid: currentUserId,
        photoURL,
      });
      this.message.showSuccess('Image uploaded successfully');
    } catch (e: any) {
      this.message.showError(e.message);
    } finally {
      this.message.hideLoading();
    }
  }

  sendEmail() {}
}
