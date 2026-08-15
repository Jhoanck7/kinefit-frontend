"use client";

import { useEffect, useState } from "react";

import { HorarioEspecialista, listHorarios } from "@/lib/panel/data/horarios";

export const useHorarios = () => {
  const [horarios, setHorarios] = useState<HorarioEspecialista[] | null>(null);

  useEffect(() => {
    listHorarios().then(setHorarios);
  }, []);

  return { horarios };
};
