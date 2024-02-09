import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import axios from "axios";
import {
  LearningMaterialControllerServiceProxy,
  LearningMaterial,
  ProjectOwner,
  ProjectStatus,
  Documents,
  DocumentsDocumentOwner,
  Sector,
  UserType,
  LearningMaterialSector,
  LearningMaterialUserType,
} from 'shared/service-proxies/service-proxies';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'environments/environment';
import decode from 'jwt-decode';
@Component({
  selector: 'app-learning-material',
  templateUrl: './learning-material.component.html',
  styleUrls: ['./learning-material.component.css']
})
export class LearningMaterialComponent implements OnInit, AfterViewInit {

  learnigMaterials: LearningMaterial[];
  sortOrder: number = 1; 
  sortType: number = 0; 
  event: any;
  searchBy: any = {
    text: null,
    sortOption: '',
  };
  display: boolean = false;


  @Output() newItemEvent = new EventEmitter<string>();
  closeResult = '';

  isSaving: boolean = false;
  options: any;
  projectOwnerList: ProjectOwner[] = [];
  projectStatusList: ProjectStatus[] = [];
  documents: Documents[] = [];
  documentsDocumentOwner: DocumentsDocumentOwner = DocumentsDocumentOwner.LearningMaterial;
  documentOwnerId: any = 4;
  editEntytyId: number = 0;
  proposeDateofCommence: Date;
  isLoading: boolean = false;

  checked: boolean = false;
  sectorList: Sector[] = [];
  typeList: UserType[] = [];
  selectedSector: Sector;
  finalSector: Sector = new Sector();
  selectedType: UserType = new UserType();
  documentLists: Documents[] = [];
  sortOptions = [   
    { name: 'By Date -> New to Oldest' },
    { name: 'By Date -> Oldest to New' },
    { name: 'By Document Name -> Z to A' },
    { name: 'By Document Name -> A to Z' },
  ];

  constTypeList = [
    { id: 1, name: "PMU Admin",   },
    { id: 2, name: "Country Admin",   },
    { id: 3, name: "PMU User",   },
    { id: 4, name: "ICAT Admin",   },
    { id: 5, name: "ICAT User",   },
    { id: 6, name: "Verifier",   },
    { id: 7, name: "Sector Admin",  },
    { id: 8, name: "MRV Admin",  },
    { id: 9, name: "Technical Team",  },
    { id: 10, name: "Data Collection Team",   },
    { id: 11, name: "QC Team",   },
    { id: 12, name: "Institution Admin",   },
    { id: 13, name: "Data Entry Operator", },
  ];


  downloadURL: String = environment.baseUrlAPI + "/document/downloadDocument"

  userTypeId: number = 0; 
  sectorId: number = 0; 
  userrole: any;

  username: any;
  constructor(
    private LearningMaterialProxy: LearningMaterialControllerServiceProxy,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }


  onChangeSector() {
    this.finalSector = this.selectedSector;
  }

  ngOnInit(): void {

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    this.userrole = tokenPayload.roles[0];

    this.username = tokenPayload.usr;




    let filter: string[] = [];
    if (this.userrole == "PMU Admin") {
      filter.push('name||$in||' + ["PMU Admin", "PMU User", "Country Admin"]);

    }
    if (this.userrole == "PMU User") {
      filter.push('name||$in||' + ["PMU User", "Country Admin"]);

    }
    if (this.userrole == "ICAT User") {
      filter.push('name||$in||' + ["ICAT User", "PMU User", "Country Admin"]);

    }



    this.loadgridData();

  }

  onSearch() {

    this.loadgridData();
  }

  showModalDialog() {
    this.display = true;
  }
  async closeModalDialog() {
    let url = environment.baseSyncAPI + '/lerninigMeterial';
    this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'You have successfully uploaded the document.' });
    this.display = false;
    await axios.get(url)
  }


  deleteItem(newItem: any) {
    
  }

  onStatusChange(event: any) {
    this.onSearch();

  }
  count: number = 0

  toggele() {
    this.checked = !this.checked
  }
  handleChange(e: any) {
    var isChecked = e.checked;
    this.checked = !this.checked
  }



  getDocuments() {
    this.count++;

   

  }


  loadgridData = () => {


    if (this.searchBy.sortOption.name == 'By Date -> New to Oldest') {
      this.sortOrder = 0;
      this.sortType = 0;
    }
    if (this.searchBy.sortOption.name == 'By Date -> Oldest to New') {
      this.sortOrder = 1;
      this.sortType = 0;
    }
    if (this.searchBy.sortOption.name == 'By Document Name -> Z to A') {
      this.sortOrder = 0;
      this.sortType = 1;
    }
    if (this.searchBy.sortOption.name == 'By Document Name -> A to Z') {
      this.sortOrder = 1;
      this.sortType = 1;
    }



    let filtertext = this.searchBy.text ? this.searchBy.text : '';

    let pageNumber = 1;
    let rows = 1000;

    setTimeout(() => {
      this.LearningMaterialProxy.getLearningMaterialDetails(
        pageNumber,
        rows,
        filtertext,
        this.userTypeId,
        this.sectorId,
        this.sortOrder,
        this.sortType,

      )
        .subscribe((a) => {
          this.learnigMaterials = a.items;
        });
    });

  };

}
function num(num: any) {
  throw new Error('Function not implemented.');
}

