import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/api';
import decode from 'jwt-decode';
import {
  Audit,
  AuditControllerServiceProxy,
  ServiceProxy,
  User,
  UsersControllerServiceProxy,
} from 'shared/service-proxies/service-proxies';

// import {Audit as audit} from 'shared/service-proxies-auditlog/service-proxies'

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
})
export class AuditComponent implements OnInit {
  loading: boolean;
  totalRecords: number = 0;
  rows: number = 10;
  last: number;
  event: any;
  Date = new Date();
  searchText: string;
  status: string[] = [];
  activityList: string[] = [];
  userTypeList: string[] = [];

  searchBy: any = {
    text: null,
    usertype: null,
    activity: null,
    editedOn: null,
  };

  first = 0;
  activities: Audit[];
  dateList: Date[] = [];
  loggedusers: User;
  institutionId: number;
  username:string

  constructor(
    private router: Router,
    private serviceProxy: ServiceProxy,
    private auditproxy: AuditControllerServiceProxy,
    private userproxy: UsersControllerServiceProxy,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    this.username = tokenPayload.usr;






    // this.serviceProxy
    //   .getManyBaseUsersControllerUser(
    //     undefined,
    //     undefined,
    //     filters,
    //     undefined,
    //     ['editedOn,DESC'],
    //     undefined,
    //     1000,
    //     0,
    //     0,
    //     0

    //   )
    //   .subscribe((res) => {
    //     this.loggedusers = res.data;
    //     this.institutionId = this.loggedusers[0].institution.id;
    //   });



  }

  onactivityChange(event: any) {
    this.onSearch();
  }
  ondateChange(event: any) {
    this.onSearch();
  }
  onUTChange(event: any) {
    this.onSearch();
  }

  onSearch() {
    let event: any = {};
    event.rows = this.rows;
    event.first = 0;

    this.loadgridData(event);
  }


   loadgridData = async (event: LazyLoadEvent) => {
   await  this.userproxy.findUserByUserName(this.username)
    .subscribe(async (res) => {
      this.loggedusers = await res;
      this.institutionId = this.loggedusers.institution.id;
    });
    this.loading = true;
    this.totalRecords = 0;


    let usertype = this.searchBy.usertype ? this.searchBy.usertype : '';
    let action = this.searchBy.activity ? this.searchBy.activity : '';
    let filtertext = this.searchBy.text ? this.searchBy.text : '';


    let editedOn = this.searchBy.editedOn
      ? moment(this.searchBy.editedOn).format('YYYY-MM-DD')
      : '';

    let pageNumber =
      event.first === 0 || event.first === undefined
        ? 1
        : event.first / (event.rows === undefined ? 1 : event.rows) + 1;
    this.rows = event.rows === undefined ? 10 : event.rows;

    setTimeout(() => {
      this.auditproxy
        .getAuditDetails(
          pageNumber,
          this.rows,
          usertype,
          action,
          editedOn,
          filtertext,
          this.institutionId
        )

        .subscribe((a) => {

          this.activities = a.items;

          this.totalRecords = a.meta.totalItems;
          this.loading = false;

          for (let d of a.items) {
            if (!this.status.includes(d.actionStatus)) {
              this.status.push(d.actionStatus);
            }

            if (!this.userTypeList.includes(d.userType)) {
              this.userTypeList.push(d.userType);
            }
          }
        });
    }, 1000);
  };
}
