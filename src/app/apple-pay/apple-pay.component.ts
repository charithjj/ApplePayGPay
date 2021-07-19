import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, RendererStyleFlags2, ViewChild } from '@angular/core';


@Component({
  selector: 'app-apple-pay',
  templateUrl: './apple-pay.component.html',
  styleUrls: ['./apple-pay.component.scss']
})
export class ApplePayComponent implements OnInit {
  @ViewChild('applePay', {static: false}) but: ElementRef<any>;  
  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if ((window as any).ApplePaySession) {
      const button = this.renderer.createElement('apple-pay-button');
      this.renderer.setAttribute(this.but.nativeElement, 'buttonstyle', 'black');
      this.renderer.setAttribute(this.but.nativeElement, 'type', 'buy');
      this.renderer.setAttribute(this.but.nativeElement, 'locale', 'el-GR');
      this.renderer.setStyle(this.but.nativeElement, 'display', 'inline-bloc', RendererStyleFlags2.Important);
      this.renderer.appendChild(this.but.nativeElement, button);
    }
  }

}
