const { sortWorkExperience } = require('../utils/userProfileUtils');
 
 describe('sortWorkExperience', () => {
     it('should sort work experiences by currently working, toDate, and fromDate', () => {
         const workExperience = [
             { currentlyWorking: false, toDate: '2022-12-31', fromDate: '2020-01-01' },
             { currentlyWorking: true, fromDate: '2021-01-01' },
             { currentlyWorking: false, toDate: '2021-12-31', fromDate: '2019-01-01' },
         ];
 
         const sorted = sortWorkExperience(workExperience);
 
         expect(sorted).toEqual([
             { currentlyWorking: true, fromDate: '2021-01-01' },
             { currentlyWorking: false, toDate: '2022-12-31', fromDate: '2020-01-01' },
             { currentlyWorking: false, toDate: '2021-12-31', fromDate: '2019-01-01' },
         ]);
     });
 
     it('should handle missing toDate and fromDate', () => {
         const workExperience = [
             { currentlyWorking: false, fromDate: '2020-01-01' },
             { currentlyWorking: false },
         ];
 
         const sorted = sortWorkExperience(workExperience);
 
         expect(sorted).toEqual([
             { currentlyWorking: false, fromDate: '2020-01-01' },
             { currentlyWorking: false },
         ]);
     });
 });
 
 const { validateSkillName } = require('../utils/userProfileUtils');
 
 describe('validateSkillName', () => {
     it('should return valid for a valid skill name', () => {
         const result = validateSkillName('JavaScript');
         expect(result).toEqual({ valid: true });
     });
 
     it('should return invalid for a skill name that is too short', () => {
         const result = validateSkillName('A');
         expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
     });
 
     it('should return invalid for a skill name that is too long', () => {
         const result = validateSkillName('A'.repeat(51));
         expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
     });
 
     it('should return invalid for a non-string skill name', () => {
         const result = validateSkillName(123);
         expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
     });
 
     it('should return invalid for an empty skill name', () => {
         const result = validateSkillName('');
         expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
     });
 });
 
 const { updateSkillExperienceReferences } = require('../utils/userProfileUtils');
 
 describe('updateSkillExperienceReferences', () => {
     it('should add new skills and update experience references', () => {
         const user = {
             skills: [
                 { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
             ],
         };
         const experienceIndex = 1;
         const newSkills = ['JavaScript', 'React'];
         const oldSkills = ['JavaScript'];
 
         updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);
 
         expect(user.skills).toEqual([
             { skillName: 'JavaScript', experience: [0, 1], education: [], endorsements: [] },
             { skillName: 'React', experience: [1], education: [], endorsements: [] },
         ]);
     });
 
     it('should remove skills no longer associated with the experience', () => {
         const user = {
             skills: [
                 { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
                 { skillName: 'React', experience: [0], education: [], endorsements: [] },
             ],
         };
         const experienceIndex = 0;
         const newSkills = ['JavaScript'];
         const oldSkills = ['JavaScript', 'React'];
 
         updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);
 
         expect(user.skills).toEqual([
             { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
         ]);
     });
 
     it('should handle empty newSkills and oldSkills', () => {
         const user = { skills: [] };
         const experienceIndex = 0;
         const newSkills = [];
         const oldSkills = [];
 
         updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);
 
         expect(user.skills).toEqual([]);
     });
 });