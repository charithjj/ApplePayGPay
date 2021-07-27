import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ApplePayComponent } from './apple-pay/apple-pay.component';
import { GooglePayComponent } from './google-pay/google-pay.component';
import { GooglePayButtonModule } from "@google-pay/button-angular";

@NgModule({
  declarations: [
    AppComponent,
    ApplePayComponent,
    GooglePayComponent
  ],
  imports: [
    BrowserModule,
    GooglePayButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
