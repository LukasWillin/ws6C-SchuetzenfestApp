import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchuetzenfestShowPage } from './schuetzenfest-show';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    SchuetzenfestShowPage,
  ],
  imports: [
    IonicPageModule.forChild(SchuetzenfestShowPage),
    BrowserAnimationsModule
  ],
})
export class SchuetzenfestShowPageModule {}
