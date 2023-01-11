import { injectable } from 'tsyringe';
import { ExchangeService } from '../services/exchange.service';
import { ArbitrageInput } from './interface/arbitrage.types';
import { CalculateSuggestionUseCase } from './calculate-suggestion.use-case';
import { BuySuggestion } from './interface/suggestion.interface';
import { OrderBook } from './interface/best-price.interface';

@injectable()
export class ArbitrageUseCase {

  private orders: OrderBook[] = [];

  constructor(
    private exchange_service: ExchangeService
  ) {}

  async execute(arbitrage_input: ArbitrageInput[]): Promise<BuySuggestion[]> {
    const symbols = arbitrage_input.map(request => request.symbol);
    this.orders = await this.exchange_service.fetch_orders(symbols);

    const result: BuySuggestion[] = [];
      
    arbitrage_input
      .map(this.calculate_suggestion.bind(this))
      .forEach(suggestions => result.push(...suggestions));
    
    return this.group_suggestions_by_currency(result);
  }

  private group_suggestions_by_currency(suggestions: BuySuggestion[]): BuySuggestion[] {
    const exchange_currencies: {[key: string]: BuySuggestion} = {};
    
    suggestions.forEach(suggestion => {
      const { exchange, currency } = suggestion;
      const key = `${exchange}_${currency}`;
      
      if (exchange_currencies[key]) {
        exchange_currencies[key].amount+= suggestion.amount;
        return;
      }

      exchange_currencies[key] = suggestion;
    });
    
    return Object
      .values(exchange_currencies)
      .map(this.set_precision.bind(this))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Calculate buy suggestion getting the lower prices from different exchanges
   * @param input
   * @returns buy suggestion with the lower prices
   */
  private calculate_suggestion(input: ArbitrageInput): BuySuggestion[] {
    const { symbol, value } = input;
    return new CalculateSuggestionUseCase(
      this.orders,
      symbol,
      value
    ).get();
  }

  /**
   * Parse suggestion object to set amount precision according to the exchange definition
   * @param suggestion buy suggestion
   */
  private set_precision(suggestion: BuySuggestion): BuySuggestion {
    const precision = this.exchange_service.get_currency_precision(
      suggestion.exchange,
      suggestion.currency
    );
    const amount = +suggestion.amount.toFixed(precision);

    return { ...suggestion, amount };
  }

}
