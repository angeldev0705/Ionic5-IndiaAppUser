import { Component , ViewChild } from '@angular/core';
import { NavController, NavParams , Slides , ModalController ,  ViewController , LoadingController , Loading } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the PagesIntroSliderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-pages-intro-slider',
  templateUrl: 'pages-intro-slider.html',
})
export class PagesIntroSliderPage {

  @ViewChild(Slides) slides: Slides;
  private loading: Loading;
  private loadingShown: Boolean = false;
  public lang;
  public introArray;
  playload;

  goToSlide() {
    this.slides.slideTo(2, 500);
  }
  constructor(public navCtrl: NavController, public navParams: NavParams , public modelCtrl: ModalController , public viewCtrl: ViewController , private service: ClientService , private loadingCtrl: LoadingController ,private translate: TranslateService,) {
    this.checkLang();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PagesIntroSliderPage');
  }
  checkLang(){
    let lang =  window.localStorage.getItem('2milp_locale');
    console.log(this.lang);
    if(lang == 'ro')
    {
      this.lang = 'Romanian'
    } else if(lang == 'en'){
      this.lang = 'English'
    }
    this.getadata();
  }

  getadata(){
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
        this.playload = {
          language: this.lang,
          appName: '2MilPro'
        };
        this.service.getslides(window.localStorage.getItem(Constants.KEY_TOKEN), this.playload).subscribe(res => {
          console.log(res);
          this.introArray  = res;
          console.log(this.introArray);
          this.dismissLoading();
        }, err => {
          console.log(err);
          this.dismissLoading();
        });
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
  
  dismiss() {
    window.localStorage.setItem('intro', 'true');
    this.viewCtrl.dismiss();
  }
}
