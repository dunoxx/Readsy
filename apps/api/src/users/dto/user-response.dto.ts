export class UserResponseDto {
  id = '';
  email = '';
  username = '';
  displayName = '';
  avatar?: string;
  frame?: string;
  background?: string;
  totalXP = 0;
  seasonXP = 0;
  coins = 0;
  isPremium = false;
  countryId?: string;
  languageId?: string;
  birthDate?: Date;
  isPrivate = false;
  createdAt = new Date();
  updatedAt = new Date();
} 