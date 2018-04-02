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
  /**
   * Méthode qui se lance à l'initialisation de la page.
   * Cette méthode fait une requète HTTP sur le fichier json
   * Le récupère et le parse
   * Lorsque le parçage est terminé, la méthode de création des équipes est appelée 
   * 
   * @memberof AppComponent
   */
  getAndEditJson() {
    let url: string = "assets/players.json";
    let tmpTab = [];
    this._http.get(url)
      .takeUntil(this.destroy$)
      .subscribe(
        data => {
          let objArray: Object[] = <Object[]>data;
          let tmp;
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
  /**
   * Méthode qui dispatch les joueurs dans les tableaux appropriés en fonction de leurs rôle dans l'équipe
   * 
   * @private
   * @param {any[]} players 
   * @memberof AppComponent
   */
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
/**
 * Méthode qui crée des équipes sans tenir compte des niveaux
 * Elle vide les tableaux des rôles au fur et à mesure jusqu'à ce que toutes les équipes soient constituées
 * Cette méthode n'est plus appellée dans la version finale.
 * 
 * @private
 * @param {any[]} players 
 * @memberof AppComponent
 */
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

/**
 * Méthode de comparaison des niveaux des joueurs.
 * On se sert de cette methode avec la fonction array.sort afin de trier les tableaux des joueurs par leurs niveaux
 * 
 * @private
 * @param {any} a 
 * @param {any} b 
 * @returns 
 * @memberof AppComponent
 */
private compareLvl(a, b) {
    return a.HR - b.HR;
  }

  /**
   * Méthode de triage des joueurs par niveaux.
   * 
   * @private
   * @memberof AppComponent
   */
  private sortTabs() {
    this.dps.sort(this.compareLvl);
    this.tanks.sort(this.compareLvl);
    this.healers.sort(this.compareLvl);
  }

/**
 * Méthode qui crée les équipes en tenant compte de leurs niveaux
 * Tant que le nombre de joueurs est suffisant pour le maintenir, l'algorithme fonctionne ainsi:
 * 
 * On recupère le premier joueur
 * Si son niveau est < 25 on le met avec 3 joueurs > 50
 * 
 * Sinon on met 2 joueurs entre 25 et 50 et deux joueurs au dessus de 50
 * 
 * Les tests montrent ainsi qu'au minimun même lorsque le nombre de joueur n'est pas suffisant,
 * on a généralement 2 véterans et 2 jeunes joueurs par équipe ce qui répond à la problématique.
 * 
 * @private
 * @param {any[]} players 
 * @memberof AppComponent
 */
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


/**
 * Les méthode Step servent à faire marcher les boutons prev et next des mat-extension-panel
 * 
 * @param {number} index 
 * @memberof AppComponent
 */
setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
/**
 * Méthode triggered à la destruction de la page.
 * Elle sert à unsubcribe l'observable de la requete HTML
 * Gestion de mémoire de l'application.
 * 
 * @memberof AppComponent
 */
ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}