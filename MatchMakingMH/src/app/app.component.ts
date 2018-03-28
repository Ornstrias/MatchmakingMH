import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  teams = [];
  step = 0;

  constructor(private _http: HttpClient) { }

  ngOnInit() {
    this.getAndEditJson();
  }

  getAndEditJson() {
    let url: string = "assets/players.json";
    let tmpTab = [];
    this._http.get(url)
      .takeUntil(this.destroy$)
      .subscribe(
        data => {
          let objArray: Object[] = <Object[]>data;
          let tmp;
          let premadeLuck;
          let alreadyPicked = [];
          let j;
          for (let elem of objArray) {
            tmp = {
              playerID: elem['playerID'],
              id: elem['id'],
              HR: elem['HR'],
              role: elem['role'],
            }
            tmpTab.push(tmp);
          }
          this.createTeams(tmpTab);
        },
        error => {
          let msg: string = "Echec de la récupération des données (services indisponibles ou en erreur)";
          console.log(msg);
        })
  }

  private createTeams(players:any[])
  {
    let tmpTeams = [];
    let tmp =
    {
      id:0,
      players:[]
    };
    for(let i = 0; i < players.length; ++i)
    {
      tmp.players.push(players[i]);
      if(tmp.players.length == 4)
      {
        tmp.id=Math.floor(i/4) + 1;
        tmpTeams.push(tmp);
        tmp = {
          id:0,
          players:[]
        };
      }
    }
    this.teams = tmpTeams;
    console.log(this.teams);
  }

  

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}