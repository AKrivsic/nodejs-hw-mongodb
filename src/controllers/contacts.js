import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';


export async function getAllContactsController(req, res) {
  const userId = req.user._id;


  const page = req.query.page ? parseInt(req.query.page) || 1 : 1;
  const perPage = req.query.perPage ? parseInt(req.query.perPage) || 10 : 10;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  const filter = {};
  if (typeof req.query.isFavourite !== 'undefined') {
    filter.isFavourite = req.query.isFavourite === 'true';
  }
  if (req.query.type) filter.type = req.query.type;

  const data = await getAllContacts({ userId, page, perPage, sortBy, sortOrder, filter });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
}

export async function getContactByIdController(req, res) {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await getContactById({ contactId, userId });
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
  const userId = req.user._id;
  const { name, phoneNumber, email, isFavourite, contactType } = req.body || {};


  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'name, phoneNumber and contactType are required');
  }

  const contact = await createContact({
    userId,
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
  const userId = req.user._id;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw createError(400, 'Empty request body');
  }

  const payload = pickUpdatable(req.body);
  if (Object.values(payload).every(v => typeof v === 'undefined')) {
    throw createError(400, 'No updatable fields provided');
  }

  const updated = await updateContact({ contactId, userId, payload });
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
  const userId = req.user._id;

  const deleted = await deleteContact({ contactId, userId });
  if (!deleted) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
}
