import { v4 as uuidv4 } from 'uuid';
import { isValidBtDbType } from './validation';
import { idTypes } from './types/types';

export const btDbUuid = (idType: idTypes): string => {
  if (!isValidBtDbType(idType)) return "";
  const uuid = uuidv4().replace(/-/g, '');
  return `${idType}_${uuid}`
}