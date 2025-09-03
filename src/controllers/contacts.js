import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export async function getAllContactsController(req, res) {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const data = await getAllContacts({ page, perPage, sortBy, sortOrder, filter });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
}

export async function getContactByIdController(req, res) {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

export async function createContactController(req, res) {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body || {};

  const contact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
}

const pickUpdatable = ({ name, phoneNumber, email, isFavourite, contactType }) => (
  { name, phoneNumber, email, isFavourite, contactType }
);

export async function patchContactController(req, res) {
  const { contactId } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw createError(400, 'Empty request body');
  }

  const payload = pickUpdatable(req.body);

  if (Object.values(payload).every(v => typeof v === 'undefined')) {
    throw createError(400, 'No updatable fields provided');
  }

  const updated = await updateContact(contactId, payload);
  if (!updated) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
}

export async function deleteContactController(req, res) {
  const { contactId } = req.params;

  const deleted = await deleteContact(contactId);

  if (!deleted) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
}