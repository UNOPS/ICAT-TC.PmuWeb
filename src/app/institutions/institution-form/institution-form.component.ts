import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Country, CountryControllerServiceProxy, Institution, InstitutionControllerServiceProxy, InstitutionType, InstitutionTypeControllerServiceProxy, ServiceProxy } from 'shared/service-proxies/service-proxies';
import decode from 'jwt-decode';

@Component({
  selector: 'app-institution-form',
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.css']
})
export class InstitutionFormComponent implements OnInit {

  selectedTypeList: Institution[] = [];



  institution: Institution = new Institution();

  country: Country = new Country();

  countryList: Country[] = [];
  oldCountryList: Country[] = [];

  listc: Country[] = [];

  editInstitutionId: number = 0;

  isNewInstitution: boolean = true;


  getSelectedApproach() {

  }

  @ViewChild('op') overlay: any;



  constructor(
    private serviceProxy: ServiceProxy,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private institutionProxy: InstitutionControllerServiceProxy,
    private insTypeProxy : InstitutionTypeControllerServiceProxy,
    private router: Router,
    private countryProxy: CountryControllerServiceProxy,
    private messageService: MessageService) { }

  async ngOnInit(): Promise<void> {


    this.insTypeProxy.getAllCo().subscribe((res)=>{
      this.selectedTypeList = res;
    })


this.countryProxy.getAllCo()
    .subscribe(async (res)=>{
      this.countryList = res;

        for (let i in this.countryList) {
          if (this.countryList[i].institution?.id == this.editInstitutionId && this.editInstitutionId > 0) {

            this.listc.push(this.countryList[i]);
          }
        }
    })

    this.route.queryParams.subscribe((params) => {
      this.editInstitutionId = params['id'];

      if (this.editInstitutionId > 0) {
        this.isNewInstitution = false;

        this.institutionProxy.getInstitutionDetails(
          this.editInstitutionId

        ).subscribe((res) => {
          this.institution = res;
          this.oldCountryList =res.countries;
          this.listc = res.countries;

          for (let co in this.listc) {
            this.countryList.push(this.listc[co]);
          }
        });

      }
    })



  }

  async saveForm(formData: NgForm) {

    if (formData.valid) {
      if (this.isNewInstitution) {
        let type = new InstitutionType()
        type.id = this.institution.type.id

        let ins =new Institution();
        let coArry :Country[] =[];
        for(let data of this.listc){
          let co = new Country;
          co.id= data.id;
          coArry.push(co)
        }

        ins.countries = coArry;
        ins.name =this.institution.name;
        ins.address =this.institution.address;
        ins.contactNumber =this.institution.contactNumber;
        ins.description =this.institution.description;        
        ins.type=type;

        this.serviceProxy
          .createOneBaseInstitutionControllerInstitution(ins)
          .subscribe(
            (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail:
                  this.institution.name +
                  ' has saved successfully ',
                closable: true,
              });

            },

            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error.',
                detail: 'Internal server error, please try again.',
                sticky: true,
              });
            }
          );



      } else {

        await this.oldCountryList.forEach(async (old) => {
          let ins= new Institution();
          let co =new Array();
          ins.countries=co;
          ins.type =new InstitutionType()
 //@ts-ignore
          old.institution = null;
          this.serviceProxy
            .updateOneBaseCountryControllerCountry(old.id, old)
            .subscribe((res) => {});
        });


        this.institution.countries = this.listc;
        this.serviceProxy
          .updateOneBaseInstitutionControllerInstitution(this.institution.id, this.institution)
          .subscribe(
            (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail:
                  this.institution.name +
                  ' is updated successfully ',
                closable: true,

              });

            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error.',
                detail: 'Internal server error, please try again.',
                sticky: true,
              });
            }
          );



      }
    }

  }

  onBackClick() {
    this.router.navigate(['/institution']);
  }


  activateInstitution(institution: Institution) {

    if (this.institution.status == 1) {

      let statusUpdate = 0;
      this.institution.status = statusUpdate;
    }
    else if (this.institution.status == 0) {
      let statusUpdate = 1;
      this.institution.status = statusUpdate;

    }


    this.serviceProxy
      .updateOneBaseInstitutionControllerInstitution(this.institution.id, this.institution)
      .subscribe((res) => {
        this.confirmationService.confirm({
          message: this.institution.status === 0 ? this.institution.name + ' is Activated' : this.institution.name + ' is Deactivated',
          header: 'Confirmation',
          rejectIcon: 'icon-not-visible',
          rejectVisible: false,
          acceptLabel: 'Ok',
          accept: () => {
            this.onBackClick();
          },

          reject: () => { },
        });
      },
        (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error.',
              detail: 'Failed Deactiavted, please try again.',
              sticky: true,
            });
        }
      );

  }


}
