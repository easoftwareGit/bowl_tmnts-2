import { brktType, divType, elimType, potType } from "@/lib/types/types";

const findDiv = (id: string, divs: divType[]): divType | undefined => {
  return divs.find((div) => div.id === id);
}

export const getDivName = (id: string, divs: divType[]): string => {
  const foundDiv: divType | undefined = findDiv(id, divs)
  return (foundDiv)
    ? foundDiv.div_name
    : '';
}

export const getPotName = (pot: potType, divs: divType[]): string => {
  const foundDiv: divType | undefined = findDiv(pot.div_id, divs)
  return (foundDiv)
    ? pot.pot_type + ' - ' + foundDiv.div_name
    : '';
}

export const getBrktOrElimName = (feature: brktType | elimType, divs: divType[]): string => {
  if (!feature || !feature.div_id || !divs) return '';
  const foundDiv: divType | undefined = findDiv(feature.div_id, divs)  
  return (foundDiv)
    ? foundDiv.div_name + ': ' + feature.start + '-' + (feature.start + feature.games - 1)
    : '';
}

export const exportedForTesting = {
  findDiv,  
}