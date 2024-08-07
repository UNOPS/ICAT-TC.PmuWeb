import { Component, OnInit, ViewChild } from '@angular/core';
import { } from "googlemaps";
import { CountriesData } from 'countries-map';
import { Country, CountryControllerServiceProxy, } from 'shared/service-proxies/service-proxies';
import decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  basicData: any;
  horizontalOptions: any
   options: any;
  displayPosition: boolean = false;

  overlays: any[];
  mapData1: CountriesData = {};
  mapData2: CountriesData = {};
  src: string = "";
  coun: Country;
  src1: string = "";

  isusemeth:boolean=true;
  isuse:boolean=true;

  position: string = 'top-right';
  selectedCountryCode: string;
  selectedMapCountry: any;

  @ViewChild('op') overlay: any;

  countryList: any;
  count: number;
  userName: any;

  userChartData: any;
  methologyChartData: any;
  methologychartOptions:any;
  countries: Country[];
  selectedCountryForMethology: Country;
  slectedCountryForUsertype: Country;
  constructor(
    private countryProxy: CountryControllerServiceProxy,
    private http: HttpClient) { }

  ngOnInit(): void {

    this.options = {
      center: { lat: 7.119082288502541, lng: -73.120029012106 },
      zoom: 13
    };

    const token = localStorage.getItem('access_token')!;
    const tokenPayload = decode<any>(token);
    let institutionId = tokenPayload.institutionId;

    this.horizontalOptions = {
      indexAxis: 'y',
      plugins: {
          legend: {
              labels: {
                  color: '#495057'
              }
          }
      },
      scales: {
          x: {
              ticks: {
                  color: '#495057'
              },
              grid: {
                  color: '#ebedef'
              }
          },
          y: {
              ticks: {
                  color: '#495057'
              },
              grid: {
                  color: '#ebedef'
              }
          }
      }
  };


    this.getUserUsageChart(0);
    this.getMethologyUsageChart(0);



    let filter: string[] = new Array();
    filter.push('isSystemUse||$eq||' + 1);
    if (institutionId) {
      filter.push('institution.id||$eq||' + institutionId)
    }

    this.countryProxy.getAllCountryByFilter(1,1000, 'institution.id =' +institutionId)
    .subscribe(async (res)=>{
      if(institutionId ==undefined){
        this.countryList = await res;
      }
      else if(institutionId){
        this.countryList = await res.items;
      }
    
      let count = 0;
      for (let c of this.countryList) {

        this.src1 = c.flagPath;

        this.mapData2[c.code] = { value: 1 };

        count++;
      }
      let countmem = 0;
      this.countryProxy.getAllCountryByFilter(1,1000, 'isMember =' +1)
      .subscribe((re)=>{
        countmem = re.items.length;
        this.res(countmem);
        this.basicData = {
          labels: [''],
          datasets: [


            {
              label: 'Number of ICAT member countries',
              backgroundColor: '#42A5F5',
              data: [59],
            },
            {
              label: 'Number of ICAT member countries using the tool',
              backgroundColor: '#1a069e',
              data: [count],
            },

          ]
        }
      });
      let membercount = this.res(countmem);
      this.mapData1 = this.mapData2;
    })

    this.countryProxy.getAllCountryByFilter(1,1000, 'isSystemUse =' +1)
      .subscribe(res => {
        this.countries = res.items;
      });



  }
 

  getUserUsageChart(countryId: number): void {
    let chart_url = environment.baseUrlCountryAPI + `/audit/userCount?countryId=${countryId}`;
    
    this.http.get<any[]>(chart_url).subscribe(res => {

      if(res.length>0){
        this.isuse=false
      }
     else{
        this.isuse=true
      }


      let labels: any[] = []
      let data: any[] = []
      res.map(a => {
        labels.push(a.au_userType)
        data.push(a.data)

      });

      this.userChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "#96DED1",
              "#89CFF0",
              "#0000FF",
              '#0047AB',
              '#6495ED',
              '#00008B',
              '#6082B6',
              '#5D3FD3',
              '#CCCCFF',
              '#4169E1',
            ],

            hoverBackgroundColor: [
              "#F0FFFF",

            ]
          }
        ]
      };


    });


  }

  getMethologyUsageChart(countryId: number): void {
    let chart_url = environment.baseUrlCountryAPI + `/assessment/methologyCount?countryId=${countryId}`;
   
    this.http.get<any[]>(chart_url).subscribe(res => {
      
      let labels: any[] = []
      let data: any[] = []

      if(res.length>0){
        this.isusemeth=false
      }
     else{
        this.isusemeth=true
      }
      res.map(a => {
        labels.push(a.name)
        data.push(a.data)

      });

      this.methologyChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "#96DED1",
              "#89CFF0",
              "#0000FF",
              '#0047AB',
              '#6495ED',
              '#00008B',
              '#6082B6',
              '#5D3FD3',
              '#CCCCFF',
              '#4169E1',
            ],

            hoverBackgroundColor: [
              "#F0FFFF",

            ]
          }
        ]
      };

      this.methologychartOptions={
 
        plugins: {
        
          legend: {
          
              labels: {
                generateLabels:  function(chart: any){
                  var data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map(function(label: any, i: string | number) {
                      var meta = chart.getDatasetMeta(0);
                      var style = meta.controller.getStyle(i);
                      return {
                        text: label.length >25?label.substring(0,25)+"...":label,
                        fillStyle: style.backgroundColor,
                        strokeStyle: style.borderColor,
                        lineWidth: style.borderWidth,
                        hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                        index: i
                      };
                    });
                  }
                  return [];
                },
              }
          },
      
      },
   
    
    
      }


    });


  }


  errorLoading = null;
  mapReady(): void {
  }
  onclick() {
    this.src = this.src1;
  }

  selectedCountry(event: any) {
    this.selectedCountryCode = event.country;
    if (this.selectedCountryCode != null) {
      let filter: string[] = new Array();
      filter.push('code||$eq||' + this.selectedCountryCode);
      this.countryProxy.getAllCountryByFilter(1,1000, 'code = "' + this.selectedCountryCode +'"')
      .subscribe(res => {
        this.selectedMapCountry = res.items.find((obj:any) => obj.code == this.selectedCountryCode);
       
      });
    }

    this.position = 'right';
    this.displayPosition = true;

  }


  res(count: number): number {
    this.count = count;
    return count;
  }
}

