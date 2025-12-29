export interface IHolidayRequest {
  data: {
    Name: string;
    date: string;
  };
}

export interface IHoliday {
  id: number;
  Name?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  attributes?: {
    Name: string;
    date: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface IAddHolidayFormData {
  name: string;
  date: string;
}
