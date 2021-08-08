import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, RendererStyleFlags2, ViewChild } from '@angular/core';


@Component({
  selector: 'apple-pay',
  templateUrl: './apple-pay.component.html',
  styleUrls: ['./apple-pay.component.scss']
})
export class ApplePayComponent implements OnInit {
  @ViewChild('applePay', {static: false}) but: ElementRef<any>;  
  constructor(private renderer: Renderer2) {
  }

  debugInfo = "";

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if ((window as any).ApplePaySession) {
      const button = this.renderer.createElement('apple-pay-button');
      this.renderer.setAttribute(this.but.nativeElement, 'buttonstyle', 'black');
      this.renderer.setAttribute(this.but.nativeElement, 'type', 'buy');
      this.renderer.setAttribute(this.but.nativeElement, 'locale', 'en-us');
      this.renderer.setStyle(this.but.nativeElement, 'display', 'inline-block', RendererStyleFlags2.Important);
      this.renderer.appendChild(this.but.nativeElement, button);
    }
  }

 async validateMerchant():Promise<any> {

    this.debugInfo = this.debugInfo + "Starting validate merchant" + new Date().toLocaleString();
    
    try
    {
      //return fetch("https://apple-pay-gateway.apple.com/paymentservices/paymentSession", {
       // return fetch("https://restapi-qa.pymnts.com.au/internal/applepay/startsession", {
        var response = await fetch("https://apptesting-qa.pymnts.com.au/api/internal/applepay/startsession", {
        // Adding method type
        method: "POST",
          
        // Adding body or contents to send
        body: JSON.stringify({
          ValidationUrl: "https://apple-pay-gateway.apple.com/paymentservices/paymentSession"
        }),
        // body: JSON.stringify({
        //   merchantIdentifier: "merchant.com.integrapaydev",
        //   displayName: "ApplePayMerchant",
        //   initiative: "web",
        //   initiativeContext: "apptesting-qa.pymnts.com.au"
        // }),
        
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
      });

      //const body = await response.json();

      this.debugInfo = this.debugInfo + "**** RESPONSE " + JSON.stringify(response) + "*** RESPONSE END";
      //this.debugInfo = this.debugInfo + "**** BODY " + JSON.stringify(body) + "*** BODY END";

      return response;
    }
    catch(error)
    {
      this.debugInfo = this.debugInfo + error;
      return error;
    }
    finally
    {
      this.debugInfo = this.debugInfo + " Finally in validateMerchant";
    }
  }

  async onApplePayClick() {
    try
    {
      console.log('On Apple Pay Clicked' + new Date().toLocaleString());

    this.debugInfo = this.debugInfo + " " + "apple clicked" + " " + new Date().toLocaleString();

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
    
    this.debugInfo = this.debugInfo + " " + "Creating session.";

    // Create ApplePaySession
    //https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/creating_an_apple_pay_session
    //https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_on_the_web_version_history
    const session = new (window as any).ApplePaySession(3, request);

    this.debugInfo = this.debugInfo + " " + "Session Created." + JSON.stringify(session);
    
    session.onvalidatemerchant = async (event: any) => {
        // Call your own server to request a new merchant session.
        console.log('Inside On Validate Merhant')
        this.debugInfo = this.debugInfo + new Date().toLocaleString() + ' Inside On Validate Merhant.' + " event: URL" + event.validationURL + " " + JSON.stringify(event) ;
        
        
        const merchantSession = await this.validateMerchant();
        this.validateMerchant().then(t => {
          session.completeMerchantValidation(t)
          this.debugInfo = this.debugInfo + "INSIDE THEN"
        })


        this.debugInfo = this.debugInfo + "OUT Then"

        console.log('merchantsession', merchantSession);
        this.debugInfo = this.debugInfo + "-- Merchant Session : " + new Date().toLocaleString()+ JSON.stringify(merchantSession);
        //session.completeMerchantValidation(merchantSession);
    };
    
    session.onpaymentmethodselected = (event: any) => {
      this.debugInfo = this.debugInfo + ' Inside onpaymentmethodselected.';
        // Define ApplePayPaymentMethodUpdate based on the selected payment method.
        // No updates or errors are needed, pass an empty object.
        const update = {};
        session.completePaymentMethodSelection(update);
    };
    
    session.onshippingmethodselected = (event: any) => {
      this.debugInfo = this.debugInfo + ' Inside onshippingmethodselected.';
        // Define ApplePayShippingMethodUpdate based on the selected shipping method.
        // No updates or errors are needed, pass an empty object. 
        const update = {};
        session.completeShippingMethodSelection(update);
    };
    
    session.onshippingcontactselected = (event: any) => {
      this.debugInfo = this.debugInfo + ' Inside onshippingcontactselected.';
        // Define ApplePayShippingContactUpdate based on the selected shipping contact.
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
            "amount": "5.00",
            "type": "final"
          },
          newLineItems: [{
            "label": "Free Shipping",
            "amount": "5.00",
            "type": "final"
          }]
        };
        session.completeShippingContactSelection(update);
    };
    
    session.onpaymentauthorized = (event: any) => {
      this.debugInfo = this.debugInfo + ' Inside onpaymentauthorized.';
        // Define ApplePayPaymentAuthorizationResult
        const result = {
            "status": (window as any).ApplePaySession.STATUS_SUCCESS
        };
        session.completePayment(result);
    };
    
    session.oncancel = (event: any) => {
      this.debugInfo = this.debugInfo + ' Inside oncancel.';
        // Payment cancelled by WebKit
    };
    
    this.debugInfo = this.debugInfo + ' Session begins.  ' + JSON.stringify(session);
    session.begin();
    this.debugInfo = this.debugInfo + ' Session Began.  ' + JSON.stringify(session);
    }
    catch(e)
    {
      this.debugInfo = this.debugInfo + e;
    }
  }
}
