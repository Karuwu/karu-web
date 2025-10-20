import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export default function AdminErrorPage() {
  return (
    <Box className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white text-center p-6">
      <Typography variant="h5" className="text-3xl md:text-5xl font-bold mb-6">
        Oops! This page is only accessible by an Admin
      </Typography>
      <Box className="relative w-128 h-128 md:w-1000 md:h-90">
        <Image
          src="/images/sleeping don.png"
          alt="Don-chan sad"
          fill
          className="object-contain"
          priority
        />
      </Box>
      <Link href="/score_list" className="text-[#1976d2] hover:underline mt-6">
        Click here to return Home
      </Link>
    </Box>
  );
}