"use client";

import { TourProvider } from "~/components/tour";
import { api } from "~/trpc/react";

interface TourWrapperProps {
  children: React.ReactNode;
}

export function TourWrapper({ children }: TourWrapperProps) {
  const updateTourStatus = api.user.updateTourStatus.useMutation();

  const handleTourComplete = () => {
    updateTourStatus.mutate({ status: "completed" });
  };

  return (
    <TourProvider onComplete={handleTourComplete}>
      {children}
    </TourProvider>
  );
}