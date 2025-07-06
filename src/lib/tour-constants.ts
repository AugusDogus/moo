export const TOUR_STEP_IDS = {
  TITLE: "tour-title",
  USER_MENU: "tour-user-menu",
  CREATE_ROOM: "tour-create-room",
  JOIN_ROOM: "tour-join-room",
  GAME_INSTRUCTIONS: "tour-game-instructions",
} as const;

export type TourStepId = typeof TOUR_STEP_IDS[keyof typeof TOUR_STEP_IDS];
