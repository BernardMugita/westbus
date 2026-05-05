import { create } from 'zustand';
import type {
  InsuranceClaimRecord,
  InsuranceClaimCreate,
  InsuranceClaimUpdate,
} from '../../types/insuranceClaims';
import { insuranceClaimService } from './insuranceClaimsService';

interface InsuranceClaimState {
  claims: InsuranceClaimRecord[];
  isLoading: boolean;
  error: string | null;

  fetchClaims: (token: string) => Promise<void>;
  addClaim: (
    data: InsuranceClaimCreate,
    token: string
  ) => Promise<{ success: boolean; message: string }>;
  updateClaim: (
    id: string,
    data: InsuranceClaimUpdate,
    token: string
  ) => Promise<{ success: boolean; message: string }>;
  removeClaim: (
    id: string,
    token: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const useInsuranceClaimStore = create<InsuranceClaimState>((set) => ({
  claims: [],
  isLoading: false,
  error: null,

  fetchClaims: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceClaimService.getAllClaims(token);
      if (response.status === 'success') {
        set({
          claims: (response.payload as InsuranceClaimRecord[]) || [],
          isLoading: false,
        });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addClaim: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await insuranceClaimService.createClaim(data, token);
      if (response.status === 'success') {
        const newClaim = response.payload as InsuranceClaimRecord;
        set((state) => ({
          claims: [newClaim, ...state.claims],
          isLoading: false,
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },

  updateClaim: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await insuranceClaimService.updateClaim(id, data, token);
      if (response.status === 'success') {
        const updatedClaim = response.payload as InsuranceClaimRecord;
        set((state) => ({
          claims: state.claims.map((c) =>
            c.claim_id === id ? updatedClaim : c
          ),
          isLoading: false,
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },

  removeClaim: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await insuranceClaimService.deleteClaim(id, token);
      if (response.status === 'success') {
        set((state) => ({
          claims: state.claims.filter((c) => c.claim_id !== id),
          isLoading: false,
        }));
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, message: err.message };
    }
  },
}));