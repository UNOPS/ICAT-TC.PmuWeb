import { Component, OnInit, ViewChild } from '@angular/core';
import { LoginLayoutService } from '../login-layout/login-layout.service';
import { AuthControllerServiceProxy, ResetPassword } from 'shared/service-proxies/service-proxies';
import { AuthenticationService } from '../login-layout/authentication.service';
import {  FormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import decode from 'jwt-decode';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  @ViewChild('fSetPassword') form: NgForm;
  form1: any;
  email: string = "";
  showEmail: boolean = false;
  passwordConfirm: string = "";
  resetPasswordDto = new ResetPassword;
  islSuccessPopup: boolean;
  isErrorPopup: boolean;
  setPasswordForm: UntypedFormGroup;
  isPasswordType: boolean = true;
  isConfirmPasswordType?: boolean = true;
  public isSubmitted: boolean = false;

  constructor(public loginLayoutService: LoginLayoutService,
    private appServiceProxy: AuthControllerServiceProxy,
    private router: Router,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute) {

    this.authenticationService.authenticate(false, true);
    let regEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])((?=.*[0-9])|(?=.*[!@#$%^&*]))(?=.{6,})");

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = localStorage.getItem('access_token')!;
      const tokenPayload = decode<any>(token);
      this.email = tokenPayload.usr;
      if (this.email) {
        this.showEmail = true
      }
    });
  }

  clickResetPassword() {
    if (this.form.valid && this.passwordConfirm == this.resetPasswordDto.password) {
      this.resetPasswordDto.token = "";
      this.resetPasswordDto.email = this.email;
      this.appServiceProxy.resetPassword(this.resetPasswordDto).subscribe(isSuccess => {
        if (isSuccess) {
          this.islSuccessPopup = true;
        } else {
          this.isErrorPopup = true;
        }
      },
        err => {
          this.isErrorPopup = true;
        });
    }
  }

  get password() {
    return this.setPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.setPasswordForm.get('confirmPassword');
  }

  gotoLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordText() {
    this.isPasswordType = !this.isPasswordType;
  }

  toggleConfirmPasswordText() {
    this.isConfirmPasswordType = !this.isConfirmPasswordType;
  }

  toLanding() {
    window.location.href = environment.baseUrlLandingPage;
  }


}
