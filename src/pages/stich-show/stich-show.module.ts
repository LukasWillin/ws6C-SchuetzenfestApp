import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StichShowPage } from './stich-show';

@NgModule({
  declarations: [
    StichShowPage,
  ],
  imports: [
    IonicPageModule.forChild(StichShowPage),
  ],
})
export class StichShowPageModule {}
