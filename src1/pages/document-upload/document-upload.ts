import { Component } from '@angular/core';
import { NavController, Loading, LoadingController, ToastController, AlertController, NavParams, App, Platform } from 'ionic-angular';
import { SelectservicePage } from '../selectservice/selectservice';
import { Constants } from '../../models/constants.models';
import { Profile } from '../../models/profile.models';
import { ClientService } from '../../providers/client.service';
import { Category } from '../../models/category.models';
import { Subscription } from 'rxjs/Subscription';
import { MyLocation } from '../../models/my-location.models';
import { SelectareaPage } from '../selectarea/selectarea';
import { FirebaseClient } from '../../providers/firebase.service';
import { ProfileUpdateRequest } from '../../models/profile-update-request.models';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../tabs/tabs';
import { File, FileEntry, Entry } from '@ionic-native/file';
import { IOSFilePicker } from '@ionic-native/file-picker';

/**
 * Generated class for the DocumentUploadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-document-upload',
  templateUrl: 'document-upload.html',
  providers: [FirebaseClient]
})
export class DocumentUploadPage {
  private subscriptions: Array<Subscription> = [];
  private loading: Loading;
  private loadingShown = false;
  private progress: boolean;
  private uploadType: number;
  profile = new Profile();

  constructor(private navCtrl: NavController, private service: ClientService,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private firebaseService: FirebaseClient,
    private translate: TranslateService, navParam: NavParams, private app: App, private file: File,
    private iosFilePicker: IOSFilePicker, private platform: Platform) {
      // let create_edit = navParam.get("create_edit");
      // if (create_edit) this.translate.get('create_edit_profile').subscribe(value => this.showToast(value));
      this.translate.get('just_moment').subscribe(value => {
        this.presentLoading(value);
        this.refreshProfile();
      });
  }

  ionViewDidLoad() {
    // let newSelectedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    // if (newSelectedLocation) { this.profile.address = newSelectedLocation.name; this.profile.latitude = newSelectedLocation.lat; this.profile.longitude = newSelectedLocation.lng; }
    // console.log('ionViewDidLoad DocumentUploadPage');
  }


  private refreshProfile() {
    this.subscriptions.push(this.service.getProfile().subscribe(res => {
      this.profile = res;
      // this.setupSubCatsText();
      this.dismissLoading();
    }, err => {
      console.log('profile_get_err', err);
      this.dismissLoading();
    }));
  }

  pickPicker(num) {
    const component = this;
    if (this.progress)
      return;
    this.uploadType = num;
    this.platform.ready().then(() => {
      if (this.platform.is("android")) {
        //{ "mime": "application/pdf" }  // text/plain, image/png, image/jpeg, audio/wav etc
        //(<any>window).fileChooser.open({ "mime": component.uploadType == 1 ? "image/jpeg" : "application/*" }, (uri) => component.resolveUri(uri), (err) => console.log("fileChooser", err)); // with mime filter
        (<any>window).fileChooser.open({ "mime": "image/*" }, (uri) => component.resolveUri(uri), (err) => console.log("fileChooser", err)); // with mime filter
      } else if (this.platform.is("ios")) {
        this.iosFilePicker.pickFile().then(uri => component.resolveUri(uri)).catch(err => console.log("fileChooser", err));
      }
    });
  }

  resolveUri(uri: string) {
    // console.log('uriIn', uri);
    // if (this.platform.is("android") && uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
    //   uri = "file://" + uri.substring(uri.indexOf("/storage/"), uri.length);
    //   console.log('file: ' + uri);
    // }
    this.file.resolveLocalFilesystemUrl(uri).then((entry: Entry) => {
      console.log(entry);
      var fileEntry = entry as FileEntry;
      fileEntry.file(success => {
        var mimeType = success.type;
        console.log("mimeType", mimeType);
        // let dirPath = entry.nativeURL;
        // this.upload(dirPath, entry.name, mimeType);
        var reader = new FileReader();
        reader.onloadend = (evt: any) => {
          var imgBlob: any = new Blob([evt.target.result], { type: mimeType });
          imgBlob.name = entry.name;
          this.uploadBlob(imgBlob);
        };
        reader.onerror = (e) => {
          console.log("FileReaderErr", e);
          this.progress = false;
          this.dismissLoading();
        };
        this.translate.get(this.uploadType == 1 ? "uploading_image" : "uploading_doc").subscribe(value => {
          this.progress = true;
          this.presentLoading(value);
          reader.readAsArrayBuffer(success);
        });
      }, error => {
        console.log(error);
      });
    })
  }

  uploadBlob(blob) {
    this.firebaseService.uploadBlob(blob).then(url => {
      this.progress = false;
      this.dismissLoading();
      console.log("Url is", url);
      if (this.uploadType == 1) {
        this.profile.user.image_url = String(url);
        this.service.updateUser({ image_url: String(url) }).subscribe(res => {
          console.log(res);
          this.profile.user = res;
          let profileMe: Profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
          if (profileMe != null) {
            profileMe.user = res;
            window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(profileMe));
          }
        }, err => {
          console.log('update_user', err);
        });
      } else {
        this.profile.document_url = String(url);
        this.translate.get('document_uploaded').subscribe(value => {
          this.showToast(value);
        });
      }
    }).catch(err => {
      this.progress = false;
      this.dismissLoading();
      this.showToast(JSON.stringify(err));
      console.log(err);
      this.translate.get("uploading_fail").subscribe(value => {
        this.presentErrorAlert(value);
      });
    });
  }

  save() {
    if (!this.profile.document_url || !this.profile.document_url.length) {
      this.translate.get('err_empty_doc').subscribe(value => this.showToast(value));
      return;
    }

    let profileRequest = new ProfileUpdateRequest(this.profile);
    this.translate.get('profile_updating').subscribe(value => {
      this.presentLoading(value);
      this.subscriptions.push(this.service.updateProfile(profileRequest).subscribe(res => {
        window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
        if (this.service.getTokenSetToUse()) window.localStorage.setItem(Constants.KEY_TOKEN, this.service.getTokenSetToUse());
        this.dismissLoading();
        // this.app.getRootNav().setRoot(TabsPage);
        this.navCtrl.pop();
      }, err => {
        this.dismissLoading();
        console.log("profile_update_err", err);
        this.translate.get('profile_updating_fail').subscribe(value => this.presentErrorAlert(value));
      }));
    });
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

  private showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

}
