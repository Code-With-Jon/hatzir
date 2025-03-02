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
  async ({ title, description, location, isAnonymous, mediaFiles, userId }, { rejectWithValue }) => {
    try {
      console.log('Adding incident with userId:', userId);
      
      const mediaUrls = [];
      
      if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const storageRef = ref(storage, `incidents/${fileName}`);
            
            // Convert the URI to a blob
            const response = await fetch(file.uri);
            const blob = await response.blob();
            
            // Upload the blob
            const uploadResult = await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(uploadResult.ref);
            
            mediaUrls.push({
              url: downloadUrl,
              type: file.type, // Now includes 'video' type
              name: fileName
            });
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error(`Failed to upload media: ${uploadError.message}`);
          }
        }
      }

      console.log('Media URLs:', mediaUrls);
      
      // Prepare incident data
      const incidentData = {
        title,
        description,
        location,
        isAnonymous,
        reportedBy: userId,
        createdAt: new Date().toISOString(),
        votes: 0,
        flags: 0,
        status: 'pending',
        mediaUrls
      };

      console.log('Creating incident with data:', {
        ...incidentData,
        userId,
        isAnonymous
      });
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'incidents'), incidentData);
      console.log('Document written with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...incidentData
      };
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