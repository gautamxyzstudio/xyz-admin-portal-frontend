/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Typography } from '@mui/material';
import { useMemo } from 'react';
import MDBox from '../../../../components/MDBox/MDBox';
import Confetti from 'react-confetti';
import { Swiper, SwiperSlide } from 'swiper/react';
import {Navigation} from "swiper/modules"
import MDButton from '../../../../components/MDButton/MDButton';
import { useGetHolidaysQuery } from '../../../holydayList/holydayListApi';
import { useNavigate } from 'react-router-dom';

const UpComingHolidays = () => {
  const { data: holidays } = useGetHolidaysQuery();
  const navigate = useNavigate();
  const processedHolidays = useMemo(() => {
    if (!holidays?.data) return [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Process holidays and filter for current month or upcoming
    const validHolidays = holidays.data
      .map((holiday: any) => {
        const holidayData = holiday.attributes || holiday;
        const holidayDate = new Date(holidayData.date);

        return {
          id: holiday.id,
          name: holidayData.Name,
          date: holidayDate,
          formattedDate: holidayDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          day: holidayDate.getDate(),
          month: holidayDate.getMonth(),
          year: holidayDate.getFullYear(),
        };
      })
      .filter((holiday: any) => {
        // Show holidays from current month or future months
        return (
          holiday.year > currentYear ||
          (holiday.year === currentYear && holiday.month >= currentMonth)
        );
      })
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

    return validHolidays;
  }, [holidays]);

  const currentMonthHolidays = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return processedHolidays.filter(
      (holiday: any) =>
        holiday.month === currentMonth && holiday.year === currentYear
    );
  }, [processedHolidays]);

  const displayHolidays =
    currentMonthHolidays.length > 0
      ? currentMonthHolidays
      : processedHolidays.slice(0, 3); // Show up to 3 upcoming holidays if no current month holidays

  const formatDayWithSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return `${day}th`;
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  if (!holidays?.data || displayHolidays.length === 0) {
    return (
      <Card sx={{ width: '48%' }}>
        <MDBox py={3} px={3}>
          <div className="flex flex-row justify-between items-center">
            <Typography variant="h6">Upcoming Holidays</Typography>
            <MDButton
              variant="text"
              className="cursor-pointer z-30"
              color="info"
              size="medium"
            >
              View All
            </MDButton>
          </div>
          <div className="flex flex-col w-full h-24 justify-center items-center">
            <Typography variant="h6" color="textSecondary">
              No upcoming holidays
            </Typography>
          </div>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '48%' }}>
      <div className="relative overflow-hidden">
        <MDBox py={3} px={3}>
          <div className="flex flex-row justify-between items-center">
            <Typography variant="h6">
              {currentMonthHolidays.length > 0
                ? "This Month's Holidays"
                : 'Upcoming Holidays'}
            </Typography>
            <MDButton
              onClick={() => navigate('/holidays')}
              variant="text"
              className="cursor-pointer z-30"
              color="info"
              size="medium"
            >
              View All
            </MDButton>
          </div>
        </MDBox>
        <Swiper
          modules={[Navigation]}
          className="h-24 mb-10"
          slidesPerView={1}
          navigation={true}
          centeredSlides={true}
        >
          {displayHolidays.map((holiday: any) => (
            <SwiperSlide key={holiday.id}>
              <div className="flex flex-col w-full h-full justify-center items-center">
                <Typography variant="h2" className="text-center">
                  {holiday.name}
                </Typography>
                <Typography variant="h6" className="text-center">
                  <span className="text-red-500">
                    {formatDayWithSuffix(holiday.day)}
                  </span>
                  ,{' '}
                  {holiday.date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {currentMonthHolidays.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full">
            <Confetti
              run={true}
              recycle={false}
              width={window.innerWidth}
              height={window.innerHeight}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpComingHolidays;
