import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordDontMatch: true };
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="flex justify-content-center flex-wrap mt-8 sm:mt-1 md:mt-4">
      <div class="flex justify-content-center align-items-center shadow-5">
        <form [formGroup]="signupForm" (ngSubmit)="signup()">
          <p-card header="Sign Up" [style]="{ width: '360px' }">
            <ng-template pTemplate="p-card-content">
              <div class="field">
                <label>Name</label>
                <input
                  type="text"
                  pInputText
                  formControlName="name"
                  class="w-full {{ isNameValid ? 'ng-invalid ng-dirty' : '' }}"
                />
                @if (isNameValid; as message) {
                  <small class="block p-error pl-2">
                    {{ message }}
                  </small>
                }
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
              </div>
              <div class="field">
                <label>Confirm Password</label>
                <p-password
                  class="w-full {{
                    isConfirmPassword
                      ? 'ng-invalid ng-dirty'
                      : signupForm.hasError('passwordDontMatch')
                        ? 'ng-invalid ng-dirty'
                        : ''
                  }}
                "
                  [feedback]="false"
                  formControlName="confirmPassword"
                  styleClass="p-password p-component p-inputwrapper p-input-icon-right"
                  [style]="{ width: '100%' }"
                  [inputStyle]="{ width: '100%' }"
                  [toggleMask]="true"
                />
                @if (isConfirmPassword; as message) {
                  <small class="block p-error pl-2">
                    {{ message }}
                  </small>
                } @else if (signupForm.hasError('passwordDontMatch')) {
                  <small class="block p-error pl-2"
                    >Password should match</small
                  >
                }
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex gap-3 -mt-3">
                <p-button
                  label="SignUp"
                  class="w-full"
                  styleClass="w-full"
                  [disabled]="signupForm.invalid"
                  type="submit"
                  [loading]="loadings"
                />
              </div>
              <div class="mt-3 mb-3 ml-2">
                Already a member?
                <a routerLink="/login">
                  <span class="text-blue-600 hover:text-cyan-100">Login</span>
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
  `,
})
export class SignupComponent {
  loadings: boolean = false;
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private message: MessagesService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator() },
    );
  }

  get isNameValid(): string | boolean {
    const control = this.signupForm.get('name');
    const isValid = control?.invalid && control.touched;
    if (isValid) {
      if (control.hasError('required')) {
        return 'This field is required';
      }
    }
    return false;
  }

  get isEmailValid(): string | boolean {
    const control = this.signupForm.get('email');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }

  get isValidPassword(): string | boolean {
    const control = this.signupForm.get('password');
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

  get isConfirmPassword(): string | boolean {
    const control = this.signupForm.get('confirmPassword');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('passwordDontMatch')) {
        return 'Password should match';
      } else {
        return 'Enter a valid password';
      }
    }

    return false;
  }

  forgotPassword() {}

  async signup() {
    if (this.signupForm.invalid) return;

    try {
      const { name, email, password } = this.signupForm.value;
      this.message.showLoading();
      const {
        user: { uid },
      } = await this.authService.signup(email, password);
      this.userService.addUser({ uid, email, displayName: name });
      this.authService.sendEmailVerification().then(() => {
        this.message.showSuccess('Send Email Verification successfully!');
        this.message.showWarn('You must verify your email & sign in again!');
      });

      this.router.navigate(['/home']);
    } catch (error: any) {
      this.message.showError(error.message);
    } finally {
      this.message.hideLoading();
    }
  }
}
