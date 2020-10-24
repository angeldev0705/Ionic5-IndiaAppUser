import { Component , ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams , Slides , ModalController ,  ViewController } from 'ionic-angular';

/**
 * Generated class for the PagesIntroSliderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pages-intro-slider',
  templateUrl: 'pages-intro-slider.html',
})
export class PagesIntroSliderPage {

  @ViewChild(Slides) slides: Slides;
  public lang;
  public introArray;

  goToSlide() {
    this.slides.slideTo(2, 500);
  }
  constructor(public navCtrl: NavController, public navParams: NavParams , public modelCtrl: ModalController , public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PagesIntroSliderPage');
  }

  checkLang(lang){
    this.lang =  window.localStorage.getItem('2milp_dl');
    console.log(this.lang);
    this.getadata();
  }

  getadata(){
    this.introArray = 'http responce';
  }



  
  dismiss() {
    window.localStorage.setItem('intro', 'true');
    this.viewCtrl.dismiss();
  }
}
