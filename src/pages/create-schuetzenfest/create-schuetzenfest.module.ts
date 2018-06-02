import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateSchuetzenfestPage } from './create-schuetzenfest';

@NgModule({
  declarations: [
    CreateSchuetzenfestPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateSchuetzenfestPage),
  ],
})
export class CreateSchuetzenfestPageModule {}
