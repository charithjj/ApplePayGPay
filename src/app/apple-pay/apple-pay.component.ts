import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, RendererStyleFlags2, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'apple-pay',
  templateUrl: './apple-pay.component.html',
  styleUrls: ['./apple-pay.component.scss']
})
export class ApplePayComponent implements OnInit {
  @ViewChild('applePay', {static: false}) but: ElementRef<any>;  
  constructor(private renderer: Renderer2, private http: HttpClient) {
  }

  debugLog = "";
  apiBase = "https://apptesting-qa.pymnts.com.au/api"

  ngAfterViewInit() {
    // if ((window as any).ApplePaySession) {
    //   const button = this.renderer.createElement('apple-pay-button');
    //   this.renderer.setAttribute(this.but.nativeElement, 'buttonstyle', 'black');
    //   this.renderer.setAttribute(this.but.nativeElement, 'type', 'buy');
    //   this.renderer.setAttribute(this.but.nativeElement, 'locale', 'en-us');
    //   this.renderer.setStyle(this.but.nativeElement, 'display', 'inline-block', RendererStyleFlags2.Important);
    //   this.renderer.appendChild(this.but.nativeElement, button);
    // }
  }

  ngOnInit(): void {
  }

  GetPaymentSession(uri:string): Observable<any>{    
    const body = JSON.stringify({
      ValidationUrl: uri
    });

    // Adding headers to the request
    const header = {"Content-type": "application/json; charset=UTF-8" };

    this.addLog("Calling IntegraPay server GetPaymentSession:" + new Date().toLocaleString() + " Body : " + body);

    return this.http.post(this.apiBase + "/internal/applepay/startsession", body, {'headers':header}) 
  }

  // NotifyOnPaymentMethodSelected(e:any): Observable<any>{    
  //   const body = JSON.stringify({
  //     EventObj: e
  //   });

  //   // Adding headers to the request
  //   const header = {"Content-type": "application/json; charset=UTF-8" };

  //   this.addLog("Calling IntegraPay server NotifyOnPaymentMethodSelected:" + new Date().toLocaleString() + " Body : " + body);

  //   return this.http.post(this.apiBase + "/internal/applepay/OnPaymentMethodSelected", body, {'headers':header}) 
  // }

  // NotifyOnPaymentAuthorized(e:any): Observable<any>{    
  //   const body = JSON.stringify({
  //     EventObj: e
  //   });

  //   // Adding headers to the request
  //   const header = {"Content-type": "application/json; charset=UTF-8" };

  //   this.addLog("Calling IntegraPay server NotifyOnPaymentAuthorized:" + new Date().toLocaleString() + " Body : " + body);

  //   return this.http.post(this.apiBase + "/internal/applepay/NotifyOnPaymentAuthorized", body, {'headers':header}) 
  // }

  async onApplePayClick() {
    try
    {
       "apple clicked" + " " + new Date().toLocaleString();

    // Define ApplePayPaymentRequest
    const request = {
        "countryCode": "AU",
        "currencyCode": "AUD",
        "merchantCapabilities": [
            "supports3DS"
        ],
        "supportedNetworks": [
            "visa",
            "masterCard",
            "amex",
            "discover"
        ],
        "total": {
            "label": "IntegraPayDev",
            "type": "final",
            "amount": "1.99"
        }
    };
    
    // Create ApplePaySession
    //https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/creating_an_apple_pay_session
    //https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_on_the_web_version_history
    const session = new (window as any).ApplePaySession(3, request);
    
    session.onvalidatemerchant = async (event: any) => {

      this.addLog("Start Onvalidatemerchant")
      this.addLog("ValidationUrl :" + event.validationURL);
        this.GetPaymentSession(event.validationURL).subscribe(data =>
          {
            this.addLog("Received data " + new Date().toLocaleString() + " data " + data);

            this.addLog("Before Calling completeMerchantValidation");

            session.completeMerchantValidation(JSON.parse(data));
            
            this.addLog("After calling completeMerchantValidation");
          })
    };
    
    session.onpaymentmethodselected = (event: any) => {
      this.addLog("Start onpaymentmethodselected");
      // this.addLog("event.paymentMethod " + JSON.stringify(event.paymentMethod));
      // this.addLog("event.paymentPass " + JSON.stringify(event.paymentMethod.paymentPass));

        // this.NotifyOnPaymentMethodSelected(event).subscribe(data =>
        //   {
        //     this.addLog("Received data (onpaymentmethodselected)" + new Date().toLocaleString() + " data " + data);
        //   })

      const update = {
        newTotal: {
          "label": "Integrapay HPP",
          "amount": "1.99",
          "type": "final"
        },
       //newLineItems: []
        newLineItems: [{
          "label": "Card processing fee",
          "amount": "0.35",
          "type": "final"
        }]
      };
        session.completePaymentMethodSelection(update);
        this.addLog("After calling onpaymentmethodselected");
        this.addLog(JSON.stringify(session));
    };
    
    session.onshippingmethodselected = (event: any) => {
      this.addLog("Start onshippingmethodselected.");
      const update = {
        status: 'STATUS_SUCCESS',
        newShippingMethods: {    
          "label": "Free Shipping",
          "detail": "Arrives in 5 to 7 days",
          "amount": "0.00",
          "identifier": "FreeShip"
        },
        newTotal: {
          "label": "Free Shipping",
          "amount": "1.99",
          "type": "final"
        },
        newLineItems: [{
          "label": "Free Shipping",
          "amount": "1.99",
          "type": "final"
        }]
      };
        session.completeShippingMethodSelection(update);
    };
    
    session.onshippingcontactselected = (event: any) => {
      this.addLog("Start onshippingcontactselected.");
        const update = {};
        session.completeShippingContactSelection(update);
    };
    
    session.onPaymentauthorized = (event: any) => {
      this.addLog("Start onpaymentmethodselected");
      ///is.addLog("Token : " +event.payment.token);

        // this.NotifyOnPaymentAuthorized(event).subscribe(data =>
        //   {
        //     this.addLog("Received data (onPaymentauthorized) " + new Date().toLocaleString() + " data " + data);
        //   })

        const result = {
            "status": (window as any).ApplePaySession.STATUS_SUCCESS
        };
        session.completePayment(result);
    };
    
    session.oncancel = (event: any) => {
      this.addLog('Start oncancel.');
      this.addLog("event :" + JSON.stringify(event));
        // Payment cancelled by WebKit
    };
    
    session.begin();
    }
    catch(e)
    {
      this.addLog(e);
    }
  }

  addLog(log:string)
  {
    this.debugLog = this.debugLog + "\n\n" +"<br>"+ log;
    console.log(log);
  }
}
