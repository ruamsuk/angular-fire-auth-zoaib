import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessagesService } from '../services/messages.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="flex justify-content-center flex-wrap mt-8 sm:mt-1 md:mt-4">
      <div class="flex justify-content-center align-items-center shadow-5">
        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <p-card header="Log in" [style]="{ width: '360px' }">
            <ng-template pTemplate="p-card-content">
              <div class="flex justify-content-center">
                <img
                  class="cursor-pointer"
                  src="/images/google-sign-in.png"
                  alt="google"
                  role="button"
                  (click)="signInWithGoogle()"
                />
              </div>
              <div class="separator mt-3 mb-3">
                <hr class="line" />
                <span>OR</span>
                <hr class="line" />
              </div>
              <div class="field">
                <label>Email</label>
                <input
                  type="email"
                  pInputText
                  formControlName="email"
                  class="w-full {{ isEmailValid ? 'ng-invalid ng-dirty' : '' }}"
                  name="email"
                />
                @if (isEmailValid; as message) {
                  <small class="block p-error pl-2">
                    {{ message }}
                  </small>
                }
              </div>
              <div class="field">
                <label>Password</label>
                <p-password
                  class="w-full {{
                    isValidPassword ? 'ng-invalid ng-dirty' : ''
                  }}"
                  [feedback]="false"
                  formControlName="password"
                  styleClass="p-password p-component p-inputwrapper p-input-icon-right"
                  [style]="{ width: '100%' }"
                  [inputStyle]="{ width: '100%' }"
                  [toggleMask]="true"
                />
                @if (isValidPassword; as message) {
                  <small class="block p-error pl-2">
                    {{ message }}
                  </small>
                }
                <div class="mt-2">
                  <span
                    class="sarabun text-blue-600 font-italic cursor-pointer hover:text-red-600"
                    (click)="forgotPassword()"
                  >
                    ลืมรหัสผ่าน
                  </span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex gap-3 -mt-3">
                <p-button
                  label="Login"
                  class="w-full"
                  styleClass="w-full"
                  [disabled]="loginForm.invalid"
                  type="submit"
                  [loading]="loadings"
                />
              </div>
              <div class="mt-3 mb-3 ml-2">
                Not a member?
                <a routerLink="/signup">
                  <span class="text-blue-600 hover:text-cyan-100"
                    >Register</span
                  >
                </a>
              </div>
            </ng-template>
          </p-card>
        </form>
      </div>
    </div>
  `,
  styles: `
    a {
      text-decoration: none;
    }

    .separator {
      display: flex;
      align-items: center;
      text-align: center;
    }

    .separator .line {
      flex-grow: 1;
      border: none;
      height: 1px;
      background-color: #4f4e4e; /* สีเส้นตรง */
    }

    .separator span {
      margin: 0 10px; /* ระยะห่างระหว่างเส้นกับข้อความ */
    }

    img {
      border-radius: 15px; /* ทำมุมโค้ง 15px */
    }
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  ref!: DynamicDialogRef;
  loadings: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private message: MessagesService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get isEmailValid(): string | boolean {
    const control = this.loginForm.get('email');

    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }

  get isValidPassword(): string | boolean {
    const control = this.loginForm.get('password');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('minlength')) {
        return 'Password must be at least 6 characters long';
      } else {
        return 'Enter a valid password';
      }
    }

    return false;
  }

  forgotPassword() {}

  async login() {
    if (this.loginForm.invalid) return;

    try {
      this.message.showLoading();
      this.loadings = true;
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
      this.message.showSuccess('Logged in successfully!');

      await this.router.navigate(['/home']);
    } catch (e: any) {
      this.message.showError(e?.message);
    } finally {
      this.message.hideLoading();
      this.loadings = false;
    }
  }

  async signInWithGoogle() {
    try {
      this.message.showLoading();
      await this.authService.googleSignIn();
      this.router.navigate(['/home']);
      this.message.showSuccess('Logged in successfully');
    } catch (e: any) {
      this.message.showError(e.message);
    } finally {
      this.message.hideLoading();
    }
  }
}
