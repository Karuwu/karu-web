// File: app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase-client";
import { Container, Typography, CircularProgress, Button } from "@mui/material";
import { useAuth } from "../../components/AuthProvider";
import CreatePostForm from '../../components/CreatePostForm';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", margin: "auto", mt: 10 }} />;
  }

  if (!user) return null;

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Welcome, {user.email}!
      </Typography>
      <Typography>This is the protected admin dashboard.</Typography>
      <CreatePostForm/>
      <Button onClick={handleSignOut} sx={{ mt: 2 }}>
        Sign Out
      </Button>
    </Container>
  );
}
