import axios from 'axios';

export const convertToINR = async (amount: number, fromCurrency: string): Promise<number> => {
  if (fromCurrency === 'INR') {
    return amount;
  }

  try {
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_BASE_URL}${fromCurrency}`);
    const rate = response.data.rates.INR;
    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new Error('Failed to convert currency');
  }
};

export const convertFromINR = async (amount: number, toCurrency: string): Promise<number> => {
  if (toCurrency === 'INR') {
    return amount;
  }

  try {
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_BASE_URL}INR`);
    const rate = response.data.rates[toCurrency];
    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new Error('Failed to convert currency');
  }
};

