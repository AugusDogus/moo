"use client";

import { useEffect, useState } from "react";
import { useTour, TourAlertDialog, type TourStep } from "~/components/tour";
import { TOUR_STEP_IDS } from "~/lib/tour-constants";
import { api } from "~/trpc/react";

const tourSteps: TourStep[] = [
  {
    content: (
      <div className="space-y-2">
        <h4 className="font-medium">Welcome to moo! 🐮</h4>
        <p className="text-sm text-muted-foreground">
          This is your cozy cottage-core deduction game. Let's learn how to play!
        </p>
      </div>
    ),
    selectorId: TOUR_STEP_IDS.TITLE,
    position: "bottom",
  },
  {
    content: (
      <div className="space-y-2">
        <h4 className="font-medium">Your User Menu</h4>
        <p className="text-sm text-muted-foreground">
          Click here to access your account settings and sign out when needed.
        </p>
      </div>
    ),
    selectorId: TOUR_STEP_IDS.USER_MENU,
    position: "bottom",
  },
  {
    content: (
      <div className="space-y-2">
        <h4 className="font-medium">Create a Room</h4>
        <p className="text-sm text-muted-foreground">
          Start a new game by creating a room. Share the room code with a friend to play together!
        </p>
      </div>
    ),
    selectorId: TOUR_STEP_IDS.CREATE_ROOM,
    position: "top",
  },
  {
    content: (
      <div className="space-y-2">
        <h4 className="font-medium">Join a Room</h4>
        <p className="text-sm text-muted-foreground">
          Enter a room code to join an existing game and start playing with your friend.
        </p>
      </div>
    ),
    selectorId: TOUR_STEP_IDS.JOIN_ROOM,
    position: "top",
  },
  {
    content: (
      <div className="space-y-2">
        <h4 className="font-medium">How to Play</h4>
        <p className="text-sm text-muted-foreground">
          In moo, you'll try to crack your opponent's 4-emoji code! You'll get "bulls" for correct emojis in the right position and "cows" for correct emojis in the wrong position. Good luck! 🍀
        </p>
      </div>
    ),
    selectorId: TOUR_STEP_IDS.GAME_INSTRUCTIONS,
    position: "top",
  },
];

export function TourManager() {
  const { setSteps, startTour, endTour } = useTour();
  const [showTourDialog, setShowTourDialog] = useState(false);
  
  const { data: tourStatus, isLoading: isLoadingTourStatus } = api.user.getTourStatus.useQuery();
  const updateTourStatus = api.user.updateTourStatus.useMutation();

  useEffect(() => {
    setSteps(tourSteps);
  }, [setSteps]);

  useEffect(() => {
    if (!isLoadingTourStatus && tourStatus) {
      // Show tour dialog if user hasn't completed/skipped the tour
      if (tourStatus === "not_started" || tourStatus === "remind_later") {
        const timer = setTimeout(() => {
          setShowTourDialog(true);
        }, 1000); // Show after 1 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [tourStatus, isLoadingTourStatus]);

  const handleTourComplete = () => {
    updateTourStatus.mutate({ status: "completed" });
  };

  const handleTourSkip = () => {
    updateTourStatus.mutate({ status: "skipped" });
  };

  const handleTourRemindLater = () => {
    updateTourStatus.mutate({ status: "remind_later" });
  };

  return (
    <>
      <TourAlertDialog
        open={showTourDialog}
        onOpenChange={(open) => {
          setShowTourDialog(open);
          if (!open) {
            // If dialog is closed without starting tour, mark as skipped
            handleTourSkip();
          }
        }}
        onStartTour={() => {
          setShowTourDialog(false);
          startTour();
        }}
        onSkipTour={() => {
          setShowTourDialog(false);
          handleTourSkip();
        }}
      />
    </>
  );
}