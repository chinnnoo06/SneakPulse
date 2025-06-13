import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderAdminComponent } from './components/header_footer/headeradmin.component';
import { FooterAdminComponent } from './components/header_footer/footeradmin.component';
import { HeaderClientComponent } from './components/header_footer/headercliente.component';
import { FooterClientComponent } from './components/header_footer//footercliente.component';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    FooterAdminComponent,
    HeaderClientComponent,
    FooterClientComponent,
    RouterModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  mostrarHeaderFooterAdmin = false;
  mostrarHeaderFooterCliente = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      
      this.mostrarHeaderFooterAdmin = 
        url.startsWith('/inicio-admin') || 
        url.startsWith('/detallesproducto-admin/')|| 
        url.startsWith('/perfil-admin');
      
      this.mostrarHeaderFooterCliente = 
        url.startsWith('/inicio-cliente') || 
        url.startsWith('/detallesproducto-cliente/')  || 
        url.startsWith('/carrito-cliente') || 
        url.startsWith('/perfil-cliente');
    });
  }
}