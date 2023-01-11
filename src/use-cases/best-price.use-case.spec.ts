import { BestPriceUseCase } from './best-price.use-case';
import { Operation, OrderBook } from './interface/best-price.interface';

describe('BestPriceUseCase', () => {

  describe('get()', () => {

    describe('Buy operation', () => {

      it('should return the lowest prices below the amount limit', () => {
        // Setup
        const order_book: OrderBook = {
          exchange: 'bitso',
          asks: [
            [5.3168, 10.0005],
            [5.3191, 150],
            [5.3173, 15],
            [5.3209, 200],
            [5.3299, 200.99],
            [5.3190, 33],
          ],
          bids: [],
        };
        const use_case = new BestPriceUseCase(order_book, Operation.BUY, 60);
  
        // Execute
        const result = use_case.get();
  
        // Validate
        expect(result).toEqual([
          { exchange: 'bitso', amount: 10.0005, value: 5.3168 },
          { exchange: 'bitso', amount: 15, value: 5.3173 },
          { exchange: 'bitso', amount: 33, value: 5.3190 },
          { exchange: 'bitso', amount: 150, value: 5.3191 },
        ]);
      });

    });

    describe('Sell operation', () => {

      it('should return the lowest prices below the amount limit', () => {
        // Setup
        const order_book: OrderBook = {
          exchange: 'bitso',
          asks: [],
          bids: [
            [5, 1],
            [5.5, 2.5],
            [5.5190, 9],
            [4.9991, 200],
            [4.9909, 150],
            [4.9973, 5],
            [4.9999, 1.99],
          ],
        };
        const use_case = new BestPriceUseCase(order_book, Operation.SELL, 65);
  
        // Execute
        const result = use_case.get();

        // Validate
        expect(result).toEqual([
          { exchange: 'bitso', value: 0.1811922449719152, amount: 49.671 },
          { exchange: 'bitso', value: 0.18181818181818182, amount: 13.75 },
          { exchange: 'bitso', value: 0.2, amount: 5 },
        ]);
      });

    });

  });

});
