import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { environment } from 'environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  Country,
  CountryControllerServiceProxy,
  Indicator,
  Methodology,
  MethodologyData,
  Sector,
  SectorControllerServiceProxy

} from 'shared/service-proxies/service-proxies';

interface City {
  name: string;
  code: string;
}
interface Countryy {
  name: string;
  code: string;
}
@Component({
  selector: 'app-assign-methodology',
  templateUrl: './assign-methodology.component.html',
  styleUrls: ['./assign-methodology.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class AssignMethodologyComponent implements OnInit, AfterViewInit {

  countryList: Country[] = [];
  selectedSectors: Sector[] = [];
  selectedIndicators: Indicator[] = [];
  selectedMethodSelected: MethodologyData[];
  methodologyList: MethodologyData[] = [];
  countryMethList: Methodology[] = [];
  oldCountryMeth: Methodology[] = [];
  oldMethName = new Array();
  cou: Country = new Country();
  sec: Sector = new Sector();
  country: Country;
  sector: Sector;
  indicator : Indicator;
  countryId: number;
  sectorId: number;
  indicatorId: number;
  sectornID:number;

  sectorn:Sector;
  indicatorList :any = [];
  

  constructor(
    private countryProxy: CountryControllerServiceProxy,
    private sectorproxy :SectorControllerServiceProxy,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private messageService: MessageService,
  ) {

  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  select(event: any) {
  }
  selectCoun(event: any) {

    this.countryId = event.id
    this.country = event;


    this.countryProxy.getCountry(event.id).subscribe((res: any) => {
      this.cou = res;
      this.selectedSectors = [];
      for (let x = 0; x < this.cou.countrysector.length; x++) {
        this.selectedSectors.push(this.cou.countrysector[x].sector);
      }
    });


  }


  selectIndicator(event: any) {

    this.sectornID = event.id
    this.sectorn = event;

    this.selectedIndicators = [];

    this.sectorproxy.getSector(event.id).subscribe((res: any) => {
      this.sec = res;
      this.selectedIndicators = [];
       for (let x = 0; x < this.sec.sectorindicator.length; x++) {
        this.selectedIndicators.push(this.sec.sectorindicator[x].indicator);
       this.indicatorList =  this.selectedIndicators ;
       
      } 
    });


  }


  async selectMeth(event: any) {
    let methFilter: string[] = [];
    this.methodologyList = [];
    let filter: string[] = new Array();
    filter.push('Methodology.countryId||$eq||' + this.countryId);

for(let i=0; i<event.length; i++){

  this.indicatorId = event[i].id

   methFilter.push('MethodologyData.indicatorId||$eq||' + this.indicatorId);

    
    
 


  }

}


  onBackClick() {
    this.router.navigate(['/dashboard']);
  }


  async saveClick() {
    let url = environment.baseSyncAPI + '/methodology';

    await this.oldCountryMeth.forEach(async old => {
      old.isActive = 2;
    

    });

    setTimeout(async () => {
      await this.selectedMethodSelected.forEach(async a => {

        if (!this.oldMethName.includes(a.name)) {
          let newone = new Methodology()
          newone.editedBy = a.editedBy;
          newone.editedOn = a.editedOn;
          newone.status = a.status;
          newone.version = a.version;
          newone.name = a.name;
          newone.displayName = a.displayName;
          newone.developedBy = a.developedBy;
          newone.parentId = a.parentId;
          newone.applicableSector = a.applicableSector;
          newone.isActive = 1
          newone.easenessOfDataCollection = a.easenessOfDataCollection;
          newone.country = this.country;
          newone.sector = a.sector;
          newone.mitigationActionType = a.mitigationActionType;
          newone.applicability = a.applicability;
          newone.transportSubSector = a.transportSubSector;
          newone.upstream_downstream = a.upstream_downstream;
          newone.ghgIncluded = a.ghgIncluded;
          newone.documents = a.documents;
          newone.indicator = a.indicator;

          newone.method = a;
       
        }
        else {
          await this.oldCountryMeth.forEach(async old => {
            if (old.name == a.name && old.country.id == this.country.id) {
              old.isActive = 1;
             

            }
          })
        }

      });
      this.messageService.add({
        severity: 'success',
        summary: 'Success.',
        detail: 'Methodologies have been assigned successfully',

      });
      setTimeout(async () => {
        this.router.navigate(['/methodologies']);
        await axios.get(url)
      },750)


    }, 1000);



  }


  ngOnInit(): void {

    let countryFilter: string[] = [];
    countryFilter.push('Country.IsSystemUse||$eq||' + 1);

    


  }


  async saveMethod(assignMethodology: NgForm) {

  }
}
