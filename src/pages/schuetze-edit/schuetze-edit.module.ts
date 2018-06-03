import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchuetzeEditPage } from './schuetze-edit';

@NgModule({
  declarations: [
    SchuetzeEditPage,
  ],
  imports: [
    IonicPageModule.forChild(SchuetzeEditPage),
  ],
})
export class SchuetzeEditPageModule {}
