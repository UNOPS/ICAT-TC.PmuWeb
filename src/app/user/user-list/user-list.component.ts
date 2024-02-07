import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  Country,
  CountryControllerServiceProxy,
  Institution,
  InstitutionControllerServiceProxy,
  ReqUserDto,
  ServiceProxy,
  User,
  UserType,
  UsersControllerServiceProxy,
} from 'shared/service-proxies/service-proxies';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  rows: number = 10;

  loading: boolean;

  customers: User[];
  users: User[];

  totalRecords: number;

  searchText: string = '';
  searchEmailText: string;
  searchLastText: string;

  instuitutionList: Institution[];
  countrylists: Country[]
  selctedInstuitution: Institution;
  selectedCountry: Country;

  userTypes: UserType[] = [];
  selctedUserType: UserType;
  userrole: string;
  username: string;
  userInsId: number;
  userCountries: number[] = [];
  institutionId: number;
  filter2: string[] | undefined;
  pmuFilter: string[] = [];

  constructor(
    private serviceProxy: ServiceProxy,
    private userProxy: UsersControllerServiceProxy,
    private insProxy: InstitutionControllerServiceProxy,
    private countryProxy: CountryControllerServiceProxy,
    private router: Router,
    private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  @ViewChild("dt") table: Table;

  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    this.userrole = tokenPayload.roles[0];
    this.username = tokenPayload.usr;
    this.userInsId = tokenPayload.institutionId;

    this.filter2 = [];


    if (this.userrole == "PMU Admin" || this.userrole === "PMU User") {
      this.pmuFilter.push(...[' not userType.id =5 ', 'not userType.id=4', 'not userType.id=1'])
    }

    this.userProxy.allUserDetails(1, 10, this.username, 0)
      .subscribe((res) => {
        this.users = res.items;
        this.institutionId = this.users[0].institution.id;

      });

    this.insProxy.getAllIns().subscribe(res => {
      this.instuitutionList = res;
    })
    this.userProxy.getUserType(this.userrole).subscribe(a=>{
      this.userTypes = a;
    })
    this.countryProxy.getActiveCountry()
    .subscribe((res) => {
      this.countrylists = res;
    });
    if (this.userrole == "PMU Admin" || this.userrole == "PMU User") {
      this.filter2 = []
      this.insProxy.getInstitutionDetails(this.userInsId)
      .subscribe((res) => {
        res.data[0].countries.forEach((c:any)=> {
          this.userCountries.push(c.id)
        })
      });
    }


    


     

  }




  getFilterand() {
    let filters: string[] = [];

    if (this.userrole == 'PMU Admin' || this.userrole == 'PMU User') {
      if (this.selectedCountry) {
        filters.push(...this.pmuFilter)
      } else {
        filters.push(...this.pmuFilter)
          & filters.push('institution.id =' + this.userInsId);
      }
    }

    if (this.searchText && this.searchText.length > 0) {
      filters.push('firstName like "%' + this.searchText +'%"');
    }

    if (this.searchLastText && this.searchLastText.length > 0) {
      filters.push('lastName like "%' + this.searchLastText +'%"');
    }

    if (this.searchEmailText && this.searchEmailText.length > 0) {
      filters.push('email like "%' + this.searchEmailText +'%"');
    }

    if (this.selctedUserType) {
      filters.push('userType.id =' + this.selctedUserType.id);
    }

    if (this.selctedInstuitution) {
      let filter = 'institution.id =' + this.selctedInstuitution.id;
      filters.push(filter);
    }
    if (this.selectedCountry) {
      let filter = 'country.id =' + this.selectedCountry.id;
      filters.push(filter)

    }

    return filters;
  }



  onKeydown(event: any) {

    this.searchGain();
  }




  searchGain() {
    let a: any = {};
    a.rows = this.rows;
    a.first = 0;

    this.loadCustomers(a);
  }

  loadCustomers(event: LazyLoadEvent) {
    this.loading = true;

    let orFilter: string[] = []
    let andFilter: string[] = this.getFilterand()

    if ((this.userrole === "PMU Admin" || this.userrole === "PMU User") && this.userCountries.length > 0 && andFilter.length === 4) {
      orFilter.push(...this.pmuFilter, 'country.id in' + this.userCountries)
    }
    let str1 = andFilter.join(' and ');
    let str2 = orFilter.join(' or ');
    let req=new ReqUserDto();
    req.andoprator = str1;
    req.oroprator =str2;
    req.first= 1;
    req.row =event.rows;
    this.userProxy.getUserByCountry(req).subscribe(res=>{
      this.customers = res.items;
      this.totalRecords = res.meta.totalItems;
      this.loading = false;
    })

    // this.serviceProxy
    //   .getManyBaseUsersControllerUser(
    //     undefined,
    //     undefined,
    //     andFilter,
    //     orFilter,
    //     ['firstName,ASC'],
    //     ['institution'],
    //     event.rows,
    //     event.first,
    //     0,
    //     0
    //   )
    //   .subscribe((res) => {
    //     this.totalRecords = res.total;
    //     this.customers = res.data;
    //     this.loading = false;
    //   });
  }

  editUser(user: User) {

    this.router.navigate(['/user'], { queryParams: { id: user.id } });
  }

  new() {
    this.router.navigate(['/user-new']);
  }
}
