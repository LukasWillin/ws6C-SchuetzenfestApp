import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchuetzePage } from './schuetze';

@NgModule({
  declarations: [
    SchuetzePage,
  ],
  imports: [
    IonicPageModule.forChild(SchuetzePage),
  ],
})
export class SchuetzePageModule {}
