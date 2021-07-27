import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Validator } from '@helium/http'
import { getElectedValidators, getValidators } from '../../utils/appDataClient'
import {
  CacheRecord,
  handleCacheFulfilled,
  hasValidCache,
} from '../../utils/cacheUtils'

export type ValidatorsSliceState = {
  validators: CacheRecord<{ data: Validator[] }>
  electedValidators: CacheRecord<{ data: Validator[] }>
}

const initialState: ValidatorsSliceState = {
  validators: { lastFetchedTimestamp: 0, loading: false, data: [] },
  electedValidators: { lastFetchedTimestamp: 0, loading: false, data: [] },
}

export const fetchValidators = createAsyncThunk(
  'validators/fetchValidators',
  async (_arg, { getState }) => {
    const {
      validators: { validators },
    } = (await getState()) as {
      validators: ValidatorsSliceState
    }
    if (hasValidCache(validators)) return validators.data

    return getValidators()
  },
)

export const fetchElectedValidators = createAsyncThunk(
  'validators/fetchElectedValidators',
  async (_arg, { getState }) => {
    const {
      validators: { electedValidators },
    } = (await getState()) as {
      validators: ValidatorsSliceState
    }
    if (hasValidCache(electedValidators)) return electedValidators.data

    return getElectedValidators()
  },
)

const validatorsSlice = createSlice({
  name: 'validatorDetails',
  initialState,
  reducers: {
    signOut: () => {
      return { ...initialState }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchValidators.rejected, (state, _action) => {
      state.validators.loading = false
    })
    builder.addCase(fetchValidators.pending, (state, _action) => {
      state.validators.loading = true
    })
    builder.addCase(fetchValidators.fulfilled, (state, action) => {
      state.validators = handleCacheFulfilled({ data: action.payload })
    })
    builder.addCase(fetchElectedValidators.fulfilled, (state, action) => {
      state.electedValidators = handleCacheFulfilled({ data: action.payload })
    })
  },
})

export default validatorsSlice
