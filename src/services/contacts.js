import { ContactsCollection } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export async function getAllContacts({
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
} = {}) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const baseQuery = ContactsCollection.find({ userId });

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

export async function getContactById({ contactId, userId }) {
  return await ContactsCollection.findOne({ _id: contactId, userId });
}

export async function createContact(payload) {
  return await ContactsCollection.create(payload);
}

export async function updateContact({ contactId, userId, payload, options = {} }) {
  return await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, runValidators: true, ...options },
  );
}

export async function deleteContact({ contactId, userId }) {
  return await ContactsCollection.findOneAndDelete({ _id: contactId, userId });
}
