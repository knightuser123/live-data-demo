import { Component, OnInit } from '@angular/core';
import { LiveTableComponent } from '../../components/live-table/live-table.component';
import { ActivatedRoute } from '@angular/router';
import { ModuleConfig, ModuleKey, MODULES } from '../../config/modules';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [LiveTableComponent],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent implements OnInit {
  moduleKey: ModuleKey = 'sales_orders';
  moduleConfig: ModuleConfig = MODULES.sales_orders;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const moduleKey = this.route.snapshot.data['module'] as ModuleKey;
    this.moduleKey = moduleKey;
    this.moduleConfig = MODULES[moduleKey];
  }
}
