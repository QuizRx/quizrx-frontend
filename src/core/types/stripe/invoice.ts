// TypeScript type for Stripe Invoice object
export type Invoice = {
  id: string;
  object: 'invoice';
  account_country: string;
  account_name: string;
  account_tax_ids: null | any[];
  amount_due: number;
  amount_overpaid: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  application: null | string;
  application_fee_amount: null | number;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  automatic_tax: {
    disabled_reason: null | string;
    enabled: boolean;
    liability: null | string;
    provider: null | string;
    status: null | string;
  };
  automatically_finalizes_at: null | number;
  billing_reason: string;
  charge: null | string;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: null | any[];
  customer: string;
  customer_address: null | object;
  customer_email: string;
  customer_name: string;
  customer_phone: null | string;
  customer_shipping: null | object;
  customer_tax_exempt: string;
  customer_tax_ids: any[];
  default_payment_method: null | string;
  default_source: null | string;
  default_tax_rates: any[];
  description: null | string;
  discount: null | object;
  discounts: any[];
  due_date: null | number;
  effective_at: number;
  ending_balance: number;
  footer: null | string;
  from_invoice: null | object;
  hosted_invoice_url: string;
  invoice_pdf: string;
  issuer: {
    type: string;
  };
  last_finalization_error: null | object;
  latest_revision: null | object;
  lines: {
    object: 'list';
    data: InvoiceLineItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  livemode: boolean;
  metadata: Record<string, string>;
  next_payment_attempt: null | number;
  number: string;
  on_behalf_of: null | string;
  paid: boolean;
  paid_out_of_band: boolean;
  parent: {
    quote_details: null | object;
    subscription_details: {
      metadata: Record<string, string>;
      subscription: string;
    };
    type: string;
  };
  payment_intent: null | string;
  payment_settings: {
    default_mandate: null | string;
    payment_method_options: null | object;
    payment_method_types: null | string[];
  };
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote: null | string;
  receipt_number: null | string;
  rendering: null | object;
  shipping_cost: null | object;
  shipping_details: null | object;
  starting_balance: number;
  statement_descriptor: null | string;
  status: string;
  status_transitions: {
    finalized_at: number;
    marked_uncollectible_at: null | number;
    paid_at: number;
    voided_at: null | number;
  };
  subscription: string;
  subscription_details: {
    metadata: Record<string, string>;
  };
  subtotal: number;
  subtotal_excluding_tax: number;
  tax: null | number;
  test_clock: null | string;
  total: number;
  total_discount_amounts: any[];
  total_excluding_tax: number;
  total_pretax_credit_amounts: any[];
  total_tax_amounts: any[];
  total_taxes: any[];
  transfer_data: null | object;
  webhooks_delivered_at: number;
};

export type InvoiceLineItem = {
  id: string;
  object: 'line_item';
  amount: number;
  amount_excluding_tax: number;
  currency: string;
  description: string;
  discount_amounts: any[];
  discountable: boolean;
  discounts: any[];
  invoice: string;
  livemode: boolean;
  metadata: Record<string, string>;
  parent: {
    invoice_item_details: null | object;
    subscription_item_details: {
      invoice_item: null | string;
      proration: boolean;
      proration_details: {
        credited_items: null | object;
      };
      subscription: string;
      subscription_item: string;
    };
    type: string;
  };
  period: {
    end: number;
    start: number;
  };
  plan: {
    id: string;
    object: 'plan';
    active: boolean;
    aggregate_usage: null | string;
    amount: number;
    amount_decimal: string;
    billing_scheme: string;
    created: number;
    currency: string;
    interval: string;
    interval_count: number;
    livemode: boolean;
    metadata: Record<string, string>;
    meter: null | string;
    nickname: null | string;
    product: string;
    tiers_mode: null | string;
    transform_usage: null | object;
    trial_period_days: null | number;
    usage_type: string;
  };
  pretax_credit_amounts: any[];
  price: {
    id: string;
    object: 'price';
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: null | object;
    livemode: boolean;
    lookup_key: null | string;
    metadata: Record<string, string>;
    nickname: null | string;
    product: string;
    recurring: {
      aggregate_usage: null | string;
      interval: string;
      interval_count: number;
      meter: null | string;
      trial_period_days: null | number;
      usage_type: string;
    };
    tax_behavior: string;
    tiers_mode: null | string;
    transform_quantity: null | object;
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
  };
  pricing: {
    price_details: {
      price: string;
      product: string;
    };
    type: string;
    unit_amount_decimal: string;
  };
  proration: boolean;
  proration_details: {
    credited_items: null | object;
  };
  quantity: number;
  subscription: string;
  subscription_item: string;
  tax_amounts: any[];
  tax_rates: any[];
  taxes: any[];
  type: string;
  unit_amount_excluding_tax: string;
};
