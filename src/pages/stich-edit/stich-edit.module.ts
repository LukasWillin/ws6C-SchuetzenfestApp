import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StichEditPage } from './stich-edit';

@NgModule({
  declarations: [
    StichEditPage,
  ],
  imports: [
    IonicPageModule.forChild(StichEditPage),
  ],
})
export class StichEditPageModule {}
