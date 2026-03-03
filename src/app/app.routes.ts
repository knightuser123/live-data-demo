import { Routes } from '@angular/router';
import { DataPageComponent } from './pages/data-page/data-page.component';
import { FormPageComponent } from './pages/form-page/form-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sales-orders' },
  { path: 'sales-orders', component: DataPageComponent, data: { module: 'sales_orders' } },
  { path: 'sales-orders/form', component: FormPageComponent, data: { module: 'sales_orders' } },
  { path: 'customers', component: DataPageComponent, data: { module: 'customers' } },
  { path: 'customers/form', component: FormPageComponent, data: { module: 'customers' } },
  { path: 'products', component: DataPageComponent, data: { module: 'products' } },
  { path: 'products/form', component: FormPageComponent, data: { module: 'products' } },
  { path: '**', redirectTo: 'sales-orders' }
];
