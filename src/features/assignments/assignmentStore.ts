import { create } from 'zustand';
import type { DriverAssignment, DriverAssignmentCreate, DriverAssignmentUpdate } from '../../types/assignment';
import { assignmentService } from './assignmentService';

interface AssignmentState {
  assignments: DriverAssignment[];
  isLoading: boolean;
  error: string | null;
  
  fetchAssignments: (token: string) => Promise<void>;
  assignDriver: (data: DriverAssignmentCreate, token: string) => Promise<{ success: boolean; message: string }>;
  updateAssignment: (id: string, data: DriverAssignmentUpdate, token: string) => Promise<{ success: boolean; message: string }>;
  removeAssignment: (id: string, token: string) => Promise<{ success: boolean; message: string }>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  isLoading: false,
  error: null,

  fetchAssignments: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await assignmentService.getAllAssignments(token);
      if (response.status === 'success') {
        set({ assignments: (response.payload as DriverAssignment[]) || [], isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  assignDriver: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await assignmentService.assignDriver(data, token);
      if (response.status === 'success') {
        const newAssignment = response.payload as DriverAssignment;
        set((state) => ({ 
          assignments: [newAssignment, ...state.assignments],
          isLoading: false 
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

  updateAssignment: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await assignmentService.updateAssignment(id, data, token);
      if (response.status === 'success') {
        const updatedAssignment = response.payload as DriverAssignment;
        set((state) => ({
          assignments: state.assignments.map((a) => a.assignment_id === id ? updatedAssignment : a),
          isLoading: false
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

  removeAssignment: async (id, token) => {
    set({ isLoading: true });
    try {
      const response = await assignmentService.unassignDriver(id, token);
      if (response.status === 'success') {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.assignment_id !== id),
          isLoading: false
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
