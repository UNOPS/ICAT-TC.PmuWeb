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

import { HttpClient } from '@angular/common/http';

import { LazyLoadEvent, ConfirmationService, MessageService } from 'primeng/api';

import {
  Country,
  CountryControllerServiceProxy,
  CountryStatus,
  ProjectControllerServiceProxy,
  Sector,
  ServiceProxy,

} from 'shared/service-proxies/service-proxies';



@Component({
  selector: 'app-view-country',
  templateUrl: './view-country.component.html',
  styleUrls: ['./view-country.component.css']
})
export class ViewCountryComponent implements OnInit, AfterViewInit {

  countryList: Country[] = [];

  accessmodules: any[] = [
    { id: 1, name: "Carbon Market Tool" },
    { id: 2, name: "Portfolio Tool" },
    { id: 3, name: "Investment and Private Sector Tool" },
  ]

  selectedModules: any[] = [];

  selectedSectors: Sector[] = [];
  mapData1: CountriesData = {};
  mapData2: CountriesData = {};
  flagPath: string;
  editCountryId: any;
  isNewCountry: boolean = true;
  arr: any[] = []
  url = environment.baseUrlCountryAPI + '/country/synccountry';
  selectCountry: string = "Select a Country";

  cou: Country = new Country();
  secNames:string = ''; 
  modNames:string = '';
  @ViewChild('op') overlay: any;
  cstaus: number = 0;

  constructor(

    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,

    private serviceProxy: ServiceProxy,
    private projectProxy: ProjectControllerServiceProxy,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private countryProxy: CountryControllerServiceProxy,


  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }



  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    let institutionId = tokenPayload.institutionId ? tokenPayload.institutionId:0;


    let countryFilter: string[] = [];
    countryFilter.push('Country.IsSystemUse||$eq||' + 0);
    if(institutionId != undefined){
      countryFilter.push('institution.id||$eq||' +institutionId);
     }

     this.countryProxy.getAllCountry(
      1,
      1000,
      institutionId,
    ).subscribe(data => {
      for(let co of data.items){
        if(co.isSystemUse==false){
          this.countryList.push(co)
        }
      }
    });
    




    this.cou = new Country();
    this.route.queryParams.subscribe((params) => {
      this.editCountryId = params['id'];
      if (this.editCountryId && this.editCountryId > 0) {
        this.isNewCountry = false;
        
        this.countryProxy.getCountry(this.editCountryId)
        .subscribe((res: any) => {
          this.cou = res;

            this.cou.description = res.description
            this.onStatusChange(this.cou)

           
            if (this.cou.carboneMarketTool) {
              this.selectedModules.push({ id: 1, name: "Carbon Market Tool" })

            }
            if (this.cou.portfoloaTool) {
              this.selectedModules.push({ id: 2, name: "Portfolio Tool" })

            }
            if (this.cou.investmentTool) {
              this.selectedModules.push({ id: 3, name: "Investment and Private Sector Tool" })

            }

            for(let x =0; x<this.selectedModules.length; x++){
              let tempModName = this.selectedModules[x].name;
              this.modNames = this.modNames + ",  " + tempModName;
              
            }



            if (this.editCountryId) {
              this.selectCountry = this.cou.name;
            }
            else {

              this.selectCountry = "Select Country"
            }



          });
      }
    });



 


  }

  onStatusChange(event: any) {
    if (this.editCountryId != undefined) {

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
      }
    }

  }


  selectmod(event: any) {
  }





  activateCountry(cou: Country) {

    if (this.cou.countryStatus == CountryStatus.Active) {


      this.cou.countryStatus = CountryStatus.Deactivated;

    } else if (this.cou.countryStatus == CountryStatus.Deactivated) {
      this.cou.countryStatus = CountryStatus.Active;


    }
    this.serviceProxy.updateOneBaseCountryControllerCountry(this.cou.id, this.cou)
      .subscribe(async (res) => {
          this.confirmationService.confirm({
            message: this.cou.countryStatus === CountryStatus.Active ? 'Country is Activated' : 'Country is Deactivated',
            header: 'Confirmation',
            rejectIcon: 'icon-not-visible',
            rejectVisible: false,
            acceptLabel: 'Ok',
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
  }

  onBackClick() {
    this.router.navigate(['/country-registry']);
  }
}