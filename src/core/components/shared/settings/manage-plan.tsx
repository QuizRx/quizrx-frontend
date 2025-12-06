"use client";
import React, { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/core/components/ui/separator";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Check, CreditCard, TriangleAlert, DownloadCloud } from "lucide-react";
import { toast } from "@/core/hooks/use-toast";
import { useUser } from "@/core/providers/user";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_SUBSCRIPTION_OF_USER } from "@/modules/subscription/apollo/query/subscription-of-user";
import { GET_INVOICE_OF_USER } from "@/modules/subscription/apollo/query/get-invoice-of-user";
import { CANCEL_SUBSCRIPTION } from "@/modules/subscription/apollo/mutation/cancel-subscription";
import { GET_DEFAULT_PAYMENT } from "@/modules/subscription/apollo/query/get-default-payment";
import { GET_STRIPE_CUSTOMER_JSON } from "@/modules/subscription/apollo/query/get-customer";
import CancelSubscriptionDialog from "./cancel-subscription-dialog";
import { UPDATE_BILLING_ADDRESS } from "@/modules/subscription/apollo/mutation/update-billing-address";
import UpdateBillingDateDialog from "./update-billing-date-dialog";
import { UPDATE_DEFAULT_BILLING_DATE } from "@/modules/subscription/apollo/mutation/update-billing-date";
import { unvailableStatuses } from "@/core/types/api/enum"
import { RESTORE_SUBSCRIPTION } from "@/modules/subscription/apollo/mutation/restore-subscription";
import StoreCard from "@/modules/subscription/components/store-card";
import UpdateCardInfo from "@/modules/subscription/components/update-card-info-dialog";
const GET_NEXT_INVOICE_OF_USER = gql`
  query GetNextInvoices {
    getNextInvoices
  }
`
const isMoreThanToday = (date: string | number): boolean => {
  const today = new Date();
  const dateObj = typeof date === "number" ? new Date(date * 1000) : new Date(date);
  return dateObj > today;
}
type Invoice = {
  name: string;
  date: string;
  amount: string;
  url: string;
  dateObj: Date;
  period_end: number;
};
function badStatus(status: string): boolean {
  return unvailableStatuses.includes(status as any);
}

// Modular helper to check if subscription is canceled but still available
function isCanceledButAvailable(userSubscription: any): boolean {
  return !!(userSubscription?.availableUntil && isMoreThanToday(userSubscription.availableUntil));
}

const ManagePlan = () => {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [updateBillingDateOpen, setUpdateBillingDateOpen] = useState(false);
  const [updateBillingDateLoading, setUpdateBillingDateLoading] = useState(false);
  const [storeCardOpen, setStoreCardOpen] = useState(false);
  const { userSubscription, refetch } = useUser();

  const { data: nextInvoiceData, loading: nextInvoiceLoading } = useQuery(GET_NEXT_INVOICE_OF_USER);
  const { data: subscriptionData, loading: subscriptionLoading } = useQuery(GET_SUBSCRIPTION_OF_USER);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { data: invoiceData, loading: invoiceLoading } = useQuery(GET_INVOICE_OF_USER);
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);
  const { data: defaultPaymentData, loading: defaultPaymentLoading } = useQuery(GET_DEFAULT_PAYMENT);
  useEffect(() => {
    console.log("defaultPaymentLoading", defaultPaymentData);
  }, [defaultPaymentLoading, defaultPaymentData]);
  const { data: customerData, loading: customerLoading } = useQuery(GET_STRIPE_CUSTOMER_JSON);
  const [updateBillingAddress] = useMutation(UPDATE_BILLING_ADDRESS);
  const [updateDefaultBillingDate] = useMutation(UPDATE_DEFAULT_BILLING_DATE);
  const [restoreSubscription, { loading: restoreLoading }] = useMutation(RESTORE_SUBSCRIPTION);

  function getPaymentMethodLabel(payment: any): string {
    if (!payment) return "No payment method on file";
    if (typeof payment === "string") return payment;
    if (payment.card && payment.card.brand && payment.card.last4) {
      return `${payment.card.brand} ending in ${payment.card.last4}`;
    }
    if (payment.type && payment.type === "card" && payment.last4 && payment.brand) {
      return `${payment.brand} ending in ${payment.last4}`;
    }
    return "Unknown payment method";
  }

  useEffect(() => {
    if (invoiceLoading) return
    setInvoices(
      invoiceData?.getInvoices.map((invoice: any) => ({
        name: invoice.number,
        date: new Date(invoice.period_end * 1000).toLocaleDateString(),
        amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
        url: invoice.invoice_pdf,
        dateObj: new Date(invoice.period_end * 1000),
        period_end: invoice.period_end,
      })) || []
    );
  }
  , [invoiceLoading, invoiceData]);

  const handleCancelSubscription = async () => {
    try {
      const result = await cancelSubscription({
        variables: {
          reason: cancelReason,
        },
      });
      // GraphQL errors (from Apollo)
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Error",
          description: result.errors[0].message || "There was an error cancelling your subscription.",
          variant: "destructive",
        });
        return;
      }
      // Backend returns JSON scalar, so result.data.cancelSubscription is the object
      const response: any = result.data?.cancelSubscription;
      if (response && response.success) {
        toast({
          title: "Subscription Cancelled",
          description: response.message || "Your subscription has been successfully cancelled.",
        });
        setCancelDialogOpen(false);
        refetch();
        router.push("/dashboard/settings");
      } else {
        toast({
          title: "Error",
          description: response?.message || "There was an error cancelling your subscription.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was an error cancelling your subscription. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Extract billing address from Stripe customer data (fix property name)
  const rawBillingAddress =
    defaultPaymentData?.getDefaultPayment &&
    typeof defaultPaymentData.getDefaultPayment === "object"
      ? (defaultPaymentData.getDefaultPayment as any).billing_details?.address
      : undefined;

  const billingAddress = {
    line1: rawBillingAddress?.line1 ?? "",
    city: rawBillingAddress?.city ?? "",
    state: rawBillingAddress?.state ?? "",
    postalCode: rawBillingAddress?.postal_code ?? rawBillingAddress?.postalCode ?? "",
  };

  // Handler to update billing address
  const handleSaveAddress = async (address: { line1: string; city: string; state: string; postalCode: string }) => {
    setAddressLoading(true);
    try {
      const result = await updateBillingAddress({
        variables: {
          address: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
        },
      });
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Error",
          description: result.errors[0].message || "There was an error updating your billing address.",
          variant: "destructive",
        });
        setAddressLoading(false);
        return;
      }
      toast({
        title: "Billing Address Updated",
        description: "Your billing address has been updated.",
      });
      setEditAddressOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was an error updating your billing address.",
        variant: "destructive",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // Handler to update billing date (no variables, just call mutation)
  const handleSaveBillingDate = async () => {
    setUpdateBillingDateLoading(true);
    try {
      const result = await updateDefaultBillingDate();
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Error",
          description: result.errors[0].message || "There was an error updating your billing date.",
          variant: "destructive",
        });
        setUpdateBillingDateLoading(false);
        return;
      }
      toast({
        title: "Billing Date Updated",
        description: "Your billing date has been updated to today. Stripe will handle proration automatically.",
      });
      setUpdateBillingDateOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was an error updating your billing date.",
        variant: "destructive",
      });
    } finally {
      setUpdateBillingDateLoading(false);
    }
  };

  const handleRestoreSubscription = async () => {
    try {
      const result = await restoreSubscription();
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Error",
          description: result.errors[0].message || "There was an error restoring your subscription.",
          variant: "destructive",
        });
        return;
      }
      if (result.data?.restoreSubscription) {
        toast({
          title: "Subscription Restored",
          description: "Your subscription has been successfully restored.",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "There was an error restoring your subscription.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was an error restoring your subscription. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="">
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold">Manage your plan</h1>
        <p className="text-sm mt-1">Update, cancel, or modify your subscription</p>
        <Separator className="my-8" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 flex flex-col gap-5">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Current Plan: 
                    { " "+subscriptionData?.getSubscriptionOfUser.name }</h2>
                  <p className="font-semibold">Plan Information</p>
                </div>
                <div>
                   {
                      badStatus(userSubscription?.status) || isCanceledButAvailable(userSubscription) ? (
                        <Badge className="bg-red-100 rounded-2xl py-2 px-3 text-red-600 border-red-600" variant={'outline'}>
                          {isCanceledButAvailable(userSubscription) ? "CANCELED" : userSubscription?.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 rounded-2xl py-2 px-3 text-green-600 border-green-600" variant={'outline'}>
                          {userSubscription?.status}
                        </Badge>
                      )
                    }
                     { userSubscription?.availableUntil && isMoreThanToday(userSubscription.availableUntil) && (
                        <Badge className="bg-yellow-100 rounded-2xl mx-2 py-2 px-3 text-yellow-600 border-yellow-600" variant={'outline'}>
                          {`Available until ${new Date(userSubscription.availableUntil).toLocaleDateString("en-US")}`}
                        </Badge>
                      )}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <p className="text-muted-foreground my-3 text-base">Monthly Cost:</p>
                  <h3 className="font-bold text-lg">${subscriptionData?.getSubscriptionOfUser.pricing}.month</h3>
                </div>
                <div className="col-span-6">
                  <p className="text-muted-foreground my-3">Users Included:</p>
                  <h3 className="font-bold">Up to {subscriptionData?.getSubscriptionOfUser.usersIncluded} Users</h3>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="mb-6">
                <p className="text-muted-foreground my-3">Plan Features:</p>
                <div className="grid grid-cols-2 gap-4">
                  {(Array.isArray(subscriptionData?.getSubscriptionOfUser.details)
                    ? subscriptionData?.getSubscriptionOfUser.details
                    : subscriptionData?.getSubscriptionOfUser.details
                      ? [subscriptionData?.getSubscriptionOfUser.details]
                      : []
                  )
                    .filter((feature): feature is string => typeof feature === "string")
                    .map((feature: string, index: number) => (
                      <div key={"features" + index} className="flex items-center space-x-2">
                        <Check className="text-blue-500 w-5 h-5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
              { [
                {
                  name: "Payment Method",
                  description:
                    defaultPaymentLoading
                      ? "Loading..."
                      : getPaymentMethodLabel(defaultPaymentData?.getDefaultPayment),
                  buttonText: "Update Payment Method",
                  onClick: () => setStoreCardOpen(true),
                },
                {
                  name: "Billing Date",
                  description: nextInvoiceData?.getNextInvoices?.next_payment_attempt
                    ? new Date(nextInvoiceData.getNextInvoices.next_payment_attempt * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "-",
                  buttonText: "Update Billing Date",
                  onClick: () => setUpdateBillingDateOpen(true),
                },
                {
                  name: "Billing Address",
                  description: `${billingAddress.line1 || ""}${billingAddress.line1 ? ", " : ""}${billingAddress.city || ""}${billingAddress.city ? ", " : ""}${billingAddress.state || ""}${billingAddress.state ? ", " : ""}${billingAddress.postalCode || ""}` || "-",
                  buttonText: "Edit Address",
                  onClick: () => setEditAddressOpen(true),
                },
              ].map((item, index) => (
                <div key={"billing" + index} className="flex justify-between items-center py-4">
                  <div className="flex gap-5">
                    <CreditCard className="w-8 h-8 text-black mb-2" />
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-blue-500 hover:text-blue-500" onClick={item.onClick}>
                    {item.buttonText}
                  </Button>
                </div>
              ))}
            </Card>
            {
              badStatus(userSubscription?.status) || isCanceledButAvailable(userSubscription) ? ( <Card className="p-6 border-green-500 border-2 bg-green-50">
                <div className="flex items-center space-x-4">
                  <Badge className="h-8 w-8 p-0 flex justify-center items-center rounded-full bg-green-400">
                    <Check className="h-4 w-4 text-white" />
                  </Badge>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-green-800">Restore Plan</h3>
                    <p className="text-sm text-green-700">
                      Your subscription is {userSubscription?.status}, but you can restore your plan and regain access to premium features instantly.
                    </p>
                    <Button
                      variant="default"
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleRestoreSubscription}
                      disabled={restoreLoading}
                    >
                      {restoreLoading ? "Restoring..." : "Restore Plan"}
                    </Button>
                  </div>
                </div>
              </Card>
              ) : (
              <Card className="p-6">
              <div className="space-y-4 flex">
                <Badge className="h-8 w-8 p-0 flex justify-center items-center rounded-full mx-3 bg-red-400 hover:bg-red-800">
                  <TriangleAlert className="h-4 w-4" />
                </Badge>
                <div className="w-full me-7">
                  <h3 className="font-medium text-lg">Cancel Subscription</h3>
                  <p className="text-sm">
  {nextInvoiceData?.getNextInvoices?.next_payment_attempt
    ? `Your Subscription will end on ${new Date(nextInvoiceData.getNextInvoices.next_payment_attempt * 1000).toLocaleDateString()}. You will lose access to all premium features after cancellation.`
    : "Your Subscription will end at the end of your current billing period. You will lose access to all premium features after cancellation."}
</p>
                  <Button
                    variant="outline"
                    className="mt-5 text-red-600 border-red-600 hover:text-red-600"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </Card>
            )
            }
            {/* Restore Plan Card */}
          
            <CancelSubscriptionDialog
              open={cancelDialogOpen}
              onOpenChange={setCancelDialogOpen}
              cancelReason={cancelReason}
              setCancelReason={setCancelReason}
              onCancel={handleCancelSubscription}
              nextInvoiceData={nextInvoiceData}
            />
            <UpdateCardInfo
              open={editAddressOpen}
              onClose={() => setEditAddressOpen(false)}
              cardInfo={
                defaultPaymentData?.getDefaultPayment && typeof defaultPaymentData.getDefaultPayment === 'object' ? {
                  brand: defaultPaymentData.getDefaultPayment.card?.brand || "",
                  last4: defaultPaymentData.getDefaultPayment.card?.last4 || "",
                  exp_month: defaultPaymentData.getDefaultPayment.card?.exp_month || 0,
                  exp_year: defaultPaymentData.getDefaultPayment.card?.exp_year || 0,
                  id: defaultPaymentData.getDefaultPayment.id || "",
                  address: defaultPaymentData.getDefaultPayment.billing_details?.address || {},
                } : {}
              }
              updateOnlyAddress
            />
            <UpdateBillingDateDialog
              open={updateBillingDateOpen}
              onOpenChange={setUpdateBillingDateOpen}
              onSave={handleSaveBillingDate}
              loading={updateBillingDateLoading}
            />
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-6 items-start">
            <Card className="p-6 space-y-4 w-full">
              <h2 className="font-bold text-xl">Billing Summary</h2>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Current Period:</p>
                <p className="text-sm font-semibold">
                  {(() => {
                    if (!invoices.length) return "-";
                    const sorted = [...invoices].sort((a, b) => {
                      const aDate = a.period_end;
                      const bDate = b.period_end;
                      return bDate - aDate;
                    });
                    const mostRecent = sorted[0];
                    const dateObj = new Date(mostRecent.period_end * 1000);
                    return dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
                  })()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Amount Due:</p>
                <p className="text-sm font-semibold">$9.99</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Payment Method:</p>
                <p className="text-sm font-semibold">
                  {defaultPaymentLoading
                    ? "Loading..."
                    : getPaymentMethodLabel(defaultPaymentData?.getDefaultPayment)}
                </p>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Charge:</p>
                  <p className="text-sm font-semibold">{new Date(nextInvoiceData?.getNextInvoices.next_payment_attempt * 1000).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-semibold">${nextInvoiceData?.getNextInvoices.amount_due/100}</p>
              </div>
            </Card>
            <Card className="p-6 w-full">
              <h2 className="font-bold text-xl mb-4">Recent Invoices</h2>
              {invoices.map((invoice: Invoice, index) => (
                <div key={"invoice" + index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-semibold">{invoice.name || "Invoice #" + index}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">{invoice.amount}</span>
                    <Button variant="link" size="sm" asChild>
                      <a href={invoice.url}>
                        <DownloadCloud className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
            <Card className="p-6 mt-2 w-full">
              <h2 className="font-bold text-xl mb-4">Need Help?</h2>
              <p className="text-sm text-muted-foreground mb-4">Have a question about your subscription or billing?</p>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
      <StoreCard open={storeCardOpen} onClose={() => setStoreCardOpen(false)} />
    </div>
  );
};

export default ManagePlan;