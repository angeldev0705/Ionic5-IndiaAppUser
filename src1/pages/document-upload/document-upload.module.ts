import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DocumentUploadPage } from './document-upload';

@NgModule({
  declarations: [
    DocumentUploadPage,
  ],
  imports: [
    IonicPageModule.forChild(DocumentUploadPage),
  ],
})
export class DocumentUploadPageModule {}
