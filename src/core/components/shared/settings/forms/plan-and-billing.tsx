"use client";

import { useMutation, useQuery, gql } from "@apollo/client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "@/core/components/ui/separator";
import { TabsContent } from "@/core/components/ui/tabs";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { CreditCard, Plus, ArrowDown, Download, FileText, ArrowUp, Check  } from "lucide-react";
import { DataTable } from "@/core/components/table";
import type { SortingState } from "@tanstack/react-table";
import { Invoice } from "@/core/types/stripe/invoice";
import { GET_SUBSCRIPTION_OF_USER } from "@/modules/subscription/apollo/query/subscription-of-user";
import { GET_INVOICE_OF_USER } from "@/modules/subscription/apollo/query/get-invoice-of-user";
import { useUser } from "@/core/providers/user";
import { unvailableStatuses } from "@/core/types/api/enum"
import { GET_DEFAULT_PAYMENT } from "@/modules/subscription/apollo/query/get-default-payment";
import StoreCard from "@/modules/subscription/components/store-card";
import UpdateCardInfo from "@/modules/subscription/components/update-card-info-dialog";
const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    getPaymentMethods
  }
`;

type GetInvoicesResponse = Invoice[];

function badStatus(status: string): boolean {
  return unvailableStatuses.includes(status as any);
}

const convertDate = (date?: string | number): string => {
  if (!date) return "";
  if (typeof date === "number") {
    date = new Date(date).toISOString();
  } else if (typeof date === "string") {
    date = new Date(date).toISOString();
  }
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const formatted = dateObj.toLocaleDateString("en-US", options);
  return formatted.replace(",", " -");
}
const isMoreThanToday = (date: string | number): boolean => {
  const today = new Date();
  const dateObj = typeof date === "number" ? new Date(date * 1000) : new Date(date);
  return dateObj > today;
}
type InvoiceTableRow = {
  invoice: string;
  billingDate: string;
  status: string;
  amount: string;
  plan: string;
  url: string;
};
const PlanAndBilling = () => {
  const { push } = useRouter();
  const { userSubscription } = useUser();
  const { data: subscriptionData } = useQuery(GET_SUBSCRIPTION_OF_USER);
  const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError } = useQuery(GET_PAYMENT_METHODS);
  const { data: defaultPaymentData, loading: defaultPaymentLoading } = useQuery(GET_DEFAULT_PAYMENT);
  const [invoiceData, setInvoiceData] = useState<InvoiceTableRow[]>([]);
  const { data: invoiceData2, loading: invoiceDataLoading } = useQuery<{ getInvoices: Invoice[] }>(GET_INVOICE_OF_USER);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [updateCardDialogOpen, setUpdateCardDialogOpen] = useState(false);
  useEffect(() => {
    if (invoiceDataLoading) return; // Wait for loading to finish
      const apiInvoices = invoiceData2?.getInvoices || [];
      console.log("API Invoices Data:", apiInvoices);
      const mappedInvoices = apiInvoices.map((inv: Invoice) => {
        // Format billingDate as "Dec 1 - 2025"
        let billingDate = convertDate((inv.next_payment_attempt || inv.period_end) * 1000);
        return {
          invoice: inv.number || inv.id || "",
          billingDate,
          status: inv.status || "Paid",
          amount: `USD ${inv.amount_due / 100}$`,
          plan: "Full access to EBEEDM",
          url: inv.invoice_pdf || "",
        };
      });
      setInvoiceData(mappedInvoices);
    }, [invoiceData2, invoiceDataLoading]);
  useEffect(() => {
    console.log("Payment Methods Data:", paymentMethodsData);
    console.log("Default Payment Data:", defaultPaymentData);
  }, [paymentMethodsData, defaultPaymentData]);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'billingDate', desc: false }]);

  // Card plan data in state
  const [plan, setPlan] = useState({
    name: "EBEEDN Full Acess",
    price: "USD 9.99$",
    status: "Active",
    description: "Full access to EBEEDM question bank.",
  });

  useEffect(() => {
    // Initial sort by oldest to earliest (asc)
    sortByBillingDate('asc');
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (subscriptionData?.getSubscriptionOfUser) {
      const sub = subscriptionData.getSubscriptionOfUser;
      setPlan((prev) => ({
        ...prev,
        name: sub.name || prev.name,
        price: sub.pricing ? `USD ${sub.pricing}$` : prev.price,
        status: "Active",
        description: sub.details || prev.description,
      }));
    }
  }, [subscriptionData]);

  function sortByBillingDate(direction: 'asc' | 'desc') {
    setInvoiceData(prev => [...prev].sort((a, b) => {
      const dateA = new Date(a.billingDate).getTime();
      const dateB = new Date(b.billingDate).getTime();
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }));
  }

  // Invoice table columns
  const invoiceColumns = [
    {
      accessorKey: "invoice",
      header: "Invoice",
      cell: (info: any) => 
      <div className="flex items-center">
        {/* <Checkbox className="me-1"/> */}
        <FileText className="w-4 h-4 me-2 text-red-500" />
        <span className="font-mono"> {info.getValue()}</span>
        </div>,
    },
    {
      accessorKey: "billingDate",
      header: () => (
        <span
          className="cursor-pointer select-none flex items-center gap-1"
          onClick={() => {
            const dir = sorting[0]?.desc ? 'asc' : 'desc';
            setSorting([{ id: 'billingDate', desc: dir === 'desc' }]);
            sortByBillingDate(dir as 'asc' | 'desc');
          }}
        >
          Billing Date
          {sorting[0]?.id === 'billingDate' && (
            sorting[0].desc ? (
              <ArrowDown className="w-2 h-2" fill="currentColor" />
            ) : (
              <ArrowUp className="w-2 h-2" fill="currentColor" />
            )
          )}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => (
        <Badge className="bg-green-100 rounded-2xl py-2 px-3 text-green-600 border-green-600" variant={'outline'}>
          <Check  className="w-3 h-3 me-1"/>{info.getValue()}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "plan",
      header: "Plan",
    },
    {
      id: "download",
      header: "",
      cell: ({ row }: any) => (
        <Button size="sm" variant="ghost" onClick={() => handleDownload(row.original)}>
          <Download />
        </Button>
      ),
    },
  ];

  function handleDownload(row: any) {
    // Download the invoice PDF from the provided URL
    if (!row.url) {
      alert("No invoice URL available.");
      return;
    }
    const a = document.createElement("a");
    a.href = row.url;
    a.download = `${row.invoice || row.number || row.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }

  async function handleDownloadAll() {
    // Download all invoice PDFs one by one (open in new tabs to avoid CORS issues)
    const pdfInvoices = invoiceData.filter(row => row.url);
    pdfInvoices.forEach((row, idx) => {
      // Open each PDF in a new tab/window
      window.open(row.url, '_blank');
    });
  }

  // Helper to map Stripe card brand to image
  function getCardImage(brand?: string) {
    switch ((brand || '').toLowerCase()) {
      case "visa":
        return "/card-visa.png";
      case "mastercard":
        return "/card-mastercard.png";
      case "amex":
      case "american express":
        return "/card-amex.png";
      case "discover":
        return "/card-discover.png";
      case "diners":
      case "diners club":
        return "/card-diners.png";
      case "jcb":
        return "/card-jcb.png";
      case "unionpay":
        return "/card-unionpay.png";
      default:
        return "/card-visa.png"; // fallback or generic card image
    }
  }

  // Modular helper to check if subscription is canceled but still available
  function isCanceledButAvailable(userSubscription: any): boolean {
    return !!(userSubscription?.availableUntil && isMoreThanToday(userSubscription.availableUntil));
  }

  return (
    <TabsContent value="billing">
      <div className="space-y-8 mb-12">
        <div className="my-8">
          <h2 className="text-xl font-medium">Plans</h2>
          <p className="text-sm ">Select a plan that is most suitable for you</p>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
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
              <h2 className="font-bold text-xl">
                {plan.name} {plan.price}
                <span className="text-gray-500 font-normal">/ month</span>
              </h2>
              <p className="text-sm font-semibold text-muted-foreground">
                {plan.description}
              </p>
            </div>
            <div className="">
              <Button onClick={() => {push("settings/manage-plan")}}>Manage Plan</Button>
            </div>
          </div>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="space-y-8 mb-12">
        <div className="my-8">
          <h2 className="text-xl font-medium">Payment Method</h2>
          <p className="text-sm ">Update your billing and address</p>
        </div>

        <Card className="p-6 mt-5">
          <div className="space-y-4 flex">
            <CreditCard className="w-8 h-8 text-black mx-3" />
            <div className="w-full me-7">
              <h3 className="font-medium text-lg">Stripe Payment</h3>
              <p className="text-sm">Secure payment processing via Stripe</p>

              <Card className="p-6 mt-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {defaultPaymentData && defaultPaymentData.getDefaultPayment && typeof defaultPaymentData.getDefaultPayment === 'object' && 'card' in defaultPaymentData.getDefaultPayment && defaultPaymentData.getDefaultPayment.card ? (
                      <img
                        src={getCardImage(defaultPaymentData.getDefaultPayment.card.brand)}
                        alt={defaultPaymentData.getDefaultPayment.card.brand || "Card"}
                        className="w-15 h-15 object-contain"
                      />
                    ) : (
                      <img
                        src={getCardImage()}
                        alt="Card"
                        className="w-15 h-15 object-contain"
                      />
                    )}
                    <div className="space-y-2">
                      {defaultPaymentLoading ? (
                        <h2 className="font-semibold">Loading payment method...</h2>
                      ) : defaultPaymentData?.getDefaultPayment && typeof defaultPaymentData.getDefaultPayment === 'object' ? (
                        <>
                          <h2 className="font-semibold">
                            {defaultPaymentData.getDefaultPayment.card?.brand?.toUpperCase() || 'Card'} ending in {defaultPaymentData.getDefaultPayment.card?.last4}
                          </h2>
                          <p className="text-sm">Expiry {defaultPaymentData.getDefaultPayment.card?.exp_month?.toString().padStart(2, '0')}/{defaultPaymentData.getDefaultPayment.card?.exp_year}</p>
                        </>
                      ) : (
                        <h2 className="font-semibold">No default payment method</h2>
                      )}
                    </div>
                  </div>
                  <div className="">
                    <Button variant={'ghost'} className="text-blue-500 hover:bg-blue-500 hover:text-white" onClick={() => setUpdateCardDialogOpen(true)}>
                      update
                    </Button>
                  </div>
                </div>
              </Card>
              <Button
                variant="outline"
                className="w-full mt-5"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <Plus className="font-semibold" strokeWidth={3} />
                Add a new payment method
              </Button>
              <StoreCard
                open={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
              />
              <UpdateCardInfo open={updateCardDialogOpen} onClose={() => setUpdateCardDialogOpen(false)} cardInfo={
                defaultPaymentData?.getDefaultPayment && typeof defaultPaymentData.getDefaultPayment === 'object' ? {
                  brand: defaultPaymentData.getDefaultPayment.card?.brand || "",
                  last4: defaultPaymentData.getDefaultPayment.card?.last4 || "",
                  exp_month: defaultPaymentData.getDefaultPayment.card?.exp_month || 0,
                  exp_year: defaultPaymentData.getDefaultPayment.card?.exp_year || 0,
                  id: defaultPaymentData.getDefaultPayment.id || "",
                  address: defaultPaymentData.getDefaultPayment.billing_details?.address || {},
                } : {}
              }/>
            </div>
          </div>
        </Card>
      </div>

      <Separator className="my-8" />
      <div className="space-y-8 mb-12">
        <div className="my-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium">Billing and Invoice</h2>
            <p className="text-sm ">Billing and invoice history</p>
          </div>
          <Button variant="outline" onClick={handleDownloadAll}>
            <ArrowDown /> Download all
          </Button>
        </div>
        <DataTable columns={invoiceColumns} data={invoiceData} />
      </div>
    </TabsContent>
  );
};

export default PlanAndBilling;
