import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, AlertController, Events } from 'ionic-angular';
import { ChatscreenPage } from '../chatscreen/chatscreen';
import { Appointment } from '../../models/appointment.models';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';
import { Chat } from '../../models/chat.models';
import { Helper } from '../../models/helper.models';
import { TranslateService } from '@ngx-translate/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { MyLocation } from '../../models/my-location.models';
import { CallNumber } from '@ionic-native/call-number';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html'
})
export class BookingPage {
  private appointment: Appointment;
  private loading: Loading;
  private isLoading = false;
  private loadingShown = false;
  private statusLevel = 1;
  private statusText = "Job Pending";
  private statusLevel1Time: string;
  private statusLevel2Time: string;;
  private statusLevel3Time: string;
  private subscriptions: Array<Subscription> = [];
  private geoSubscription: Subscription;
  private watchLocationIntervalId;

  constructor(private navCtrl: NavController, navParam: NavParams, private service: ClientService, private events: Events,
    private loadingCtrl: LoadingController, private geolocation: Geolocation, private callNumber: CallNumber,
    private translate: TranslateService, private diagnostic: Diagnostic, private alertCtrl: AlertController, private locationAccuracy: LocationAccuracy) {
    this.appointment = navParam.get("appointment");
    this.setStatus();
    console.log("logs", this.appointment.logs);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    if (this.watchLocationIntervalId) {
      clearInterval(this.watchLocationIntervalId);
      this.watchLocationIntervalId = null;
    }
    this.dismissLoading();
  }

  ionViewDidEnter() {
    this.checkAndWatchLocation();
  }

  checkAppointment(toUpdate) {
   console.log(toUpdate);
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
      this.subscriptions.push(this.service.appointmentById(this.appointment.id).subscribe(res => {
        this.dismissLoading();
        console.log("res status "+res.status);
        if (toUpdate == "rejected" || toUpdate == "accepted") {
          // if (res.status == "pending") {
          //   this.updateJobStatus(toUpdate);
          // } else {
          //   this.markRefreshedThisAppointment(res);
          // }
          if (res.status) {
            this.updateJobStatus(toUpdate);
          } else {
            this.markRefreshedThisAppointment(res);
          }
        } else if (toUpdate == "onway" || toUpdate == "ongoing" || toUpdate == "complete") {
          console.dir(res);
          // if (res.status == "pending") {
          //   alert("123");
          //   this.updateJobStatus(toUpdate);
          // } else {
          //   alert("456");
          //   this.markRefreshedThisAppointment(res);
          // }
           if (res.status) {
            //alert("123");
            this.updateJobStatus(toUpdate);
          } else {
            //alert("456");
            this.markRefreshedThisAppointment(res);
          }
        } else {
          this.markRefreshedThisAppointment(res);
        }

      }, err => {
        console.log("appointmentById", err);
        this.dismissLoading();
      }));
    });
  }

  private markRefreshedThisAppointment(res) {
    this.appointment = res;
    this.setStatus();
    this.events.publish("refresh:appointments");
  }

  updateJobStatus(toUpdate: string) {
    if (toUpdate == "onway") {
      this.checkAndWatchLocation();
    } else if (this.geoSubscription) {
      this.geoSubscription.unsubscribe();
      this.geoSubscription = null;
    }
    this.translate.get('updating').subscribe(value => {
      this.presentLoading(value);
      this.subscriptions.push(this.service.appointmentUpdate(this.appointment.id, toUpdate).subscribe(res => {
        this.dismissLoading();
        this.markRefreshedThisAppointment(res);
      }, err => {
       // console.log('update_status', err);
        this.dismissLoading();
        if (err && err.status && err.status == 403) {
          this.translate.get(['err_quota_title', 'err_quota_message']).subscribe(text => {
            this.presentErrorAlert(text['err_quota_title'], text['err_quota_message']);
          });
        }
      }));
    });
  }

  checkAndWatchLocation() {
    this.diagnostic.isLocationEnabled().then((isAvailable) => {
      if (!isAvailable) this.alertLocationServices();
    }).catch((e) => {
      console.error(e);
      this.alertLocationServices();
    });
    this.watchLocation();
  }

  navigate() {
    if (this.appointment.address.latitude && this.appointment.address.longitude)
      window.open("http://maps.google.com/maps?q=loc:" + this.appointment.address.latitude + "," + this.appointment.address.longitude + " (Appointment)", "_system");
  }

  setStatus() {
    if (this.appointment) {
      console.log(this.appointment.status);
      switch (this.appointment.status) {
        case "pending": {
          this.statusLevel = 1;
          this.translate.get('updating').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "accepted": {
          this.statusLevel = 1;
          this.translate.get('job_accepted').subscribe(value => {
            this.statusText = value;
            console.log("this.statusText "+this.statusText);
          });
          break;
        }
        case "onway": {
          this.statusLevel = 2;
          this.translate.get('job_goingto').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "ongoing": {
          this.statusLevel = 2;
          this.translate.get('job_ongoing').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "complete": {
          this.statusLevel = 3;
          this.translate.get('job_complete').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "cancelled": {
          this.statusLevel = 1;
          this.translate.get('job_cancelled').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
        case "rejected": {
          this.statusLevel = 1;
          this.translate.get('job_rejected').subscribe(value => {
            this.statusText = value;
          });
          break;
        }
      }
      console.log(this.appointment);
      let acceptedTime = Helper.getLogTimeForStatus("accepted", this.appointment.logs);
      console.log(acceptedTime);
      console.log("ee");
      if (acceptedTime && acceptedTime.length) {
        this.translate.get('job_accepted_on').subscribe(value => {
          this.statusLevel1Time = value + acceptedTime;
          console.log("ggg"+this.statusLevel1Time);
        });
      }
      if (!this.statusLevel1Time || !this.statusLevel1Time.length) {
        if (this.appointment.status == "cancelled") {
          this.translate.get('job_cancelled_on').subscribe(value => {
            this.statusLevel1Time = value + Helper.formatTimestampDateTime(this.appointment.updated_at, Helper.getLocale());
          });
        } else if (this.appointment.status == "rejected") {
          this.translate.get('job_rejected_on').subscribe(value => {
            this.statusLevel1Time = value + Helper.formatTimestampDateTime(this.appointment.updated_at, Helper.getLocale());
          });
        } else {
          this.statusLevel1Time = this.appointment.updated_at;
        }
      }
      this.translate.get('job_started_on').subscribe(value => {
        let onwaytime = Helper.getLogTimeForStatus("onway", this.appointment.logs);
        console.log("onwaytime "+onwaytime);
        if (onwaytime && onwaytime.length) {
          this.statusLevel2Time = value + onwaytime;
          console.log("onwaytime "+onwaytime);
        } else {
          this.statusLevel2Time = value + Helper.getLogTimeForStatus("ongoing", this.appointment.logs);
          console.log("ongoing "+onwaytime);
        }
      });
      this.translate.get('job_completed_on').subscribe(value => {
        this.statusLevel3Time = value + Helper.getLogTimeForStatus("complete", this.appointment.logs);
      });
     // console.log(this.appointment.logs);
    }
  }

  callUser() {
    this.callNumber.callNumber(this.appointment.user.mobile_number, true).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
  }

  chatscreen() {
    let chat = new Chat();
    chat.chatId = this.appointment.user.id + "hc";
    chat.chatImage = (this.appointment.user.image_url && this.appointment.user.image_url.length) ? this.appointment.user.image_url : "assets/imgs/empty_dp.png";
    chat.chatName = this.appointment.user.name;
    chat.chatStatus = this.appointment.user.email;
    chat.myId = this.appointment.provider.user_id + "hp";
    this.navCtrl.push(ChatscreenPage, { chat: chat });
  }

  watchLocation() {
    if (!this.watchLocationIntervalId) {
      this.watchLocationIntervalId = setInterval(() => {
        console.log("Watchinglocation");
        const component = this;
        component.geolocation.getCurrentPosition().then((resp) => {
          let location = new MyLocation();
          location.lat = String(resp.coords.latitude);
          location.lng = String(resp.coords.longitude);
          window.localStorage.setItem(Constants.KEY_LOCATION, JSON.stringify(location));
          let refLocation = firebase.database().ref().child("handyman_provider").child(String(this.appointment.provider.user_id));
          refLocation.set(location).then(res => console.log(res)).catch(err => console.log(err));
        });
      }, 10000);
    }
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['location_services_title'],
        subTitle: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            this.locationAccuracy.canRequest().then((canRequest: boolean) => {
              if (canRequest) {
                // the accuracy option will be ignored by iOS
                this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                  () => console.log('Request successful'),
                  error => console.log('Error requesting location permissions', error)
                );
              }
            });
          }
        }]
      });
      alert.present();
    })
  }

  private presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.onDidDismiss(() => { });
    this.loading.present();
    this.loadingShown = true;
  }

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }

  private presentErrorAlert(title: string, msg: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

}
