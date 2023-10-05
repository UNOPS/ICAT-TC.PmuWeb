import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { CountriesData } from 'countries-map';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import decode from 'jwt-decode';


import { LazyLoadEvent, ConfirmationService, MessageService } from 'primeng/api';

import {
  Country,
  CountryControllerServiceProxy,
  CountrySector,
  CountryStatus,
  ProjectControllerServiceProxy,
  ServiceProxy,

} from 'shared/service-proxies/service-proxies';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.component.html',
  styleUrls: ['./add-country.component.css']
})
export class AddCountryComponent implements OnInit, AfterViewInit {

  countryList: Country[] = [];

  accessmodules: any[] = [
    { id: 1, name: "Carbon Market Tool" },
    { id: 2, name: "Portfolio Tool" },
    { id: 3, name: "Investment and Private Sector Tool" },
  ]

  selectedModules: any[] = [];
  modules: any[] = [];

  mapData1: CountriesData = {};
  mapData2: CountriesData = {};
  flagPath: string;
  editCountryId: any;
  isNewCountry: boolean = true;
  arr: any[] = []
  url = environment.baseMainSyncAPI + '/country/synccountry';
  selectCountry: string = "Select a Country";


  selectedCountryCode: string;
  selectedMapCountry: any;
  displayPosition: boolean = false;
  position: string = 'top-right';
  cou: Country = new Country();


  @ViewChild('op') overlay: any;
  cstaus: number = 0;

  constructor(

    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,

    private serviceProxy: ServiceProxy,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private countryProxy: CountryControllerServiceProxy,


  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }



  async ngOnInit(): Promise<void> {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    let institutionId = tokenPayload.institutionId;

    let countryFilter: string[] = [];
    countryFilter.push('Country.IsSystemUse||$eq||' + 0);
    if(institutionId != undefined){
      countryFilter.push('institution.id||$eq||' +institutionId);  
     }
    await this.serviceProxy
      .getManyBaseCountryControllerCountry(
        undefined,
        undefined,
        countryFilter,
        undefined,
        ["name,ASC"],
        undefined,
        1000,
        0,
        0,
        0
      ).subscribe((res: any) => {
        this.countryList = res.data;
      });


    // if (institutionId != undefined) {
    //   countryFilter.push('institution.id||$eq||' + institutionId);
    // }

    this.route.queryParams.subscribe(async (params) => {
      this.editCountryId = params['id'];
      if (this.editCountryId && this.editCountryId > 0) {
        this.isNewCountry = false;

        this.countryProxy.getCountry(this.editCountryId)
          .subscribe(async (res: any) => {
            this.cou = await res;
            this.onStatusChange(this.cou)
            if (this.cou.countryStatus == CountryStatus.Active) {
              this.cstaus = 1;
            }
            else {
              this.cstaus = 0;
            }
            if (this.cou.carboneMarketTool) {
              this.selectedModules.push({ id: 1, name: "Carbon Market Tool" })

            }
            if (this.cou.portfoloaTool) {
              this.selectedModules.push({ id: 2, name: "Portfolio Tool" })

            }
            if (this.cou.investmentTool) {
              this.selectedModules.push({ id: 3, name: "Investment and Private Sector Tool" })

            }

            this.modules = this.selectedModules.filter(m => { return m.name });

            this.selectedModules = this.selectedModules.filter(m => { return m })

            if (this.editCountryId) {
              this.selectCountry = this.cou.name;
            }
            else {
              this.selectCountry = "Select Country"
            }
            let mapData2: CountriesData = {};
            mapData2[this.cou.code] = { value: 1 };
            this.mapData1 = mapData2;
          });
      }
    });


  }

  onStatusChange(event: any) {
    if (this.editCountryId == undefined) {

      if (event != null || event != undefined) {

        let mapData2: CountriesData = {};
        mapData2[event.code] = { value: 1000 };
        this.mapData1 = mapData2;
        this.cou.flagPath = event.flagPath;
        this.cou.description = event.description;
        this.cou.region = event.region;

      }
      else {
        this.mapData1 = {};
        this.flagPath = '';
        this.cou = new Country()
      }
    }
    else {
      let mapData2: CountriesData = {};
      this.mapData1 = mapData2;
      this.cou.flagPath = event.flagPath;
      this.cou.description = event.description;
      this.cou.region = event.region;
    }

  }


  selectmod(event: any) {
  }




  async saveCountry(userForm: NgForm) {
    {
      if (this.isNewCountry) {

        this.cou.id = this.cou.id;
        this.cou.description = this.cou.description
        this.cou.isSystemUse = true;
        this.cou.countryStatus = CountryStatus.Active;
        this.cou.registeredDate = moment(new Date());

        for (let x = 0; x < this.selectedModules.length; x++) {
          let selectModId = this.selectedModules[x].id;

          this.arr.push(selectModId);
        }


        if (this.arr.includes(1)) {

          this.cou.carboneMarketTool = true;
        }
        else if (!this.arr.includes(1)) {

          this.cou.carboneMarketTool = false;

        }
        if (this.arr.includes(2)) {
          this.cou.portfoloaTool = true;

        }
        else if (!this.arr.includes(2)) {
          this.cou.portfoloaTool = false;
        }
        if (this.arr.includes(3)) {
          this.cou.investmentTool = true;

        }
        else if (!this.arr.includes(3)) {
          this.cou.investmentTool = false;
        }

        let countrysectr: CountrySector[] = [];
        this.cou.countrysector = countrysectr;

        setTimeout(() => {
          this.serviceProxy
            .createOneBaseCountryControllerCountry(this.cou)
            .subscribe(async (res: any) => {

              this.messageService.add({
                severity: 'success',
                summary: 'Success.',
                detail: 'Successfully created the country',

              });
              setTimeout(() => {
                this.onBackClick();
                this.http.post<any[]>(this.url, this.cou).subscribe();
              },500)

            });
        }, 500);

      } else {

        for (let x = 0; x < this.selectedModules.length; x++) {
          let selectModId = this.selectedModules[x].id;

          this.arr.push(selectModId);

        }

        if (this.arr.includes(1)) {

          this.cou.carboneMarketTool = true;
        }
        else if (!this.arr.includes(1)) {

          this.cou.carboneMarketTool = false;

        }
        if (this.arr.includes(2)) {
          this.cou.portfoloaTool = true;

        }
        else if (!this.arr.includes(2)) {
          this.cou.portfoloaTool = false;
        }
        if (this.arr.includes(3)) {
          this.cou.investmentTool = true;

        }

        let countrysectr: CountrySector[] = [];
        this.cou.countrysector = countrysectr;
        console.log(this.cou)
        this.serviceProxy.updateOneBaseCountryControllerCountry(this.cou.id, this.cou)
          .subscribe(

            async (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success.',
                detail: 'Successfully updated the country',

              });
              setTimeout(async () => {
                this.http.post<any[]>(this.url, this.cou).subscribe();
                this.onBackClick();
              }, 1000)
            },
            (error) => {
              alert('An error occurred, please try again.');
            }
          );


      }



    }


  }



  async activateCountry(cou: Country) {

    if (this.cou.countryStatus == CountryStatus.Active) {

      this.cou.countryStatus = CountryStatus.Deactivated;

    } else if (this.cou.countryStatus == CountryStatus.Deactivated) {
      this.cou.countryStatus = CountryStatus.Active;


    }
    this.serviceProxy.updateOneBaseCountryControllerCountry(this.cou.id, this.cou)
      .subscribe(async (res) => {


        this.confirmationService.confirm({
          message: this.cou.countryStatus === CountryStatus.Active ? 'Are you sure you want to activate ' + res.name + '?' : 'Are you sure you want to deactivate ' + res.name + '?',
          header: 'Confirmation',
          rejectIcon: 'icon-not-visible',
          rejectVisible: true,
          acceptLabel: 'Yes',
          rejectLabel: 'No',
          accept: () => {
            this.onBackClick();
          },

          reject: () => { },
        });
        this.http.post<any[]>(this.url, this.cou).subscribe();
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
      this.http.post<any[]>(this.url, this.cou).subscribe();
  }

  onBackClick() {
    this.router.navigate(['/country-registry']);
  }
}