import {
  CurrencyPrice,
  Operation,
  OrderBook
} from './interface/best-price.interface';

/**
 * Use case responsible for calculate and return the lower prices of an order book
 */
export class BestPriceUseCase {

  /**
   * @param order_book order book data
   * @param operation states whether it is a buy or sell operation
   * @param amount_limit maximum amount needed
   */
  constructor(
    private order_book: OrderBook,
    private operation: Operation,
    private amount_limit: number
  ) {}
  
  /**
   * Get lower prices to buy up to a set amount from a single order book
   */
  get(): CurrencyPrice[] {
    const exchange = this.order_book.exchange!;
    const orders = this.get_sorted_orders();

    let amount_control = 0;
    return orders
      .reduce<CurrencyPrice[]>((result, order) => {
        if (amount_control < this.amount_limit) {
          const [value, amount] = order;
          amount_control+= amount;
          return [
            ...result,
            {
              amount,
              value,
              exchange
            }
          ];
        }

        return result;
      }, []);
  }

  /**
   * Returns the list of orders sorted by increasing value in case of 
   * buy, or descending value in case of sale.
   */
  private get_sorted_orders() {
    const orders = this.operation === Operation.BUY
      ? this.order_book.asks
      : this.convert_orders_price(this.order_book.bids);

    return orders.sort((a, b) => a[0] - b[0]);
  }

  /**
   * Convert the orders price vs amount
   * @param orders array with order value and order amount
   * @returns reverse orders prices
   */
  private convert_orders_price(
    orders: [number, number][]
  ): [number, number][] {
    return orders.map(([original_value, original_amount]) => {
      const amount = original_amount * original_value;
      const value = 1 / original_value;
      return [value, amount];
    });
  }

}
