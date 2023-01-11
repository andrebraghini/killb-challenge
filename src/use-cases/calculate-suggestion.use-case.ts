import { BestPriceBySymbolUseCase } from './best-price-by-symbol.use-case';
import { OrderBook } from './interface/best-price.interface';
import { BuySuggestion } from './interface/suggestion.interface';

/**
 * Class responsible for calculate buy suggestion getting the lower prices from different exchanges
 */
export class CalculateSuggestionUseCase {

  /**
   * @param orders full order book list
   * @param symbol trading pair
   * @param value value needed
   * @param precision source and target decimal precision grouped by exchange
   */
  constructor(
    private orders: OrderBook[],
    private symbol: string,
    private value: number
  ) {}

  /**
   * Calculate buy suggestion getting the lower prices from different exchanges
   * @param input 
   * @param orders 
   * @returns buy suggestion with the lower prices
   */
  get(): BuySuggestion[] {
    const result: BuySuggestion[] = [];
    const amount = this.value;

    const prices = new BestPriceBySymbolUseCase(
      this.orders,
      this.symbol,
      this.value
    ).get();

    const [currency] = this.symbol.split('/');
    
    let amount_control = 0;
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      const { exchange } = price;

      let suggestion = result.find(suggestion => suggestion.exchange === exchange);
      if (!suggestion) {
        suggestion = {
          exchange,
          currency,
          amount: 0
        };
        result.push(suggestion);
      }

      suggestion.amount+= price.amount >= (amount - amount_control)
        ? (amount - amount_control)
        : price.amount;

      amount_control+= price.amount;
      if (amount_control >= amount) {
        break;
      }
    }

    return result;
  }

}
