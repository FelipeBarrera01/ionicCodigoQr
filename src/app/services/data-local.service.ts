import { Injectable } from '@angular/core';
import { registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
guardados: registro[] = [];
constructor(private storage: Storage, private navCtrl: NavController
  ,private iab: InAppBrowser, private file: File,private emailComposer: EmailComposer){
  this.cargarStora();
 }
 enviarCorreo(){
   const arrTemp = [];
   const titulos = 'Tipo, Formato, Creado en, Texto\n';
   arrTemp.push(titulos);
   this.guardados.forEach(registro =>{
     const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
    arrTemp.push(linea);
    });
    this.crearArchivoFisico(arrTemp.join(''));
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
  crearArchivoFisico( text: string ){
    this.file.checkFile(this.file.dataDirectory, 'registros.csv')
    .then( existe => {
      return this.escribirEnArchivo(text);
    }).catch(err =>{
      return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
      .then( creado =>{
        this.escribirEnArchivo(text);
      }).catch(er =>{
        console.log(er);

      });
    });
  }
  async escribirEnArchivo(text: string){
   await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
   const archivo = `${this.file.dataDirectory}/registros.csv`
   const email = {
    to: 'juan.f.barrera@gmail.com',
  
   
    attachments: [
      archivo
    ],
    subject: 'Backup de scans',
    body: 'How are you? Nice greetings from Leipzig',
    isHtml: true
  }
  
  // Send a text message using default options
  this.emailComposer.open(email);
  }
}
