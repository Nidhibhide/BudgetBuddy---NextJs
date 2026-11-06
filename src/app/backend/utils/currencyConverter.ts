import axios from 'axios';

export const convertToINR = async (
  amount: number,
  fromCurrency: string,
  // Kept for call-site compatibility; unused
  _t?: (key: string) => string
): Promise<number> => {
  if (fromCurrency === 'INR') {
    return amount;
  }

  try {
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_BASE_URL}${fromCurrency}`);
    const rate = response.data.rates.INR;
    if (typeof rate !== 'number') {
      return amount;
    }
    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Currency conversion failed', error);
    return amount; // fallback instead of crashing the API
  }
};

export const convertFromINR = async (
  amount: number,
  toCurrency: string,
  // Kept for call-site compatibility; unused
  _t?: (key: string) => string
): Promise<number> => {
  if (toCurrency === 'INR') {
    return amount;
  }

  try {
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_BASE_URL}INR`);
    const rate = response.data.rates[toCurrency];
    if (typeof rate !== 'number') {
      return amount;
    }
    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Currency conversion failed', error);
    return amount; // fallback instead of crashing the API
  }
};
