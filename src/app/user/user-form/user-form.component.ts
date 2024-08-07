import { Component, OnInit } from '@angular/core';
import {
  Country,
  CountryControllerServiceProxy,
  CreateUserDto,
  Institution,
  InstitutionControllerServiceProxy,
  ServiceProxy,
  User,
  UsersControllerServiceProxy,
  UserType,
  UserTypeControllerServiceProxy,
} from 'shared/service-proxies/service-proxies';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';;
import decode from 'jwt-decode';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class UserFormComponent implements OnInit {
  temp1: string;
  temp2: string;
  temp3: string;

  user: User = new User();

  userTypes: UserType[] = [];

  institutions: Institution[] = [];

  countryList: Country[];

  emptyObj: Institution;

  userTitles: { id: number; name: string }[] = [
    { id: 1, name: 'Mr.' },
    { id: 2, name: 'Mrs.' },
    { id: 3, name: 'Ms.' },
    { id: 4, name: 'Dr.' },
    { id: 5, name: 'Professor' },
  ];
  selecteduserTitle: { id: number; name: string };

  isNewUser = true;
  editUserId: number;
  isEmailUsed = false;
  isEmailCountryUsed =false;
  usedEmail = '';

  alertHeader = 'User';
  alertBody: string;
  showAlert = false;

  coreatingUser = false;
  uid: any;

  filter: string='';
  filter2: string[] = [];
  countryUserList: any[] = [];
  instituteUserList: any[] = [];
  message: string;
  isDisableCuzCountry = false;

  constructor(
    private serviceProxy: ServiceProxy,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private userProxy: UsersControllerServiceProxy,
    private insProxy: InstitutionControllerServiceProxy,
    private userTypeControllerProxy: UserTypeControllerServiceProxy,
    private countryProxy: CountryControllerServiceProxy,
    private http: HttpClient,
  ) { }

  async utypeid(event: any) {
    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    const institutionId = tokenPayload.institutionId;

    this.uid = event;

    this.filter = 'status !=1' 
   
    if (this.uid?.id === 5) {
      this.filter = this.filter + ' AND id =' + 1
    } else {
      if (institutionId) {
        this.filter = this.filter + ' AND id =' + institutionId
      }
    }
    await this.insProxy.getFilteredInstitution(this.filter)
      .subscribe((res) => {
        this.institutions = res;

        if (this.user?.institution) {
          this.institutions.forEach((ins) => {
            if (ins.id == this.user.institution.id) {
              if (['PMU admin'].includes(tokenPayload.roles[0])) {
                this.institutions = [ins];
              }
            }
          });
        }
      });
  }

  async ngOnInit(): Promise<void> {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    const institutionId = tokenPayload.institutionId;
    let filter1 = 'status !=1'
    await this.insProxy.getFilteredInstitution(filter1)
      .subscribe((res) => {
        this.institutions = res;
        if (this.user?.institution) {
          this.institutions.forEach((ins) => {
            if (ins.id == this.user.institution.id) {
              this.user.institution = ins;
            }
          });
        }
      });

    await this.route.queryParams.subscribe(async (params) => {

      
      this.editUserId = params['id'];

      this.uid = this.editUserId;
      if (this.editUserId && this.editUserId > 0) {

        this.isNewUser = false;
        await this.serviceProxy
          .getOneBaseUsersControllerUser(
            this.editUserId,
            undefined,
            undefined,
            0,
          )
          .subscribe(async (res: any) => {
            this.user = await res;
            this.user.institution = res.institution;
            this.user.userType = res.userType;
            this.userTypes.push(res.userType)
            this.userTypes.forEach((userlist) => {
              if (userlist.id == res.userType.id) {
                this.user.userType = userlist;
              }
            });
            this.institutions.forEach((ins) => {
              if (ins.id == res.institution.id) {
                this.user.institution = ins;
              }
            });
          });
      }

      let filter2 = '' 
      this.filter2.push('4');
      if (['PMU admin'].includes(tokenPayload.roles[0])) {
        this.filter2.push('5');
        this.filter2.push('1');
      }

      this.userProxy.getUserType("ICAT admin").subscribe((res)=>{
        for(let a of res){
          if(a.status !=1 && a.id !=4){
            if (['PMU admin'].includes(tokenPayload.roles[0]) && a.id !=5) {
            
                this.userTypes.push(a);
            }
            else{
              this.userTypes.push(a)
            }
          }
        }
      })
      await this.insProxy.getFilteredInstitution(filter2)
        .subscribe((res) => {
          this.institutions = res;
          if (this.user?.institution) {
            this.institutions.forEach((ins) => {
              if (ins.id == this.user.institution.id) {
                this.user.institution = ins;
              }
            });
          }
        });

    });


    this.user.userType = undefined!;
    this.user.mobile = '';
    this.user.telephone = '';


    if (tokenPayload.roles[0] == 'PMU admin') {
        this.filter2.push('4') &
        this.filter2.push('5') &
        this.filter2.push('1');
    } else if (tokenPayload.roles[0] == 'PMU user') {
        this.filter2.push('4') &
        this.filter2.push('5') &
        this.filter2.push('1') &
        this.filter2.push('3');
    } else {
      this.filter2.push('4');
    }
    await this.userTypeControllerProxy.getManyUserTypes(this.filter2)
      .subscribe((res: any) => {
        this.userTypes = res;
      });

    let countryFilter = 'isSystemUse =1 AND isCA IS NULL '  ;
    if (institutionId != undefined) {
      countryFilter = countryFilter + ' AND institution.id' +institutionId
    }

    setTimeout(() => {
      this.countryProxy.getManyFilteredCountries(countryFilter)
      .subscribe(async (res) => {
        this.countryList = await res;
        this.countryList.push(this.user.country);
      });
    }, 2000);
 
  }

  onChangeUser(event: any) { }

  onChangeCountry(event: any) {
    let countryAndUserFilter = 'country.id =' + event.id + ' AND userType.id = ' + this.uid.id;
    this.userProxy.getFilteredUsers(countryAndUserFilter)
      .subscribe((res: any) => {
        this.countryUserList = res;
        if (this.countryUserList.length > 0) {
          this.message =
            'Already have, You can not add more than one Country Admin for ' +
            this.countryUserList[0]?.country?.name;
          this.isDisableCuzCountry = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Info.',
            detail: this.message,
          });
        } else {
          this.isDisableCuzCountry = false;
        }
      });
  }

  onChangeInstitutioon(event: any) {
    if (event) {
      const instituteAndUserFilter = 'institution.id =' + event.id + ' AND userType.id = ' + this.uid.id;
      this.userProxy.getFilteredUsers(instituteAndUserFilter)
        .subscribe((res: any) => {
          this.instituteUserList = res;
          if (this.instituteUserList.length > 0 && this.uid.id == 1) {
            this.message =
              'Already have, You can not add more than one PMU admin for ' +
              this.instituteUserList[0]?.institution?.name;
            this.isDisableCuzCountry = true;
            this.messageService.add({
              severity: 'info',
              summary: 'Info.',
              detail: this.message,
            });
          } else {
            this.isDisableCuzCountry = false;
          }
        });
    }

  }

  onEmailChange(event: any) {
    this.isEmailUsed = false;
    this.isEmailCountryUsed = false;
    const url = environment.baseSyncAPI + '/login-profile/isUserAvailable/' + event ;

    this.userProxy.isUserAvailable(event).subscribe((res) => {
      if (res) {
        this.isEmailUsed = true;
      }
    });
    if(this.user.userType?.id == 2){
      this.http.get<any[]>(url, event).subscribe((res) => {
        if (res) {
          this.isEmailCountryUsed = true;
        }
      });
    }
   
  }

  async saveUser(userForm: NgForm) {
    if (userForm.valid) {
      if (this.isNewUser) {
        this.isEmailUsed = false;
        this.usedEmail = '';
            if (this.isEmailUsed) {
              this.isEmailUsed = true;
              this.confirmationService.confirm({
                message:
                  'Email address is already in use, please select a diffrent email address to create a new user.!',
                header: 'Error!',
                rejectIcon: 'icon-not-visible',
                rejectVisible: false,
                acceptLabel: 'Ok',
                accept: () => { },

                reject: () => { },
              });
            } else {
              this.user.username = this.user.email;

              this.user.status = 0;

              const userType = new UserType();
              userType.id = this.user.userType.id;
              this.user.userType = userType;
              this.coreatingUser = true;
              const url = environment.baseSyncAPI + '/login-profile/syncuser';

              let createUserDto = new CreateUserDto()
              createUserDto.email = this.user.email
              createUserDto.firstName = this.user.firstName
              createUserDto.lastName = this.user.lastName
              createUserDto.mrvInstitution = this.user.mrvInstitution
              createUserDto.username = this.user.username
              createUserDto.mobile = this.user.mobile
              createUserDto.telephone = this.user.telephone
              if(this.user.country ){
                createUserDto.country = this.user.country.id
              }
              createUserDto.userType = this.user.userType.id
              if(this.user.institution ){
                createUserDto.institution = this.user.institution.id
              }
              

              this.userProxy
                .create(createUserDto)
                .subscribe(
                  async (res) => {
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Success.',
                      detail: 'User is created successfully..',
                    });
                    setTimeout(() => {
                      this.router.navigate(['/user-list']);
                    }, 2000);

                    if (this.user.userType.id === 2) {
                      this.http.post<any[]>(url, res).subscribe();
                    }
                  },
                  (error) => {
                    this.coreatingUser = false;
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error.',
                      detail: 'An error occurred, please try again.',
                    });
                  },
                  () => {
                    this.coreatingUser = false;
                  },
                );
            }
          // });
      } else {
       
        if(this.user.institution ){
          let ins = new Institution()
          ins.id = this.user.institution.id
          this.user.institution = ins
        }
        this.userProxy
          .updateOneUser(this.user.id, this.user)
          .subscribe(
            (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success.',
                detail: 'User is updated successfully..',
              });
              setTimeout(() => {
                this.router.navigate(['/user-list']);
              }, 2000);
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error.',
                detail: 'An error occurred, please try again.',
              });
            },
          );
      }
    }
  }

  onBackClick() {
    this.router.navigate(['/user-list']);
  }

  onDeleteClick() {
    this.confirmationService.confirm({
      message:
        this.user.status == 0
          ? 'Are you sure you want to deactivate the user?'
          : 'Are you sure you want to activate the user?',
      header: 'Activation Confirmation',
      acceptIcon: 'icon-not-visible',
      rejectIcon: 'icon-not-visible',
      accept: () => {
        this.deactivateUser();
      },
      reject: () => { },
    });
  }

  deleteUser() {
    this.serviceProxy
      .deleteOneBaseUsersControllerUser(this.user.id)
      .subscribe((res) => {
        this.confirmationService.confirm({
          message: 'User is deleted successfully!',
          header: 'Delete Confirmation',
          rejectIcon: 'icon-not-visible',
          rejectVisible: false,
          acceptLabel: 'Ok',
          accept: () => {
            this.onBackClick();
          },

          reject: () => { },
        });
      });
  }

  async deactivateUser() {
    const url = environment.baseSyncAPI + '/login-profile/syncuser';
    await this.userProxy
      .changeStatus(this.user.id, this.user.status == 0 ? 1 : 0)
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Successfully ${this.user.status == 0 ? 'deactivated' : 'activated'
            }`,
        });
        this.user = res;
      });

    if (this.user.userType.id == 2) {
      this.user.status == 0 ? this.user.status = 1 : this.user.status = 0;
      this.http.post<any[]>(url, this.user).subscribe();
    }

  }
}
