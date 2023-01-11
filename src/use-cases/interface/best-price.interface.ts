export enum Operation {
  BUY = 'buy',
  SELL = 'sell'
}

export interface OrderBook {
  asks: [number, number][];
  bids: [number, number][];
  exchange?: string;
  symbol?: string;
}

export interface CurrencyPrice {
  exchange: string;
  value: number;
  amount: number;
}
