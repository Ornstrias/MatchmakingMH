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
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private teams = [];
  private step = 0;
  private dps = [];
  private tanks = [];
  private healers = [];

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
          this.createTeamsByLevels(tmpTab);
        },
        error => {
          let msg: string = "Echec de la récupération des données (services indisponibles ou en erreur)";
          console.log(msg);
        })
  }

  private dispatchPlayers(players: any[]) {
    for (let elem of players) {
      switch (elem.role) {
        case "DPS":
          this.dps.push(elem);
          break;
        case "Tank":
          this.tanks.push(elem);
          break;
        case "Healer":
          this.healers.push(elem);
          break;
      }
    }
  }

  private createTeams(players: any[]) {
    let tmpTeams = [];
    let tmp =
      {
        id: 0,
        players: []
      };

    this.dispatchPlayers(players);

    for (let i = 0; i < players.length / 4; ++i) {
      tmp.players.push(this.dps.pop());
      tmp.players.push(this.dps.pop());
      tmp.players.push(this.tanks.pop());
      tmp.players.push(this.healers.pop());
      tmp.id = i + 1;
      tmpTeams.push(tmp);
      tmp = {
        id: 0,
        players: []
      };
    }
    this.teams = tmpTeams;
  }

  private compareLvl(a, b) {
    return a.HR - b.HR;
  }

  private sortTabs() {
    this.dps.sort(this.compareLvl);
    this.tanks.sort(this.compareLvl);
    this.healers.sort(this.compareLvl);
  }

  private createTeamsByLevels(players: any[]) {
    let tmpTeams = [];
    let firstPlayer: any;
    let tmp =
      {
        id: 0,
        players: []
      };

    this.dispatchPlayers(players);
    this.sortTabs();

    for (let i = 0; i < players.length / 4; ++i) {
      firstPlayer = this.dps.shift();
      tmp.players.push(firstPlayer);
      if (firstPlayer.HR <= 25)
        tmp.players.push(this.dps.pop());
      else
        tmp.players.push(this.dps.shift());

      tmp.players.push(this.tanks.pop());
      tmp.players.push(this.healers.pop());
      tmp.id = i + 1;
      tmpTeams.push(tmp);
      tmp = {
        id: 0,
        players: []
      };
    }
    this.teams = tmpTeams;
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