import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  GeoPoint,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'incidents'));
      const incidents = [];
      querySnapshot.forEach((doc) => {
        incidents.push({ id: doc.id, ...doc.data() });
      });
      return incidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return rejectWithValue('Failed to fetch incidents');
    }
  }
);

export const addIncident = createAsyncThunk(
  'incidents/addIncident',
  async (incidentData, { rejectWithValue }) => {
    try {
      console.log('Adding incident to Firestore:', incidentData);
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'incidents'), incidentData);
      console.log('Document written with ID:', docRef.id);
      
      const savedIncident = {
        id: docRef.id,
        ...incidentData
      };
      console.log('Saved incident:', savedIncident);
      
      return savedIncident;
    } catch (error) {
      console.error('Error adding incident:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const voteIncident = createAsyncThunk(
  'incidents/voteIncident',
  async ({ id, voteValue }, { rejectWithValue }) => {
    try {
      const incidentRef = doc(db, 'incidents', id);
      await updateDoc(incidentRef, {
        votes: voteValue
      });
      
      // Return both the id and the new vote value
      return { 
        id, 
        votes: voteValue 
      };
    } catch (error) {
      console.error('Vote update failed:', error);
      return rejectWithValue(error.message || 'Failed to update vote');
    }
  }
);

export const flagIncident = createAsyncThunk(
  'incidents/flagIncident',
  async (id, { rejectWithValue }) => {
    try {
      const incidentRef = doc(db, 'incidents', id);
      await updateDoc(incidentRef, {
        flags: increment(1)
      });
      
      return { id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  incidents: [],
  isLoading: false,
  error: null,
};

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    clearIncidentsError: (state) => {
      state.error = null;
    },
    setIncidents: (state, action) => {
      state.incidents = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addIncident.fulfilled, (state, action) => {
        console.log('Adding incident to state:', action.payload);
        state.incidents.push(action.payload);
        state.isLoading = false;
      })
      .addCase(addIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(voteIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex(incident => incident.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index].votes = action.payload.votes;
        }
      })
      .addCase(flagIncident.fulfilled, (state, action) => {
        const index = state.incidents.findIndex(incident => incident.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index].flags += 1;
        }
      });
  },
});

export const { clearIncidentsError, setIncidents } = incidentsSlice.actions;
export default incidentsSlice.reducer; 