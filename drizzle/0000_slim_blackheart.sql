CREATE TABLE `moo_account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `moo_game_move` (
	`id` text PRIMARY KEY NOT NULL,
	`gameId` text NOT NULL,
	`playerId` text NOT NULL,
	`round` integer NOT NULL,
	`guess` text(4) NOT NULL,
	`bulls` integer NOT NULL,
	`cows` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `moo_game`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`playerId`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `moo_game_room` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text(4) NOT NULL,
	`createdBy` text NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`emptyAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `moo_game_room_code_unique` ON `moo_game_room` (`code`);--> statement-breakpoint
CREATE TABLE `moo_game` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`player1Id` text NOT NULL,
	`player2Id` text NOT NULL,
	`player1Code` text(4),
	`player2Code` text(4),
	`currentRound` integer DEFAULT 1 NOT NULL,
	`winnerId` text,
	`status` text DEFAULT 'code_selection' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`roomId`) REFERENCES `moo_game_room`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player1Id`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player2Id`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`winnerId`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `moo_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`userId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `moo_post` (`name`);--> statement-breakpoint
CREATE TABLE `moo_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `moo_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `moo_session_token_unique` ON `moo_session` (`token`);--> statement-breakpoint
CREATE TABLE `moo_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`tourStatus` text DEFAULT 'not_started' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `moo_user_email_unique` ON `moo_user` (`email`);--> statement-breakpoint
CREATE TABLE `moo_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
