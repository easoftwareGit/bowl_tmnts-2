import type { brktType, divType, elimType, potType } from "@/lib/types/types";

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
    ? foundDiv.div_name + ': ' + pot.pot_type
    : '';
}

export const getPotShortName = (pot: potType, divs: divType[]): string => {
  const foundDiv: divType | undefined = findDiv(pot.div_id, divs)
  const potShort = (pot.pot_type === 'Game')
    ? 'Gm'
    : (pot.pot_type === 'Last Game') ? 'LG' : 'Sr';    
  return (foundDiv)
    ? foundDiv.div_name + ': ' + potShort
    : '';
}

export const getBrktOrElimName = (feature: brktType | elimType, divs: divType[]): string => {
  if (!feature || !feature.div_id || !divs) return '';
  const foundDiv: divType | undefined = findDiv(feature.div_id, divs)  
  return (foundDiv)
    ? foundDiv.div_name + ': ' + feature.start + '-' + (feature.start + feature.games - 1)
    : '';
}

export const fullName = (first: string, last: string): string => {  
  if (!first || first.trim().length === 0) {
    return (!last || last.trim().length === 0) ? '' : last.trim();
  } else { 
    return (!last || last.trim().length === 0)
      ? first : first.trim() + ' ' + last.trim();
  }
}

export const exportedForTesting = {
  findDiv,  
}