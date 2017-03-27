import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { GlobalService } from '../global.service';
import '../../assets/soundmanager2.js';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})

export class PlayerComponent {
  soundManager;
  private http: Http;
  playlistTracks;
  playlistTrack;
  playlistData;
  isPlaylist: boolean;
  currentPlaylist;
  currentIndex;
  currentTrack;
  currentSound;
  newSounds;
  newSound;
  currentlyPlaying: boolean;

  constructor(public globalService: GlobalService, http: Http) {
    this.http = http;
    this.currentlyPlaying = false;

    this.soundManager = window['soundManager'];

    globalService.playerUrl.subscribe(id => {
      this.playTrack(id, 0);
    });

    this.soundManager.setup({
      url: '../../assets/swf'
    });
  }

  playTrack(id, i) {
    if (typeof id === "object" && id && id.length > 0) {
      this.currentPlaylist = id;
      this.http.get('https://api.soundcloud.com/tracks/' + id[i] + '?client_id=' + this.globalService.soundcloudId.getValue())
        .map(res => {
          res.text();
            this.currentIndex = i;
            this.playlistTrack = res.json();
            this.newSound = this.soundManager.createSound({
              id: ('a' + id[i].toString()),
              url: 'https://api.soundcloud.com/tracks/' + id[i] + '/stream?client_id=' + this.globalService.soundcloudId.getValue(),
              onfinish: () => {
                this.playTrack(id, i + 1);
              },
              onPlay: () => {
                this.currentlyPlaying = true;
              },
              onPause: () => {
                this.currentlyPlaying = false;
              }
            });
            this.currentTrack = this.playlistTrack;
            if (this.currentSound) {
              this.currentSound.stop();
            }
            this.currentSound = this.newSound;
            this.newSound.play();
            this.currentlyPlaying = true;
        })
        .subscribe(
          data => this.playlistData = data
        );
    } else if (typeof id !== "object" && id) {
      this.http.get('https://api.soundcloud.com/tracks/' + id + '?client_id=' + this.globalService.soundcloudId.getValue())
        .map(res => {
          res.text();
            this.playlistTrack = res.json();
            this.newSound = this.soundManager.createSound({
              id: ('a' + id.toString()),
              url: 'https://api.soundcloud.com/tracks/' + id + '/stream?client_id=' + this.globalService.soundcloudId.getValue(),
              onfinish: () => {
                this.currentlyPlaying = false;
              },
              onPlay: () => {
                this.currentlyPlaying = true;
              },
              onPause: () => {
                this.currentlyPlaying = false;
              }
            });
            this.currentTrack = this.playlistTrack;
            if (this.currentSound) {
              this.currentSound.stop();
            }
            this.currentSound = this.newSound;
            this.newSound.play();
            this.currentlyPlaying = true;
        })
        .subscribe(
          data => this.playlistData = data
        );
    }
  }

  playSound() {
    this.currentSound.play();
    this.currentlyPlaying = true;
  }

  pauseSound() {
    this.currentSound.pause();
    this.currentlyPlaying = false;
  }

  playPrevious() {
    this.currentlyPlaying = true;
    this.currentSound.stop();
    if (this.currentPlaylist[this.currentIndex - 1]) {
      this.playTrack(this.currentPlaylist, (this.currentIndex - 1));
    } else {
      this.playTrack(this.currentPlaylist, (this.currentPlaylist.length - 1));
    }
  }

  playNext() {
    this.currentlyPlaying = true;
    this.currentSound.stop();
    if (this.currentPlaylist[this.currentIndex + 1]) {
      this.playTrack(this.currentPlaylist, (this.currentIndex + 1));
    } else {
      this.playTrack(this.currentPlaylist, 0);
    }
  }
}
