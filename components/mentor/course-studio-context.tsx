"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type CoursePlannerStepHandlers = {
  /** Return true to allow planner route change; false to handle internally. */
  onNext?: () => boolean | Promise<boolean>;
  /** Return true to allow planner route change; false to handle internally. */
  onBack?: () => boolean | Promise<boolean>;
  /** When true, floating nav buttons are disabled (uploads, saves, etc.). */
  navigationLocked?: boolean;
};

type CourseStudioValue = {
  readOnly: boolean;
  registerStepHandlers: (handlers: CoursePlannerStepHandlers | null) => void;
  stepHandlers: CoursePlannerStepHandlers | null;
  navigationLocked: boolean;
};

const CourseStudioContext = createContext<CourseStudioValue>({
  readOnly: false,
  registerStepHandlers: () => {},
  stepHandlers: null,
  navigationLocked: false,
});

export function CourseStudioProvider({
  value,
  children,
}: {
  value: { readOnly: boolean };
  children: ReactNode;
}) {
  const handlersRef = useRef<CoursePlannerStepHandlers | null>(null);
  const [handlersVersion, setHandlersVersion] = useState(0);

  const registerStepHandlers = useCallback(
    (handlers: CoursePlannerStepHandlers | null) => {
      handlersRef.current = handlers;
      setHandlersVersion((v) => v + 1);
    },
    [],
  );

  const contextValue = useMemo(
    (): CourseStudioValue => ({
      readOnly: value.readOnly,
      registerStepHandlers,
      stepHandlers: handlersRef.current,
      navigationLocked: handlersRef.current?.navigationLocked ?? false,
    }),
    [
      value.readOnly,
      registerStepHandlers,
      handlersVersion,
    ],
  );

  return (
    <CourseStudioContext.Provider value={contextValue}>
      {children}
    </CourseStudioContext.Provider>
  );
}

export function useCourseStudio() {
  return useContext(CourseStudioContext);
}
