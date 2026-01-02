import { Box, Typography } from "@mui/material";

const EmployeeTableRow = ({
  image,
  name,
  email,
}: {
  image: string;
  name: string;
  email: string;
}) => {
  return (
    <Box
      display="flex"
      sx={{
        overflow: "scroll",
      }}
      alignItems="center"
      lineHeight={1}
    >
      <img src={image} alt="" className="size-12 object-center rounded-full" />
      <Box ml={2} lineHeight={1}>
        <Typography
          display="block"
          variant="caption"
          color="text"
          textTransform="capitalize"
          fontWeight="bold"
        >
          {name}
        </Typography>
        <Typography variant="caption">{email}</Typography>
      </Box>
    </Box>
  );
};

export default EmployeeTableRow;
