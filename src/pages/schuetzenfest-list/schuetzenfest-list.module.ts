import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchuetzenfestListPage } from './schuetzenfest-list';

@NgModule({
  declarations: [
    SchuetzenfestListPage,
  ],
  imports: [
    IonicPageModule.forChild(SchuetzenfestListPage),
  ],
})
export class SchuetzenfestListPageModule {}
