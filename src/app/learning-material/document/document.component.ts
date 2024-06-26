import { Component, Input, OnInit ,AfterViewInit, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LearningMaterial } from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit,AfterViewInit {
  @Input() documents: any;
  @Output() newItemEvent = new EventEmitter<string>();
  
 object_array: any[] = [];
 doc_name :any[] = [];
 
  constructor(private cdr: ChangeDetectorRef, 
    private confirmationService: ConfirmationService,
    private messageService:MessageService,
    public router: Router,
    ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  ngOnInit(): void {
    

 this.object_array = Object.keys(this.documents).map((key) =>{  
    this.object_array.push({[key]:this.documents[key]})  
    
    
    return this.object_array;  
}); 

this.doc_name.push(this.object_array[0][7].documentName);
this.doc_name.push(this.object_array[0][3].editedOn);
this.doc_name.push(this.object_array[0][5].id);
  }

  onRedirect()
  {
   window.location.href = this.object_array[0][8].document; 
  }

  toDelete(doc:any)
  {
  this.confirmationService.confirm({
    message: `Are you sure Do you want to delete this document ?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    accept: () => {
      
      this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted the delete'});
      this.newItemEvent.emit(doc);
    },
    reject: () => {
      this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected the delete'});
    },
  });

  }

}
