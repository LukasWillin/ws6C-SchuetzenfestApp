import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchuetzeCreatePage } from './schuetze-create';

@NgModule({
  declarations: [
    SchuetzeCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(SchuetzeCreatePage),
  ],
})
export class SchuetzeCreatePageModule {}
