import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  stations: FirebaseListObservable<any[]>;
  newstation: HTMLTemplateElement;
  user: FirebaseObjectObservable<any>;
  userLikes: FirebaseListObservable<any[]>;
  userLikeValues: string[];
  userId: string;

  constructor(public af: AngularFire) {
    const me = this;
    this.stations = af.database.list('/stations');
    this.af.auth.subscribe(auth => {
      if (auth) {
        this.userId = auth.uid;
        af.database.object('/users/' + this.userId).update({ name: auth.auth.displayName, uid: auth.uid, photo: auth.auth.photoURL, email: auth.auth.email });
        this.user = af.database.object('/users/' + this.userId);
        this.userLikes = af.database.list('/users/' + this.userId + '/likes');
        let userLikesArray = [];
        this.userLikes.subscribe(likes => {
          console.log('userlikes', likes);
          likes.forEach(like => {
            userLikesArray.push(like.$value);
            me.userLikeValues = userLikesArray;
            console.log('userlikelist', me.userLikeValues);
          });
        });
        this.user.subscribe(user => {
          console.log('thieuser', user);
        });
      }
    });
  }
  login() {
    this.af.auth.login();
  }
  logout() {
     this.af.auth.logout();
  }
  addStation(newName: string, newLocation: string, newCoordinates: string, newUrl: string) {
    this.newstation = null;
    if (newName && newLocation && newCoordinates && newUrl) {
      this.stations.push({ name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl, user: this.userId, published: new Date() });
      this.af.database.list('/users-stations/' + this.userId).push({ name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl, published: new Date() });
    }
  }
  updateStation(key: string, newName: string, newLocation: string, newCoordinates: string, newUrl: string) {
    this.stations.update(key, { name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl });
  }
  deleteStation(key: string) {
    this.stations.remove(key);
  }
  deleteEverything() {
    this.stations.remove();
  }
  likeStation(key: string) {
    this.af.database.list('/users/' + this.userId + '/likes').push(key);
    this.af.database.list('/stations/' + key + '/likes').push(this.userId);
  }
  unlikeStation(key: string) {
    this.af.database.list('/users/' + this.userId + '/likes').remove(key);
    this.af.database.list('/stations/' + key + '/likes').remove(this.userId);
  }
}