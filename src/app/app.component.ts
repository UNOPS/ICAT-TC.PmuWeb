import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { RoleGuardService } from './auth/role-guard.service';
import decode from 'jwt-decode';
import { SharedDataService } from 'shared/shared-data-services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService, DialogService],
})
export class AppComponent {
  title = 'icat-country-portal-web-app';
  togglemenu: boolean = true;
  innerWidth = 0;
  showLeftMenu: boolean = false;
  showTopMenu: boolean = false;
  userRoles: any[] = [];
  userRole: any = { name: 'Guest', role: '-1' };
  fname: any;
  urole: any;
  lname: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  /**
   *
   */
  constructor(
    private roleGuardService: RoleGuardService,
    private router: Router,
    private sharedDataService: SharedDataService

  ) {
    this.userRoles = [
      { name: 'ICAT admin', role: '4' },
      { name: 'ICAT user', role: '5' },
      { name: 'PMU admin', role: '1' },
      { name: 'PMU user', role: '3' },
    ];

    this.router.events.subscribe((event: any) => {
      if (event && event.url) {
        this.showLeftMenu = true;
        this.showTopMenu = true;
        if (event.url == '/login') {
          this.showLeftMenu = false;
		  this.showTopMenu = false;
          return;
        }
        if (event.url == '/') {
          this.showLeftMenu = false;
		  this.showTopMenu = false;
          return;
        }
      
        if (event.url == '/landing-page') {
          this.showLeftMenu = false;
          return;
        }
        if (event.url == '/propose-project   ') {
          this.showLeftMenu = false;
          return;
        }
        if (event.url == '/reset-password') {
          this.showLeftMenu = false;
          this.showTopMenu = false;
          return;
        }
        
      }
    });
  }

  ngOnInit() {

    this.sharedDataService.currentMessage.subscribe((message: string) => {
      if (message == 'login_success') {
        this.setLoginRole();
      }
    });

    this.innerWidth = window.innerWidth;
    this.setLoginRole();
  }



  setLoginRole() {
    const token = localStorage.getItem('access_token')!;
   
    const tokenPayload = decode<any>(token);


    this.fname = tokenPayload.fname;
    this.lname = tokenPayload.lname;
    this.urole = tokenPayload.roles[0];



    if (this.roleGuardService.checkRoles(['ICAT admin'])) {
      this.userRole = this.userRoles[0];
    } else if (this.roleGuardService.checkRoles(['ICAT user'])) {
      this.userRole = this.userRoles[1];
    } else if (this.roleGuardService.checkRoles(['PMU admin'])) {
      this.userRole = this.userRoles[2];
    } else if (this.roleGuardService.checkRoles(['PMU user'])
    ) {
      this.userRole = this.userRoles[3];
    } 
  }

    logout() {
      localStorage.setItem('access_token', '');
      localStorage.setItem('user_name', '');
      this.router.navigate(['/login']);
    }
}
