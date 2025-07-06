"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface TourStep {
	content: React.ReactNode;
	selectorId: string;
	position: "top" | "bottom" | "left" | "right";
	onClickWithinArea?: () => void;
}

interface TourContextType {
	currentStep: number;
	totalSteps: number;
	nextStep: () => void;
	previousStep: () => void;
	endTour: () => void;
	isActive: boolean;
	startTour: () => void;
	setSteps: (steps: TourStep[]) => void;
	steps: TourStep[];
	isTourCompleted: boolean;
	setIsTourCompleted: (completed: boolean) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
	children: React.ReactNode;
	onComplete?: () => void;
	className?: string;
	isTourCompleted?: boolean;
}

export function TourProvider({ 
	children, 
	onComplete, 
	className, 
	isTourCompleted = false 
}: TourProviderProps) {
	const [currentStep, setCurrentStep] = useState(-1);
	const [steps, setSteps] = useState<TourStep[]>([]);
	const [isActive, setIsActive] = useState(false);
	const [tourCompleted, setTourCompleted] = useState(isTourCompleted);

	const totalSteps = steps.length;

	const nextStep = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			endTour();
		}
	};

	const previousStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const startTour = () => {
		setIsActive(true);
		setCurrentStep(0);
	};

	const endTour = () => {
		setIsActive(false);
		setCurrentStep(-1);
		setTourCompleted(true);
		onComplete?.();
	};

	const value: TourContextType = {
		currentStep,
		totalSteps,
		nextStep,
		previousStep,
		endTour,
		isActive,
		startTour,
		setSteps,
		steps,
		isTourCompleted: tourCompleted,
		setIsTourCompleted: setTourCompleted,
	};

	return (
		<TourContext.Provider value={value}>
			{children}
			<TourHighlight className={className} />
		</TourContext.Provider>
	);
}

export function useTour() {
	const context = useContext(TourContext);
	if (context === undefined) {
		throw new Error("useTour must be used within a TourProvider");
	}
	return context;
}

interface TourAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour?: () => void;
  onSkipTour?: () => void;
}

export function TourAlertDialog({ 
  open, 
  onOpenChange, 
  onStartTour, 
  onSkipTour 
}: TourAlertDialogProps) {
  const { startTour } = useTour();

  const handleStartTour = () => {
    if (onStartTour) {
      onStartTour();
    } else {
      startTour();
      onOpenChange(false);
    }
  };

  const handleSkipTour = () => {
    if (onSkipTour) {
      onSkipTour();
    } else {
      onOpenChange(false);
    }
  };

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-[425px]">
				<AlertDialogHeader>
					<AlertDialogTitle>Welcome to moo! 🐮</AlertDialogTitle>
					<AlertDialogDescription>
						Would you like to take a quick tour to learn how to play this cozy cottage-core deduction game?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleSkipTour}>
						Skip Tour
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleStartTour}>
						Start Tour
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function TourHighlight({ className }: { className?: string }) {
	const { currentStep, steps, isActive, nextStep, previousStep, endTour } = useTour();
	const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
	const [stepPosition, setStepPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	useEffect(() => {
		if (!isActive || currentStep === -1 || !steps[currentStep]) return;

		const step = steps[currentStep];
		const element = document.getElementById(step.selectorId);
		if (!element) return;

		const rect = element.getBoundingClientRect();
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;

		setHighlightStyle({
			position: "absolute",
			top: rect.top + scrollY - 4,
			left: rect.left + scrollX - 4,
			width: rect.width + 8,
			height: rect.height + 8,
			border: "2px solid hsl(var(--primary))",
			borderRadius: "8px",
			pointerEvents: "none",
			zIndex: 1000,
		});

		// Calculate step position
		let x = rect.left + scrollX;
		let y = rect.top + scrollY;

		switch (step.position) {
			case "right":
				x = rect.right + scrollX + 16;
				y = rect.top + scrollY + rect.height / 2;
				break;
			case "left":
				x = rect.left + scrollX - 16;
				y = rect.top + scrollY + rect.height / 2;
				break;
			case "top":
				x = rect.left + scrollX + rect.width / 2;
				y = rect.top + scrollY - 16;
				break;
			case "bottom":
				x = rect.left + scrollX + rect.width / 2;
				y = rect.bottom + scrollY + 16;
				break;
		}

		setStepPosition({ x, y });
	}, [currentStep, steps, isActive]);

	if (!isActive || currentStep === -1 || !steps[currentStep]) {
		return null;
	}

	const step = steps[currentStep];

	return (
		<>
			<div
				style={highlightStyle}
				className={cn("border-primary", className)}
			/>
			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					style={{
						position: "absolute",
						left: stepPosition.x,
						top: stepPosition.y,
						transform: 
							step.position === "left" ? "translateX(-100%) translateY(-50%)" :
							step.position === "right" ? "translateY(-50%)" :
							step.position === "top" ? "translateX(-50%) translateY(-100%)" :
							"translateX(-50%)",
						zIndex: 1001,
					}}
				>
					<Card className="max-w-xs shadow-lg">
						<CardContent className="p-4">
							<div className="flex items-start justify-between gap-2 mb-3">
								<div className="flex-1">
									{step.content}
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={endTour}
									className="h-6 w-6 p-0"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
							<div className="flex items-center justify-between">
								<div className="text-xs text-muted-foreground">
									{currentStep + 1} of {steps.length}
								</div>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={previousStep}
										disabled={currentStep === 0}
										className="h-8 w-8 p-0"
									>
										<ChevronLeft className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={nextStep}
										className="h-8 w-8 p-0"
									>
										<ChevronRight className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</AnimatePresence>
		</>
	);
}
