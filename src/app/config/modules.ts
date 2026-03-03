export type ModuleKey = 'sales_orders' | 'customers' | 'products';

export type FieldType = 'text' | 'number' | 'currency' | 'status' | 'date';

export interface ModuleField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  gridFields: ModuleField[];
  formFields: ModuleField[];
  listTitleKey: string;
  listSubtitleKey: string;
  statusOptions: string[];
}

export const MODULES: Record<ModuleKey, ModuleConfig> = {
  sales_orders: {
    key: 'sales_orders',
    label: 'Sales Orders',
    listTitleKey: 'order_no',
    listSubtitleKey: 'customer_name',
    statusOptions: ['pending', 'approved', 'completed', 'canceled'],
    gridFields: [
      { key: 'order_no', label: 'Order #', type: 'text', required: true },
      { key: 'customer_name', label: 'Customer', type: 'text', required: true },
      { key: 'product_name', label: 'Product', type: 'text', required: true },
      { key: 'quantity', label: 'Qty', type: 'number', required: true },
      { key: 'total_amount', label: 'Total', type: 'currency', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'sales_rep', label: 'Sales Rep', type: 'text', required: true },
      { key: 'channel', label: 'Channel', type: 'text', required: true },
      { key: 'priority', label: 'Priority', type: 'text', required: true },
      { key: 'updated_at', label: 'Updated', type: 'date' }
    ],
    formFields: [
      { key: 'order_no', label: 'Order #', type: 'text', required: true },
      { key: 'customer_name', label: 'Customer', type: 'text', required: true },
      { key: 'product_name', label: 'Product', type: 'text', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'total_amount', label: 'Total Amount', type: 'currency', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'sales_rep', label: 'Sales Rep', type: 'text', required: true },
      { key: 'channel', label: 'Channel', type: 'text', required: true },
      { key: 'priority', label: 'Priority', type: 'text', required: true }
    ]
  },
  customers: {
    key: 'customers',
    label: 'Customers',
    listTitleKey: 'name',
    listSubtitleKey: 'company',
    statusOptions: ['active', 'inactive', 'prospect'],
    gridFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'tier', label: 'Tier', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'city', label: 'City', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
      { key: 'credit_limit', label: 'Credit Limit', type: 'currency', required: true },
      { key: 'updated_at', label: 'Updated', type: 'date' }
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'tier', label: 'Tier', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'city', label: 'City', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
      { key: 'credit_limit', label: 'Credit Limit', type: 'currency', required: true }
    ]
  },
  products: {
    key: 'products',
    label: 'Products',
    listTitleKey: 'name',
    listSubtitleKey: 'category',
    statusOptions: ['active', 'discontinued', 'draft'],
    gridFields: [
      { key: 'sku', label: 'SKU', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'price', label: 'Price', type: 'currency', required: true },
      { key: 'stock', label: 'Stock', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'supplier', label: 'Supplier', type: 'text', required: true },
      { key: 'rating', label: 'Rating', type: 'number', required: true },
      { key: 'launch_date', label: 'Launch Date', type: 'date', required: true },
      { key: 'updated_at', label: 'Updated', type: 'date' }
    ],
    formFields: [
      { key: 'sku', label: 'SKU', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'price', label: 'Price', type: 'currency', required: true },
      { key: 'stock', label: 'Stock', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'status', required: true },
      { key: 'supplier', label: 'Supplier', type: 'text', required: true },
      { key: 'rating', label: 'Rating', type: 'number', required: true },
      { key: 'launch_date', label: 'Launch Date', type: 'date', required: true }
    ]
  }
};
