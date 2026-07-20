import { useEffect, useRef, useState, type ReactNode } from "react";
import { authApi } from "@/auth/api/authApi";
import { useAuthStore } from "@/auth/store/authStore";
import LoadingSpinner from "@/common/components/LoadingSpinner";

interface AuthBootstrapProps {
  children: ReactNode;
}

export default function AuthBootstrap({ children }: AuthBootstrapProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isReady, setIsReady] = useState(!isAuthenticated || Boolean(user));
  const hasRequestedUser = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || user) {
      setIsReady(true);
      return;
    }

    if (hasRequestedUser.current) return;
    hasRequestedUser.current = true;

    authApi
      .getMe()
      .then((response) => {
        const currentUser = response.data?.data;

        if (currentUser) {
          useAuthStore.getState().hydrateUser(currentUser);
          return;
        }

        useAuthStore.getState().logout();
      })
      .catch(() => useAuthStore.getState().logout())
      .finally(() => setIsReady(true));
  }, [isAuthenticated, user]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner message="사용자 정보를 확인하고 있어요." />
      </div>
    );
  }

  return children;
}
