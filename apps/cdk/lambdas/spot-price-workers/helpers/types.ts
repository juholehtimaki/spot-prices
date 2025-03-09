type MarketParticipant = {
  mRID: {
    _: string;
    codingScheme: string;
  };
  marketRole: {
    type: string;
  };
};

type TimeInterval = {
  start: string;
  end: string;
};

type Point = {
  position: string;
  "price.amount": string;
};

type Period = {
  timeInterval: TimeInterval;
  resolution: string;
  Point: Point[];
};

export type TimeSeries = {
  mRID: string;
  auction: {
    type: string;
  };
  businessType: string;
  in_Domain: {
    mRID: {
      _: string;
      codingScheme: string;
    };
  };
  out_Domain: {
    mRID: {
      _: string;
      codingScheme: string;
    };
  };
  contract_MarketAgreement: {
    type: string;
  };
  currency_Unit: {
    name: string;
  };
  price_Measure_Unit: {
    name: string;
  };
  curveType: string;
  Period: Period;
};

type PublicationMarketDocument = {
  xmlns: string;
  mRID: string;
  revisionNumber: string;
  type: string;
  sender_MarketParticipant: MarketParticipant;
  receiver_MarketParticipant: MarketParticipant;
  createdDateTime: string;
  period: {
    timeInterval: TimeInterval;
  };
  TimeSeries: TimeSeries[] | TimeSeries;
};

export type ApiResponseInJson = {
  Publication_MarketDocument: PublicationMarketDocument;
};
