import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Ndc, SubNdc } from 'shared/service-proxies/service-proxies';

@Component({
  selector: 'app-edit-ndc',
  templateUrl: './edit-ndc.component.html',
  styleUrls: ['./edit-ndc.component.css']
})
export class EditNdcComponent implements OnInit {

  ndcname: any;
  ndceditname: boolean=false;
  ndcid: any;
  data: SubNdc[]=new Array();
  visibility2: boolean = false;
  visibility3:boolean = false;
  visibility5: boolean = false;

  subndcname: any;
  subndc: any;
  subndcs: string[];
  subndcs1: SubNdc[];
  Deactivate:string = "Delete";
  visibility1:boolean = false;
  constructor(private router: Router, private activateroute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activateroute.queryParams.subscribe(params=>{
          this.ndcname = params['ndcname'];
          this.ndcid = params['ndcid'];
    });

let filter: string[] = new Array(); 
        filter.push('ndc.id||$eq||' + this.ndcid);  



  }

  save(){
    let ndc = new Ndc();
    ndc.name = this.ndcname;
    ndc.subNdc=this.data;
   

   
    for(let sub of this.data){
      sub.ndc.id = this.ndcid;
      if(sub.id!=undefined){
      
    }else{
    }
    }
    this.visibility3=true;
  }

  Back(){
  
    
  }
  addsub(){
   let ndc = new SubNdc();
   this.data.push(ndc);
  }

  deletendc(){
   let ndc = new Ndc();
    
    
  
  }

  deletesub(){
    
    
    this.data.splice(-1);
    this.visibility1 = true;
  }

  test(){
    this.router.navigate(['/ndc']).then(() => {
        window.location.reload();
      });
  }


}
