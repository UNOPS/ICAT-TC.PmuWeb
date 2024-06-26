import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, FilterService, LazyLoadEvent, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Methodology, MethodologyControllerServiceProxy, Sector, } from 'shared/service-proxies/service-proxies';
import decode from 'jwt-decode';
import axios from "axios";
import { environment } from 'environments/environment';
@Component({
  selector: 'app-methodologies',
  templateUrl: './methodologies.component.html',
  styleUrls: ['./methodologies.component.css']
})
export class MethodologiesComponent implements OnInit, AfterViewInit {

  sectors: Sector[];
  sectorName: string[] = [];

  mlist: Methodology[] = [];
  developper: string[] = [];
  methodologies: Methodology[];
  sectorList: Sector[] = [];
  searchText: string;
  countryId: any = 1;

  selectSector: Sector;


  loading: boolean;
  totalRecords: number = 0;
  rows: number = 10;
  last: number;
  event: any;

  userrole: any;
  @ViewChild('op') overlay: any;
  @ViewChild('opDR') overlayDR: any;

  searchBy: any = {
    text: null,
    version: null,
    sector: null,
    developedBy: null,
    applicablesector: null,
    document: null,
  };

  first = 0;


  constructor(
    private methodologyProxy: MethodologyControllerServiceProxy,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  @ViewChild("dt") table: Table;

  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);

    this.userrole = tokenPayload.roles[0];

   


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

    let sectorId = this.searchBy.sector ? this.searchBy.sector.id : 0;
    let developedBy = this.searchBy.developedBy ? this.searchBy.developedBy : 0;
    let filtertext = this.searchBy.text ? this.searchBy.text : '';

    let pageNumber =
      event.first === 0 || event.first === undefined
        ? 1
        : event.first / (event.rows === undefined ? 1 : event.rows) + 1;
    this.rows = event.rows === undefined ? 10 : event.rows;
    setTimeout(() => {
      this.methodologyProxy
        .getMethoDetails(

          pageNumber,
          this.rows,

          filtertext,
          sectorId,
          developedBy
        ).subscribe((a) => {
          this.methodologies = a.items;

          this.totalRecords = a.meta.totalItems;
          this.loading = false;
        });
    }, 1);
  };

  async updateMethodologyStatus(meth: Methodology, aprovalStatus: number) {


    let url = environment.baseSyncAPI + '/methodology';
    if (aprovalStatus === 1) {
     
      await this.confirmationService.confirm({

        message:
          'Are you sure to activate' +
          ' ?',
        accept: async () => {
          meth.isActive = aprovalStatus;
          await this.updateStatus(meth, aprovalStatus);

        },
        reject: () => {}
      });


      await axios.get(url)
    }
    else if (aprovalStatus === 2) {
      await this.confirmationService.confirm({

        message:
          'Are you sure to deactivate' +
          ' ?',
        accept: async () => {
          meth.isActive = aprovalStatus;
          await this.updateStatus(meth, aprovalStatus);

        },
        reject: () => {}
      });;
      await axios.get(url);
    }
    await axios.get(url)
  }

  async updateStatus(meth: Methodology, aprovalStatus: number) {
    let url = environment.baseSyncAPI + '/methodology';
   


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

  isLastPage(): boolean {
    return this.methodologies
      ? this.first === this.methodologies.length - this.rows
      : true;
  }

  isFirstPage(): boolean {
    return this.methodologies ? this.first === 0 : true;
  }

  onRedirect(meth: Methodology) {
    let docPath = meth.documents;
    window.location.href = docPath;

  }

}
