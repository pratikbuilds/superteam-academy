import {defineField, defineType} from 'sanity'

export const moduleType = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      type: 'string',
      description: 'Unique ID (e.g. anchor-fundamentals-setup)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'lessons',
      type: 'array',
      of: [{type: 'contentLesson'}, {type: 'challengeLesson'}],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare: ({title}) => ({title: title || 'Module'}),
  },
})
