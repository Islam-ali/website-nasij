export interface IState {
  _id?: string;
  name: {
    en: string;
    ar: string;
  };
  code: string; // State code (e.g., "CA", "NY")
  shippingCost: number;
  isActive: boolean;
}

export interface ICountry {
  _id?: string;
  name: {
    en: string;
    ar: string;
  };
  code: string; // Country code (e.g., "US", "CA")
  states: IState[];
  defaultShippingCost: number;
  isActive: boolean;
}

export interface ILocation {
  country: ICountry;
  state: IState;
  shippingCost: number;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
}