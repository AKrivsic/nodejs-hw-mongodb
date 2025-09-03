import Joi from 'joi';

const string20 = Joi.string().min(3).max(20);

export const createContactSchema = Joi.object({
  name: string20.required(),
  phoneNumber: string20.required(),
  email: Joi.string().email().max(50).allow('', null),
  isFavourite: Joi.boolean().default(false),
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
});

export const updateContactSchema = Joi.object({
  name: string20,
  phoneNumber: string20,
  email: Joi.string().email().max(50).allow('', null),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
}).min(1);
