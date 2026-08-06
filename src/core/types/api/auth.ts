
export type CreateUserWithEmailAndPasswordInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Optional beta fields (spec A-06 / backend H-14).
  whatsappNumber?: string;
  whatsappConsent?: boolean;
  examPreparation?: string;
};

export type DecodedJwtTokenType = {
  name: string;
  picture: string;
  email: string;
  user_id: string;
  email_verified: boolean;
  firebase: {
    identities: {
      "google.com": string[];
      email: string[];
    };
    sign_in_provider: string;
  };
};
