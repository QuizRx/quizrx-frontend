import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/dialog";

import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { gql, useMutation } from "@apollo/client";



const CREATE_STRIPE_CUSTOMER = gql`
  mutation CreateStripeCustomer {
    createStripeCustomer {
      id
      email
      name
    }
  }
`;

const CREATE_STRIPE_SETUP_INTENT = gql`
  mutation {
    createStripeSetupIntent {
      clientSecret
      setupIntentId
    }
  }
`;

const SUBSCRIBE_STRIPE_TO_PLAN = gql`
mutation SubscribeToPlan($priceId: String!, $paymentMethodId: String!, $isTrial: Boolean) {
  subscribeToPlan(
    priceId: $priceId,
    paymentMethodId: $paymentMethodId,
    isTrial: $isTrial
  )
}
`;

interface StoreCardProps {
  open: boolean;
  onClose: () => void;
}
import PaymentComponent from "./payment";
const StoreCard: React.FC<StoreCardProps> = ({ open, onClose }) => {
  
    //force reload of page

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-5 bg-card">
        <DialogTitle className="sr-only">Payment Information</DialogTitle>
        <PaymentComponent onCreateCard={async (_paymentMethodId) => {
          onClose();
          window.location.reload();
        }}/>
      </DialogContent>
    </Dialog>
  );
};

export default StoreCard;
