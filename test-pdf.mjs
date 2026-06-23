import { generateCV } from './src/pdf-renderer.js';
const data = {
  name: 'Test',
  address: 'Address',
  telephone: '123',
  email: 'test@example.com',
  nationality: 'Sp',
  dateOfBirth: '2000-01-01',
  socialLinks: [],
  profiles: {
    es: {
      title: 'Developer',
      shortDescription: 'Short bio',
      workExperience: [],
      education: [],
      languageSkills: [],
      digitalSkills: [],
      communicationSkills: [],
      organisationalSkills: [],
      jobRelatedSkills: [],
      additionalInfo: ''
    }
  }
};
const doc = generateCV(data, 'es', null);
console.log('page count', doc.internal.getNumberOfPages());
