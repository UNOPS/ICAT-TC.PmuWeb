import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  LazyLoadEvent, MessageService,
} from 'primeng/api';

import {
  Sector,
  
  SubSector,
} from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-add-sector',
  templateUrl: './add-sector.component.html',
  styleUrls: ['./add-sector.component.css']
})
export class AddSectorComponent implements OnInit,AfterViewInit {

  hasSubSector:boolean = false;
  typedSector:string='';
  typedSectorDescription:string='';
  typedSubSector:string='';
  typedSubSectorDescription:string='';

  subSectorList: SubSector[] = [];

  @ViewChild('op') overlay: any;
  constructor(
    private cdr: ChangeDetectorRef,
    private messageService :MessageService,
  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void 
  {


  }


  addSubSector()
  {
    this.hasSubSector = !this.hasSubSector;
  }

  addSubsSectors()
  {

    let obj = new SubSector();
    obj.name = this.typedSubSector;
    obj.description = this.typedSubSectorDescription;
    this.subSectorList.push(obj);
    
    if(this.typedSubSector !='')
    {
      this.messageService.add({severity:'info', summary:'Info Message', detail:'Added a Sub Sector !'});
    }
    this.typedSubSector = '';
    this.typedSubSectorDescription = '';
  }

  sendData()
  {

    
    let sctr = new Sector();
    sctr.name = this.typedSector;
    sctr.description = this.typedSectorDescription;
    sctr.subSector = this.subSectorList;

       

  }

}
