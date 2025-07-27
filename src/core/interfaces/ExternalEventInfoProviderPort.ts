export interface EventInfo {
  ticker: string;
  type: string;
  date: Date;
  factor: number;
}

export interface ExternalEventInfoProviderPort {
  /**
   * Get the factor for a stock split or reverse split event
   * @param ticker The asset ticker
   * @param eventType The event type
   * @param eventDate The event date
   * @returns The factor or null if not found
   */
  getEventFactor(ticker: string, eventType: string, eventDate: Date): Promise<number | null>;

  /**
   * Get the average price for a special event (Atualização, Direito de Subscrição, Cessão de Direitos - Solicitada)
   * @param ticker The asset ticker
   * @param eventType The event type
   * @param eventDate The event date
   * @returns The average price or null if not found
   */
  getSpecialEventAveragePrice(
    ticker: string,
    eventType: string,
    eventDate: Date
  ): Promise<number | null>;
}
