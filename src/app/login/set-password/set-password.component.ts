import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword, AuthControllerServiceProxy, ForgotPasswordDto } from 'shared/service-proxies/service-proxies';
import { AuthenticationService } from '../login-layout/authentication.service';
import { finalize } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['../login-layout/login-layout.component.scss'],
})
export class SetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  resetPasswordDto = new ResetPassword();
  token: string = '';
  emailFromUrl: string = '';
  isActivation: boolean = false;

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  isLoading: boolean = false;
  isSuccessful: boolean = false;
  isErrorPopup: boolean = false;
  isExpiredPopup: boolean = false;
  isResendSuccess: boolean = false;
  errorMessage: string = '';

  private passwordPattern = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private authControllerService: AuthControllerServiceProxy
  ) {
    this.authService.authenticate(false, true);
  }

  ngOnInit(): void {
    this.initForm();
    this.getParamsFromUrl();
  }

  get passwordControl(): any {
    return this.resetPasswordForm.get('password');
  }

  get emailControl(): any {
    return this.resetPasswordForm.get('email');
  }

  get confirmPasswordControl(): any {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get pageTitle(): string {
    return this.isActivation ? 'Set Your Password' : 'Reset Your Password';
  }

  get pageDescription(): string {
    return this.isActivation
      ? 'Welcome! Please create a password to activate your account.'
      : 'Enter your new password below.';
  }

  get submitLabel(): string {
    return this.isActivation ? 'Activate Account' : 'Reset Password';
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.resetPasswordDto.password = this.passwordControl.value;
    this.resetPasswordDto.token = this.token;
    this.resetPasswordDto.email = this.resetPasswordForm.getRawValue().email;

    this.authControllerService.resetPassword(this.resetPasswordDto)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        (response: any) => {
          if (response && response.success !== false) {
            this.isSuccessful = true;
          } else {
            this.isErrorPopup = true;
            this.errorMessage = 'Password reset failed. Please try again.';
          }
        },
        (err: any) => {
          if (err.status === 410 || (err.error && err.error.expired)) {
            this.isExpiredPopup = true;
            this.errorMessage = err.error?.message || 'Your link has expired. Please request a new one.';
          } else {
            this.isErrorPopup = true;
            this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
          }
        }
      );
  }

  resendActivationCode(): void {
    const email = this.emailControl.value;
    if (!email) {
      return;
    }
    const request = new ForgotPasswordDto();
    request.email = email;
    this.authControllerService.forgotPassword(request).subscribe(
      () => {
        this.isExpiredPopup = false;
        this.isResendSuccess = true;
      },
      () => {
        this.errorMessage = 'Failed to resend. Please try again.';
      }
    );
  }

  closeExpiredPopup(): void {
    this.isExpiredPopup = false;
  }

  closeResendSuccessPopup(): void {
    this.isResendSuccess = false;
  }

  gotoLogin(): void {
    this.router.navigate(['/login']);
  }

  toLanding(): void {
    window.location.href = environment.baseUrlLandingPage;
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.passwordMatchValidator,
    });
  }

  private getParamsFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.emailFromUrl = params['email'] || '';
      this.isActivation = params['activate'] === 'true';

      if (!this.token) {
        this.router.navigate(['/login']);
        return;
      }

      if (this.emailFromUrl) {
        this.emailControl.setValue(this.emailFromUrl);
        this.emailControl.disable();
      }
    });
  }

  private passwordMatchValidator(control: any): ValidationErrors | null {
    const password = control.get('password').value;
    const confirmPassword = control.get('confirmPassword').value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
