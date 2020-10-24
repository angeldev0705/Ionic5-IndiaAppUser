import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagesIntroSliderPage } from './pages-intro-slider';

@NgModule({
  declarations: [
    PagesIntroSliderPage,
  ],
  imports: [
    IonicPageModule.forChild(PagesIntroSliderPage),
  ],
})
export class PagesIntroSliderPageModule {}
