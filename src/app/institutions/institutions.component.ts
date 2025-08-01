import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Country, CountryControllerServiceProxy, Institution, InstitutionControllerServiceProxy } from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.component.html',
  styleUrls: ['./institutions.component.css']
})
export class InstitutionsComponent implements OnInit, AfterViewInit {


  name:string;

 
  institutions: Institution[];

  
  countryList: Country[];
  insCountryList: Country[];

  loading: boolean;
  totalRecords: number = 0;
  rows: number = 10;
  last: number;
  event: any;
  countryName : string;

  searchBy: any = {
    text: null,
    country: null

  };

  first = 0;

  constructor(
    private institutionProxy: InstitutionControllerServiceProxy, 
    private cdr: ChangeDetectorRef,  
    private countryProxy: CountryControllerServiceProxy,

    private router: Router) { }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  @ViewChild("dt") table: Table;

  ngOnInit(): void {
    

this.countryProxy.getAllCo()
.subscribe((res: any) => {

  this.countryList = res;
  this.countryList = this.countryList.filter(a=>a.institution && a.institution.id);
});

  }

  onCountryChange(event: any) {
    this.onSearch();
  }

  onSearch() {
    let event: any = {};
    event.rows = this.rows;
    event.first = 0;


    this.loadgridData(event);
  }

  loadgridData = (event: LazyLoadEvent) => {

    this.loading = true;
    this.totalRecords = 0;

    let filtertext = this.searchBy.text ? this.searchBy.text : '';
    let countryId = this.searchBy.country ? this.searchBy.country.id : 0;



    let pageNumber =
      event.first === 0 || event.first === undefined
        ? 1
        : event.first / (event.rows === undefined ? 1 : event.rows) + 1;
    this.rows = event.rows === undefined ? 10 : event.rows;

    setTimeout(() => {
      this.institutionProxy
        .getInstiDetails(
          pageNumber,
          this.rows,
          filtertext,
          countryId,

        ).subscribe((a) => {
          this.institutions = a["1"];
          
          this.totalRecords = a["0"];

          this.loading = false;
        });
    }, 1);
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }
  getCountries(insId:number) {

    this.insCountryList=[]
    this.institutionProxy.getInstitutionDetails(insId)
    .subscribe((res: any) => {
      this.insCountryList=res.countries;
    })

  }


  new() {
    this.router.navigate(['/institution-new']);
  }
  getCountryname(institution:Institution){
    this.countryName=""
    for(let co of institution.countries){
      if(this.countryName){
        this.countryName = this.countryName + ", ";
      }     
      let name = co.name;
      this.countryName = this.countryName + name;
    }
  }

  editInstitution(institution: Institution) {
    this.router.navigate(['/institution-new'], { queryParams: { id: institution.id} });
  
  }

  testfun(){

  }

}
