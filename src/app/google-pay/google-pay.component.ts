import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReadyToPayChangeResponse } from '@google-pay/button-angular';

@Component({
  selector: 'google-pay',
  templateUrl: './google-pay.component.html',
  styleUrls: ['./google-pay.component.scss']
})
export class GooglePayComponent {

  debugLog = "";
  amount = '1.99';
  buttonType: google.payments.api.ButtonType = 'buy';
  buttonColor: google.payments.api.ButtonColor = 'default';
  buttonLocale = '';
  existingPaymentMethodRequired = false;

  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY'],
          allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      },
    ],
    merchantInfo: {
      merchantId: '12345678901234567890',
      merchantName: 'Demo Merchant',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: '10',
      currencyCode: 'AUD'
    },
    callbackIntents:['PAYMENT_AUTHORIZATION']
  };

  onLoadPaymentData = (event: CustomEvent<google.payments.api.PaymentData>): void => {
    this.addLog('load payment data' + JSON.stringify(event.detail));
  };

  onError = (event: ErrorEvent): void => {
    this.addLog('error' + JSON.stringify(event.error));
  };

  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = paymentData => {
    this.addLog('payment authorized' + JSON.stringify(paymentData));

    return {
      transactionState: 'SUCCESS',
    };
  };

  onReadyToPayChange = (event: CustomEvent<ReadyToPayChangeResponse>): void => {
    this.addLog('ready to pay change' + JSON.stringify(event.detail));
  };

  onClick = (event: Event): void => {
    this.addLog('click');
  };

  onClickPreventDefault = (event: Event): void => {
    this.addLog('prevent default');
    event.preventDefault();
  };

  addLog(log:string)
  {
    this.debugLog = this.debugLog + "\n\n" +"<br>"+ log;
    console.log(log);
  }
}
