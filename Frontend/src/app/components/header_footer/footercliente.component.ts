import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-cliente',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footercliente.component.html',
  styleUrls: ['./headerfooter.component.css']
})
export class FooterClientComponent {
  constructor(private router: Router) {}
}