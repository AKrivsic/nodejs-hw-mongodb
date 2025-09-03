import { ContactsCollection } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export async function getAllContacts({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
} = {}) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const baseQuery = ContactsCollection.find();

  if (typeof filter.isFavourite === 'boolean') {
    baseQuery.where('isFavourite').equals(filter.isFavourite);
  }
  if (filter.type) {
    baseQuery.where('contactType').equals(filter.type);
  }

  const sortObject = { [sortBy]: sortOrder, _id: 'asc' };

  const [totalItems, items] = await Promise.all([
    baseQuery.clone().countDocuments(),
    baseQuery.skip(skip).limit(limit).sort(sortObject).lean().exec(),
  ]);

  const pagination = calculatePaginationData(totalItems, perPage, page);

  return {
    data: items,
    ...pagination,
  };
}

export async function getContactById(contactId) {
  return await ContactsCollection.findById(contactId);
}

export async function createContact(payload) {
  const contact = await ContactsCollection.create(payload);
  return contact;
}

export async function updateContact(contactId, payload, options = {}) {
  const updated = await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    { new: true, runValidators: true, ...options },
  );
  return updated;
}

export async function deleteContact(contactId) {
  return await ContactsCollection.findByIdAndDelete(contactId);
}