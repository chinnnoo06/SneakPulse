import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderAdminComponent } from './components/header_footer/headeradmin.component';
import { FooterAdminComponent } from './components/header_footer/footeradmin.component';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    FooterAdminComponent,
    RouterModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  mostrarHeaderFooterAdmin = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.mostrarHeaderFooterAdmin = 
        event.urlAfterRedirects.startsWith('/inicio-admin') || 
        event.urlAfterRedirects.startsWith('/detallesproducto-admin/');
    });
  }
}