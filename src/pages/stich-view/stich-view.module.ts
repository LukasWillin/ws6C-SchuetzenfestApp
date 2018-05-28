import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StichViewPage } from './stich-view';

@NgModule({
  declarations: [
    StichViewPage,
  ],
  imports: [
    IonicPageModule.forChild(StichViewPage),
  ],
})
export class StichViewPageModule {}
