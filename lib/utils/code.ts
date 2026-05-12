import { customAlphabet } from 'nanoid'

// 시각적으로 혼동되는 문자(0,O,1,I,l) 제외
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'

export const generatePlayCode = customAlphabet(alphabet, 6)
export const generateManageCode = customAlphabet(alphabet, 12)
export const generateResultCode = customAlphabet(alphabet, 6)
