import { ContactsCollection } from '../models/contact.js';

export async function getAllContacts() {
  const contacts = await ContactsCollection.find();
  return contacts;
}

export async function getContactById(contactId) {
  return await ContactsCollection.findById(contactId);
}