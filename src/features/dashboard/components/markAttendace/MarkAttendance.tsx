import { Card, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MDBox from '../../../../components/MDBox/MDBox';
import MDButton from '../../../../components/MDButton/MDButton';
import { timeStringToDate } from '../../../../utils/utils';

export const formatDateToMMDDYYYY = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const MarkAttendance = ({
  inTime,
  outTime,
  handleCheckIn,
  handleCheckOut,
}: {
  inTime: string | null;
  outTime: string | null;
  handleCheckIn: (time: Date) => void;
  handleCheckOut: (time: Date) => void;
}) => {
  const inTimeDate = inTime ? timeStringToDate(inTime) : null;
  const outTimeDate = outTime ? timeStringToDate(outTime) : new Date();
  const initialElapsedTime = inTimeDate
    ? Math.floor((outTimeDate.getTime() - inTimeDate.getTime()) / 60000)
    : 0;

  const [elapsedMinutes, setElapsedMinutes] = useState(initialElapsedTime);

  useEffect(() => {
    setElapsedMinutes(initialElapsedTime);
  }, [initialElapsedTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inTime && !outTime) {
      timer = setInterval(() => {
        setElapsedMinutes((prev) => prev + 1);
        console.log('Timer updated:', elapsedMinutes + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [inTime, outTime, elapsedMinutes]);

  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours} H: ${minutes} M`;
  };

  return (
    <Card sx={{ width: '48%' }}>
      <MDBox py={3} px={3}>
        <div className="flex flex-row justify-between">
          <div>
            <MDBox display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {new Date().toLocaleDateString()}
              </Typography>
            </MDBox>

            {inTime && !outTime && (
              <div className="mt-4">
                <MDBox>
                  <Typography fontSize={16} variant="body1">
                    In Time :
                  </Typography>
                  <Typography variant="h3">
                    {formatTime(elapsedMinutes)}
                  </Typography>
                </MDBox>
              </div>
            )}
            {outTime && (
              <div className="mt-4">
                <MDBox>
                  <Typography fontSize={16} variant="body1">
                    Today's Work Time :
                  </Typography>
                  <Typography variant="h3">
                    {formatTime(elapsedMinutes)}
                  </Typography>
                </MDBox>
              </div>
            )}
          </div>
          {!inTime && !outTime && (
            <div className="gap-x-4 flex flex-col items-end">
              <MDButton
                sx={{ height: '40px' }}
                variant="gradient"
                color="success"
                onClick={() => handleCheckIn(new Date())}
              >
                Check In
              </MDButton>
            </div>
          )}
          {inTime && !outTime && (
            <div className="gap-x-4 flex flex-col items-end">
              <MDButton
                sx={{ height: '40px' }}
                variant="gradient"
                color="error"
                onClick={() => handleCheckOut(new Date())}
              >
                Check Out
              </MDButton>
            </div>
          )}
        </div>
      </MDBox>
    </Card>
  );
};

export default MarkAttendance;
