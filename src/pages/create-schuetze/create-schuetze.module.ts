import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateSchuetzePage } from './create-schuetze';

@NgModule({
  declarations: [
    CreateSchuetzePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateSchuetzePage),
  ],
})
export class CreateSchuetzePageModule {}
