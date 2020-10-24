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
import { PriceUpdate } from '../../models/price-updator.models';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../tabs/tabs';
import { File, FileEntry, Entry } from '@ionic-native/file';
import { IOSFilePicker } from '@ionic-native/file-picker';

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  providers: [FirebaseClient]
})
export class MyprofilePage {
  private subscriptions: Array<Subscription> = [];
  private loading: Loading;
  private loadingShown = false;
  private progress: boolean;
  private uploadType: number;
  private categoriesPage = 1;
  profile = new Profile();
  categories = new Array<Category>();
  subcategoriestext: string;
  public calledby;
  sendby;

  constructor(private navCtrl: NavController, private service: ClientService,
    private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private firebaseService: FirebaseClient,
    private translate: TranslateService, navParam: NavParams, private app: App, private file: File,
    private iosFilePicker: IOSFilePicker, private platform: Platform) {
    let create_edit = navParam.get("create_edit");
    this.sendby = navParam.get('send');
    if(this.sendby == 1){
      this.calledby = true;
    }else{
      this.calledby = false;
    }
    if (create_edit) this.translate.get('create_edit_profile').subscribe(value => this.showToast(value));
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
      this.refreshProfile();
      this.getCategories();
    }); 
    // setTimeout(() => this.profile.document_url = "https://i.picsum.photos/id/456/200/300.jpg?hmac=p9jAgKWZ8BmAcmdpyO2siEEUZaIzEUHYN64WS2rJNtM", 5000);
  }

  ionViewDidEnter() {
    let newSelectedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    if (newSelectedLocation) { this.profile.address = newSelectedLocation.name; this.profile.latitude = newSelectedLocation.lat; this.profile.longitude = newSelectedLocation.lng; }

    let subCategories: Array<Category> = JSON.parse(window.localStorage.getItem("temp_sub_cats"));
    if (subCategories != null) { this.profile.subcategories = subCategories; this.setupSubCatsText(); }


    window.localStorage.removeItem(Constants.KEY_LOCATION);
    window.localStorage.removeItem("temp_sub_cats");
  }

  private setupSubCatsText() {
    if (this.profile.subcategories != null) {
      let sct = "";
      for (let sc of this.profile.subcategories)
        sct += sc.title + ", ";
      this.subcategoriestext = sct.substring(0, sct.length - 2);
    }
    this.profile.price = 50;
  }

  private refreshProfile() {
    this.subscriptions.push(this.service.getProfile().subscribe(res => {
      this.profile = res;
      window.localStorage.setItem("latestSubCat", JSON.stringify(this.profile.subcategories));
      this.setupSubCatsText();
      this.dismissLoading();
    }, err => {
      console.log('profile_get_err', err);
      this.dismissLoading();
    }));
  }

  getCategories() {
    this.subscriptions.push(this.service.categoryParentAll().subscribe(res => this.categories = res, err => console.log("categoryParentAllErr", err)));
    // this.subscriptions.push(this.service.categoryParent(this.categoriesPage).subscribe(res => {
    //   this.categories = this.categories.concat(res.data);
    //   if (res.data && res.data.length) { this.categoriesPage++; this.getCategories(); }
    // }, err => console.log('cat_err', err)));
  }

  pickLocation() {
    this.navCtrl.push(SelectareaPage);
  }

  compareFn(tr1: Category, tr2: Category): boolean {
    return tr1 && tr2 ? tr1.id == tr2.id : tr1 === tr2;
  }

  selectservice() {
    if (this.profile.categories && this.profile.categories.length) {
      if(this.calledby){
        this.navCtrl.push(SelectservicePage, { cats: this.profile.categories, cats_sub: this.profile.subcategories  , sendby: true});
      } else {
        this.navCtrl.push(SelectservicePage, { cats: this.profile.categories, cats_sub: this.profile.subcategories  , sendby: false});
      }
    } else {
      //alert("ddd");
      this.translate.get('err_service_cat').subscribe(value => this.showToast(value));
    }
  }
  subcatSelect(){
    this.translate.get('err_service_cat').subscribe(value => this.showToast(value)); 
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

  // reduceImages(selected_pictures: any): any {
  //   return selected_pictures.reduce((promise: any, item: any) => {
  //     return promise.then((result) => {
  //       return this.cropService.crop(item, { quality: 100 }).then(cropped_image => {
  //         this.resolveUri(cropped_image);
  //       });
  //     });
  //   }, Promise.resolve());
  // }

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

  upload(path: string, mime: string) {
    console.log('original: ' + path);
    let dirPathSegments = path.split('/');
    let name = dirPathSegments.pop();
    path = dirPathSegments.join('/');
    console.log('path', String(path));
    console.log('name', String(name));

    this.file.readAsArrayBuffer(path, name).then(buffer => {
      console.log("readAsArrayBuffer", buffer);
      this.translate.get(this.uploadType == 1 ? "uploading_image" : "uploading_doc").subscribe(value => {
        this.presentLoading(value);
        this.progress = true;
        this.firebaseService.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
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
      });
    }).catch(err => {
      this.dismissLoading();
      this.showToast(JSON.stringify(err));
      console.log(err);
    })
  }

  save() {
    if(this.calledby){
      if (!this.profile.categories || !this.profile.categories.length) {
        this.translate.get('err_service_cat').subscribe(value => this.showToast(value));
        return;
      }
      if (!this.profile.subcategories || !this.profile.subcategories.length) {
        this.translate.get('err_services').subscribe(value => this.showToast(value));
        return;
      }
      if (!this.profile.price || this.profile.price <= 0 || this.profile.price == undefined || this.profile.price == null) {
        this.translate.get('err_empty_price').subscribe(value => this.showToast(value));
        return;
      }
    } else {
      console.log(this.profile);
      if (!this.profile.categories || !this.profile.categories.length) {
        this.translate.get('err_service_cat').subscribe(value => this.showToast(value));
        return;
      }
      if (!this.profile.subcategories || !this.profile.subcategories.length) {
        this.translate.get('err_services').subscribe(value => this.showToast(value));
        return;
      }
      let sub = this.profile.subcategories;
      console.log(sub);
      for (let cat of sub) {
        if (cat.selected) {
          if(!cat.price) {
            this.translate.get('err_empty_price').subscribe(value => this.showToast(value));
            return;
          }
        }
      }
    }
   
    // if (!this.profile.price || this.profile.price <= 0) {
    //   this.translate.get('err_empty_price').subscribe(value => this.showToast(value));
    //   return;
    // }
    // if (!this.profile.about || !this.profile.about.length) {
    //   this.translate.get('err_empty_about').subscribe(value => this.showToast(value));
    //   return;
    // }
    // if (!this.profile.address || !this.profile.address.length) {
    //   this.translate.get('err_select_location').subscribe(value => this.showToast(value));
    //   return;
    // }
    // if (!this.profile.document_url || !this.profile.document_url.length) {
    //   this.translate.get('err_empty_doc').subscribe(value => this.showToast(value));
    //   return;
    // }
    console.log(this.profile.subcategories);
    if(this.calledby) 
    {
      let profileRequest = new ProfileUpdateRequest(this.profile);
      this.translate.get('profile_updating').subscribe(value => {
        this.presentLoading(value);
        this.subscriptions.push(this.service.updateProfile(profileRequest).subscribe(res => {
          console.log(res);
          window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
          if (this.service.getTokenSetToUse()) window.localStorage.setItem(Constants.KEY_TOKEN, this.service.getTokenSetToUse());
          this.dismissLoading();
          this.app.getRootNav().setRoot(TabsPage);
        }, err => {
          this.dismissLoading();
          console.log("profile_update_err", err);
          this.translate.get('profile_updating_fail').subscribe(value => this.presentErrorAlert(value));
        }));
      });
    } else {
      let profileRequest = new PriceUpdate(this.profile);
      this.translate.get('profile_updating').subscribe(value => {
        this.presentLoading(value);
        this.subscriptions.push(this.service.priceUpdate(profileRequest).subscribe(res => {
          console.log(res);
          window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
          if (this.service.getTokenSetToUse()) window.localStorage.setItem(Constants.KEY_TOKEN, this.service.getTokenSetToUse());
          this.dismissLoading();
          this.app.getRootNav().setRoot(TabsPage);
        }, err => {
          this.dismissLoading();
          console.log("profile_update_err", err);
          this.translate.get('profile_updating_fail').subscribe(value => this.presentErrorAlert(value));
        }));
      });
    }
    
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
