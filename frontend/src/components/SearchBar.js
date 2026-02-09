import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import { propertyAPI } from '../services/api';

const SearchBar = ({ initialLocation = '', onSearch, compact = false }) => {
  const [inputValue, setInputValue] = useState(initialLocation);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    const term = inputValue.trim();
    if (!term) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await propertyAPI.getLocationSuggestions(term);
        setOptions(res.data || []);
      } catch (_err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const submit = () => onSearch(inputValue.trim());

  return (
    <Stack direction={compact ? { xs: 'column', sm: 'row' } : { xs: 'column', md: 'row' }} spacing={2}>
      <Autocomplete
        freeSolo
        fullWidth
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_event, value) => setInputValue(value)}
        onChange={(_event, value) => setInputValue(value || '')}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search by location"
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
          />
        )}
      />
      <Button variant="contained" size="large" onClick={submit}>
        Search
      </Button>
    </Stack>
  );
};

export default SearchBar;
