import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/dialog";
import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { toast } from "@/core/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

interface UpdateCardInfoProps {
  open: boolean;
  onClose: () => void;
  cardInfo: {
    id: string;
    last4: string;
    expiryDate: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    address: {
        line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
    }
  } | {}
  updateOnlyAddress?: boolean;
}

const UPDATE_CARD_MUTATION = gql`
  mutation UpdateCard($paymentMethodId: String!, $cardInformation: UpdateStripeCardInput!) {
    updateCard(paymentMethodId: $paymentMethodId, cardInformation: $cardInformation)
  }
`;

const cardFormSchema = z.object({
  expMonth: z.coerce.number().min(1).max(12),
  expYear: z.coerce.number().min(new Date().getFullYear()),
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
  })
});

type CardFormValues = z.infer<typeof cardFormSchema>;

const UpdateCardInfo: React.FC<UpdateCardInfoProps> = ({ open, onClose, cardInfo, updateOnlyAddress }) => {
  const [updateCard, { loading, error }] = useMutation(UPDATE_CARD_MUTATION);

  // Prefill form with cardInfo
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      expMonth: (cardInfo as any)?.exp_month || undefined,
      expYear: (cardInfo as any)?.exp_year || undefined,
      address: {
        line1: (cardInfo as any)?.address?.line1 || "",
        city: (cardInfo as any)?.address?.city || "",
        state: (cardInfo as any)?.address?.state || "",
        postal_code: (cardInfo as any)?.address?.postal_code || "",
      },
    },
  });

  useEffect(() => {
    form.reset({
      expMonth: (cardInfo as any)?.exp_month || undefined,
      expYear: (cardInfo as any)?.exp_year || undefined,
      address: {
        line1: (cardInfo as any)?.address?.line1 || "",
        city: (cardInfo as any)?.address?.city || "",
        state: (cardInfo as any)?.address?.state || "",
        postal_code: (cardInfo as any)?.address?.postal_code || "",
      },
    });
  }, [cardInfo, open]);

  const onSubmit = async (values: CardFormValues) => {
    const paymentMethodId = (cardInfo as any)?.id;
    if (!paymentMethodId) {
      toast({ title: "Missing card ID", description: "No card ID provided.", variant: "destructive" });
      return;
    }
    const cardInformation = updateOnlyAddress
      ? { address: values.address }
      : values;
    const { errors} = await updateCard({
        variables: {
          paymentMethodId,
          cardInformation,
        },
      });
    if (errors) {
      toast({ title: "Error updating card", description: errors[0].message, variant: "destructive" });
      return;
    }
      toast({ title: "Card updated", description: "Your card information was updated." });
      onClose();
    }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-5 bg-card">
        <DialogTitle className="mb-4">Update Card Information</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!updateOnlyAddress && (
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="expMonth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Expiration Month</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={12} value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expYear"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Expiration Year</FormLabel>
                      <FormControl>
                        <Input type="number" min={new Date().getFullYear()} value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="address.line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Card"}
            </Button>
            {error && <div className="text-red-500 text-sm">{error.message}</div>}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCardInfo;
