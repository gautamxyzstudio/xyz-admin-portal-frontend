export interface IHolidayRequest {
  data: {
    Name: string;
    date: string;
  };
}

export interface IAddHolidayFormData {
  name: string;
  date: string;
}

export interface IHolidayApiResponse {
  data: {
    id: number;
    attributes: {
      Name: string;
      date: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  };
}

export interface IHolidayAttributes {
  Name: string;
  date: string; // ISO date (YYYY-MM-DD)
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  publishedAt: string; // ISO datetime
}

export interface IHoliday {
  id: number;
  attributes: IHolidayAttributes;
}
export interface IHolidayResponse {
  data: IHoliday[];
}
export interface IHolidayFlat {
  id: number;
  name: string;
  date: string;
}
