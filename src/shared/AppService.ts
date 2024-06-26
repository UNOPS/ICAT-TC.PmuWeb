import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsersControllerServiceProxy } from './service-proxies/service-proxies';
import { AuditControllerServiceProxy } from './service-proxies-auditlog/service-proxies';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public jwt: string = '';
  public userProfile: any = {};

  public isDataupdated = new BehaviorSubject<boolean>(true);

  constructor(
    private usersControllerServiceProxy: UsersControllerServiceProxy,
    private auditControllerServiceProxy : AuditControllerServiceProxy
  ) {
   

    this.userProfile.username = localStorage.getItem('user_name'); 
  }

  update() {
    this.isDataupdated.next(true);
  }

  steToken(tocken: string): void {
    this.jwt = tocken;
  }

  getToken(): string {
    return this.jwt;
  }
}
