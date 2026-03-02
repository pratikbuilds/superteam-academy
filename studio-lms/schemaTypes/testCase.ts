import {defineField, defineType} from 'sanity'

export const testCaseType = defineType({
  name: 'testCase',
  title: 'Test Case',
  type: 'object',
  fields: [
    defineField({
      name: 'input',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'expectedOutput',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
})
