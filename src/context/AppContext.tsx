import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";

export type ProductType = "ip" | "ooo" | "help";
export type FlowType = "online_light" | "assisted" | "office_crm";
export type ApplicationStatus =
  | "draft"
  | "online_light_submitted"
  | "assisted_submitted"
  | "office_crm_completed"
  | "fns_ready"
  | "submitted_to_fns";
export type FounderCount = "one" | "multiple";
export type FounderCitizenship = "ru" | "foreign";
export type CharterType = "generated" | "custom";
export type ApplicantCitizenship = "ru" | "foreign" | "stateless";
export type IdentityDocumentType = "passport_rf" | "other";
export type CapitalType = "charter";
export type ApplicantRole = "founder_individual";

export interface BusinessData {
  okvedCodes: string[];
  primaryOkvedCode?: string;
  taxRegime?: string;
  entrepreneurEmail?: string;
  legalEntityEmail?: string;
  registrationResultEmail?: string;
  companyName?: string;
  companyNameFull?: string;
  charterCapital?: string;
  capitalType?: CapitalType;
  legalLocation?: string;
  legalAddress?: string;
  founderCount?: FounderCount;
  founderCitizenship?: FounderCitizenship;
  founderDocumentType?: IdentityDocumentType;
  founderRegistrationAddress?: string;
  founderSharePercent?: string;
  directorIsFounder?: boolean;
  addressIsFounder?: boolean;
  directorPosition?: string;
  directorTerm?: string;
  charterType?: CharterType;
  typicalCharterNumber?: string;
  applicantRole?: ApplicantRole;
  hasSeal?: boolean;
  requiresManager?: boolean;
  managerReason?: string;
}

export interface PassportData {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  gender?: string;
  birthPlace?: string;
  citizenship?: ApplicantCitizenship;
  documentType?: IdentityDocumentType;
  passportSeries?: string;
  passportNumber?: string;
  issuedBy?: string;
  issueDate?: string;
  divisionCode?: string;
  inn?: string;
  snils?: string;
  registrationAddress?: string;
  ocrCompleted?: boolean;
}

export interface AppState {
  productType?: ProductType;
  flowType: FlowType;
  applicationStatus: ApplicationStatus;
  phone?: string;
  email?: string;
  paperDocuments: boolean;
  smsVerified: boolean;
  currentStep: number;
  business: BusinessData;
  passport: PassportData;
  submitted: boolean;
  lastSaved?: string;
}

const initialState: AppState = {
  flowType: "online_light",
  applicationStatus: "draft",
  email: "client@email.com",
  paperDocuments: false,
  smsVerified: false,
  currentStep: 0,
  business: {
    okvedCodes: [],
    registrationResultEmail: "client@email.com",
    charterCapital: "10000",
    capitalType: "charter",
  },
  passport: {},
  submitted: false,
};

type Action =
  | { type: "SET_PRODUCT"; payload: ProductType }
  | { type: "SET_FLOW"; payload: FlowType }
  | { type: "SET_APPLICATION_STATUS"; payload: ApplicationStatus }
  | { type: "SET_PHONE"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PAPER_DOCUMENTS"; payload: boolean }
  | { type: "SET_SMS_VERIFIED" }
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_BUSINESS"; payload: Partial<BusinessData> }
  | { type: "UPDATE_PASSPORT"; payload: Partial<PassportData> }
  | { type: "SUBMIT" }
  | { type: "LOAD_DRAFT"; payload: AppState }
  | { type: "RESET" };

function normalizeFlowType(flowType?: FlowType | "online" | "manager"): FlowType {
  if (flowType === "online") return "online_light";
  if (flowType === "manager") return "assisted";
  return flowType || "online_light";
}

// Exported for migration regression tests.
// eslint-disable-next-line react-refresh/only-export-components
export function normalizeDraft(payload: AppState): AppState {
  return {
    ...initialState,
    ...payload,
    flowType: normalizeFlowType(payload.flowType),
    applicationStatus: payload.applicationStatus || "draft",
    business: { ...initialState.business, ...payload.business },
    passport: { ...initialState.passport, ...payload.passport },
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PRODUCT": {
      const emailDefaults: Partial<BusinessData> = {};
      if (action.payload === "ip" && !state.business.entrepreneurEmail) {
        emailDefaults.entrepreneurEmail = state.email;
      }
      if (action.payload === "ooo" && !state.business.legalEntityEmail) {
        emailDefaults.legalEntityEmail = state.email;
      }
      if (!state.business.registrationResultEmail) {
        emailDefaults.registrationResultEmail = state.email;
      }

      return {
        ...state,
        productType: action.payload,
        business: { ...state.business, ...emailDefaults },
      };
    }
    case "SET_FLOW": return { ...state, flowType: action.payload };
    case "SET_APPLICATION_STATUS": return { ...state, applicationStatus: action.payload };
    case "SET_PHONE": return { ...state, phone: action.payload };
    case "SET_EMAIL": return { ...state, email: action.payload };
    case "SET_PAPER_DOCUMENTS": return { ...state, paperDocuments: action.payload };
    case "SET_SMS_VERIFIED": return { ...state, smsVerified: true };
    case "SET_STEP": return { ...state, currentStep: action.payload };
    case "UPDATE_BUSINESS": return { ...state, business: { ...state.business, ...action.payload } };
    case "UPDATE_PASSPORT": return { ...state, passport: { ...state.passport, ...action.payload } };
    case "SUBMIT": return { ...state, submitted: true };
    case "LOAD_DRAFT": return normalizeDraft(action.payload);
    case "RESET": return initialState;
    default: return state;
  }
}

const DRAFT_KEY = "uralsib_draft";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  hasDraft: () => boolean;
  loadDraft: () => void;
  clearDraft: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.currentStep > 0 || state.smsVerified || state.productType) {
      const toSave = { ...state, lastSaved: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
    }
  }, [state]);

  const hasDraft = useCallback(() => {
    const d = localStorage.getItem(DRAFT_KEY);
    if (!d) return false;
    try {
      const parsed = JSON.parse(d) as AppState;
      return !parsed.submitted && (!!parsed.productType || parsed.currentStep > 0);
    } catch { return false; }
  }, []);

  const loadDraft = useCallback(() => {
    const d = localStorage.getItem(DRAFT_KEY);
    if (d) {
      try {
        dispatch({ type: "LOAD_DRAFT", payload: JSON.parse(d) });
      } catch { /* ignore */ }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    dispatch({ type: "RESET" });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, hasDraft, loadDraft, clearDraft }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
