import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";

export type ProductType = "ip" | "ooo" | "help";
export type FlowType = "online" | "manager";

export interface BusinessData {
  okvedCodes: string[];
  taxRegime?: string;
  companyName?: string;
  directorIsFounder?: boolean;
  addressIsFounder?: boolean;
}

export interface PassportData {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  gender?: string;
  birthPlace?: string;
  passportSeries?: string;
  passportNumber?: string;
  issuedBy?: string;
  issueDate?: string;
  divisionCode?: string;
  inn?: string;
  snils?: string;
  ocrCompleted?: boolean;
}

export interface AppState {
  productType?: ProductType;
  flowType?: FlowType;
  phone?: string;
  smsVerified: boolean;
  currentStep: number;
  business: BusinessData;
  passport: PassportData;
  submitted: boolean;
  lastSaved?: string;
}

const initialState: AppState = {
  smsVerified: false,
  currentStep: 0,
  business: { okvedCodes: [], directorIsFounder: true, addressIsFounder: true },
  passport: {},
  submitted: false,
};

type Action =
  | { type: "SET_PRODUCT"; payload: ProductType }
  | { type: "SET_FLOW"; payload: FlowType }
  | { type: "SET_PHONE"; payload: string }
  | { type: "SET_SMS_VERIFIED" }
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_BUSINESS"; payload: Partial<BusinessData> }
  | { type: "UPDATE_PASSPORT"; payload: Partial<PassportData> }
  | { type: "SUBMIT" }
  | { type: "LOAD_DRAFT"; payload: AppState }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PRODUCT": return { ...state, productType: action.payload };
    case "SET_FLOW": return { ...state, flowType: action.payload };
    case "SET_PHONE": return { ...state, phone: action.payload };
    case "SET_SMS_VERIFIED": return { ...state, smsVerified: true };
    case "SET_STEP": return { ...state, currentStep: action.payload };
    case "UPDATE_BUSINESS": return { ...state, business: { ...state.business, ...action.payload } };
    case "UPDATE_PASSPORT": return { ...state, passport: { ...state.passport, ...action.payload } };
    case "SUBMIT": return { ...state, submitted: true };
    case "LOAD_DRAFT": return action.payload;
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
