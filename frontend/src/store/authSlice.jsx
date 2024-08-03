import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instance as axios } from '../api/axios'
import { userInstance } from '../api/axios';
axios.defaults.withCredentials = true;


const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  // user: null,
  // isAuthenticated: false,
  role:null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/verify-otp', otpData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const submitTutorApplication = createAsyncThunk(
  'auth/submitTutorApplication',
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/tutor_application', applicationData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }

);
export const fetchTutorDetails = createAsyncThunk(
  'auth/fetchTutorDetails',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const accessToken = localStorage.getItem(`${user.email}_access_token`);
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await userInstance.get(`/admin/usermanagement/tutor-details/${user.id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateProfilePicture = createAsyncThunk(
  'auth/updateProfilePicture',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const accessToken = localStorage.getItem(`${user.email}_access_token`);
      console.log("accesst oken in the update profile picture*****",accessToken)
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await userInstance.patch(`/admin/usermanagement/update-profile-picture/${user.id}/`, formData, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const accessToken = localStorage.getItem(`${user.email}_access_token`);
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await userInstance.patch(`/admin/usermanagement/update-profile/${user.id}/`, profileData, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
)
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const accessToken = localStorage.getItem(`${user.email}_access_token`);
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await userInstance.post(`/admin/usermanagement/update-password/${user.id}/`, passwordData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { user, role } = getState().auth;
    const rolePrefix = role === 'tutor' ? 'tutor_' : 'student_';

    localStorage.removeItem(`${user.username}_access_token`);
    localStorage.removeItem(`${user.username}_refresh_token`);
    localStorage.removeItem(`${user.username}_role`);
    localStorage.removeItem('current_user');

    // You might want to call an API endpoint to invalidate the token on the server
    // await axios.post('/api/logout');
  }
);




const authSlice = createSlice({
  name: 'auth',
  initialState,
 
    reducers: {
      logout: (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
      },

      setUser: (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.role = action.payload.role;
        localStorage.setItem('user', JSON.stringify(action.payload));
      },
    },
 

 
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      }).addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      })
   
    
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.non_field_errors?.[0] || action.payload || 'An error occurred';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload
        
        state.role = action.payload.user.role;
        const username = action.payload.user.email;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      
        const rolePrefix = action.payload.user.role === 'tutor' ? 'tutor_' : 'student_';
        localStorage.setItem(`${username}_access_token`, action.payload.access);
        localStorage.setItem(`${username}_refresh_token`, action.payload.refresh);
        localStorage.setItem(`${username}_role`, action.payload.user.role);
        localStorage.setItem('current_user', username);

    })
    .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.detail || 'Login failed';
    })
    .addCase(submitTutorApplication.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(submitTutorApplication.fulfilled, (state, action) => {
      state.loading = false;
      // You can update the user state here if needed
    })
    .addCase(submitTutorApplication.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to submit tutor application';
    })
    .addCase(updateProfilePicture.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProfilePicture.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    })
    .addCase(updateProfilePicture.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update profile picture';
    })
   
    .addCase(fetchTutorDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchTutorDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    })
    .addCase(fetchTutorDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch tutor details';
    })
    .addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    })
    .addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update profile';
    })
    .addCase(updatePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updatePassword.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(updatePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update password';
    })


  },
});

export const { logout,setUser} = authSlice.actions;

export default authSlice.reducer;

