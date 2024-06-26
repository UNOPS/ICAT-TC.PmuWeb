import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Country, CountryControllerServiceProxy, Sector, ServiceProxy } from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-view-country',
  templateUrl: './view-country.component.html',
  styleUrls: ['./view-country.component.css']
})
export class ViewCountryComponent implements OnInit {
  country: Country = new Country();
  sectors: Sector[];
  tabs:any;
  countryId: number;


  constructor(private router: Router,
    private activateroute: ActivatedRoute,
    private countryProxy: CountryControllerServiceProxy,
    private serviceProxy: ServiceProxy) { }

  ngOnInit(): void {

    
    this.activateroute.queryParams.subscribe(params=>{
      if(params!==null){
        this.countryId = 1;
      }
    })
this.countryProxy.getCountry(this.countryId)
.subscribe((res: any) => {
  this.country = res;
  this.countryId = this.country.id;
})





  let countryFilter: string[] = new Array();

  countryFilter.push('country.id||$eq||' + this.countryId);      

  this.serviceProxy
  .getManyBaseSectorControllerSector(
    undefined,
    undefined,
    countryFilter,
    undefined,
    undefined,
    ['country'],
    1000,
    0,
    0,
    0
  ).subscribe((res) => {
    this.sectors=res.data;
  });
  }
edit(){
  this.router.navigate(['edit-country']);
}

ndc(){
  this.router.navigate(['ndc'])
}


}
