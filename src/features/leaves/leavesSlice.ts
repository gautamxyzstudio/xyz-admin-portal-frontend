import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leaves: [],
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setLeaves: (state, action) => {
      state.leaves = action.payload;
    },
  },
});

export const { setLeaves } = leavesSlice.actions;
export default leavesSlice.reducer;
