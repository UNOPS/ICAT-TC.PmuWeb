import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CountriesData } from 'countries-map';
import decode from 'jwt-decode';

import {
  LazyLoadEvent,
} from 'primeng/api';

import {
  Country,
  CountryControllerServiceProxy,
  Project,
  ProjectApprovalStatus,
  ProjectControllerServiceProxy,
  ProjectOwner,
  ProjectStatus,
  Sector,
  ServiceProxy,
} from 'shared/service-proxies/service-proxies';


@Component({
  selector: 'app-country-registry',
  templateUrl: './country-registry.component.html',
  styleUrls: ['./country-registry.component.css']
})
export class CountryRegistryComponent implements OnInit, AfterViewInit {

  countryList: Country[] = [];
  pcountryList: Country[] = [];

  totalRecords: number = 0;
  rows: number = 10;
  first = 0;



  mapData1: CountriesData = {};
  mapData2: CountriesData = {};

  displayPosition: boolean = false;
  position: string = 'top-right';
  selectedCountryCode: string;
  selectedMapCountry: any;
  countryFilter: string;
  loading: boolean;
  institutionId:number=0;


  @ViewChild('op') overlay: any;


  constructor(
    private router: Router,
    // private serviceProxy: ServiceProxy,
    private projectProxy: ProjectControllerServiceProxy,
    private countryProxy: CountryControllerServiceProxy,
    private cdr: ChangeDetectorRef,


  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    this.institutionId = tokenPayload.institutionId ?tokenPayload.institutionId:0;


  }

  async loadCustomers(event: LazyLoadEvent) {

    this.loading = true;
    let pageNumber =
      event.first === 0 || event.first === undefined
        ? 1
        : event.first / (event.rows === undefined ? 1 : event.rows) + 1;
    this.rows = event.rows === undefined ? 10 : event.rows;

    this.countryProxy.getAllCountry(
      pageNumber,
      this.rows,
      this.institutionId,
    ).subscribe(data => {
      this.pcountryList = data.items;

      this.totalRecords = data.meta.totalItems;
      this.loading = false;

      for (let c of this.countryList) {
        this.mapData2[c.code] = { value: 100 };
      }
      this.mapData1 = this.mapData2;

    });
  }





  toAddCountry() {
    this.router.navigate(['add-country']);
  }


  selectedCountry(event: any) {
    this.selectedCountryCode = event.country;
    this.selectedMapCountry = this.countryList.find((obj) => obj.code == this.selectedCountryCode);

    this.position = 'right';
    this.displayPosition = true;

  }

  editCountry(con: Country) {

    this.router.navigate(['/add-country'], { queryParams: { id: con.id } });
  }

  viewCountry(con: Country) {

    this.router.navigate(['/view-country'], { queryParams: { id: con.id } });
  }


}
