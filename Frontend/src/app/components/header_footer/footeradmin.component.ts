import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-admin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footeradmin.component.html',
  styleUrls: ['./headerfooter.component.css']
})
export class FooterAdminComponent {
   constructor(private router: Router) {}
}