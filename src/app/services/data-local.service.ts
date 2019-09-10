import { Injectable } from '@angular/core';
import { registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
guardados: registro[] = [];
constructor(private storage: Storage, private navCtrl: NavController,private iab: InAppBrowser){
  this.cargarStora();
 }
async cargarStora(){
  this.guardados = await this.storage.get('registros') || [];
}
 async guardarRegistro(format: string, text: string){
  await this.cargarStora();

    const nuevoRegistro = new registro(format, text);
    this.guardados.unshift(nuevoRegistro);

    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }
  abrirRegistro(regis: registro){
    this.navCtrl.navigateForward('/tab/tab2');
    switch(regis.type){
      case 'http':
          this.iab.create(regis.text, '_system');
        break;
        case 'geo':
          this.navCtrl.navigateForward(`tabs/tabs2/mapa/${regis.text}`);
          break;
    }
  }
}
