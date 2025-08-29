import { ContactsCollection } from '../models/contact.js';

export async function getAllContacts() {
  const contacts = await ContactsCollection.find();
  return contacts;
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
    { new: true, runValidators: true, ...options }
  );
  return updated;
}

export async function deleteContact(contactId) {
  return await ContactsCollection.findByIdAndDelete(contactId);
}