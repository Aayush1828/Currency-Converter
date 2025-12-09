import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Card, CardContent, Grid, Box, CircularProgress, Alert,
  FormControl, InputLabel, Paper
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import ReactCountryFlag from 'react-country-flag';
import './App.css';

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(0);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Currency codes to country codes for flags (simplified mapping)
  const currencyToCountry = {
    USD: 'US', EUR: 'EU', INR: 'IN', GBP: 'GB', JPY: 'JP', AUD: 'AU', CAD: 'CA', CHF: 'CH'
    // Add more as needed
  };

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
     const response = await axios.get(`https://currency-converter-9kxq.onrender.com/api/rates?base=${fromCurrency}`);
      setRates(response.data.rates);
      setCurrencies(Object.keys(response.data.rates));
    } catch (err) {
      setError('Failed to fetch exchange rates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = () => {
    if (rates[toCurrency]) {
      const converted = amount * rates[toCurrency];
      setResult(converted);
      // Save to history
     axios.post('https://currency-converter-9kxq.onrender.com/api/convert', {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: converted
      });
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Container maxWidth="md" className="app-container">
      <Paper elevation={3} className="header-paper">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Currency Converter
        </Typography>
      </Paper>

      <Card className="converter-card">
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>From</InputLabel>
                <Select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  label="From"
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency} value={currency}>
                      <Box display="flex" alignItems="center">
                        <ReactCountryFlag
                          countryCode={currencyToCountry[currency] || 'US'}
                          svg
                          style={{ width: '20px', marginRight: '8px' }}
                        />
                        {currency}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1} textAlign="center">
              <Button onClick={swapCurrencies} variant="outlined" size="large">
                <SwapHoriz />
              </Button>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>To</InputLabel>
                <Select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  label="To"
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency} value={currency}>
                      <Box display="flex" alignItems="center">
                        <ReactCountryFlag
                          countryCode={currencyToCountry[currency] || 'US'}
                          svg
                          style={{ width: '20px', marginRight: '8px' }}
                        />
                        {currency}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1}>
              <Button
                onClick={convert}
                variant="contained"
                //color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Convert'}
              </Button>
            </Grid>
          </Grid>

          <Box mt={3} textAlign="center">
            <Typography variant="h5" color="primary">
              {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
