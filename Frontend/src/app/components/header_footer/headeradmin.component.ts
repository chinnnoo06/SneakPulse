import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './headeradmin.component.html',
  styleUrls: ['./headerfooter.component.css']
})
export class HeaderAdminComponent {
  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}