import { v4 as uuidv4 } from 'uuid';
import { isValidBtDbType } from './validation/validation';
import { idTypes } from './types/types';

/**
 * generates a BtDb uuid
 * 
 * @param {idType} idType - id type
 * @returns {string} - a BtDb uuid string xxx_uuid without hyphens
 */
export const btDbUuid = (idType: idTypes): string => {
  if (!isValidBtDbType(idType)) return "";
  const uuid = uuidv4().replace(/-/g, '');
  return `${idType}_${uuid}`
}