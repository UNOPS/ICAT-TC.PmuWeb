import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  LazyLoadEvent,
} from 'primeng/api';

import {
  Project,
  ProjectApprovalStatus,
  ProjectControllerServiceProxy,
  ProjectOwner,
  ProjectStatus,
  Sector,
} from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-all-climate-action',
  templateUrl: './all-climate-action.component.html',
  styleUrls: ['./all-climate-action.component.css']
})
export class AllClimateActionComponent implements OnInit,AfterViewInit {
  climateactions: Project[];
  selectedClimateActions: Project[];
  climateaction: Project = new Project();
  relatedItems: Project[] = [];
  sectors: Sector[];
  sectorName: string[] = [];
  sector: Sector = new Sector();
  cols: any;
  columns: any;
  options: any;
  sectorList: Sector[] = [];
  projectStatusList: ProjectStatus[] = [];
  projectApprovalStatus: ProjectApprovalStatus[];
  selectedSectorType: Sector;
  selectedstatustype: ProjectStatus;
  searchText: string;
  loading: boolean;
  totalRecords: number = 0;
  rows: number = 10;
  last: number;
  event: any;
  searchBy: any = {
    text: null,
    status: null,
    ApprovalStatus: null,
    
  };

  countryId: number = 0;
  sectorId: number = 0;  

  
  selectedProject: Project;
  @ViewChild('op') overlay: any;

  first = 0;
  statusList: string[] = new Array();

  constructor(
    private router: Router,
    private projectProxy: ProjectControllerServiceProxy,
    private cdr: ChangeDetectorRef,
    
    ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onRowSelect(event: any) {
    this.selectedProject = event;
  }


  onStatusChange(event: any) {
    this.onSearch();
  }

  ngOnInit(): void {
     
 
    let statusId = this.searchBy.status ? this.searchBy.status.id : 0;
    let projectApprovalStatusId = this.searchBy.ApprovalStatus ? this.searchBy.ApprovalStatus.id : 0;
    let filtertext = this.searchBy.text ? this.searchBy.text : '';
    let pageNumber = 1
    let Active= 1;
    this.projectProxy
      .getAllClimateActionList(pageNumber, this.rows, filtertext, statusId,projectApprovalStatusId,this.countryId,this.sectorId)
      .subscribe((a) => {
        this.climateactions = a.items;
        this.totalRecords = a.meta.totalItems;
      });
    
  }
 
  onSearch() {
    let event: any = {};
    event.rows = this.rows;
    event.first = 0;
    this.loadgridData(event);
  }


  loadgridData = (event: LazyLoadEvent) => {
    this.totalRecords = 0;
    let statusId = this.searchBy.status ? this.searchBy.status.id : 0;
    let projectApprovalStatusId = this.searchBy.ApprovalStatus ? this.searchBy.ApprovalStatus.id : 0;
   
    let filtertext = this.searchBy.text ? this.searchBy.text : '';
    let pageNumber =
      event.first === 0 || event.first === undefined
        ? 1
        : event.first / (event.rows === undefined ? 1 : event.rows) + 1;
    this.rows = event.rows === undefined ? 10 : event.rows;
    let Active= 1;
    setTimeout(() => {
      this.projectProxy
      .getAllClimateActionList(pageNumber, this.rows,filtertext,statusId,projectApprovalStatusId,this.countryId,this.sectorId)
      .subscribe((a) => {
        this.climateactions = a.items;
        this.totalRecords = a.meta.totalItems;
      });
    });
  };
  
  projectSummery() {
    this.router.navigate(['']); 
  }

}
