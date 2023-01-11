import { BestPriceUseCase } from './best-price.use-case';
import { CurrencyPrice, Operation, OrderBook } from './interface/best-price.interface';

export class BestPriceBySymbolUseCase {
  
  private operation = Operation.BUY;
  private filtered_orders!: OrderBook[]; 
  
  /**
   * @param order_books order book list
   * @param symbol trading pair
   * @param amount_limit maximum amount needed
   */
  constructor(
    order_books: OrderBook[],
    private symbol: string,
    private amount_limit: number
  ) {
    this.filter_orders(order_books);
  }

  get(): CurrencyPrice[] {
    const orders = this.filtered_orders
      .map(order => new BestPriceUseCase(order, this.operation, this.amount_limit).get())
      .reduce((result, prices) => {
        return [
          ...result,
          ...prices
        ];
      }, [])
      .sort((a, b) => a.value - b.value);

    let amount_control = 0;
    return orders
      .reduce<CurrencyPrice[]>((result, order) => {
        if (amount_control < this.amount_limit) {
          amount_control+= order.amount;
          return [...result, order];
        }

        return result;
      }, []);
  }

  /**
   * Filter only orders for a given symbol, setting the operation to sell if the symbol is inverted
   * @param orders order book list
   */
  private filter_orders(orders: OrderBook[]): void {
    let filtered_orders = orders.filter(order => order.symbol === this.symbol);
    
    if (!filtered_orders.length) {
      this.operation = Operation.SELL;
      const reverse_symbol = this.symbol.split('/').reverse().join('/');
      filtered_orders = orders.filter(order => order.symbol === reverse_symbol) || [];
    }

    this.filtered_orders = filtered_orders;
  }

}
