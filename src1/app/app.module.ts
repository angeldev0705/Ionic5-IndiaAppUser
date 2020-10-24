import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AccountPage } from '../pages/account/account';
import { AllreviewPage } from '../pages/allreview/allreview';
import { BookingPage } from '../pages/booking/booking';
import { ChatscreenPage } from '../pages/chatscreen/chatscreen';
import { ChatslistPage } from '../pages/chatslist/chatslist';
import { ConatctusPage } from '../pages/conatctus/conatctus';
import { MyprofilePage } from '../pages/myprofile/myprofile';
import { NotificationsPage } from '../pages/notifications/notifications';
import { PackagesPage } from '../pages/packages/packages';
import { PrivacyPage } from '../pages/privacy/privacy';
import { PurchaseplanPage } from '../pages/purchaseplan/purchaseplan';
import { RequestsPage } from '../pages/requests/requests';
import { ReviewPage } from '../pages/review/review';
import { SelectservicePage } from '../pages/selectservice/selectservice';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { My_portfolioPage } from '../pages/my_portfolio/my_portfolio';
import { Upload_portfolioPage } from '../pages/upload_portfolio/upload_portfolio';
import { DocumentUploadPage } from '../pages/document-upload/document-upload'
import { PagesIntroSliderPage } from '../pages/pages-intro-slider/pages-intro-slider';
import { QrscannerPage }  from '../pages/qrscanner/qrscanner';
import { ScanresultPage } from '../pages/scanresult/scanresult';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Connectivity } from '../providers/connectivity-service';
import { GoogleMaps } from '../providers/google-maps';
import { APP_CONFIG, BaseAppConfig } from './app.config';
import { GooglePlus } from '@ionic-native/google-plus';
import { OtpPage } from '../pages/otp/otp';
import { SelectareaPage } from '../pages/selectarea/selectarea';
import { OneSignal } from '@ionic-native/onesignal';
import { CallNumber } from '@ionic-native/call-number';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { Stripe } from '@ionic-native/stripe';
import { Diagnostic } from '@ionic-native/diagnostic';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ManagelanguagePage } from '../pages/managelanguage/managelanguage';
import { Crop } from '@ionic-native/crop';
import { File } from '@ionic-native/file';
import { FaqsPage } from '../pages/faqs/faqs';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { ClientService } from '../providers/client.service';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { FileChooser } from '@ionic-native/file-chooser';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    AccountPage,
    AllreviewPage,
    BookingPage,
    ChatscreenPage,
    ChatslistPage,
    ConatctusPage,
    MyprofilePage,
    NotificationsPage,
    PackagesPage,
    PrivacyPage,
    PurchaseplanPage,
    RequestsPage,
    ReviewPage,
    SelectservicePage,
    SigninPage,
    SignupPage,
    TabsPage,
    OtpPage,
    SelectareaPage,
    My_portfolioPage,
    Upload_portfolioPage,
    ManagelanguagePage,
    FaqsPage,
    DocumentUploadPage,
    PagesIntroSliderPage,
    QrscannerPage,
    ScanresultPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AccountPage,
    AllreviewPage,
    BookingPage,
    ChatscreenPage,
    ChatslistPage,
    ConatctusPage,
    MyprofilePage,
    NotificationsPage,
    PackagesPage,
    PrivacyPage,
    PurchaseplanPage,
    RequestsPage,
    ReviewPage,
    SelectservicePage,
    SigninPage,
    SignupPage,
    TabsPage,
    OtpPage,
    SelectareaPage,
    My_portfolioPage,
    Upload_portfolioPage,
    ManagelanguagePage,
    FaqsPage,
    DocumentUploadPage,
    PagesIntroSliderPage,
    QrscannerPage,
    ScanresultPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Network,
    Connectivity,
    GoogleMaps,
    GooglePlus,
    OneSignal,
    CallNumber,
    TranslateService,
    Stripe,
    Diagnostic,
    InAppBrowser,
    Crop,
    File,
    LocationAccuracy,
    ClientService,
    InAppPurchase,
    FileChooser,
    IOSFilePicker,
    QRScanner,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
